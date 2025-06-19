import { db, users } from "./db";
import { DocumentReference, Transaction } from "firebase-admin/firestore";

export async function getBalance(userId: string): Promise<number> {
  const snap = await users.doc(userId).get();
  return snap.exists ? snap.data()?.balance : 0;
}

export async function modifyBalance(
  userId: string,
  delta: number
): Promise<void> {
  const ref: DocumentReference = users.doc(userId);
  await db.runTransaction(async (tx: Transaction) => {
    const doc = await tx.get(ref);
    const current = doc.exists ? (doc.data()?.balance as number) : 0;
    const newBalance = current + delta;
    tx.set(ref, { balance: newBalance }, { merge: true });
  });
}

export type ValidateBalanceResult =
  | { error: true; balance: number; difference: number }
  | { error: false };

export async function validateBalance(
  userId: string,
  amount: number
): Promise<ValidateBalanceResult> {
  const balance = await getBalance(userId);
  if (balance < amount) {
    return { error: true, balance, difference: amount - balance };
  }
  return { error: false };
}
