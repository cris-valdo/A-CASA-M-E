
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  browserPopupRedirectResolver, 
  RecaptchaVerifier, 
  signInWithPhoneNumber 
} from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with settings for better connectivity in sandboxed environments
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  experimentalForceLongPolling: true, // Improved stability in some restricted network environments
}, (firebaseConfig as any).firestoreDatabaseId || '(default)');

export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

let authPromise: Promise<any> | null = null;

export const signInWithGoogle = async () => {
  // Prevent multiple simultaneous popup requests
  if (authPromise) return authPromise;

  authPromise = (async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
      return result.user;
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        console.warn("Usuário fechou a janela de autenticação.");
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.warn("Solicitação de popup cancelada.");
      } else if (error.code === 'auth/popup-blocked') {
        console.error("Popup BLOQUEADO pelo navegador. Por favor, permita popups para este site ou abra o app em uma nova aba.");
        throw new Error("POPUP_BLOCKED");
      } else {
        console.error("Erro ao autenticar com Google:", error);
      }
      throw error;
    } finally {
      authPromise = null;
    }
  })();

  return authPromise;
};

// Test connection on boot as per guidelines
async function testConnection() {
  try {
    // Force a fresh fetch from server to verify connectivity
    await getDocFromServer(doc(db, '_internal_', 'connection_test'));
    console.log("Firebase: Sincronização activa.");
  } catch (error: any) {
    if (error.code === 'unavailable') {
      console.warn("Firestore em modo offline (Backend demorou a responder).");
    } else if (error.code === 'permission-denied') {
      // This is actually a good sign - it means we reached the server and it rejected us (expected for _internal_)
      console.log("Firebase: Servidor alcançado.");
    } else {
      console.log("Firebase sync state:", error.code || 'waiting');
    }
  }
}

testConnection();
