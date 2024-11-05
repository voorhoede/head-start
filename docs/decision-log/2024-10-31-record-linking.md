# Editable redirects

**Replace generic Internal Link with individual record linking for better editor experience**

- Date: 2024-10-31
- Alternatives Considered: keep previous Internal Link implementation
- Decision Made By: [Jasper](https://github.com/jbmoelker), [Jurgen](https://github.com/jurgenbelien)

## Decision

We initially introduced a generic Internal Link model and component to centralise routing for linking to records from different models. For a record to any model (like Home or specific Page record) an editor would always use the Internal Link model. This Internal Link could be used as a reference option in every structured text field for different content fields. New structured fields directly benefit from the Internal Link and adding links to a new model (like a Person record) could be done in a single place. Similarly in code the Internal Link component would have a single fragment and route resolver in one place.

However as it turned out the generic Internal Link had a few major drawbacks for content editors:

- To create a link, an editor always had to create a new Internal Link and give it a title. The title was needed as the Internal Link was a record and would otherwise always show up only by its ID in overviews and record selection dialogs. This could be confusing as the linked record already had a title. For inlined records this might be okay, but for records added through an inline link, the link had a label, the Internal Link record had a title and the linked record had a title. Yes, confusing.
- When an editor would insert an Internal Link it could select a previously created one. This makes sense from a data modelling point of view as every Internal Link is a model record. However for content editors this was confusing, especially if you had multiple Internal Links with the same title.
- When an editor would be editing a record in an alternate locale (not the default locale) and would then insert a new Internal Link, the dialog to create that Internal Link would reset to the default locale. So when editing a page in NL it would insert a reference to a link in EN for example. The editor probably wouldn't notice. But since the GraphQL request would query everything in one language, the link would not show up. This is arguably a shortcoming of DatoCMS. For us, it's especially troubling for the editor experience.

This led us to the decision to remove the Internal Link component and replace the desired behaviour with direct links to different model records. So now editors can directly select a record like the Home page or a specific Page record as an inline record or in an inline link within a Structured Text field. This is a much better experience for content editors. The consequence for development is that when linking new models they have to be referenced in all Structured Text fields and the fragments of all related blocks have to be extended with the new linked model. We find this an acceptable trade-off for the improved editor experience.
