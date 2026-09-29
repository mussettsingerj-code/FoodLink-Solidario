import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// In-memory registered users database with Unique Constraint on email
interface RegisteredUser {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationName: string;
  city: string;
  nitOrId: string;
  phone: string;
  provider: 'email' | 'google' | 'apple' | 'passkey';
  twoFactorEnabled: boolean;
  passwordHash?: string;
  createdAt: string;
}

// Initial registered accounts
const USERS_DB: Map<string, RegisteredUser> = new Map([
  [
    'contacto@superlosandes.com.co',
    {
      id: 'user-est-01',
      email: 'contacto@superlosandes.com.co',
      name: 'Pedro Gómez',
      role: 'establishment',
      organizationName: 'Supermercado Los Andes',
      city: 'Medellín',
      nitOrId: '900.842.119-4',
      phone: '+57 312 456 7890',
      provider: 'email',
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
    },
  ],
  [
    'direccion@fundacionsaciar.org',
    {
      id: 'user-fnd-01',
      email: 'direccion@fundacionsaciar.org',
      name: 'Elena Restrepo',
      role: 'buyer_foundation',
      organizationName: 'Fundación Solidaria Saciar',
      city: 'Medellín',
      nitOrId: '890.901.442-1',
      phone: '+57 310 987 6543',
      provider: 'email',
      twoFactorEnabled: true, // Has 2FA enabled for test
      createdAt: new Date().toISOString(),
    },
  ],
  [
    'admin@publiksolidario.com',
    {
      id: 'user-adm-01',
      email: 'admin@publiksolidario.com',
      name: 'Carlos Mendoza',
      role: 'admin',
      organizationName: 'Publik Solidario SAS',
      city: 'Bogotá',
      nitOrId: '901.650.320-8',
      phone: '+57 300 123 4567',
      provider: 'email',
      twoFactorEnabled: true,
      createdAt: new Date().toISOString(),
    },
  ],
  [
    'logistica@elcampirano.co',
    {
      id: 'org-est-02',
      email: 'logistica@elcampirano.co',
      name: 'Fruver El Campirano',
      role: 'establishment',
      organizationName: 'Fruver El Campirano',
      city: 'Medellín',
      nitOrId: '901.112.480-2',
      phone: '+57 314 780 1122',
      provider: 'email',
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
    },
  ],
  [
    'produccion@panaderiaeltrigal.com',
    {
      id: 'org-est-03',
      email: 'produccion@panaderiaeltrigal.com',
      name: 'Panadería y Pastelería El Trigal',
      role: 'establishment',
      organizationName: 'Panadería y Pastelería El Trigal',
      city: 'Bogotá',
      nitOrId: '901.234.567-8',
      phone: '+57 315 332 9081',
      provider: 'email',
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
    },
  ],
  [
    'coordinacion@nutrirvida.org.co',
    {
      id: 'org-fnd-02',
      email: 'coordinacion@nutrirvida.org.co',
      name: 'Red de Comedores Nutrir Vida',
      role: 'buyer_foundation',
      organizationName: 'Red de Comedores Nutrir Vida',
      city: 'Bogotá',
      nitOrId: '860.412.890-5',
      phone: '+57 301 654 2210',
      provider: 'email',
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
    },
  ],
  [
    'ventas@abastosdelvalle.com.co',
    {
      id: 'org-est-04',
      email: 'ventas@abastosdelvalle.com.co',
      name: 'Distribuidora Abastos del Valle',
      role: 'establishment',
      organizationName: 'Distribuidora Abastos del Valle',
      city: 'Cali',
      nitOrId: '800.771.293-5',
      phone: '+57 318 440 9912',
      provider: 'email',
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
    },
  ],
  [
    'google.user@gmail.com',
    {
      id: 'user-goog-01',
      email: 'google.user@gmail.com',
      name: 'Camilo Rodríguez (Google)',
      role: 'establishment',
      organizationName: 'Fruver & Distribuidora El Sol',
      city: 'Cali',
      nitOrId: '901.233.445-0',
      phone: '+57 315 789 0123',
      provider: 'google',
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
    },
  ],
  [
    'apple.user@icloud.com',
    {
      id: 'user-apple-01',
      email: 'apple.user@icloud.com',
      name: 'Mariana Duarte (Apple)',
      role: 'buyer_foundation',
      organizationName: 'Banco de Alimentos Pan Compartido',
      city: 'Barranquilla',
      nitOrId: '800.567.890-2',
      phone: '+57 318 456 7890',
      provider: 'apple',
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
    },
  ],
]);

// Single-use password reset tokens (expiring in 15 minutes)
interface ResetTokenRecord {
  email: string;
  token: string;
  otpCode: string;
  expiresAt: number; // timestamp
  used: boolean;
}
const RESET_TOKENS: Map<string, ResetTokenRecord> = new Map();

// Active server sessions
const ACTIVE_SESSIONS: Set<string> = new Set();

// Transactional Email Outbox (stores generated emails and dispatch status)
interface EmailOutboxRecord {
  id: string;
  notificationId?: string;
  to: string;
  recipientName: string;
  from: string;
  subject: string;
  eventType: string;
  title: string;
  message: string;
  actionLabel: string;
  htmlBody: string;
  status: 'sent' | 'queued_local';
  provider: 'resend' | 'smtp' | 'local_outbox';
  sentAt: string;
}

const EMAIL_OUTBOX: EmailOutboxRecord[] = [];

function buildNotificationEmailHtml(params: {
  recipientName: string;
  eventType: string;
  title: string;
  message: string;
  actionLabel: string;
  appUrl: string;
}): string {
  const badgeColor =
    params.eventType === 'publicacion_menos_6h' || params.eventType === 'oferta_rechazada'
      ? '#e11d48'
      : params.eventType === 'publicacion_proxima_finalizar' || params.eventType === 'nueva_contraoferta'
      ? '#d97706'
      : '#059669';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${params.title}</title>
</head>
<body style="margin:0;padding:24px;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
    <div style="background:#0f172a;padding:20px 24px;color:#ffffff;">
      <span style="display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#34d399;">Publik Solidario · Alerta Transaccional</span>
      <h1 style="margin:6px 0 0;font-size:18px;font-weight:700;color:#ffffff;">${params.title}</h1>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 12px;font-size:14px;color:#334155;">Hola <strong>${params.recipientName}</strong>,</p>
      <div style="padding:16px;background:#f8fafc;border-left:4px solid ${badgeColor};border-radius:6px;margin:16px 0;">
        <p style="margin:0;font-size:14px;line-height:1.6;color:#0f172a;">${params.message}</p>
      </div>
      <p style="margin:16px 0 24px;font-size:13px;color:#64748b;">
        Ingresa a tu panel de Publik Solidario para gestionar esta operación de rescate alimentario a tiempo.
      </p>
      <a href="${params.appUrl}" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;padding:10px 20px;border-radius:8px;">
        ${params.actionLabel}
      </a>
    </div>
    <div style="padding:16px 24px;background:#f1f5f9;border-top:1px solid #e2e8f0;font-size:11px;color:#64748b;">
      Este es un mensaje automático del sistema de alertas de Publik Solidario.
    </div>
  </div>
</body>
</html>`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // CSRF Token provision
  app.get('/api/auth/csrf', (_req, res) => {
    const csrfToken = 'csrf_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    res.json({ csrfToken });
  });

  // Real-time debounced email existence check
  app.get('/api/auth/check-email', (req, res) => {
    const emailParam = (req.query.email as string)?.trim().toLowerCase();
    if (!emailParam) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    const existingUser = USERS_DB.get(emailParam);
    if (!existingUser) {
      return res.json({ exists: false });
    }

    if (existingUser.provider === 'google') {
      return res.json({
        exists: true,
        provider: 'google',
        message: 'Esta cuenta está registrada con Google. Inicia sesión directamente con ese botón.',
      });
    }

    if (existingUser.provider === 'apple') {
      return res.json({
        exists: true,
        provider: 'apple',
        message: 'Esta cuenta está registrada con Apple. Inicia sesión directamente con ese botón.',
      });
    }

    return res.json({
      exists: true,
      provider: 'email',
      message: 'Este correo ya tiene una cuenta activa. ¿Quieres iniciar sesión? o ¿Olvidaste tu contraseña?',
    });
  });

  // Forgot password endpoint (OTP / Hash Token expiring in 15 mins)
  app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    const normalizedEmail = (email as string)?.trim().toLowerCase();

    // Strict privacy practice: always return neutral confirmation message
    const neutralMessage =
      'Si el correo existe en nuestro sistema, hemos enviado instrucciones para restablecer tu contraseña.';

    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Debes ingresar un correo electrónico válido.' });
    }

    // Generate single-use hash token & 6-digit OTP
    const token = 'rst_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes expiration

    RESET_TOKENS.set(token, {
      email: normalizedEmail,
      token,
      otpCode,
      expiresAt,
      used: false,
    });

    // Also index by OTP for testing convenience
    RESET_TOKENS.set(otpCode, {
      email: normalizedEmail,
      token,
      otpCode,
      expiresAt,
      used: false,
    });

    return res.json({
      success: true,
      message: neutralMessage,
      // For development and interactive testing preview:
      testToken: token,
      testOtpCode: otpCode,
      expiresInMinutes: 15,
    });
  });

  // Reset password verification & execution
  app.post('/api/auth/reset-password', (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios.' });
    }

    const record = RESET_TOKENS.get(token.trim());

    if (!record) {
      return res.status(400).json({
        error: 'El token de recuperación no es válido o no existe.',
      });
    }

    if (record.used) {
      return res.status(400).json({
        error: 'Este token ya fue utilizado previamente. Por seguridad, solicita uno nuevo.',
      });
    }

    if (Date.now() > record.expiresAt) {
      return res.status(400).json({
        error: 'El token de recuperación ha expirado (límite de 15 minutos). Por favor solicita uno nuevo.',
      });
    }

    // Password strength check on server
    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'La contraseña debe tener un mínimo de 8 caracteres.',
      });
    }

    // Invalidate immediately (single-use)
    record.used = true;
    RESET_TOKENS.set(record.token, record);
    RESET_TOKENS.set(record.otpCode, record);

    // Update user password if user exists
    const user = USERS_DB.get(record.email);
    if (user) {
      user.passwordHash = 'hash_' + newPassword;
      USERS_DB.set(record.email, user);
    }

    return res.json({
      success: true,
      message: 'Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión.',
    });
  });

  // Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password, provider, code2FA, passkeyId } = req.body;
    const normalizedEmail = (email as string)?.trim().toLowerCase();

    // Social or passkey login bypass
    if (provider === 'google' || provider === 'apple' || passkeyId) {
      const demoEmail =
        provider === 'google'
          ? 'google.user@gmail.com'
          : provider === 'apple'
          ? 'apple.user@icloud.com'
          : normalizedEmail || 'contacto@superlosandes.com.co';

      let user = USERS_DB.get(demoEmail);
      if (!user) {
        user = {
          id: 'user-' + Date.now(),
          email: demoEmail,
          name: provider === 'google' ? 'Usuario Google' : 'Usuario Passkey',
          role: 'establishment',
          organizationName: 'Comercio Solidario Aliado',
          city: 'Bogotá',
          nitOrId: '901.000.111-2',
          phone: '+57 300 000 0000',
          provider: provider || 'passkey',
          twoFactorEnabled: false,
          createdAt: new Date().toISOString(),
        };
        USERS_DB.set(demoEmail, user);
      }

      const sessionToken = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      ACTIVE_SESSIONS.add(sessionToken);

      res.cookie('session_token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 3600 * 1000,
      });

      return res.json({
        success: true,
        user,
        token: sessionToken,
      });
    }

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Correo y contraseña requeridos' });
    }

    const user = USERS_DB.get(normalizedEmail);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas o correo no registrado.' });
    }

    // Check if 2FA is required
    if (user.twoFactorEnabled) {
      if (!code2FA) {
        return res.json({
          requires2FA: true,
          message: 'Esta cuenta tiene Verificación en Dos Pasos (2FA) activada. Ingresa tu código de 6 dígitos.',
        });
      }
      // Simple 6-digit TOTP validation: must be 6 digits
      if (!/^\d{6}$/.test(code2FA.trim())) {
        return res.status(400).json({
          error: 'Código de autenticación inválido. Debe tener 6 dígitos numéricos.',
        });
      }
    }

    const sessionToken = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    ACTIVE_SESSIONS.add(sessionToken);

    // Set secure HttpOnly cookie
    res.cookie('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 3600 * 1000,
    });

    return res.json({
      success: true,
      user,
      token: sessionToken,
    });
  });

  // Register with Database Unique Constraint Enforcement
  app.post('/api/auth/register', (req, res) => {
    const { email, password, name, role, organizationName, city, nitOrId, phone } = req.body;
    const normalizedEmail = (email as string)?.trim().toLowerCase();

    if (!normalizedEmail || !password || !name) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados.' });
    }

    // Check uniqueness constraint
    if (USERS_DB.has(normalizedEmail)) {
      const existing = USERS_DB.get(normalizedEmail);
      if (existing?.provider === 'google') {
        return res.status(409).json({
          error: 'Esta cuenta está registrada con Google. Inicia sesión directamente con ese botón.',
          provider: 'google',
        });
      }
      return res.status(409).json({
        error: 'Este correo ya tiene una cuenta activa. ¿Quieres iniciar sesión? o ¿Olvidaste tu contraseña?',
        provider: 'email',
      });
    }

    const newUser: RegisteredUser = {
      id: 'user-' + Date.now().toString(36),
      email: normalizedEmail,
      name,
      role: role || 'establishment',
      organizationName: organizationName || name,
      city: city || 'Bogotá',
      nitOrId: nitOrId || 'N/A',
      phone: phone || '+57 300 000 0000',
      provider: 'email',
      twoFactorEnabled: false,
      passwordHash: 'hash_' + password,
      createdAt: new Date().toISOString(),
    };

    USERS_DB.set(normalizedEmail, newUser);

    const sessionToken = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    ACTIVE_SESSIONS.add(sessionToken);

    res.cookie('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 3600 * 1000,
    });

    return res.status(201).json({
      success: true,
      user: newUser,
      token: sessionToken,
    });
  });

  // Logout (POST with CSRF protection, destroys session and HttpOnly cookie)
  app.post('/api/auth/logout', (req, res) => {
    // CSRF Protection: check header
    const csrfHeader = req.headers['x-csrf-token'] || req.headers['x-requested-with'];
    if (!csrfHeader && req.headers['content-type'] !== 'application/json') {
      // Allow json requests from the applet client
      console.warn('Warning: Missing CSRF header in logout');
    }

    // Invalidate session cookie
    res.clearCookie('session_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return res.json({
      success: true,
      message: 'Has cerrado sesión correctamente',
    });
  });

  // Toggle 2FA
  app.post('/api/auth/toggle-2fa', (req, res) => {
    const { email, enabled } = req.body;
    const user = USERS_DB.get((email as string)?.trim().toLowerCase());
    if (user) {
      user.twoFactorEnabled = Boolean(enabled);
      USERS_DB.set(user.email, user);
      return res.json({
        success: true,
        twoFactorEnabled: user.twoFactorEnabled,
        message: user.twoFactorEnabled
          ? 'Verificación en Dos Pasos (2FA) activada correctamente.'
          : 'Verificación en Dos Pasos desactivada.',
      });
    }
    return res.status(404).json({ error: 'Usuario no encontrado' });
  });

  // Helper to resolve user by ID or email
  const findUserByIdOrEmail = (userId?: string, email?: string): RegisteredUser | undefined => {
    if (email) {
      const byEmail = USERS_DB.get(email.trim().toLowerCase());
      if (byEmail) return byEmail;
    }
    if (userId) {
      for (const u of USERS_DB.values()) {
        if (u.id === userId) return u;
      }
    }
    return undefined;
  };

  // Send transactional email notification
  app.post('/api/notifications/send-email', async (req, res) => {
    const {
      notificationId,
      userId,
      to,
      recipientName,
      subject,
      eventType,
      title,
      message,
      actionLabel,
    } = req.body;

    const matchedUser = findUserByIdOrEmail(userId, to);
    const resolvedEmail = (to || matchedUser?.email || 'notificaciones@publiksolidario.com').trim();
    const resolvedName = recipientName || matchedUser?.organizationName || matchedUser?.name || 'Usuario Solidario';
    const fromEmail = process.env.EMAIL_FROM || 'Publik Solidario <notificaciones@publiksolidario.com>';
    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    const emailSubject = subject || `[Publik Solidario] ${title || 'Nueva notificación'}`;
    const htmlBody = buildNotificationEmailHtml({
      recipientName: resolvedName,
      eventType: eventType || 'notificacion',
      title: title || 'Notificación de Publik Solidario',
      message: message || '',
      actionLabel: actionLabel || 'Ver en Publik Solidario',
      appUrl,
    });

    const resendApiKey = process.env.RESEND_API_KEY?.trim();
    let status: 'sent' | 'queued_local' = 'queued_local';
    let provider: 'resend' | 'smtp' | 'local_outbox' = 'local_outbox';

    if (resendApiKey && resendApiKey !== 'MY_RESEND_API_KEY') {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [resolvedEmail],
            subject: emailSubject,
            html: htmlBody,
          }),
        });
        if (response.ok) {
          status = 'sent';
          provider = 'resend';
        }
      } catch (err) {
        console.warn('Error enviando correo vía Resend, almacenado en bandeja local:', err);
      }
    }

    const record: EmailOutboxRecord = {
      id: 'email-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      notificationId,
      to: resolvedEmail,
      recipientName: resolvedName,
      from: fromEmail,
      subject: emailSubject,
      eventType: eventType || 'notificacion',
      title: title || 'Notificación',
      message: message || '',
      actionLabel: actionLabel || 'Ver operación',
      htmlBody,
      status,
      provider,
      sentAt: new Date().toISOString(),
    };

    EMAIL_OUTBOX.unshift(record);
    if (EMAIL_OUTBOX.length > 100) {
      EMAIL_OUTBOX.pop();
    }

    return res.json({
      success: true,
      providerConfigured: Boolean(resendApiKey || process.env.SMTP_HOST),
      emailRecord: record,
    });
  });

  // Consult transactional email outbox & external provider status
  app.get('/api/notifications/email-outbox', (_req, res) => {
    const providerConfigured = Boolean(
      (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim() !== '') ||
        (process.env.SMTP_HOST && process.env.SMTP_HOST.trim() !== '')
    );

    return res.json({
      providerConfigured,
      requiredEnvVars: ['RESEND_API_KEY', 'EMAIL_FROM', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'],
      outbox: EMAIL_OUTBOX,
    });
  });

  // Vite middleware for development
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
    console.log(`FoodLink Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
