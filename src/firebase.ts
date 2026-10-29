import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  setLogLevel,
  Firestore,
  doc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseAppletConfig from '../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseAppletConfig.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: firebaseAppletConfig.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: firebaseAppletConfig.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: firebaseAppletConfig.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: firebaseAppletConfig.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: firebaseAppletConfig.appId || import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: firebaseAppletConfig.measurementId || import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId
);

// Suppress noisy internal WebChannel transport warnings in proxied iframe environments
setLogLevel('silent');

export const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

function createFirestoreInstance(): Firestore {
  try {
    return initializeFirestore(
      app,
      {
        experimentalAutoDetectLongPolling: true,
      },
      firebaseAppletConfig.firestoreDatabaseId
    );
  } catch {
    return getFirestore(app, firebaseAppletConfig.firestoreDatabaseId);
  }
}

import { getStorage, FirebaseStorage } from 'firebase/storage';

export const db: Firestore = createFirestoreInstance();
export const auth: Auth = getAuth(app);

export const storage: FirebaseStorage | null = (() => {
  try {
    if (firebaseConfig.storageBucket) {
      return getStorage(app);
    }
    return null;
  } catch {
    return null;
  }
})();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  if (!isFirebaseConfigured) {
    console.warn('Firebase configuration is incomplete.');
    return;
  }
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch {
    // Connection check completed; Firestore handles offline/long-polling fallback automatically
  }
}
testConnection();

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
    msg.includes('api-key-not-valid') ||
    msg.includes('invalid-api-key') ||
    msg.includes('API_KEY_INVALID')
  );
}

/**
 * Traduce los códigos de error comunes de Firebase Authentication a mensajes claros y accionables en español.
 */
export function getFirebaseAuthErrorMessage(errorCode: string): string {
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'este dominio';

  switch (errorCode) {
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid':
      return 'La API Key de Firebase no es válida o no está configurada.';
    case 'auth/user-not-found':
      return 'No existe una cuenta registrada con este correo electrónico. Verifica tus datos o crea una cuenta.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Correo electrónico o contraseña incorrectos. Verifica tus credenciales o solicita recuperación de contraseña.';
    case 'auth/email-already-in-use':
      return 'Este correo electrónico ya se encuentra registrado. Inicia sesión con tu contraseña o con Google.';
    case 'auth/weak-password':
      return 'La contraseña es muy débil. Debe tener al menos 8 caracteres e incluir al menos un número.';
    case 'auth/invalid-email':
      return 'El formato del correo electrónico no es válido (ejemplo: usuario@empresa.co).';
    case 'auth/user-disabled':
      return 'Esta cuenta de usuario ha sido inhabilitada por administración.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos consecutivos. Por seguridad, espera unos minutos antes de volver a intentarlo.';
    case 'auth/network-request-failed':
      return 'Error de red o conexión. Verifica tu conexión a internet e inténtalo nuevamente.';
    case 'auth/popup-closed-by-user':
      return 'El flujo de inicio de sesión fue cancelado al cerrar la ventana emergente.';
    case 'auth/popup-blocked':
      return 'El navegador bloqueó la ventana emergente de Google. Por favor permite las ventanas emergentes (pop-ups) en este sitio para continuar.';
    case 'auth/cancelled-popup-request':
      return 'Ya hay una solicitud de autenticación en curso. Por favor espera a que termine.';
    case 'auth/unauthorized-domain':
      return `El dominio "${currentHost}" no está autorizado en Firebase. Para habilitarlo, ve a Firebase Console > Authentication > Settings > Dominios autorizados y agrega "${currentHost}".`;
    case 'auth/operation-not-allowed':
      return 'El método de inicio de sesión no está habilitado en Firebase. Habilítalo en Firebase Console > Authentication > Sign-in method.';
    case 'auth/account-exists-with-different-credential':
      return 'Ya existe una cuenta registrada con este correo electrónico mediante contraseña. Inicia sesión con tu correo y contraseña.';
    case 'auth/credential-already-in-use':
      return 'Esta credencial ya está vinculada a otra cuenta existente.';
    case 'auth/requires-recent-login':
      return 'Por seguridad, debes cerrar sesión e iniciar sesión nuevamente para realizar esta acción.';
    case 'auth/invalid-action-code':
      return 'El enlace de recuperación o verificación es inválido o ya fue utilizado.';
    case 'auth/expired-action-code':
      return 'El enlace ha caducado. Por favor solicita uno nuevo.';
    default:
      return 'Ocurrió un error en la autenticación. Por favor verifica tus datos e intenta de nuevo.';
  }
}
