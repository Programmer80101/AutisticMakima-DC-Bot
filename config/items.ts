import { Item } from "../firebase/item.js";
import emojis from "./emojis.js";

const items: Record<string, Item> = {
  moneyBag: {
    id: "moneyBag",
    emoji: emojis.item.moneyBag,
    name: "Bag of Coins",
    description: "It's a bag full of coins!",
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
