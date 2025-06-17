import { Client, GatewayIntentBits, Collection } from "discord.js";
import express from "express";

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { getAllShopItems } from "./utils/shop.js";
import { registerCache } from "./cache.js";
import "./config.js";
import "./db.js";

const dirname = import.meta.dirname;

const app = express();

// Cache Registration

registerCache("shopItems", getAllShopItems);

// Endpoints

app.get("/ping", (req, res) => {
  res.sendStatus(200);
});

// Start Express Server

const PORT = process.env.PORT || 10_000;
app.listen(PORT, () => {
  console.log(`✅ Server started at port: ${PORT}`);
});

// Jobs

import selfPing from "./jobs/selfPing.js";

selfPing(10);

// Bot Setup

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();
client.cooldowns = new Collection();

const foldersPath = path.join(dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

// Command Handler

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const commandModule = await import(pathToFileURL(filePath).href);
    const command = commandModule.default;

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

const eventsPath = path.join(dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const eventModule = await import(pathToFileURL(filePath).href);
  const event = eventModule.default;

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(process.env.TOKEN);
