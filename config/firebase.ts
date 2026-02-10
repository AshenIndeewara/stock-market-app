import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || '111111',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'tas111111baseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'ta11111111111dee',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 't111111ebasestorage.app',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '75491111158383879',
  appId: process.env.FIREBASE_APP_ID || '1:1111111111:web:f3042da834f159a2dea3a2',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

export default app;
