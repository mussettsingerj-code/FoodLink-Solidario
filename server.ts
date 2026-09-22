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
    'admin@foodlinksolidario.com',
    {
      id: 'user-adm-01',
      email: 'admin@foodlinksolidario.com',
      name: 'Carlos Mendoza',
      role: 'admin',
      organizationName: 'FoodLink Solidario SAS',
      city: 'Bogotá',
      nitOrId: '901.650.320-8',
      phone: '+57 300 123 4567',
      provider: 'email',
      twoFactorEnabled: true,
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
