import {
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  Message,
  SlashCommandBuilder,
} from "discord.js";
import os from "node-os-utils";

import { getRandomTip } from "../../utility/random";
import commands from "../../config/commands";
import colors from "../../config/colors";
import users from "../../config/users";

const command = commands.basic.commands.info;

const thresholds: {
  cpu: [number, number];
  memory: [number, number];
  ping: [number, number];
} = {
  cpu: [80, 95],
  memory: [75, 90],
  ping: [120, 300],
};

const getInfoEmbed = async (client: Client) => {
  const ownerId = users.owner.id;

  const latency = Math.round(client.ws.ping);
  const uptimeInSeconds = Math.floor((client.uptime ?? 0) / 1000);
  const cpuUsage = await os.cpu.usage();

  const memoryInfo = await os.mem.used();
  const totalMemory = Math.round(memoryInfo.totalMemMb);
  const memoryUsed = Math.round(memoryInfo.usedMemMb);

  const memoryUsage = (memoryUsed / totalMemory) * 100;

  let critical = "";
  let warning = "";
  let embedColor = colors.embed.status.success;

  const assignThresholds = (
    name: string,
    value: number,
    limits: [number, number]
  ) => {
    if (value >= limits[1]) {
      critical += `${name} is very high!\n`;
    } else if (value >= limits[0]) {
      warning += `${name} is slightly high!\n`;
    }
  };

  assignThresholds("Ping", latency, thresholds.ping);
  assignThresholds("CPU Usage", cpuUsage, thresholds.cpu);
  assignThresholds("Memory Usage", memoryUsage, thresholds.memory);

  const fields = [
    {
      name: "👤 Owner",
      value: `<@${ownerId}>`,
    },
    {
      name: "🕔 Uptime",
      value:
        `${Math.floor(uptimeInSeconds / 3600)}h ` +
        `${Math.floor((uptimeInSeconds % 3600) / 60)}m ` +
        `${uptimeInSeconds % 60}s`,
    },
    {
      name: "⚡ Latency",
      value: `${latency}ms`,
    },
    {
      name: "🗄️ CPU Usage",
      value: `${cpuUsage.toFixed(2)}%`,
    },
    {
      name: "🧠 Memory",
      value: `${memoryUsage.toFixed(2)}%`,
    },
  ];

  if (warning) {
    embedColor = colors.embed.status.warning;
    fields.push({
      name: "🟡 Warning",
      value: warning,
    });
  }

  if (critical) {
    embedColor = colors.embed.status.error;
    fields.push({
      name: "🔴 Critical",
      value: critical,
    });
  }

  if (!warning && !critical) {
    fields.push({
      name: "🟢 Normal",
      value: "Everthing is normal!",
    });
  }

  return new EmbedBuilder()
    .setColor(embedColor)
    .setTitle("🤖 Bot Information")
    .setDescription("All necessary information about the bot!")
    .setFields(fields)
    .setFooter({
      text: getRandomTip(commands.basic.name, command.name),
    });
};

export default {
  ...command,
  data: new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
      embeds: [await getInfoEmbed(interaction.client)],
    });
  },

  async prefix(message: Message, _args: string[]) {
    await message.reply({ embeds: [await getInfoEmbed(message.client)] });
  },
};
