import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const rawApiKey = (import.meta.env.VITE_FIREBASE_API_KEY || '').trim();
const rawProjectId = (import.meta.env.VITE_FIREBASE_PROJECT_ID || '').trim();

/**
 * Valida si se dispone de una clave y configuración real de Firebase
 * para evitar llamadas a la API de Google Identity con claves de prueba inválidas.
 */
export const isFirebaseConfigured = Boolean(
  rawApiKey &&
  rawApiKey !== 'AIzaSyDummyKeyReplaceWithYourOwnValue' &&
  !rawApiKey.toLowerCase().includes('dummy') &&
  !rawApiKey.toLowerCase().includes('replacewith') &&
  rawApiKey.length >= 25 &&
  rawProjectId &&
  rawProjectId !== 'foodlink-solidario'
);

const firebaseConfig = {
  apiKey: rawApiKey || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: rawProjectId || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
};

// Initialize Firebase App safely (singleton pattern)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication
export const auth = getAuth(app);

/**
 * Detecta si un error proviene de una API Key no válida o no configurada.
 */
export function isFirebaseApiKeyError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const msg = 'message' in err ? String((err as { message: unknown }).message) : '';
  const code = 'code' in err ? String((err as { code: unknown }).code) : '';
  return (
    code.includes('api-key-not-valid') ||
    code.includes('invalid-api-key') ||
    code.includes('auth/invalid-api-key') ||
    code.includes('auth/invalid-credential') ||
    msg.includes('api-key-not-valid') ||
    msg.includes('invalid-api-key') ||
    msg.includes('API key') ||
    msg.includes('API_KEY_INVALID')
  );
}

/**
 * Traduce los códigos de error comunes de Firebase Authentication a mensajes claros en español.
 */
export function getFirebaseAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid':
      return 'La API Key de Firebase no es válida o no está configurada. Operando en modo local.';
    case 'auth/user-not-found':
      return 'No existe ninguna cuenta registrada con este correo electrónico.';
    case 'auth/wrong-password':
      return 'La contraseña ingresada es incorrecta. Inténtalo de nuevo o solicita recuperación.';
    case 'auth/invalid-credential':
      return 'Credenciales inválidas. Por favor verifica tu correo y contraseña.';
    case 'auth/email-already-in-use':
      return 'Este correo electrónico ya se encuentra registrado. Inicia sesión o recupera tu contraseña.';
    case 'auth/weak-password':
      return 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
    case 'auth/invalid-email':
      return 'El formato del correo electrónico no es válido.';
    case 'auth/user-disabled':
      return 'Esta cuenta de usuario ha sido inhabilitada por administración.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos consecutivos. Por seguridad, inténtalo más tarde.';
    case 'auth/network-request-failed':
      return 'Error de red. Verifica tu conexión a internet e inténtalo nuevamente.';
    case 'auth/popup-closed-by-user':
      return 'El flujo de autenticación fue cancelado al cerrar la ventana emergente.';
    case 'auth/operation-not-allowed':
      return 'El proveedor de inicio de sesión no está habilitado en la consola de Firebase.';
    default:
      return 'Ocurrió un error en la autenticación. Por favor intenta de nuevo.';
  }
}
