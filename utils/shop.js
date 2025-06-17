import { getBalance, addBalance } from "./balance.js";
import { shopItems } from "../db.js";
import { getItemId } from "../utils.js";
import config from "../config.js";

async function getAllShopItems() {
  const snapshot = await shopItems.get();
  if (snapshot.empty) {
    return [];
  }

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      emoji: data.emoji,
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      autoClaim: data.autoClaim || false,
    };
  });
}

async function getShopItemById(id) {
  const docRef = shopItems.doc(id);
  const doc = await docRef.get();

  if (!doc.exists) return null;
  const data = doc.data();
  return {
    id: doc.id,
    emoji: data.emoji,
    name: data.name,
    description: data.description,
    price: data.price,
    stock: data.stock,
    autoClaim: data.autoClaim || false,
  };
}

async function getShopItemByName(name) {
  const id = getItemId(name);
  const item = await getShopItemById(id);
  return item || null;
}

async function upsertShopItem(id, data) {
  const docRef = shopItems.doc(id);
  const doc = await docRef.get();

  if (doc.exists) {
    await docRef.update(data);
  } else {
    await docRef.set({
      emoji: data.emoji || "🟧",
      name: data.name || "*No name*",
      description: data.description || "*No description*",
      price: data.price || 1_000_000,
      stock: data.stock || 0,
      autoClaim: data.autoClaim || false,
    });
  }
}

async function removeShopItemByName(itemName) {
  const snapshot = await shopItems.where("name", "==", itemName).get();
  if (snapshot.empty) {
    return { error: true, message: `Item with name *${itemName}* not found.` };
  }

  const batch = shopItems.firestore.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();

  return { error: false, message: `Successfully removed item *${itemName}*.` };
}

async function checkBuyItem(userId, itemName, quantity = 1) {
  if (quantity < 1) {
    return {
      error: true,
      title: "❌ Invalid Quantity",
      message: "You must buy at least one item.",
    };
  }

  const item = await getShopItemByName(itemName);
  if (!item) {
    return {
      error: true,
      title: "❌ Item Not Found",
      message: `Item with name **${itemName}** not found. Please check the spelling and try again. Use \`!shop\` to see the list of available items.`,
    };
  }

  if (item.stock <= 0) {
    return {
      error: true,
      title: "❌ Out of Stock",
      message:
        "The item that you want to buy is out of stock. Check back later!",
    };
  }

  if (item.stock < quantity) {
    return {
      error: true,
      title: "❌ Insufficient Stock",
      message: `The item that you want to buy has limited stock. We only have ${item.stock} left!`,
    };
  }

  const balance = await getBalance(userId);
  const totalPrice = item.price * quantity;

  if (balance < totalPrice) {
    return {
      error: true,
      title: "❌ Insufficient Balance",
      message: `You don't have enough coins to purchase this item. You need ${
        config.emoji.general.currency
      } ${totalPrice - balance} more!`,
    };
  }

  return {
    error: false,
    item: item,
  };
}

async function buyItem(userId, item, quantity = 1) {
  await addBalance(userId, -item.price);
  await upsertShopItem(item.id, {
    stock: item.stock - quantity,
  });
}

export {
  getShopItemByName,
  getShopItemById,
  getAllShopItems,
  upsertShopItem,
  checkBuyItem,
  buyItem,
};
