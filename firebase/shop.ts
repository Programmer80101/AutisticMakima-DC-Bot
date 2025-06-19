import {
  QuerySnapshot,
  DocumentSnapshot,
  WriteBatch,
} from "firebase-admin/firestore";

import { getBalance, modifyBalance } from "./balance";
import { shopItems } from "./db";
import emojis from "../config/emojis";
import { toCamelCase, toKebabCase } from "../utility/string";

export interface ShopItem {
  id: string;
  emoji: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  autoClaim: boolean;
}

export type RemoveResult =
  | { error: true; description: string }
  | { error: false; description: string };

export type CheckResult =
  | { error: true; title: string; description: string }
  | { error: false; item: ShopItem };

export function getShopItemIdByName(name: string): string | null {
  return toCamelCase(name) || null;
}

export async function getAllShopItems(): Promise<ShopItem[]> {
  const snapshot: QuerySnapshot = await shopItems.get();
  if (snapshot.empty) return [];
  return snapshot.docs.map((doc: DocumentSnapshot) => {
    const data = doc.data() as Omit<ShopItem, "id">;
    return {
      id: doc.id,
      emoji: data.emoji,
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      autoClaim: data.autoClaim ?? false,
    };
  });
}

export async function getShopItemById(id: string): Promise<ShopItem | null> {
  const docRef = shopItems.doc(id);
  const doc: DocumentSnapshot = await docRef.get();
  if (!doc.exists) return null;
  const data = doc.data() as Omit<ShopItem, "id">;
  return {
    id: doc.id,
    emoji: data.emoji,
    name: data.name,
    description: data.description,
    price: data.price,
    stock: data.stock,
    autoClaim: data.autoClaim ?? false,
  };
}

export async function getShopItemByName(
  name: string
): Promise<ShopItem | null> {
  const id = toCamelCase(name);
  return (await getShopItemById(id)) ?? null;
}

export async function upsertShopItem(
  id: string,
  data: Partial<Omit<ShopItem, "id">>
): Promise<void> {
  const docRef = shopItems.doc(id);
  const doc: DocumentSnapshot = await docRef.get();
  if (doc.exists) {
    await docRef.update(data);
  } else {
    await docRef.set({
      emoji: data.emoji ?? "🟧",
      name: data.name ?? "*No name*",
      description: data.description ?? "*No description*",
      price: data.price ?? 1_000_000,
      stock: data.stock ?? 0,
      autoClaim: data.autoClaim ?? false,
    });
  }
}

export async function removeShopItemByName(
  itemName: string
): Promise<RemoveResult> {
  const snapshot: QuerySnapshot = await shopItems
    .where("name", "==", itemName)
    .get();
  if (snapshot.empty) {
    return {
      error: true,
      description: `Item with name *${itemName}* not found.`,
    };
  }
  const batch: WriteBatch = shopItems.firestore.batch();
  snapshot.docs.forEach((doc: DocumentSnapshot) => batch.delete(doc.ref));
  await batch.commit();
  return {
    error: false,
    description: `Successfully removed item *${itemName}*.`,
  };
}

export async function validatePurchase(
  userId: string,
  itemName: string,
  quantity: number = 1
): Promise<CheckResult> {
  if (quantity < 1) {
    return {
      error: true,
      title: "❌ Invalid Quantity",
      description: "You must buy at least one item.",
    };
  }

  const item = await getShopItemByName(itemName);
  if (!item) {
    return {
      error: true,
      title: "❌ Item Not Found",
      description: `Item with name **${itemName}** not found. Please check the spelling and try again. Use \`!shop\` to see the list of available items.`,
    };
  }

  if (item.stock <= 0) {
    return {
      error: true,
      title: "❌ Out of Stock",
      description:
        "The item that you want to buy is out of stock. Check back later!",
    };
  }

  if (item.stock < quantity) {
    return {
      error: true,
      title: "❌ Insufficient Stock",
      description: `The item that you want to buy has limited stock. We only have ${item.stock} left!`,
    };
  }

  const balance = await getBalance(userId);
  const totalPrice = item.price * quantity;

  if (balance < totalPrice) {
    return {
      error: true,
      title: "❌ Insufficient Balance",
      description: `You don't have enough coins to purchase this item. You need ${
        emojis.currency.coin
      } ${totalPrice - balance} more!`,
    };
  }

  return { error: false, item };
}

export async function buyItem(
  userId: string,
  item: ShopItem,
  quantity = 1
): Promise<void> {
  await modifyBalance(userId, -item.price * quantity);
  await upsertShopItem(item.id, { stock: item.stock - quantity });
}
