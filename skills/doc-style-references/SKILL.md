---
name: doc-style-references
description: How technical documentation refers to everything outside the sentence — when to link at all, descriptive link text and "For more information" introductions, stable heading anchors, reserved example values (example.com domains, TEST-NET IP addresses, 555 phone numbers), file naming and referencing rules, trademark-safe product naming (no plurals, possessives, or verbed brands; leading-lowercase names), and spelling authority. Use whenever writing or editing hyperlinks, cross-references, internal anchors, example domains/emails/IP addresses/phone numbers, filenames in docs, product or company names, or trademark mentions — including "just add a link to…" requests — so links stay accessible and examples never leak real data.
---

# Documentation style: Links, examples, and naming

Every external reference is a decision you impose on the reader (click or keep reading)
and a promise you make (the target exists). Every example value is a liability if it's
real. These rules keep both safe.

## Choosing to link

- Links are for **nonessential enrichment**. If readers need it to succeed, it belongs on
  the page: define the term, give the two steps, summarize the concept — then link for
  depth.
- Be selective: each link is cognitive load and an exit. Link once, at the most useful
  spot. Duplicates are acceptable only for long pages, distinct entry points (procedure +
  troubleshooting sections), or deep links into different sections.
- Link to the most relevant page and the most relevant heading on it — not the site root,
  not a landing page that buries the content.
- Documenting someone else's standard or tool? Link to their canonical docs rather than
  re-documenting them — after covering the few sentences your reader actually needs.

## Link text

Text that survives out of context: screen-reader users jump link to link.

- Use the destination's exact title, or a short descriptive phrase capitalized as part of
  the sentence. Front-load the meaningful words.
- Banned: *click here*, *this document*, *this article*, *read more*, bare URLs as text
  (exception: legal documents like ToS). A URL is never the link text when a title works.
- Unique text per unique target within a document — identical link text must go to the
  same place.
- Keep abbreviations inside the link: "[Example Notification Service (ENS)](…)", not
  "[Example Notification Service](…) (ENS)".
- With code elements, attach the description inside the link:
  - ✅ run the `example-tool instances create` command with the [`--hostname` flag](…)
  - ❌ …with the [`--hostname`](…) flag
- Rework sentences as needed so a good phrase exists to carry the link.

### Introductions

- Standard opener: "**For more information, see** [title]" — add "*about* X" when the
  link text doesn't say why you're sending them there ("For more information about task
  scheduling, see…"). Never "*for more information on*" — always *about*.
- The verb is *see*. State the purpose specifically without parroting the link text.
- Disclose surprises: downloads (name the file type), mailto links, same-page jumps
  ("…the [Writing link text](#link-text) section of this document").

## Anchors and headings as targets

- Prefer linking to a heading anchor over the top of a long page.
- Custom anchors are lowercase words joined by hyphens (`introduction-to-everything`).
  Add them to headings that will be linked often — auto-generated anchors change when
  the heading text changes, breaking inbound links.
- When renaming a heading that has an auto-anchor, pin the old ID as a custom anchor on
  the new heading instead of letting links rot. Changing a custom anchor means updating
  every link that uses it.

## Internal vs external links

- Keep one consistent style for internal links within a doc set.
- External links use HTTPS when available.
- Say so when a link leaves your site only if the context makes it matter.
- No URL shorteners, ever — they hide the destination, die unpredictably, and break
  accessibility expectations. No bare URLs in running text; link descriptive text.
- Prefer stable top-level pages over fragile deep links when either serves the purpose;
  prefer unversioned "current" URLs when the target site supports versionless links.

## Example values that can't hurt anyone

Never real data — not real domains, emails, names, numbers, or addresses:

| Need | Safe value |
|---|---|
| Domain | `example.com`, `example.org`, `example.net` (IANA-reserved) |
| Email | person-style address at an example domain (`alex@example.com`), or role addresses (`admin@example.com`) |
| IPv4 | RFC 5737 blocks: `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24` |
| IPv6 | RFC 3849 range: `2001:db8::/32` (for example, `2001:db8::1`) |
| Phone | US 800-555-0100 through 800-555-0199; international with `+` prefix |
| People | Diverse given names readable across genders/cultures (Alex, Amal, Kai, Noam, Sasha, Yuri…); surname as initial (Quinn A.); singular *they* unless gender matters |
| Company | *Example Organization*; differentiate as *Enterprise Example Organization*, *Startup Example Organization* |
| Street | Fictional addresses, never real ones |

- Project/service names in examples are descriptive (`staging`, `frontend-development`,
  `production-2`), never `foo`/`bar`/`baz`.
- Don't reveal PII anywhere in screenshots or samples; placeholders
  (`PROJECT_ID`, `EMAIL_ADDRESS`) beat invented specifics when the value is irrelevant —
  see `doc-style-code-and-ui` for placeholder formatting.

## Filenames

- Naming files you create (docs, examples): lowercase, hyphen separators, ASCII only —
  `avoiding-cliches.md`, `query-data.html`. Case-sensitive filesystems and search
  engines both reward this. No generic names (`document1.md`).
- Match an existing directory's convention even when it violates the above
  (`lesson_4.md` next to `lesson_1.md` beats a lone reform). Generated filenames follow
  whatever produces them.
- Referencing a specific file: code font, exact spelling, followed by the word *file* —
  "In the following `build.sh` file…".
- File types by name, not extension: "a PNG file", "a Bash file", never "a `.png`
  file". Type names aren't verbs: "Extract a zip file", not "unzip".

## Trademarks and product names

- The mark owner's usage guidelines win over anything here.
- Treat a trademark as a modifier — never a standalone noun, verb, plural, or
  possessive: "an Example Notebook computer", not "an Example Notebook"; "features of
  your laptop", not "laptop's features" when laptop is the brand name. Attach a
  generic noun: "Example Notebook computers", "the Example API".
- Follow official capitalization exactly, including leading-lowercase names — but avoid
  sentence-initial lowercase by rewriting: "You can use exampleLedger to sync offline",
  not "exampleLedger can sync offline."
- Feature names default to lowercase unless officially capitalized; when unsure, follow
  established precedent in existing docs. UI labels match their on-screen casing (rules
  in `doc-style-code-and-ui`).
- Articles: *the* before tool/API names ("The Example API", "The `example-tool` CLI"),
  no *the* before product names unless modifying something ("Using Example Data Service
  with Example Batch Service" but "The Example Data Service options page").
- Use full product names — don't invent shortenings; where repetition grates, pivot to
  the general concept ("the service mesh") once the full name is established.
  *Service* is acceptable as a generic counter ("the Example Batch Service").
- Never use product or feature names as verbs.

## Spelling authority

US English spelling by default; pick one variety per document and hold it. For
spellings this suite doesn't settle, consult Merriam-Webster (or the project's own word
list first). Word-choice rulings live in the usage word list shipped with
`doc-style-language`.

## Related skills

- Grammar, capitalization, punctuation mechanics: `doc-style-language`.
- Code font, commands, placeholders, UI labels: `doc-style-code-and-ui`.
- Structure of the pages these links live in: `doc-style-formatting`.
- Tone and third-party-content policy behind paraphrase-and-link: `doc-style-principles`.

---

Synthesized for agent use. Adapted from the [Google Developer Documentation Style Guide](https://developers.google.com/style/) (content modified), which is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The [Apple Style Guide](https://help.apple.com/applestyleguide/) and the [Red Hat supplementary style guide](https://redhat-documentation.github.io/supplementary-style-guide/) were consulted for comparison only.
