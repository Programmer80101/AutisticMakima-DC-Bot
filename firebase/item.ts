import { getInventory, modifyInventoryItem } from "./inventory";
import { getShopItemById, type ShopItem } from "./shop";
import items from "../config/items";

export function getItemIdByName(name: string): string | null {
  const item = getItemByName(name);
  if (item) return item.id;
  return null;
}

export function getItemById(id: string): Item | null {
  if (!id) return null;
  if (items && items[id]) return items[id] as Item;
  return null;
}

export function getItemByName(name: string) {
  const query = name.trim().toLowerCase();

  for (const item of Object.values(items)) {
    if (item.name.toLowerCase() === query || item.id === query) {
      return item;
    }
  }

  return null;
}

export interface Item {
  id: string;
  emoji: string;
  name: string;
  description: string;
  autoClaim: boolean;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
}

export type ItemUseResult =
  | { error: true; title: string; description: string }
  | { error: false; item: ShopItem | Item };

export async function validateItemUse(
  userId: string,
  itemId: string
): Promise<ItemUseResult> {
  const item = getItemById(itemId) || (await getShopItemById(itemId));
  if (!item) {
    return {
      error: true,
      title: "❌ Item not found",
      description: "The item you are trying to use does not exist.",
    };
  }

  const inv = await getInventory(userId);
  const quantity = inv[itemId] ?? 0;

  if (quantity <= 0) {
    return {
      error: true,
      title: "❌ Item not found",
      description: "You do not have that item in your inventory.",
    };
  }

  return { error: false, item: item };
}

export async function useItem(userId: string, itemId: string): Promise<void> {
  await modifyInventoryItem(userId, itemId, -1);
}
