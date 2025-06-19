import {
  APIEmbed,
  ChatInputCommandInteraction,
  Embed,
  EmbedBuilder,
  Message,
  SlashCommandBuilder,
} from "discord.js";

import { getAllShopItems } from "../../firebase/shop";
import { getRandomTip } from "../../utility/random";
import commandConfig from "../../config/commands";
import emojis from "../../config/emojis";
import colors from "../../config/colors";
import bot from "../../config/bot";

const command = commandConfig.economy.commands.shop;

const getShopEmbed = async (
  source: ChatInputCommandInteraction | Message
): Promise<EmbedBuilder> => {
  const allItems = await getAllShopItems();

  const fields = allItems.map(({ emoji, name, price, stock, description }) => ({
    name: `${emoji} ${stock > 0 ? name : `~~${name}~~`}`,
    value: `Price: ${emojis.currency.coin} ${price} | Stock: ${stock} \n${description}`,
  }));

  const serverName = source.guild?.name ?? "Server";

  return new EmbedBuilder()
    .setColor(colors.embed.status.info)
    .setTitle(`🛍️ ${serverName} Shop`)
    .setDescription(
      `Buy an item from the shop using \`${bot.prefix}buy (item name)\`!`
    )
    .setFields(fields)
    .setFooter({
      text: getRandomTip(commandConfig.economy.name, command.name),
    });
};

export default {
  ...command,
  data: new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const shopEmbed = await getShopEmbed(interaction);

    await interaction.editReply({
      embeds: [shopEmbed],
    });
  },

  async prefix(message: Message) {
    const shopEmbed = await getShopEmbed(message);
    await message.reply({
      embeds: [shopEmbed],
    });
  },
};
