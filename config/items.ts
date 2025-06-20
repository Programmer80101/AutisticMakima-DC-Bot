import { Item } from "../types";
import currencies from "./currencies";
import emojis from "./emojis";

const items: Record<string, Item> = {
  moneyBag: {
    id: "moneyBag",
    emoji: emojis.item.moneyBag,
    name: `Bag of ${currencies.coin.name}`,
    description: `It's a bag full of ${currencies.coin.emoji} ${currencies.coin.name}! \nIt can hold upto 20 coins.`,
    rarity: "common",
    autoClaim: true,
    minLoot: 5,
    maxLoot: 20,
  },
  chest: {
    id: "chest",
    emoji: emojis.item.chest,
    name: "Chest",
    description: "It's a rusty old chest",
    rarity: "uncommon",
    autoClaim: true,
    minLoot: 100,
    maxLoot: 500,
  },
};

export default items;
