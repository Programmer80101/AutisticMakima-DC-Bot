import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} from "discord.js";

import commandsData from "../../adminCommands.js";
import { autoCompleteShopItems } from "../../utils/autocomplete.js";
import { getShopItemByName, upsertShopItem } from "../../utils/shop.js";
import { getItemId } from "../../utils.js";

const command = commandsData.economy.commands.shopset;

export default {
  ...command,
  data: new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName(commandsData.economy.commands.shopset.args[0].name)
        .setDescription(
          commandsData.economy.commands.shopset.args[0].description
        )
        .setRequired(commandsData.economy.commands.shopset.args[0].required)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName(commandsData.economy.commands.shopset.args[1].name)
        .setDescription(
          commandsData.economy.commands.shopset.args[1].description
        )
        .setRequired(commandsData.economy.commands.shopset.args[1].required)
    )
    .addStringOption((option) =>
      option
        .setName(commandsData.economy.commands.shopset.args[2].name)
        .setDescription(
          commandsData.economy.commands.shopset.args[2].description
        )
        .setRequired(commandsData.economy.commands.shopset.args[2].required)
    )
    .addIntegerOption((option) =>
      option
        .setName(commandsData.economy.commands.shopset.args[3].name)
        .setDescription(
          commandsData.economy.commands.shopset.args[3].description
        )
        .setRequired(commandsData.economy.commands.shopset.args[3].required)
    )
    .addIntegerOption((option) =>
      option
        .setName(commandsData.economy.commands.shopset.args[4].name)
        .setDescription(
          commandsData.economy.commands.shopset.args[4].description
        )
        .setRequired(commandsData.economy.commands.shopset.args[4].required)
    )
    .addBooleanOption((option) =>
      option
        .setName(commandsData.economy.commands.shopset.args[5].name)
        .setDescription(
          commandsData.economy.commands.shopset.args[5].description
        )
        .setRequired(commandsData.economy.commands.shopset.args[5].required)
    ),

  async autocomplete(interaction) {
    await autoCompleteShopItems(interaction);
  },

  async execute(interaction) {
    const itemName = interaction.options.getString(
      commandsData.economy.commands.shopset.args[0].name
    );
    const itemEmoji = interaction.options.getString(
      commandsData.economy.commands.shopset.args[1].name
    );
    const itemDescription = interaction.options.getString(
      commandsData.economy.commands.shopset.args[2].name
    );
    const itemPrice = interaction.options.getInteger(
      commandsData.economy.commands.shopset.args[3].name
    );
    const itemStock = interaction.options.getInteger(
      commandsData.economy.commands.shopset.args[4].name
    );
    const itemAutoClaim = interaction.options.getBoolean(
      commandsData.economy.commands.shopset.args[5].name
    );

    await interaction.deferReply({
      content: `Updating item **${itemName}**...`,
      flags: MessageFlags.Ephemeral,
    });

    const item = await getShopItemByName(itemName);

    await upsertShopItem(getItemId(itemName), {
      name: itemName ?? item.name,
      emoji: itemEmoji ?? item.emoji,
      description: itemDescription ?? item.description,
      price: itemPrice ?? item.price,
      stock: itemStock ?? item.stock,
      autoClaim: itemAutoClaim ?? item.autoClaim,
    });

    await interaction.editReply({
      content: `Item **${itemName}** has been updated!`,
      flags: MessageFlags.Ephemeral,
    });
  },

  async prefix(message) {
    return;
  },
};
