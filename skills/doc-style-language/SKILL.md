---
name: doc-style-language
description: Sentence-level mechanics for technical documentation — active voice, present tense, second person, pronoun and antecedent rules, capitalization (sentence case for headings, match-the-UI labels, preserve code casing), abbreviations, contractions, plurals, possessives, hyphenation, and every punctuation mark from colons to slashes. Use when writing or editing any documentation sentence, README paragraph, heading, list item, or UI string; when deciding how to capitalize, hyphenate, or punctuate; or when a user's draft has grammar, tense, voice, or punctuation problems — even if they only ask to "clean up the writing".
---

# Documentation style: Language and punctuation

Mechanics rules that keep prose unambiguous, translatable, and scannable. Rationale in
brief; when a rule looks arbitrary, the usual drivers are translation safety, screen
readers, and non-native readers (see `doc-style-principles`).

## Voice, tense, and person

- **Active voice by default** — make the actor the subject. Passive is acceptable to
  emphasize the object or when the actor is irrelevant ("The file is saved.").
  - ✅ Send a query to the service. The server sends an acknowledgment.
  - ❌ The service is queried, and an acknowledgment is sent.
- **Present tense for general behavior.** No *will* for the immediate result of a user
  action ("The server sends…" not "will send"). Future is honest only when the action
  truly happens later (async jobs, next scheduled run). No hypothetical *would*.
- **Second person for the reader; imperative for steps.** *You*, *your*, and commands.
  First-person *we* only for the authoring organization with a clear antecedent. Use
  *user* only for the end user of software the reader is building.
- **Reference blurbs are third person; task headings are imperative.** This is the
  easiest pair to mix up:
  - ✅ `tasks.create`: Creates a task on the specified list. (API reference)
  - ✅ Create a task on the specified task list. (procedure step or task heading)
- **No anthropomorphism.** Software *specifies*, *detects*, *returns* — it doesn't *want*,
  *see*, or *tell*: ✅ A `Delimiter` object specifies where to split a string. ❌ …tells
  the splitter where to break the string.

## Pronouns and clause grammar

- Every pronoun needs an unambiguous antecedent. Follow demonstratives with a noun:
  "Set this value…" not "Set this…". Replace a vague *it* with the noun.
- Generic person = singular *they*. Never *he/she* or *(s)he*.
- *That* introduces restrictive clauses (no comma); *which* introduces nonrestrictive
  clauses (comma before it). Don't swap them: "The echidna that has a long snout is
  furry" (one of several) vs "The echidna, which has a long snout, is furry" (all of them).
- Prepositions go wherever reads best, including sentence-final — no *with which*
  contortions.

## Small words that matter

- **Keep articles** (*a*, *an*, *the*), including in headings: "Create a VM instance",
  not "Create VM instance". Choose *a*/*an* by sound, not spelling.
- **Plurals:** regular US plurals; never *'s* to pluralize (✅ APIs, ❌ API's). Match verb
  to the true subject; *one or more* takes plural, *more than one* takes singular. No
  optional plurals in parentheses (❌ `key(s)`). Don't pluralize trademarks or code
  tokens — attach a noun: "`Session` objects".
- **Possessives:** singular → *'s* (even after *s*: "the storage class's quota"); plural
  ending in *s* → *'* only. Never possess a product name or code token when describing
  function — use *of* or a modifier: "monitor Example Data Service performance", not
  "Example Data Service's performance"; "the `wordCount` method's return value", not
  "`wordCount`'s".

## Capitalization model

Three layers; don't invent a fourth:

1. **Sentence case everywhere editorial:** headings, titles, navigation, list items,
   table cells, figure captions, glossary terms. Capitalize the first word, the first
   word after a colon in a heading, and true proper nouns. No terminal period on headings.
2. **Match the UI for control names**, unless the label is ALL CAPS or inconsistent with
   its neighbors — then sentence case: "Click **Refresh**" even if the button paints
   REFRESH.
3. **Preserve code casing exactly**, and write placeholders in `UPPER_SNAKE_CASE`
   (`PROJECT_ID`, never `myProjectId` or `YOUR_PROJECT_ID`).

Never use case alone to carry meaning, and don't name casing styles in prose — describe
the pattern ("enter the value with each word capitalized, as in `AssertionAccount`").
Hyphenated words at sentence start capitalize only the first element (unless a later
element is proper): "Non-breaking spaces…".

### Heading phrasing

- Task headings: bare infinitive — "Create an instance", never "Creating an instance".
- Concept headings: noun phrase, not gerund-led — "Migration overview", not "Migrating
  to the new model". Established one-word gerunds (*Billing*, *Pricing*) are fine.
- Headings keep articles and contractions; don't number them to imply sequence.

## Abbreviations

- Spell out an unfamiliar term at first use with the short form in parentheses, both in
  italics for the introduction: "*Border Gateway Protocol* (*BGP*)… then BGP. Skip the
  expansion when it teaches nothing (*PDF*, *API*, *HTML*).
- Write *for example*, *that is*, *and so on* — never *e.g.*, *i.e.*, *etc.* in prose.
  No internet slang (*tl;dr*, *RTFM*).
- No periods in acronyms/initialisms (*API*); periods on shortened words (*etc.*, *Dr.*)
  but not on date/time or wordlike shorts (*Mon*, *Sep*, *app*, *sync*).

## Contractions

Common two-word contractions are preferred — negation contractions especially, because
scanners and skimmers miss a bare *not*: "The server doesn't return a token." Use only
established forms; no *'s* = *is* on arbitrary nouns, no three-word stacks. Match genre:
warmer in tutorials and UI copy, and lean contractions out of legal, API-normative, and
heavily translated reference material.

## Sentence architecture

- **Condition before instruction**, so readers can skip inapplicable steps:
  - ✅ To delete the entire document, click **Delete**.
  - ❌ Click **Delete** if you want to delete the entire document.
- Same order for cross-references: "For more information, see X."
- One term, one meaning: don't use the same word for two concepts nearby, and don't use
  temporal senses of *once*/*while*/*as*/*since* when the primary sense exists.

## Punctuation

### Commas

- **Serial comma required** — "zones, regions, and multi-regions". Omission changes
  meaning; this is a correctness rule, not taste.
- Comma after an introductory phrase; comma before a coordinating conjunction joining
  two independent clauses (skip it when both clauses are very short).
- Comma before nonrestrictive *which*; none before restrictive *that*.
- Before *however*/*therefore*/*otherwise* joining clauses: semicolon or period first,
  comma after the adverb. Never splice with a bare comma.
- Thousands separators from four digits: `1,532,784`; period decimals; never group right
  of the decimal.
- No *etc.* padding at the end of in-paragraph lists — introduce the series as
  non-exhaustive ("data such as…").

### Colons

- Lead-ins to lists and code samples are grammatically complete sentences:
  ✅ "The fields are defined as follows:" ❌ "The fields are:".
- Lowercase after a colon in running text; capitalize in headings, proper nouns,
  quotations, and after notice labels (*Note:* …).
- Colon when the list/sample follows immediately; period when material intervenes.

### Dashes and ranges

- Em dash — closed, no spaces — for breaks in sentence flow. Emit the real character
  (or `&mdash;`), never `--`/`---`.
- Numeric ranges: closed en dash (2013–2019) or *from/to* — never mixed ("from 8-20"
  is wrong). In plain-text/code contexts where an en dash is unavailable, a hyphen
  (8-20) is acceptable. When each number carries a unit, repeat the unit and use *to*
  so the mark can't read as a minus: "-40 °C to 85 °C".
- Never separate a term from its description with a dash — use a colon ("Example: this
  is an example").

### Hyphens

- Hyphenate to prevent misreading; otherwise prefer the closed form that prevailing use
  favors (*webpage*, *hostname*, *workaround*).
- Prefixes close up by default (*metadata*, *preprocessing*); always hyphenate *self-*
  and *cross-*; hyphenate before proper nouns/numbers (*non-Go*, *post-2000*) and to
  avoid misreading (*re-sign* vs *resign*).
- Compound modifiers hyphenate before the noun when it helps (almost never wrong there),
  and usually open after the verb ("a well-designed app" / "the app is well designed"),
  except always-hyphenated words (*on-premises*, *user-friendly*). No hyphen after
  *-ly* adverbs ("publicly available").
- Number + spelled-out unit as modifier hyphenates ("a five-minute wait", "64-bit
  system"); number + abbreviated unit does not (nonbreaking space: "200 GB disk").
  Multiplied units hyphenate ("40 person-hours").
- Suspended hyphens: "one- or two-hour intervals".

### Ellipses

Not a documentation tool. Omit material silently; mark omitted *code* with a language
comment and omitted *output* with three dots on their own line (see
`doc-style-code-and-ui`). Drop trailing ellipses from UI labels: click **Save**, not
**Save...**. Mid-quotation omission only, three ASCII periods, never the `…` character,
never inside URLs or paths.

### Parentheses

Important content doesn't live in parentheses — readers skip them. Prefer a separate
sentence; when a parenthetical is necessary, keep it short. Period goes inside only when
the parentheses enclose a complete standalone sentence. Never mark optional plurals:
❌ `key(s)`.

### Periods

- One space between sentences. Headings take no period.
- List items end with sentence punctuation unless the item is a single word, verbless,
  entirely code font, or entirely a link/title.
- Run-in description lists: term gets no period; end the term with a period or colon and
  stay consistent; after a colon the description starts lowercase.
- Keep periods off sentence-final URLs and paths (put the URL on its own line, or place
  the period tight with no space).
- US quotation punctuation: commas and periods inside closing quotes for prose; outside
  when the quotes mark an exact string — and prefer code font over quote-wrapping a
  literal anyway.
- Avoid exclamation marks; never in concept/reference material.

### Quotation marks

Straight quotes only — never curly. Use them sparingly: short-work titles, unlinked
section names, direct citations, one-off metaphors. Full-length works take italics.
Single quotes only inside a quotation or where the code language uses them.

### Semicolons

Avoid. Three legitimate uses: closely related independent clauses; before a conjunctive
adverb (*therefore,* …); complex series whose items contain commas.

### Slashes

Prose bans them (code, paths, and URLs excepted). Write *or*, *and*, or *per*:
"requests per day", not "requests/day"; no *and/or* outside cramped tables; no slash
dates (spell the month, or ISO `YYYY-MM-DD`); no slash fractions (use 0.75 or 75%).
Wrap long URLs by breaking after a slash, never by inserting hyphens or dots.

## Word choice

For term-level decisions — *sign in* vs *sign-in*, *filename*, *email*, *Wi-Fi*,
inclusive-language swaps, and other usage entries — check
`references/usage-word-list.md` in this skill.

## Related skills

- Audience, tone, and inclusive-language policy: `doc-style-principles`.
- Headings, lists, procedures, tables, numbers, dates, units: `doc-style-formatting`.
- Code font, commands, placeholders, UI labels and verbs: `doc-style-code-and-ui`.
- Link text, cross-references, filenames, trademarks: `doc-style-references`.
- For controlled-English sentence simplification, follow `simple-english`.

---

Synthesized for agent use. Adapted from the [Google Developer Documentation Style Guide](https://developers.google.com/style/) (content modified), which is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The [Apple Style Guide](https://help.apple.com/applestyleguide/) and the [Red Hat supplementary style guide](https://redhat-documentation.github.io/supplementary-style-guide/) were consulted for comparison only.
