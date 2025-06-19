import {
  ChatInputCommandInteraction,
  Interaction,
  Message,
  SlashCommandBuilder,
} from "discord.js";

import { getRandomTip } from "../../utility/random";
import commandConfig from "../../config/commands";
import colors from "../../config/colors";
import emojis from "../../config/emojis";
import users from "../../config/users";

const command = commandConfig.basic.commands.rules;

const sendRules = async (source: ChatInputCommandInteraction | Message) => {
  let description = `Follow these rules all the time while using the bot! \n\n`;

  description += `**1. No Spamming**Don't spam commands or slash commands. \n`;
  description += `**3. No Exploiting**Don't exploit any bugs or glitches in the bot.\n`;
  description += `**2. No Alt Accounts**Don't use multiple accounts to get an advantage.\n`;

  description += `\n\n🪲 If you find any bugs or glitches, please report them to <@${users.owner.id}>. If you successfully report an exploit you'll be given ${emojis.currency.coin} 100.`;
  description += `\n\n📄 If you found someone else breaking the rules, please report them to the moderators.`;
  description += `\n\n⚠️ If you break any of the rules, necessary action will be taken!`;

  const guideEmbed = {
    color: colors.embed.status.success,
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

  async execute(interaction: ChatInputCommandInteraction) {
    await sendRules(interaction);
  },

  async prefix(message: Message, _args: string[]) {
    await sendRules(message);
  },
};
