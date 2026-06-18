# Form Block

**Renders a reusable form by referencing a Form record by slug.**

## Fields

Each form field has:

- **type** — `text`, `email`, `phone`, `number`, `date`, `textarea`, `select`, `radio`, `checkbox`
- **label** — visible label above the field
- **name** — unique key, used to identify the submitted value
- **required** — whether the field must be filled before submitting
- **placeholder** — hint text inside the input (text-style fields only)
- **inputWidth** — column span on the 4-column grid: `quarter`, `half`, `three_quarters`, or `full`
- **options** — list of choices (label + value) for `select`, `radio`, and `checkbox` fields

## Notes

- Form validation runs on submit: required, email, phone, number, and date fields are checked.
- Spam protection via Cloudflare Turnstile runs automatically on the live site.
- Submissions are not routed anywhere by default (for now). A developer needs to wire up a handler per form under `src/pages/api/forms/[slug]/`.
