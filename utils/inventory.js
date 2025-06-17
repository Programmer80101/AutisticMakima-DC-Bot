import { FieldValue } from "firebase-admin/firestore";
import { db, users } from "../db.js";

async function getInventory(userId) {
  const snap = await users.doc(userId).get();
  return snap.exists ? snap.data().items : {};
}

async function modifyInventoryItem(userId, itemId, delta) {
  const userRef = users.doc(userId);
  await db.runTransaction(async (tx) => {
    const userSnap = await tx.get(userRef);
    const userData = userSnap.exists ? userSnap.data() : {};
    const items = userData.items ? userData.items : {};
    const current = items[itemId] || 0;
    const updated = current + delta;
    if (updated < 0) {
      throw new Error(`Cannot reduce below zero: have ${current}`);
    }
    if (updated === 0) {
      tx.update(userRef, { [`items.${itemId}`]: FieldValue.delete() });
    } else {
      tx.set(
        userRef,
        {
          items: {
            ...items,
            [itemId]: updated,
          },
        },
        {
          merge: true,
        }
      );
    }
  });
}

export { getInventory, modifyInventoryItem };
