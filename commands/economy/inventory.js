import { SlashCommandBuilder } from "discord.js";

import { getInventory } from "../../utils/inventory.js";
import { getShopItemById } from "../../utils/shop.js";
import { getRandomTip } from "../../utils.js";
import commandConfig from "../../commands.js";
import config from "../../config.js";

const command = commandConfig.economy.commands.inventory;

const sendInventory = async (source, user) => {
  const inv = (await getInventory(user.id)) || {};
  const fields = Object.entries(inv).map(async ([itemId, amount]) => {
    const item = await getShopItemById(itemId);
    return {
      name: `${item.emoji} ${item.name}`,
      value: `Amount: ${amount}`,
    };
  });

  const invEmbed = {
    color: config.embed.color.default,
    title: `${command.emoji} Inventory: ${user.username}`,
    description: `Inventory of ${user}!`,
    fields:
      fields.length > 0
        ? await Promise.all(fields)
        : [
            {
              name: "No items",
              value: "You have no items in your inventory.",
            },
          ],
    footer: {
      text: getRandomTip(commandConfig.economy.name, command.name),
    },
  };

  await source.reply({ embeds: [invEmbed] });
};

export default {
  ...command,
  data: new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description),

  async execute(interaction) {
    await sendInventory(interaction, interaction.user);
  },

  async prefix(message) {
    await sendInventory(message, message.author);
  },
};
