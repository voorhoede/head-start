import { Client, SimpleSchemaTypes } from "@datocms/cli/lib/cma-client-node";

export default async function (client: Client) {
  const newFields: Record<string, SimpleSchemaTypes.Field> = {};
  const newItemTypes: Record<string, SimpleSchemaTypes.ItemType> = {};

  console.log("Create new models/block models");

  console.log('Create model "Internal link" (`internal_link`)');
  newItemTypes["WywlzYXpSVWFQIeeNk3iMw"] = await client.itemTypes.create(
    {
      name: "Internal link",
      api_key: "internal_link",
      collection_appearance: "table",
      inverse_relationships_enabled: false,
    },
    { skip_menu_item_creation: true }
  );

  console.log("Creating new fields/fieldsets");

  console.log(
    'Create Single-line string field "Title" (`title`) in model "Internal link" (`internal_link`)'
  );
  newFields["dSdakG3hSWSGNkm9YOCwGw"] = await client.fields.create(
    newItemTypes["WywlzYXpSVWFQIeeNk3iMw"],
    {
      label: "Title",
      field_type: "string",
      api_key: "title",
      localized: true,
      validators: { required: {} },
      appearance: {
        addons: [],
        editor: "single_line",
        parameters: { heading: false },
      },
      default_value: { en: "", nl: "" },
    }
  );

  console.log(
    'Create Single link field "Page" (`page`) in model "Internal link" (`internal_link`)'
  );
  newFields["CdQJtWxySIak3Fs2cPJTEw"] = await client.fields.create(
    newItemTypes["WywlzYXpSVWFQIeeNk3iMw"],
    {
      label: "Page",
      field_type: "link",
      api_key: "page",
      localized: true,
      validators: {
        item_item_type: {
          on_publish_with_unpublished_references_strategy: "fail",
          on_reference_unpublish_strategy: "delete_references",
          on_reference_delete_strategy: "delete_references",
          item_types: ["2216253", "2596445"],
        },
        required: {},
      },
      appearance: { addons: [], editor: "link_select", parameters: {} },
    }
  );

  console.log("Update existing fields/fieldsets");

  console.log(
    'Update Structured text field "Text" (`text`) in block model "Text Block" (`text_block`)'
  );
  await client.fields.update("NtVXfZ6gTL2sKNffNeUf5Q", {
    validators: {
      required: {},
      structured_text_blocks: {
        item_types: [
          "ZdBokLsWRgKKjHrKeJzdpw",
          "gezG9nO7SfaiWcWnp-HNqw",
          "0SxYNS2CR1it_5LHYWuEQg",
        ],
      },
      structured_text_links: {
        on_publish_with_unpublished_references_strategy: "fail",
        on_reference_unpublish_strategy: "delete_references",
        on_reference_delete_strategy: "delete_references",
        item_types: [newItemTypes["WywlzYXpSVWFQIeeNk3iMw"].id],
      },
    },
  });

  console.log("Finalize models/block models");

  console.log('Update model "Internal link" (`internal_link`)');
  await client.itemTypes.update(newItemTypes["WywlzYXpSVWFQIeeNk3iMw"], {
    title_field: newFields["dSdakG3hSWSGNkm9YOCwGw"],
  });
}
