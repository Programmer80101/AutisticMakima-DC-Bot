import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  Message,
  SlashCommandBuilder,
  User,
} from "discord.js";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import duration from "dayjs/plugin/duration.js";

import { getRandomTip } from "../../utility/random";
import commandConfig from "../../config/commands";
import colors from "../../config/colors";
import emojis from "../../config/emojis";

dayjs.extend(relativeTime);
dayjs.extend(duration);

const command = commandConfig.basic.commands.user;

const getUserEmbed = async (user: User, member: GuildMember | undefined) => {
  const createdAt = `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`;

  if (!member) {
    return new EmbedBuilder()
      .setColor(colors.embed.status.error)
      .setTitle(`${emojis.status.error} User Not Found`)
      .setDescription("Unable to find that user.");
  }

  const joinedAt = member.joinedTimestamp
    ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`
    : "N/A";

  const accountAgeInMs = Date.now() - user.createdTimestamp;
  const serverAgeInMs = Date.now() - (member.joinedTimestamp ?? 0);

  const accountAge = dayjs.duration(accountAgeInMs).humanize();
  const serverAge = dayjs.duration(serverAgeInMs).humanize();

  const roles =
    member.roles.cache
      .filter((r) => r.id !== member.guild.id)
      .sort((a, b) => b.position - a.position)
      .map((r) => r.toString())
      .join("\n") || "*None*";

  return new EmbedBuilder()
    .setColor(colors.embed.status.info)
    .setTitle(`User: ${user}`)
    .setDescription("User Information")
    .addFields({
      name: "🆔 ID",
      value: user.id,
    })
    .addFields({
      name: "📅 Created",
      value: createdAt,
    })
    .addFields({
      name: "👤 Username",
      value: user.username,
    })
    .addFields({
      name: "💳 Display Name",
      value: user.globalName || "*None*",
    })
    .addFields({
      name: "🗄️ Server Nickname",
      value: member.nickname || "*None*",
    })
    .addFields({
      name: "🚪 Joined",
      value: joinedAt,
    })
    .addFields({
      name: "⏰ Account Age",
      value: accountAge,
    })
    .addFields({
      name: "🕘 Server Age",
      value: serverAge,
    })
    .addFields({
      name: "⚙️ Roles",
      value: roles,
    })
    .setFooter({ text: getRandomTip(commandConfig.basic.name, command.name) });
};

export default {
  ...command,
  data: new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description)
    .addUserOption((option) => {
      return option
        .setName(command.args[0].name)
        .setDescription(command.args[0].description)
        .setRequired(command.args[0].required);
    }),

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("target") || interaction.user;
    const member = await interaction.guild?.members.fetch(user.id);

    const userEmbed = await getUserEmbed(user, member);

    await interaction.reply({ embeds: [userEmbed] });
  },

  async prefix(message: Message, _args: string[]) {
    const user = message.mentions.users.first() || message.author;
    const member = await message.guild?.members.fetch(user.id);

    const userEmbed = await getUserEmbed(user, member);

    await message.reply({ embeds: [userEmbed] });
  },
};
