import { SlashCommandBuilder } from "discord.js";

import { getRandomTip } from "../../utils.js";
import commandConfig from "../../commands.js";
import config from "../../config.js";

const command = commandConfig.basic.commands.rules;

const sendRules = async (source) => {
  let description = `Follow these rules all the time while using the bot! \n\n`;

  description += `**1. No Spamming**Don't spam commands or slash commands. \n`;
  description += `**3. No Exploiting**Don't exploit any bugs or glitches in the bot.\n`;
  description += `**2. No Alt Accounts**Don't use multiple accounts to get an advantage.\n`;

  description += `\n\n🪲 If you find any bugs or glitches, please report them to <@${config.owner.id}>. If you successfully report an exploit you'll be given ${config.emoji.general.currency} 100.`;
  description += `\n\n📄 If you found someone else breaking the rules, please report them to the moderators.`;
  description += `\n\n⚠️ If you break any of the rules, necessary action will be taken!`;

  const guideEmbed = {
    color: config.embed.color.default,
    title: `${command.emoji} Bot Rules`,
    description: description,
    footer: {
      text: getRandomTip(commandConfig.basic.name, command.name),
    },
  };

  await source.reply({
    embeds: [guideEmbed],
  });
};

export default {
  ...command,
  data: new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description),

  async execute(interaction) {
    await sendRules(interaction);
  },

  async prefix(message, args) {
    await sendRules(message);
  },
};
