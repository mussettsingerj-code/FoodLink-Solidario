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
 * Traduce los códigos de error comunes de Firebase Authentication a mensajes claros en español.
 */
export function getFirebaseAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid':
      return 'La API Key de Firebase no es válida o no está configurada.';
    case 'auth/user-not-found':
      return 'Esta cuenta no está registrada. Debes registrarte primero o crear una cuenta.';
    case 'auth/wrong-password':
      return 'La contraseña ingresada es incorrecta. Inténtalo de nuevo o solicita recuperación.';
    case 'auth/invalid-credential':
      return 'Credenciales inválidas. Verifica tu correo y contraseña.';
    case 'auth/email-already-in-use':
      return 'Este correo electrónico ya se encuentra registrado. Inicia sesión o recupera tu contraseña.';
    case 'auth/weak-password':
      return 'La contraseña es muy débil. Debe tener al menos 8 caracteres.';
    case 'auth/invalid-email':
      return 'El formato del correo electrónico no es válido.';
    case 'auth/user-disabled':
      return 'Esta cuenta de usuario ha sido inhabilitada por administración.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos consecutivos. Por seguridad, inténtalo más tarde.';
    case 'auth/network-request-failed':
      return 'Error de red. Verifica tu conexión a internet e inténtalo nuevamente.';
    case 'auth/popup-closed-by-user':
      return 'Has cerrado la ventana de inicio de sesión de Google antes de completar la autenticación.';
    case 'auth/popup-blocked':
      return 'La ventana emergente de inicio de sesión fue bloqueada por tu navegador. Permite las ventanas emergentes (popups) para este sitio e inténtalo nuevamente.';
    case 'auth/unauthorized-domain':
      return 'El dominio actual no está autorizado en Firebase Authentication. Para resolverlo, agrega el dominio en Firebase Console > Authentication > Settings > Authorized domains.';
    case 'auth/operation-not-allowed':
      return 'El proveedor de Google no está habilitado en Firebase Authentication. Actívalo en Firebase Console > Authentication > Sign-in method.';
    case 'auth/account-exists-with-different-credential':
      return 'Ya existe una cuenta con este correo electrónico registrada con otro método de acceso (ej. contraseña). Inicia sesión con tus credenciales habituales.';
    case 'auth/cancelled-popup-request':
      return 'Se inició otra solicitud de autenticación concurrente. Por favor espera a que finalice.';
    case 'auth/credential-already-in-use':
      return 'Esta credencial de Google ya está vinculada a otra cuenta de usuario.';
    case 'auth/timeout':
      return 'El tiempo de espera para autenticar con Google se agotó. Inténtalo nuevamente.';
    case 'auth/internal-error':
      return 'Ocurrió un error interno en el servicio de autenticación de Firebase. Por favor intenta de nuevo.';
    default:
      return 'Ocurrió un error en la autenticación. Por favor intenta de nuevo.';
  }
}

/**
 * Analiza errores provenientes de Firebase Auth o Cloud Firestore
 * y produce un código y mensaje comprensible y seguro en español.
 */
export function getDetailedAuthErrorMessage(error: unknown): { code: string; message: string } {
  if (!error) {
    return { code: 'unknown-error', message: 'Ocurrió un error desconocido. Inténtalo nuevamente.' };
  }

  const rawMsg = error instanceof Error ? error.message : String(error);

  // Detección de error serializado de handleFirestoreError
  if (
    rawMsg.includes('permission-denied') ||
    rawMsg.includes('Missing or insufficient permissions') ||
    rawMsg.includes('PERMISSION_DENIED')
  ) {
    return {
      code: 'firestore/permission-denied',
      message: 'Error de permisos en Cloud Firestore: las reglas de seguridad denegaron el acceso a tu perfil. Comunícate con el soporte técnico.',
    };
  }

  if (
    rawMsg.includes('the client is offline') ||
    rawMsg.includes('unavailable') ||
    rawMsg.includes('could not reach') ||
    rawMsg.includes('Failed to get document because the client is offline')
  ) {
    return {
      code: 'firestore/offline',
      message: 'No se pudo conectar con la base de datos de Cloud Firestore. Comprueba tu conexión a internet.',
    };
  }

  if (rawMsg.includes('Quota exceeded') || rawMsg.includes('resource-exhausted')) {
    return {
      code: 'firestore/quota-exceeded',
      message: 'Se ha superado la cuota de operaciones en la base de datos de Firestore.',
    };
  }

  // Código estándar de Firebase Auth
  const fbCode =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';

  if (fbCode) {
    return {
      code: fbCode,
      message: getFirebaseAuthErrorMessage(fbCode),
    };
  }

  // Búsqueda por regex de auth/code en el mensaje
  const match = rawMsg.match(/auth\/[a-z0-9-]+/i);
  if (match) {
    return {
      code: match[0],
      message: getFirebaseAuthErrorMessage(match[0]),
    };
  }

  return {
    code: 'auth-error',
    message: rawMsg.length > 0 && rawMsg.length < 200 ? rawMsg : 'Ocurrió un error en la autenticación. Intenta de nuevo.',
  };
}
