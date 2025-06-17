import { getInventory, modifyInventoryItem } from "./inventory.js";
import { getShopItemById } from "./shop.js";

async function checkUseItem(userId, itemId) {
  const shopItem = await getShopItemById(itemId);

  if (!shopItem) { 
    return {
      error: true,
      title: "❌ Item not found",
      message: "The item you are trying to use does not exist.",
    };
  }

  const inv = await getInventory(userId);

  const quantity = inv[itemId] || 0;
  if (quantity <= 0) {
    return {
      error: true,
      title: "❌ Item not found",
      message: "You do not have that item in your inventory.",
    };
  }

  return {
    error: false,
    item: shopItem,
  };
}

async function useItem(userId, itemId) {
  await modifyInventoryItem(userId, itemId, -1);
}

export { checkUseItem, useItem };
