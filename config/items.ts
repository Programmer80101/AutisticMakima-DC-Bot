import { Item } from "../firebase/item.js";
import currencies from "./currencies.js";
import emojis from "./emojis.js";

const items: Record<string, Item> = {
  moneyBag: {
    id: "moneyBag",
    emoji: emojis.item.moneyBag,
    name: `Bag of ${currencies.coin.name}`,
    description: `It's a bag full of ${currencies.coin.emoji} ${currencies.coin.name}!`,
    rarity: "common",
    autoClaim: true,
  },
  chest: {
    id: "chest",
    emoji: emojis.item.chest,
    name: "Chest",
    description: "It's a rusty old chest",
    rarity: "uncommon",
    autoClaim: true,
  },
};

export default items;
