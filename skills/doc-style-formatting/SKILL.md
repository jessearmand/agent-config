---
name: doc-style-formatting
description: Document structure and formatting for technical writing — heading hierarchy and phrasing, paragraph discipline, choosing between lists and tables, numbered procedures with context-goal-action-result ordering, notice/callout usage, number/date/time/unit conventions, figures with alt text, italics for defined terms, and why footnotes are banned. Use when creating or restructuring any README, guide, tutorial, how-to, or reference page; when deciding whether something should be a list, table, or prose; when writing step-by-step instructions; or when adding notes, warnings, numbers, dates, or measurements to docs — even if the user just says "structure this" or "make it readable".
---

# Documentation style: Structure and formatting

How documents organize attention: readers scan headings first, then leads, then steps.
Structure carries meaning — wrong shape (a wall of text, a fake table, a procedure buried
in bullets) loses readers even when every sentence is grammatical.

## Headings

- One `h1` per page, unique and descriptive — it becomes the browser-tab title. Never
  skip levels (`h2` → `h4`), never use a heading for font size, never stack a heading on
  an empty section.
- Sentence case everywhere (model in `doc-style-language`). No terminal period.
- Phrase by content type:
  - Task sections start with a bare infinitive: "Create an instance" — not "Creating an
    instance".
  - Concept sections are noun phrases: "Migration overview" — not "Migrating to X".
    Established single-word gerunds (*Billing*, *Pricing*) survive when no better noun
    exists.
- Mark non-universal sections with a leading `Optional:` prefix, not a trailing "(optional)".
- Keep headings simple: no links, minimal punctuation, avoid code tokens (if unavoidable,
  pair with a descriptive noun). Define abbreviations in the following paragraph, not the
  heading.
- Refer to sibling sections as "the following sections"; *this section* is ambiguous
  between parent and children.

## Paragraphs

- One idea per paragraph, point first — readers don't finish paragraphs. Split past ~5–6
  sentences; a one-sentence paragraph is fine.
- Short sentences beat long ones; never pad to reduce paragraph count.
- Left-aligned body text; no hard line breaks inside sentences (they shatter at other
  widths).

## Lists

Pick the shape by data, not habit:

| Shape | Use when |
|---|---|
| Numbered | order matters (sequences, rankings) |
| Bulleted | unordered options/examples |
| Description list (term–definition) | two fields per item |
| Table | three or more fields per item |

One item is never a list — write a sentence.

- Introduce lists with a complete sentence ending in a colon (period if material
  intervenes). No stems the items must complete: ❌ "Use the Submit button to:".
- Keep items grammatically parallel — same verb form, same completeness. If parallelism
  fails, rewrite.
- Capitalize items unless the casing itself is the content (glossary terms, flags).
  Items that are single words, verbless, entirely code, or entirely a link take no end
  punctuation; otherwise they do (rules in `doc-style-language`).
- Run-in headings inside items: bold term, ended by period or colon, consistent across
  the list — never a dash.
- Multi-paragraph items are legal; use real paragraphs, not `<br>`.
- In-sentence lists: serial commas, framed as non-exhaustive ("such as"), no trailing
  *etc.*

## Procedures

A procedure is an ordered task. Numbered steps for multiple actions; one action gets a
single bullet or sentence, never a numbered list of one.

- Order each step: **context → goal → action → result**. Name the surface before the
  verb, purpose before the click:
  - ✅ To start a new document, click **File > New**.
  - ❌ Click **File > New** if you want to start a new document.
- One instruction per step. Only tiny adjacent clicks may share a step via `>`
  (**Next > Finish**). Fold a required Enter into the same step.
- Every step starts with an imperative in a complete sentence; keep verb forms parallel.
- `Optional:` prefixes optional steps (never parenthesized). Nested sub-steps: letters,
  then lowercase Roman numerals.
- Inside a complex step: action, command, placeholder explanation, extra detail, sample
  output — then what the output means as its own paragraph.
- Document one shortest accessible path. Alternates live on separate pages/tabs, linked,
  not branched inside one list. Prerequisites come before step 1. Cross-link repeated
  procedures instead of duplicating them.
- Locate UI by name, never spatially (no *above*/*below*/*right panel*) — see
  `doc-style-code-and-ui` for verbs and control naming.
- State what a command does instead of "run the following command".

## Notices and callouts

Body text is the default. Draft as prose; promote to a notice only when information is
genuinely off-flow. A page full of callouts has none working.

- Severity ladder (match the project's existing callout syntax first):
  - **Note** — useful aside, skippable.
  - **Tip** — helpful shortcut or best practice.
  - **Important** — reader must not miss this to succeed.
  - **Warning** — risk of data loss, cost, or security damage; irreversible.
- Never: stacked notices, a notice as the first element under a heading, required
  procedure steps hidden in a note, prerequisites or cross-references dumped into notes.
- In Markdown: `> **Note:** Full sentence(s).` — bold label, complete-sentence body.

## Tables

Three-plus related fields per item → table. One field → list; two → description list.
Never use tables for page layout, code samples, or mid-procedure interruptions.

- Introduce with a complete sentence stating purpose ("The following table lists…").
  Screen readers often skip unannounced tables.
- First row and first column are real headers (`th`/`scope`); no merging cells; sort rows
  logically; split multi-header monsters into several tables.
- Column heads: sentence case, concise, no end punctuation. Cells: multi-paragraph cells
  use real markup, not `<br>`; facts never ride on icons alone.
- Caption only when the page has several tables: "**Table 1.** Sentence-case description"
  (no trailing period); "table 1" lowercase in running text.

## Numbers

- Spell out zero through nine; numerals from 10. Recast sentences that would start with
  a numeral. Spell out a number followed immediately by another number ("fifteen
  100,000-byte files") and vague quantities (*thousands of requests*).
- Always numerals regardless of size: versions, technical quantities (RAM, QPS, bit
  widths), prices, percentages, decimals, dimensions, negatives, math, anything in a
  range. If a sentence mixes small and large values, numeral all of them.
- Ordinals spelled out: *first*, *forty-third*.
- Percentages: `40%`, no space — except sentence-starting percentages spelled out
  ("Forty percent of…").
- Decimals over fractions ("0.75"); leading zero below one ("0.3"); decimals read as
  plural ("1.0 inches").
- Money: `$10,000`; disambiguate when needed (`US$10`); comma grouping from four digits;
  nothing after the decimal's last digit.
- Dimensions `WxH`: lowercase x, no spaces (`192x192`).
- Ranges: en dash or from/to — details in `doc-style-language` (Punctuation › Dashes).

## Dates and times

- Dates: month spelled out, "January 19, 2017"; weekday adds a comma ("Tuesday, April
  27, 2021"). Month+year takes no comma. Mid-sentence dates close with a comma after the
  year. Slash/dot numeric dates are banned; if numeric is unavoidable, ISO `YYYY-MM-DD`
  with example days > 12. Compact tables may abbreviate consistently ("Mon, Sep 3, 2018").
- Times: 12-hour with space before AM/PM, minutes dropped on the hour ("3 PM", "3:45
  PM"); *noon*/*midnight* fine; match 24-hour UI when quoting one. Date before time.
- Avoid time-zone abbreviations ("10 AM (UTC)" style offset if needed) and seasons —
  name months or quarters instead.

## Units of measurement

- Nonbreaking space between number and unit: `64 GB`, `25 mm`. No space for currency,
  percent, angular degrees (`$10`, `65%`, `180°`); temperature keeps a space before `°`
  but none after (`50 °C`); Kelvin drops the degree sign (`300 K`).
- Unit ranges repeat the unit with *to*: "-40 °C to 85 °C" — a hyphen reads as minus.
- Multiplied units hyphenate ("40 person-hours"); rates prefer *per*
  ("requests per day"), compacted only in established units (*Gbps*).
- Bytes: match the product's actual system — kB/MB/GB (1000ⁿ) vs KiB/MiB/GiB (1024ⁿ) —
  never write MB for MiB.

## Figures

- An image exists only when words can't carry it; never screenshot text, code, or
  terminal output — render real text. Crop screenshots to the controls the procedure
  needs; overlay (don't blur) any personal data.
- Introduce with a complete sentence unless it illustrates the step just written. Alt
  text replaces the image concisely (~≤155 chars, ends with punctuation, never "Image
  of…"); decorative images get empty alt — but always include the attribute.
- Numbered captions: "**Figure 1.** Complete sentence." Prefer SVG diagrams; MP4 over
  GIF. New information never lives only in an image (translation kills it).

## Terms, examples, footnotes

- Italicize a term at its first definition and words discussed as words; later uses go
  roman. Bold never defines.
- Introduce examples with *such as*/*for example* set off by commas, or as their own
  "For example," sentence. Semicolons don't introduce examples.
- No footnotes — they fail accessibility and translation. Use cross-references, notes,
  or parentheses.
- Math (rare): italic variables, roman operators, real minus/times characters, `<sup>`/
  `<sub>` over `^`; keep expressions on one line. Phone numbers in examples: use the
  reserved fictional block (555-0100–0199), never a real-looking number.

## Related skills

- Sentence mechanics, punctuation, capitalization model: `doc-style-language`.
- Code blocks, commands, UI references inside steps: `doc-style-code-and-ui`.
- Tone, audience, modality (*must*/we recommend/*can*): `doc-style-principles`.
- Links, anchors, filenames, trademarks: `doc-style-references`.

---

Synthesized for agent use. Adapted from the [Google Developer Documentation Style Guide](https://developers.google.com/style/) (content modified), which is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The [Apple Style Guide](https://help.apple.com/applestyleguide/) and the [Red Hat supplementary style guide](https://redhat-documentation.github.io/supplementary-style-guide/) were consulted for comparison only.
