import { getCache } from "../cache.js";

const autoCompleteShopItems = async (interaction) => {
  const focusedValue = interaction.options.getFocused();
  const items = getCache("shopItems");
  const choices = items.map((item) => item.name);
  const filtered = choices
    .filter((choice) =>
      choice.toLowerCase().startsWith(focusedValue.toLowerCase())
    )
    .slice(0, 25);

  await interaction.respond(
    filtered.map((choice) => ({ name: choice, value: choice }))
  );
};

export { autoCompleteShopItems };
