import { Client, GatewayIntentBits, Collection } from "discord.js";
import express, { Request, Response } from "express";

import { pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

import { BotClient, CommandModule, EventModule } from "./types";
import { getAllShopItems } from "./firebase/shop";
import { cache } from "./cache";
import "./firebase/db";
import "./config";

const dirname = import.meta.dirname;

const app = express();

// Cache Registration

cache.register("shopItems", getAllShopItems);

await cache.initAll();

// Endpoints

app.get("/ping", (_req: Request, res: Response) => {
  res.sendStatus(200);
});

// Start Express Server

const PORT = process.env.PORT || 10_000;

app.listen(PORT, () => {
  console.log(`✅ Server started at port: ${PORT}`);
});

// Jobs

import selfPing from "./jobs/self-ping";

selfPing(10);

// Bot Setup

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
}) as BotClient;

client.commands = new Collection();
client.cooldowns = new Collection();

const commandsDir = path.join(dirname, "commands");
const commandFolders = fs.readdirSync(commandsDir);

// Command Handler

for (const folder of commandFolders) {
  const commandsPath = path.join(commandsDir, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const modulePath = pathToFileURL(filePath).href;
    const { default: command } = (await import(modulePath)) as {
      default: CommandModule;
    };

    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] ⚠️ The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

// Event Handler

const eventsDir = path.join(dirname, "events", "discord");
const eventFiles = fs
  .readdirSync(eventsDir)
  .filter((file) => file.endsWith(".ts"));

for (const file of eventFiles) {
  const filePath = path.join(eventsDir, file);
  const modulePath = pathToFileURL(filePath).href;
  const { default: event } = (await import(modulePath)) as {
    default: EventModule;
  };

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(process.env.TOKEN);
