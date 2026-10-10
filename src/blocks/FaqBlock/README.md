# FAQ Block

**Renders a set of reusable FAQ records as an accordion of questions and answers.**

Each FAQ is a shared record in the `Faq` model, holding a single Accordion Item (its title is the question, its blocks are the answer). The FAQ Block links to the specific FAQ records you want and renders them as an accordion, so the same question can be reused across multiple pages. Use the `groupTitle` field to add a heading above the questions.
