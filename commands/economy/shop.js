import { SlashCommandBuilder } from "discord.js";

import { getAllShopItems } from "../../utils/shop.js";
import { getRandomTip } from "../../utils.js";
import commandConfig from "../../commands.js";
import config from "../../config.js";

const command = commandConfig.economy.commands.shop;

const getShopEmbed = async (source) => {
  const allItems = await getAllShopItems();
  const fields = allItems.map(({ emoji, name, price, stock, description }) => ({
    name: `${emoji} ${stock > 0 ? name : `~~${name}~~`}`,
    value: `Price: ${config.emoji.general.currency} ${price} | Stock: ${stock} \n${description}`,
  }));

  const shopEmbed = {
    title: `🛍️ ${source.guild.name} Shop`,
    color: config.embed.color.default,
    description: `Buy an item from the shop using \`${config.prefix}buy (item name)\`!`,
    fields: fields,
    footer: {
      text: getRandomTip(commandConfig.economy.name, command.name),
    },
  };

  return shopEmbed;
};

export default {
  ...command,
  data: new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description),

  async execute(interaction) {
    await interaction.deferReply();
    const shopEmbed = await getShopEmbed(interaction);

    await interaction.editReply({
      embeds: [shopEmbed],
    });
  },

  async prefix(message) {
    const shopEmbed = await getShopEmbed(message);
    await message.reply({
      embeds: [shopEmbed],
    });
  },
};
