import { ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";

import { modifyBalance } from "../../firebase/balance";
import { random } from "../../utility/random";
import colors from "../../config/colors";
import items from "../../config/items";

const item = items.moneyBag;

const getEmbed = (loot: number) => {
  return new EmbedBuilder()
    .setColor(colors.embed.status.success)
    .setTitle(`You opened a ${item.emoji} ${item.name}!`)
    .setDescription(`You found **${loot}** coins!`);
};

export default async function (
  userId: string,
  source: ChatInputCommandInteraction | Message
): Promise<void> {
  const loot = random.integer(item.minLoot, item.maxLoot);
  modifyBalance(userId, loot);
  await source.reply({ embeds: [getEmbed(loot)] });
}
