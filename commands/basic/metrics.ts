import {
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  Message,
  SlashCommandBuilder,
} from "discord.js";
import { platform } from "os";

import checkDiskSpace from "check-disk-space";
import si from "systeminformation";
import os from "node-os-utils";

import { getRandomTip } from "../../utility/random";
import commands from "../../config/commands";
import colors from "../../config/colors";
import users from "../../config/users";

const command = commands.basic.commands.metrics;

const diskPath = platform() === "win32" ? "C:/" : "/";

const thresholds: {
  cpu: [number, number];
  disk: [number, number];
  memory: [number, number];
  ping: [number, number];
} = {
  cpu: [80, 95],
  disk: [80, 90],
  memory: [75, 90],
  ping: [120, 300],
};

const getMetricsEmbed = async (client: Client): Promise<EmbedBuilder> => {
  const ownerId = users.owner.id;

  const latency = Math.round(client.ws.ping);

  const uptimeInSeconds = Math.floor((client.uptime ?? 0) / 1000);

  const cpuUsage = await os.cpu.usage();

  const { free, size } = await checkDiskSpace(diskPath);
  const diskUsage = Math.round(((size - free) / size) * 100);

  const netStatsArray = await si.networkStats();

  const totalSent = netStatsArray.reduce(
    (sum, iface) => sum + iface.tx_bytes,
    0
  );

  const totalReceived = netStatsArray.reduce(
    (sum, iface) => sum + iface.rx_bytes,
    0
  );

  const sentMb = (totalSent / 1024 / 1024).toFixed(2);
  const receivedMb = (totalReceived / 1024 / 1024).toFixed(2);

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
  assignThresholds("Disk Usage", diskUsage, thresholds.disk);
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
      inline: true,
    },
    {
      name: "🗄️ CPU Usage",
      value: `${cpuUsage.toFixed(2)}%`,
      inline: true,
    },
    {
      name: "💾 Disk Usage",
      value: `${diskUsage}%`,
      inline: true,
    },
    {
      name: "🧠 Memory",
      value: `${memoryUsage.toFixed(2)}%`,
      inline: true,
    },
    {
      name: "📡 Network I/O",
      value: `⬆️ ${sentMb}MB / ⬇️ ${receivedMb}MB`,
      inline: true,
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
    .setTitle("🤖 Bot Metrics")
    .setDescription("Important metrics about the bot!")
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
      embeds: [await getMetricsEmbed(interaction.client)],
    });
  },

  async prefix(message: Message, _args: string[]) {
    await message.reply({ embeds: [await getMetricsEmbed(message.client)] });
  },
};
