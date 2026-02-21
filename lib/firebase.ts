import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCKdvrPJucFAF7GnceztuJW1Q7RNuCmsyU',
  authDomain: 'arabic-video-quiz-app.firebaseapp.com',
  projectId: 'arabic-video-quiz-app',
  storageBucket: 'arabic-video-quiz-app.firebasestorage.app',
  messagingSenderId: '539411981450',
  appId: '1:539411981450:web:90b5756ce070af24f9b973',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
