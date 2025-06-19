import "../config";

import { initializeApp, cert } from "firebase-admin/app";
import {
  getFirestore,
  Firestore,
  CollectionReference,
  DocumentData,
} from "firebase-admin/firestore";

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT as string
);

initializeApp({
  credential: cert(serviceAccount),
});

const db: Firestore = getFirestore();
const users: CollectionReference<DocumentData> = db.collection("users");
const shopItems: CollectionReference<DocumentData> = db.collection("shopItems");

export { db, users, shopItems };
