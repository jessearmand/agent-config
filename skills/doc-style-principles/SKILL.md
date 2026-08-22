---
name: doc-style-principles
description: Voice, tone, and audience principles for technical documentation — conversational-but-professional register, writing for global readers and translation, inclusive language, accessibility-aware prose, jargon control, avoiding hype and unverifiable claims, prescriptive guidance style, and timeless wording. Use when writing or reviewing any README, tutorial, how-to guide, API reference, release note, or UI text, even when the user never says "style" — and whenever a question comes up about tone, inclusive wording, global English, audience level, or whether a claim is safe to make.
---

# Documentation style: Principles

Apply these principles whenever you write or edit technical documentation. They decide
*how the document treats its reader*; sentence-level mechanics live in `doc-style-language`,
structure lives in `doc-style-formatting`.

Two ideas drive everything below:

1. **Readers are in a hurry, multicultural, and diverse in ability.** Many will read
   English as a second language; many use screen readers; nearly all scan.
2. **Consistency beats preference.** Where this guide makes a choice among equally good
   options, follow it so readers never wonder whether two spellings mean two things.
   Deviate only for a reason you could state, then stay consistent within the document.

## Voice and tone

Write like a knowledgeable colleague: friendly, respectful, direct. Not slangy, not
pedantic, not promotional.

- Aim for conversation on paper, not speech transcribed. Written docs can be lighter than
  legalese but must stay precise.
- Match warmth to genre: tutorials and how-tos run warmer; API reference and
  normative/spec-style pages run drier. The rules stay the same; the dial moves.
- Stay in the middle register: no buzzwords, internet slang (`tl;dr`, `ymmv`), pop-culture
  riffs, jokes, or figurative language. Humor rarely survives translation and often
  excludes readers.
- Prefer clear over clever, every time. If tone is hard, fall back to plain, useful,
  direct information.
- Skip filler openers and padding: *please note*, *at this time*, *it should be noted that*.
  Omit *please* before instructions — politeness here slows scanning.
  - ✅ To view the document, click **View**.
  - ❌ To view the document, please click **View**.
- Never call a task *easy*, *simple*, or *quick*. Readers who struggle feel insulted, and
  the claim is unverifiable (see [Claims](#claims-you-can-defend)).
- Avoid exclamation marks almost everywhere; never stack them.

## Write for a global audience

Assume the text will be translated and read by non-native speakers.

- Pick one English variety per document (default: US English) and keep it.
- Prefer the common word over the fancy one: *start* not *commence*, *use* not *utilize*
  or *leverage*, *so* not *consequently*, *some*/*many* not *a number of*.
- Prefer single verbs over phrasal verbs when possible (*install* over *set up*) — except
  established UI terms like *sign in* and *log in*.
- Keep sentences short (aim under ~26 words) and in subject–verb–object order. Put the
  condition before the instruction: "If X, then do Y."
- Limit stacked noun modifiers to two ("cloud pipeline config parser" fails); keep
  modifiers next to what they modify, including *only*.
- Keep helper words that remove ambiguity even if conversation would drop them: *then*,
  *that*, relative pronouns. Repeat a noun instead of a vague *it*.
- Don't overload one word with two meanings nearby, and don't use temporal/causal senses
  of *once*, *while*, *as*, *since* when the primary sense exists.
- One concept, one term, everywhere — same spelling, same capitalization. Translation
  memory treats variants as different concepts.
- No culture-bound content: US holidays, sports metaphors, idioms (*ballpark figure*),
  hemisphere-specific seasons, humor. Use diverse person names in examples.
- Put new information in prose, never only inside images — images rarely translate.

## Inclusive language

Precision is the point: inclusive wording is usually the more literal wording.

- Replace violent/graphic industry metaphors with the precise process: *kill* → *stop* or
  *terminate*, *hangs* → *stops responding*, *sanity check* → *final check* or *completeness check*.
  If readers need the legacy term to find existing docs, mention it once in parentheses,
  de-emphasized, then use the replacement.
- No unnecessarily gendered wording (*man-hours* → *person-hours*, *mankind* → *humanity*).
  Vary gender and origin of example names.
- No ableist language: *crazy*, *insane*, *dumb*, *blind to*, *crippled*, *dummy* (for
  placeholder values). Describe outcomes, not people's deficits.
- Swap exclusionary tech terms: *whitelist*/*blacklist* → *allowlist*/*blocklist*,
  *master*/*slave* → *primary*/*replica* (or the ecosystem's standard pair).
  In code where the old identifier is fixed, show the preferred term in prose plus the
  literal identifier in code font — and never use the old term outside code font.
- Write about disability with the community's preferred terms, person-first unless the
  community prefers identity-first. Avoid *suffers from*, *wheelchair-bound*, euphemisms
  like *special*/*differently abled*, and calling nondisabled people *normal*.
- Don't divide readers by nativeness (*native speakers*) or status (*first-class citizen*)
  when describing features.

## Accessibility in prose

Write so the document still works without images, color, sound, or a mouse.

- Never make color, size, position, or an icon the only carrier of meaning — pair it with
  a text label. Refer to controls by their visible name: "Click **Save**", not "click the
  floppy-disk icon".
- No directional language for layout (*above*, *below*, *left panel*) — it breaks screen
  readers and right-to-left locales. Use *preceding*, *following*, *earlier*, *later*, or
  name the thing.
- Real heading hierarchy, one `h1`, no skipped levels, no empty headings. Headings are
  navigation infrastructure, not font sizes.
- Meaningful link text that works out of context (screen-reader users jump link-to-link);
  see `doc-style-references`.
- Every informative image gets alt text stating its intent; decorative images get empty
  alt. No screenshots of code or terminal output — use real text.
- Introduce tables and widgets in the preceding sentence; procedures go in numbered lists.
- Don't rely on punctuation, ALL CAPS, camelCase, or `&` (write *and*) to carry meaning;
  some screen readers skip or spell such text letter-by-letter.
- Avoid double negatives and exception-on-exception sentences; state what readers *can* do.

## Jargon

- Default to plain language. If an in-group term (*blast radius*, *swim lane*,
  *out-of-the-box*) is the only workable word — because it is the industry-standard search
  term — define it briefly on first use and link a trusted definition.
- Replace rather than footnote when a specific word exists: *blast radius* → *affected
  area*, *off-the-shelf* → *pre-built*, *post-mortem* → *review of what worked*.
- Terms flagged as non-inclusive anywhere in this suite are never "define and continue":
  replace them outright.

## Claims you can defend

Documentation outlives the numbers in it. Don't write claims an incident could falsify.

- No superlatives or absolutes: *best*, *fastest*, *simplest*, *never fails*, *always*.
- Performance/cost comparisons: only with cited, verifiable sources, framed per scenario
  ("can be faster for this workload"), never as blanket superiority — and never disparage
  another product.
- Security: say *helps prevent* / *is designed to reduce*, not *prevents* or *guarantees*.
  No breach-proof promises.
- *Ensure*/*guarantee* only when the outcome truly is ensured by the documented action.

## Prescriptive, with explicit modality

Tell readers the recommended path instead of dumping every option.

- When multiple approaches exist, pick one recommended route and document it end-to-end;
  mention alternatives only as pointers.
- Make requiredness unambiguous — *should* is banned as a modal because nobody can tell
  requirement level from it:
  - Required: *must*, or the imperative ("Do X before continuing.").
  - Recommended: "*We recommend* X" (name who recommends).
  - Optional: *can* ("You can also use B").
  - Expected outcome: state it plainly ("The command returns 10 items."); possible
    outcome: *might* or *can*.
  - ✅ Ensure that the button conforms to the minimum-size guideline.
  - ❌ The button should conform to the minimum-size guideline.

## Timeless wording

Documents are read years after writing. Don't date them or leak roadmaps.

- Ban time-anchored words in product/reference docs: *now*, *currently*, *new*, *latest*,
  *old*, *existing*, *soon*, *eventually*, *does not yet*, *in the future*, *as of this
  writing*. State facts plain: "These subcommands let you…" not "These new subcommands…".
- Never pre-announce or roadmap unshipped features. Time-stamped genres (release notes,
  blog posts) may use *new*/*soon*; if *new* is unavoidable elsewhere, anchor it to a
  version or date.
- Don't assume the reader knew a previous version of the product.

## Third-party content

Never paste text, images, code, logos, or transcripts from third parties — paraphrase and
link. An "open" license you can't verify is not permission; when in doubt, link instead of
copying. This includes dictionary/Wikipedia wording even with attribution.

## Related skills

- Sentence-level grammar, capitalization, punctuation, and the usage word list:
  `doc-style-language`.
- Document structure — headings, lists, procedures, tables: `doc-style-formatting`.
- Code, commands, and UI-element references: `doc-style-code-and-ui`.
- Links, cross-references, filenames, trademarks: `doc-style-references`.
- For aggressively simplified controlled English (ASD-STE100), follow `simple-english`;
  these principles are the broader default.

---

Synthesized for agent use. Adapted from the [Google Developer Documentation Style Guide](https://developers.google.com/style/) (content modified), which is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The [Apple Style Guide](https://help.apple.com/applestyleguide/) and the [Red Hat supplementary style guide](https://redhat-documentation.github.io/supplementary-style-guide/) were consulted for comparison only.
