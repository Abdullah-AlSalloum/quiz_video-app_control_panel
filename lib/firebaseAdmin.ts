import admin, { type ServiceAccount as FirebaseServiceAccount } from 'firebase-admin';
import fs from 'node:fs';
import path from 'node:path';

const getServiceAccountFromEnv = (): FirebaseServiceAccount | null => {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, '\n'),
  } as FirebaseServiceAccount;
};

const getServiceAccountFromFile = (): FirebaseServiceAccount => {
  const serviceAccountPath = path.resolve(
    process.cwd(),
    '..',
    'quiz_video_app',
    'serviceAccountKey.json'
  );
  const raw = fs.readFileSync(serviceAccountPath, 'utf-8');
  const parsed = JSON.parse(raw) as FirebaseServiceAccount;
  return parsed;
};

const getServiceAccount = (): FirebaseServiceAccount => {
  return getServiceAccountFromEnv() ?? getServiceAccountFromFile();
};

const initAdmin = () => {
  if (admin.apps.length) {
    return admin.app();
  }
  const serviceAccount = getServiceAccount();
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
};

export const adminApp = initAdmin();
export const adminDb = admin.firestore();
