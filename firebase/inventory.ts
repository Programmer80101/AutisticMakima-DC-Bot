import {
  FieldValue,
  Transaction,
  DocumentReference,
} from "firebase-admin/firestore";
import { db, users } from "./db";

export async function getInventory(
  userId: string
): Promise<Record<string, number>> {
  const snap = await users.doc(userId).get();
  const data = snap.data();
  return (data?.items as Record<string, number>) ?? {};
}

export async function modifyInventoryItem(
  userId: string,
  itemId: string,
  delta: number
): Promise<void> {
  const userRef: DocumentReference = users.doc(userId);
  await db.runTransaction(async (tx: Transaction) => {
    const userSnap = await tx.get(userRef);
    const userData = userSnap.data() as
      | { items?: Record<string, number> }
      | undefined;
    const items = userData?.items ?? {};
    const current = items[itemId] ?? 0;
    const updated = current + delta;

    if (updated < 0) {
      throw new Error(`Cannot reduce below zero: have ${current}`);
    }

    if (updated === 0) {
      tx.update(userRef, { [`items.${itemId}`]: FieldValue.delete() });
    } else {
      tx.set(
        userRef,
        { items: { ...items, [itemId]: updated } },
        { merge: true }
      );
    }
  });
}
