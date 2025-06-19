import { ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";

import { modifyBalance } from "../../firebase/balance";
import colors from "../../config/colors";
import items from "../../config/items";

const itemEmoji = items.moneyBag.emoji;
const itemName = items.moneyBag.name;

const getEmbed = (loot: number) => {
  return new EmbedBuilder()
    .setColor(colors.embed.status.success)
    .setTitle(`You opened a ${itemEmoji} ${itemName}!`)
    .setDescription(`You found **${loot}** coins!`);
};

export default async function (
  userId: string,
  source: ChatInputCommandInteraction | Message
): Promise<void> {
  const loot = Math.ceil(Math.random() * 15);
  modifyBalance(userId, loot);
  await source.reply({ embeds: [getEmbed(loot)] });
}
