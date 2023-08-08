import type { Client, SimpleSchemaTypes } from "@datocms/cli/lib/cma-client-node";

export default async function (client: Client) {
  const newFields: Record<string, SimpleSchemaTypes.Field> = {};
  const newItemTypes: Record<string, SimpleSchemaTypes.ItemType> = {};
  const newMenuItems: Record<string, SimpleSchemaTypes.MenuItem> = {};

  console.log("Create new models/block models");

  console.log('Create model "Translation" (`translation`)');
  newItemTypes["2229390"] = await client.itemTypes.create(
    {
      name: "Translation",
      api_key: "translation",
      all_locales_required: true,
      collection_appearance: "table",
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: true }
  );

  console.log("Creating new fields/fieldsets");

  console.log(
    'Create Single-line string field "Key" (`key`) in model "Translation" (`translation`)'
  );
  newFields["11637513"] = await client.fields.create(newItemTypes["2229390"], {
    label: "Key",
    field_type: "string",
    api_key: "key",
    validators: {
      required: {},
      unique: {},
      format: { custom_pattern: "^[a-z_]+$" },
    },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: false },
    },
    default_value: "",
  });

  console.log(
    'Create Single-line string field "Value" (`value`) in model "Translation" (`translation`)'
  );
  newFields["11637514"] = await client.fields.create(newItemTypes["2229390"], {
    label: "Value",
    field_type: "string",
    api_key: "value",
    localized: true,
    validators: { required: {} },
    appearance: {
      addons: [],
      editor: "single_line",
      parameters: { heading: true },
      type: "title",
    },
    default_value: { en: "", nl: "" },
  });

  console.log("Finalize models/block models");

  console.log('Update model "Translation" (`translation`)');
  await client.itemTypes.update(newItemTypes["2229390"], {
    ordering_field: newFields["11637514"],
    title_field: newFields["11637513"],
  });

  console.log("Manage menu items");

  console.log('Create menu item "Translations"');
  newMenuItems["1304241"] = await client.menuItems.create({
    label: "Translations",
    item_type: newItemTypes["2229390"],
  });

  console.log('Update menu item "Translations"');
  await client.menuItems.update(newMenuItems["1304241"], { position: 1 });
}
