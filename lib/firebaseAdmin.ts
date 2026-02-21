import admin, { type ServiceAccount as FirebaseServiceAccount } from 'firebase-admin';
import fs from 'node:fs';
import path from 'node:path';

const getServiceAccount = (): FirebaseServiceAccount => {
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
