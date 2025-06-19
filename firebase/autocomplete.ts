import { cache } from "../cache";
import { AutocompleteInteraction } from "discord.js";

export async function autoCompleteShopItems(
  interaction: AutocompleteInteraction
): Promise<void> {
  const focusedValue = interaction.options.getFocused() as string;
  const items = await cache.get<{ name: string }[]>("shopItems");
  const choices = items
    .map((i) => i.name)
    .filter((n) => n.toLowerCase().startsWith(focusedValue.toLowerCase()))
    .slice(0, 25);

  await interaction.respond(
    choices.map((choice) => {
      return { name: choice, value: choice };
    })
  );
}
