import emojiConfig from "../config/emoji.js";

export default {
  bagOfCoins: {
    id: "bagOfCoins",
    emoji: emojiConfig.currency.moneyBag,
    name: "Bag of Coins",
    description: "It's a bag full of coins!",
  },
  autoResponse: {
    id: "autoResponse",
    shopItem: true,
    emoji: "💱",
    name: "Auto Response",
    description: "An Auto Response of your choice!",
  },
  customRole: {
    id: "customRole",
    shopItem: true,
    emoji: "🛡️",
    name: "Custom Role",
    description: "An private/custom role you can show off!",
  },
  customVc: {
    id: "customVc",
    shopItem: true,
    emoji: "🔊",
    name: "Custom VC",
    description: "An Custom VC for you and your friends!",
  },
  customChannel: {
    id: "customChannel",
    shopItem: true,
    emoji: "💬",
    name: "Custom Channel",
    description: "An Custom Channel for you and your friends!",
  },
  discordNitro: {
    id: "discordNitro",
    shopItem: true,
    emoji: "<:nitro:1374004904506425424>",
    name: "Discord Nitro",
    description: "A Discord Nitro",
  },
};
