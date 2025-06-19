import { Timestamp } from "firebase-admin/firestore";
import { users } from "./db";

export async function getLastDaily(userId: string): Promise<number | null> {
  const snap = await users.doc(userId).get();
  const data = snap.data();
  if (!snap.exists || !data?.lastDaily) return null;
  return (data.lastDaily as Timestamp).toMillis();
}

export async function setLastDaily(
  userId: string,
  timestampMs: number
): Promise<void> {
  const timestamp = Timestamp.fromMillis(timestampMs);
  await users.doc(userId).set({ lastDaily: timestamp }, { merge: true });
}
