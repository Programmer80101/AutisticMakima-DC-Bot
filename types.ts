import { Client, Collection } from "discord.js";

import commands from "./config/commands";

export interface BotClient extends Client {
  commands: Collection<string, CommandModule>;
  cooldowns: Collection<string, Collection<string, number>>;
}

export type CommandModule = CommandShape & {
  data: { name: string };
  prefix: (...args: any[]) => Promise<unknown> | unknown;
  execute: (...args: any[]) => Promise<unknown> | unknown;
  autocomplete: (...args: any[]) => Promise<unknown> | unknown;
};

export type EventModule = {
  name: string;
  once?: boolean;
  execute: (...args: any[]) => Promise<unknown> | unknown;
};

export type Commands = typeof commands;
export type CategoryKey = keyof Commands;
export type TipMap = Record<string, string>;

export interface CommandArg {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface CommandShape {
  name: string;
  emoji: string;
  cooldown?: number;
  description: string;
  aliases: string[];
  usage: string;
  args?: CommandArg[];
  notes?: string | string[];
  tips: TipMap;
}
