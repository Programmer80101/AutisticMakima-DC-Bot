import { db, users } from "../db.js";

async function getBalance(userId) {
  const snap = await users.doc(userId).get();
  return snap.exists ? snap.data().balance : 0;
}

async function addBalance(userId, amount) {
  const ref = users.doc(userId);
  await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const current = doc.exists ? doc.data().balance : 0;
    tx.set(ref, { balance: current + amount }, { merge: true });
  });
}

async function checkBalance(userId, amount) {
  const balance = await getBalance(userId);
  if (balance < amount) {
    return {
      error: true,
      balance: balance,
      difference: amount - balance,
    };
  }

  return {
    error: false,
  };
}

export { getBalance, addBalance, checkBalance };
