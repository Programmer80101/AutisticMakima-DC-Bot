import { camelCase, kebabCase } from "change-case";

export const toCamelCase = (str: string): string => camelCase(str);
export const toKebabCase = (str: string): string => kebabCase(str);

export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
