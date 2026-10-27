import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const EMAIL_OUTBOX_FILE = path.join(DATA_DIR, 'email_outbox.json');

interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: 'buyer' | 'seller';
  organizationName: string;
  nitOrId: string;
  phone: string;
  city: string;
  verified: boolean;
  provider: 'email' | 'google';
  createdAt: string;
  updatedAt?: string;
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function ensureUsersFile(): StoredUser[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), 'utf-8');
    return [];
  }
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as StoredUser[];
    // Filter out any legacy demo users
    const cleaned = parsed.filter(
      u =>
        u.email !== 'gerencia@mercadosdelvalle.co' &&
        u.email !== 'direccion@bancodealimentosbogota.org'
    );
    if (cleaned.length !== parsed.length) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(cleaned, null, 2), 'utf-8');
    }
    return cleaned;
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

function sanitizeUser(u: StoredUser) {
  const { passwordHash: _ph, salt: _s, ...safeUser } = u;
  return safeUser;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  ensureUsersFile();

  // Check if email exists
  app.post('/api/auth/check-email', (req, res) => {
    const { email } = req.body as { email?: string };
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'El correo electrónico es obligatorio.' });
      return;
    }
    const normalized = email.trim().toLowerCase();
    const users = ensureUsersFile();
    const found = users.find(u => u.email.toLowerCase() === normalized);

    if (found) {
      res.json({
        exists: true,
        provider: found.provider,
        message: 'Cuenta encontrada.',
      });
    } else {
      res.json({
        exists: false,
        message: 'Esta cuenta no está registrada. Debes registrarte primero o crear una cuenta.',
      });
    }
  });

  // Sync Firebase Auth user with backend registry for email existence lookup
  app.post('/api/auth/sync-user', (req, res) => {
    const {
      uid,
      name,
      email,
      role,
      organizationName,
      nitOrId,
      phone,
      city,
      verified,
      provider,
    } = req.body as {
      uid?: string;
      name?: string;
      email?: string;
      role?: 'buyer' | 'seller';
      organizationName?: string;
      nitOrId?: string;
      phone?: string;
      city?: string;
      verified?: boolean;
      provider?: 'email' | 'google';
    };

    if (!email) {
      res.status(400).json({ error: 'Email requerido.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRole: 'buyer' | 'seller' = role === 'seller' ? 'seller' : 'buyer';
    const users = ensureUsersFile();
    const existingIdx = users.findIndex(
      u => u.email.toLowerCase() === normalizedEmail || (uid && u.id === uid)
    );

    const now = new Date().toISOString();
    if (existingIdx >= 0) {
      users[existingIdx] = {
        ...users[existingIdx],
        id: uid || users[existingIdx].id,
        name: name || users[existingIdx].name,
        email: normalizedEmail,
        role: role ? normalizedRole : users[existingIdx].role,
        organizationName: organizationName || users[existingIdx].organizationName,
        nitOrId: nitOrId || users[existingIdx].nitOrId,
        phone: phone || users[existingIdx].phone,
        city: city || users[existingIdx].city,
        verified: verified !== undefined ? verified : users[existingIdx].verified,
        provider: provider || users[existingIdx].provider,
        updatedAt: now,
      };
      saveUsers(users);
      res.json({ success: true, user: sanitizeUser(users[existingIdx]) });
    } else {
      const salt = crypto.randomBytes(16).toString('hex');
      const newUser: StoredUser = {
        id: uid || `user-${Date.now()}`,
        name: name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        passwordHash: hashPassword(crypto.randomUUID(), salt),
        salt,
        role: normalizedRole,
        organizationName: organizationName || name || 'Usuario Independiente',
        nitOrId: nitOrId || 'Pendiente',
        phone: phone || 'Pendiente',
        city: city || 'Bogotá D.C.',
        verified: Boolean(verified),
        provider: provider || 'email',
        createdAt: now,
        updatedAt: now,
      };
      users.push(newUser);
      saveUsers(users);
      res.status(201).json({ success: true, user: sanitizeUser(newUser) });
    }
  });

  // Email Notification Service Endpoint
  interface EmailLogEntry {
    id: string;
    to: string;
    recipientName: string;
    subject: string;
    notificationType: string;
    html: string;
    text: string;
    status: 'sent' | 'queued_local';
    provider: string;
    sentAt: string;
  }

  function readEmailOutbox(): EmailLogEntry[] {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(EMAIL_OUTBOX_FILE)) {
      return [];
    }
    try {
      return JSON.parse(fs.readFileSync(EMAIL_OUTBOX_FILE, 'utf-8')) as EmailLogEntry[];
    } catch {
      return [];
    }
  }

  function saveEmailOutbox(entries: EmailLogEntry[]) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(EMAIL_OUTBOX_FILE, JSON.stringify(entries.slice(0, 200), null, 2), 'utf-8');
  }

  const isSmtpConfigured = Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );

  app.get('/api/notifications/email-status', (_req, res) => {
    const outbox = readEmailOutbox();
    res.json({
      smtpConfigured: isSmtpConfigured,
      smtpHost: process.env.SMTP_HOST ? process.env.SMTP_HOST : null,
      fromAddress: process.env.SMTP_FROM || 'notificaciones@publiksolidario.org',
      totalProcessed: outbox.length,
      recentEmails: outbox.slice(0, 30),
    });
  });

  app.post('/api/notifications/send-email', async (req, res) => {
    const {
      to,
      recipientName,
      subject,
      notificationType,
      title,
      message,
      actionLabel,
      productName,
    } = req.body as {
      to?: string;
      recipientName?: string;
      subject?: string;
      notificationType?: string;
      title?: string;
      message?: string;
      actionLabel?: string;
      productName?: string;
    };

    if (!to || !subject || !message) {
      res.status(400).json({ error: 'Faltan campos requeridos para el envío del correo (to, subject, message).' });
      return;
    }

    const htmlTemplate = `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="background: #1B4332; color: #ffffff; padding: 20px 24px; border-radius: 12px 12px 0 0;">
          <h2 style="margin: 0; font-size: 18px; font-weight: 700;">FoodLink Solidario · Alertas y Operaciones</h2>
          <p style="margin: 4px 0 0; font-size: 12px; color: #A7F3D0;">Red B2B de Rescate y Redistribución Alimentaria</p>
        </div>
        <div style="background: #ffffff; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
          <p style="margin: 0 0 12px; font-size: 14px; color: #475569;">Hola <strong>${recipientName || 'Aliado Solidario'}</strong>,</p>
          <div style="background: #F0FDF4; border-left: 4px solid #16A34A; padding: 14px 16px; border-radius: 6px; margin-bottom: 16px;">
            <h3 style="margin: 0 0 6px; font-size: 16px; color: #14532D;">${title || subject}</h3>
            <p style="margin: 0; font-size: 14px; color: #1E293B; line-height: 1.5;">${message}</p>
          </div>
          ${productName ? `<p style="font-size: 13px; color: #64748B; margin: 0 0 16px;"><strong>Lote / Publicación asociada:</strong> ${productName}</p>` : ''}
          <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #F1F5F9; font-size: 12px; color: #94A3B8;">
            <p style="margin: 0;">Acción sugerida en plataforma: <strong>${actionLabel || 'Consultar en el Centro de Notificaciones'}</strong></p>
            <p style="margin: 6px 0 0;">Este es un mensaje automático generado por el motor de eventos de FoodLink Solidario.</p>
          </div>
        </div>
      </div>
    `;

    const status: 'sent' | 'queued_local' = isSmtpConfigured ? 'sent' : 'queued_local';
    const providerInfo = isSmtpConfigured
      ? `SMTP (${process.env.SMTP_HOST})`
      : 'Bandeja Local (Configurar SMTP_HOST, SMTP_USER, SMTP_PASS en .env para despacho externo)';

    const entry: EmailLogEntry = {
      id: `email-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      to,
      recipientName: recipientName || 'Usuario',
      subject,
      notificationType: notificationType || 'general',
      html: htmlTemplate,
      text: message,
      status,
      provider: providerInfo,
      sentAt: new Date().toISOString(),
    };

    const currentOutbox = readEmailOutbox();
    saveEmailOutbox([entry, ...currentOutbox]);

    res.json({
      success: true,
      status,
      smtpConfigured: isSmtpConfigured,
      emailEntry: entry,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
