import type { Client, SimpleSchemaTypes } from "@datocms/cli/lib/cma-client-node";

export default async function (client: Client) {
  const newFields: Record<string, SimpleSchemaTypes.Field> = {};
  const newFieldsets: Record<string, SimpleSchemaTypes.Fieldset> = {};
  const newItemTypes: Record<string, SimpleSchemaTypes.ItemType> = {};
  const newPlugins: Record<string, SimpleSchemaTypes.Plugin> = {};

  console.log("Manage upload filters");

  console.log('Install plugin "Table Editor"');
  newPlugins["z58SHsTGSJ2cu4DN4IV_Xw"] = await client.plugins.create({
    package_name: "datocms-plugin-table-editor",
  });

  console.log("Create new models/block models");

  console.log('Create block model "Table Block" (`table_block`)');
  newItemTypes["XY9BRCLqQbWFJKcpy8_vjg"] = await client.itemTypes.create(
    {
      name: "Table Block",
      api_key: "table_block",
      modular_block: true,
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: true }
  );

  console.log("Creating new fields/fieldsets");

  console.log(
    'Create Single-line string field "Title" (`title`) in block model "Table Block" (`table_block`)'
  );
  newFields["9Cz6E74WTnKAUPsLBKKmAQ"] = await client.fields.create(
    newItemTypes["XY9BRCLqQbWFJKcpy8_vjg"],
    {
      label: "Title",
      field_type: "string",
      api_key: "title",
      appearance: {
        addons: [],
        editor: "single_line",
        parameters: { heading: false },
      },
      default_value: "",
    }
  );

  console.log(
    'Create JSON field "Table" (`table`) in block model "Table Block" (`table_block`)'
  );
  newFields["HLttnhqESOuNqx05TG67tQ"] = await client.fields.create(
    newItemTypes["XY9BRCLqQbWFJKcpy8_vjg"],
    {
      label: "Table",
      field_type: "json",
      api_key: "table",
      validators: { required: {} },
      appearance: {
        addons: [],
        editor: newPlugins["z58SHsTGSJ2cu4DN4IV_Xw"].id,
        parameters: {},
        field_extension: "table",
      },
      default_value: null,
    }
  );

  console.log('Create fieldset "Meta" in model "Page" (`page`)');
  newFieldsets["vQtsm7PNQ12nFLf35GQJNA"] = await client.fieldsets.create(
    "2596445",
    { title: "Meta", collapsible: true, start_collapsed: true }
  );

  console.log('Create fieldset "Content" in model "Page" (`page`)');
  newFieldsets["s3qpmLcGR-eJER6BrPs9Ng"] = await client.fieldsets.create(
    "2596445",
    { title: "Content" }
  );

  console.log(
    'Create Modular content field "Body" (`body_blocks`) in model "Page" (`page`)'
  );
  newFields["CxG9j_VzRFCsQM_cCV4GQQ"] = await client.fields.create("2596445", {
    label: "Body",
    field_type: "rich_text",
    api_key: "body_blocks",
    localized: true,
    validators: {
      rich_text_blocks: {
        item_types: [newItemTypes["XY9BRCLqQbWFJKcpy8_vjg"].id],
      },
    },
    appearance: {
      addons: [],
      editor: "rich_text",
      parameters: { start_collapsed: true },
    },
    fieldset: newFieldsets["s3qpmLcGR-eJER6BrPs9Ng"],
  });

  console.log("Update existing fields/fieldsets");

  console.log('Update Slug field "Slug" (`slug`) in model "Page" (`page`)');
  await client.fields.update("13623256", {
    position: 0,
    fieldset: newFieldsets["vQtsm7PNQ12nFLf35GQJNA"],
  });

  console.log(
    'Update SEO meta tags field "SEO" (`seo`) in model "Page" (`page`)'
  );
  await client.fields.update("13623274", {
    position: 1,
    fieldset: newFieldsets["vQtsm7PNQ12nFLf35GQJNA"],
  });

  console.log(
    'Update Modular content field "Body" (`body_blocks`) in model "Page" (`page`)'
  );
  await client.fields.update(newFields["CxG9j_VzRFCsQM_cCV4GQQ"], {
    position: 0,
  });
}
