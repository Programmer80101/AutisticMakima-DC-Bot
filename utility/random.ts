import weighted from "weighted";
import { Random } from "random-js";

import { CategoryKey, CommandShape } from "../types";
import { toCamelCase } from "./string";

import commands from "../config/commands";

export const random = new Random();

export function pickWeightedOption<K extends string>(
  options: Record<K, number>
): K {
  const values = Object.keys(options) as K[];
  const weights = values.map((v) => options[v]);
  return weighted.select(values, weights) as K;
}

export const getRandomTip = (
  categoryName: string,
  exception: string = ""
): string => {
  const categoryKey = toCamelCase(categoryName) as CategoryKey;
  const category = (commands as any)[categoryKey];

  const allCommands = Object.values(category.commands) as CommandShape[];

  const validCommands = allCommands.filter(
    (command) => command.name !== exception
  );

  if (validCommands.length === 0) return "";

  const command = random.pick(validCommands) as CommandShape;
  return random.pick(Object.values(command.tips)) || "";
};
