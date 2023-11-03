import { Client, SimpleSchemaTypes } from "@datocms/cli/lib/cma-client-node";

export default async function (client: Client) {
  const newFields: Record<string, SimpleSchemaTypes.Field> = {};
  const newItemTypes: Record<string, SimpleSchemaTypes.ItemType> = {};

  console.log("Create new models/block models");

  console.log('Create block model "Image Block" (`image_block`)');
  newItemTypes["ZdBokLsWRgKKjHrKeJzdpw"] = await client.itemTypes.create(
    {
      name: "Image Block",
      api_key: "image_block",
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: true }
  );

  console.log("Creating new fields/fieldsets");

  console.log(
    'Create Single asset field "Image" (`image`) in block model "Image Block" (`image_block`)'
  );
  newFields["nl2r21M8SnKAgtrAmA9Ctw"] = await client.fields.create(
    newItemTypes["ZdBokLsWRgKKjHrKeJzdpw"],
    {
      label: "Image",
      field_type: "file",
      api_key: "image",
      validators: {
        required: {},
        extension: { extensions: [], predefined_list: "image" },
        required_alt_title: { title: false, alt: true },
      },
      appearance: { addons: [], editor: "file", parameters: {} },
      default_value: null,
    }
  );

  console.log("Update existing fields/fieldsets");

  console.log(
    'Update Modular content field "Body" (`body_blocks`) in model "Home" (`home`)'
  );
  await client.fields.update("pUj2PObgTyC-8X4lvZLMBA", {
    validators: {
      rich_text_blocks: {
        item_types: [
          "PAk40zGjQJCcDXXPgygUrA",
          newItemTypes["ZdBokLsWRgKKjHrKeJzdpw"].id,
          "0SxYNS2CR1it_5LHYWuEQg",
        ],
      },
    },
  });

  console.log(
    'Update Modular content field "Body" (`body_blocks`) in model "Page" (`page`)'
  );
  await client.fields.update("Q-z1nyMsQtC8Sr6w6J2oGw", {
    validators: {
      rich_text_blocks: {
        item_types: [
          "PAk40zGjQJCcDXXPgygUrA",
          newItemTypes["ZdBokLsWRgKKjHrKeJzdpw"].id,
          "0SxYNS2CR1it_5LHYWuEQg",
        ],
      },
    },
  });
}
