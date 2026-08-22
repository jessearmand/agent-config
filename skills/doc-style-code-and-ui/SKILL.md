---
name: doc-style-code-and-ui
description: How to present code, commands, placeholders, and user-interface elements in technical documentation — what goes in code font, runnable samples vs snippets, command-line syntax and prompts, placeholder naming, referring to buttons/menus/keys with correct interaction verbs (click/tap/select/press), semantic HTML tagging, and Markdown-vs-HTML choices. Use whenever documentation mentions identifiers, file names, shell commands, API methods, keyboard shortcuts, or UI controls — including READMEs, how-tos, API references, and troubleshooting steps — even if the user just asks to "document this feature" or "write it up".
---

# Documentation style: Code and user interfaces

Readers copy what you write. These rules make computer text visually unambiguous,
copy-paste safe, and grammatically sane when software names collide with English.

## What goes in code font

Put anything verbatim-from-the-machine in code font (backticks in Markdown): readers must
see exactly what to type and where it starts and ends.

- In code font: attribute/parameter names and values, class names, data types, constants,
  enum values, environment variables, language keywords, methods/functions, HTTP verbs and
  status codes (`POST`, `404`), IP addresses used as values, package and CLI utility names
  (`curl`, `kubectl`), paths and filenames cited as files, text the user types, query
  strings, element/tag names without angle brackets (`script`, not `<script>`).
- Not in code font: product names, company names, ordinary domain names and URLs a browser
  follows (link them instead), and *true*/*false* when they describe a condition in English
  rather than a literal value ("True if the bird is in the sanctuary; false otherwise." —
  but `returns `true``).
- Command vs project: the executable is code, the project is prose — `apt` the program,
  APT the packaging system; `gcc` compiles, GCC is the collection.
- Email addresses, domains, and URLs take code font only when they are input or output.
- Don't wrap code in quotation marks; the font already delimits it.

## Grammar around code

Software names are not English words — don't inflect them.

- Never pluralize, possess, or verb a token: not "`POST` the data", "`Session`s",
  "`settings.h`'s path". Attach an ordinary noun and inflect that:
  - ✅ Send a `POST` request. Create `Session` objects. The value of `ADDRESS` is…
  - ❌ `POST` the data. Create `Sessions`. `ADDRESS`'s value…
- If the class name doubles as an English word, you may use the plain word lowercase in
  roman type for the concept ("the activity launches").
- Match code spelling and casing exactly when citing it (`NavBar`, never "Nav Bar"
  in code font).
- Omit the class prefix on method references unless ambiguity results: "call its `get`
  method".

## Files and file types

- A specific file: code font, real spelling, followed by the word *file* — "the
  `build.sh` file". Don't use extensions as nouns for kinds: "a PNG file", not "a `.png`
  file"; "a Markdown file".
- Naming new files in docs/examples: lowercase, hyphens not underscores, ASCII only —
  except inside a directory whose existing convention differs; match it.
- Never use file-type names as verbs ("zip the archive" is fine as the format name; don't
  write *unzip a zip file*-style puns — say "extract").

## HTTP status codes

Call them *status codes*, number plus official name in code font:
"an HTTP `400 Bad Request` status code". Ranges: `2xx` or `200`–`299`.

## Code samples

- Multi-line code lives in fenced blocks. Match the project's formatter or language
  style guide for wrapping and indentation; only when no convention exists, wrap near
  80 characters. Breaking a line must not change meaning.
- Introduce every sample with a sentence. Colon when the block follows immediately;
  period when anything intervenes. Prefer stating what the command does over the empty
  "run the following command".
- **Copy safety:** a click-to-copy sample must run after the reader replaces placeholders —
  nothing else. Metacharacters (`[]`, `{}`, `|`, `...`) never appear in copyable blocks;
  put fully concrete variants in separate blocks instead.
- Omitted lines in code get a language comment (`# Remaining setup omitted.`); omitted
  *output* gets three dots on their own line. An ellipsis character is never an omission
  marker, and a block containing omissions is never click-to-copy.
- Show command output only when readers must verify or copy a value, introduced as "The
  output is similar to the following:" (variable) or "The output is the following:" (exact).

## Command-line syntax

- Long commands go in blocks, broken before flags or quotes, each continuation ending
  with the platform marker (`\` for POSIX shells, `^` for Windows) and indented to show
  continuation (four spaces when no project style says otherwise).
- Keep one command per block, and split input and output into separate blocks — copied
  commands must not carry output or a second command with them.
- Use `$` before input lines in multi-line terminal blocks; keep one-liner prompts
  consistent within a page; never show a working-directory prompt (`~/proj $`).
- Syntax-diagram notation is reference-only, never copy-paste: `[optional]`,
  `{a|b}` required choice, `...` repeatable.
- Explain placeholders after the command; explain what the whole command accomplishes.
  Use *option* as the catchall noun unless teaching the concept. Signals keep their verbs:
  SIGTERM *terminates*, SIGKILL *kills*, SIGINT *interrupts*.

## Placeholders

- Name placeholders in `UPPER_SNAKE_CASE`: `PROJECT_ID`, `INSTANCE_NAME`. Never
  `MY_THING`/`YOUR_THING`, `xxx`, or "dummy" variables.
- Inline in Markdown, italicize outside the backticks for visibility; inside fences the
  uppercase shape alone signals it.
- Explain every placeholder at first appearance: one → "Replace `NAME` with…"; several →
  "Replace the following:" plus a list in command order.

## API reference comments

When writing reference prose (also applies to docstring-style summaries):

- First sentence of a type says what it's *for*, not restating the name; short and unique —
  tools harvest it. No "this class…" phrasing.
- Start member blurbs with a conventional verb, third person, present tense:
  - Operation returning a result: "Adds a bird and returns the ID."
  - Boolean getter: "Checks whether…"; other getter: "Gets the…"; setter: "Sets…";
    callback: "Called by…".
- Parameters: full sentences, capitalized, ending with a period, non-booleans starting
  "The"/"A"; state booleans "True if …; false otherwise."; action booleans "If true, …".
- Deprecations: name the replacement in the first sentence so summaries show it.

## Referring to the UI

Task first, chrome second. "Refresh the page" beats naming widgets — and survives UI
redesigns. Name controls when the interface itself is the subject.

- Bold visible labels; never quote them or put them in code font (unless the label is
  literally a code entity — then bold + code). Strip trailing ellipses: Click **Browse**.
- Follow on-screen capitalization, except ALL-CAPS or inconsistent labels become sentence
  case: "Click **Refresh**," even if the button paints REFRESH.
- Buttons are referred to by label alone: "Click **OK**", not "the OK button". For icon
  buttons give icon + tooltip name; never describe an icon alone ("the button with three
  lines") — screen readers and translations both fail.
- Component vocabulary: *window* (desktop frame), *page* (web), *dialog* (front-most small
  window, not "pop-up"), *pane*/*panel* (region inside), *section* (labeled group),
  *navigation menu*, *toolbar*. Menu-bar items are *commands*. No slang (*hamburger*).
- Menu paths: one bold span with `>` separators, menus only — never mix panes+buttons
  into a path. ✅ Choose **File > Export**. When merely locating a command, name it in
  words instead: "the Page Setup command in the File menu".
- Form controls: "the **Owner** box" (or *field* if that's the product's term); checkboxes
  are *selected*/*cleared*, never checked/unchecked; radio options are selected by label.
- Prepositions: *in* dialogs, boxes, lists, menus, panes; *on* pages, tabs, toolbars.
  Location before action: "In the **Name** box, enter `wsfc-1`."

### Interaction verbs match the device

| Control | Verb |
|---|---|
| Mouse targets: buttons, links, items | *click* (never "click on") |
| Menu commands | *choose* |
| Touch targets | *tap* |
| Keyboard keys, mechanical buttons | *press* |
| Options, checkbox states, text ranges | *select* / *clear* |
| Supplying text (typed, pasted, dictated) | *enter* (prefer over *type*) |
| Moving an item across a drop target | *drag* (adjective: *drag-and-drop*) |

- *Toggle* is a noun (the control), never a verb — state the resulting position.
- Procedures document the UI action, not the shortcut: "Copy the value" not "Press
  `Control+C`" — include the key press in the same step only when Enter is genuinely
  required.

### Keyboard keys

- Keys the reader presses: `kbd`/monospace, letter keys uppercase, no symbols — spell out
  Command, Control, Option, Shift. Combinations join with `+`: `Control+Shift+P`.
- Characters typed as text take code font. Ambiguous key names: "the Esc key".
- Multiple platforms: Windows/Linux first, macOS parenthetical.

## Markup: semantics first

- Use HTML elements for meaning, not default looks: `em` = emphasis vs `i` = non-emphasis
  italics; `strong` = importance vs `b` = UI-label bold; `cite` for work titles; headings
  `h1`–`h6` only for hierarchy; CSS for layout, never tables or frames.
- Markdown is fine for most docs; switch to inline HTML when you need semantic tags
  (`var`, `kbd`, `cite`) or characters Markdown can't mark. Prefer `**bold**` and `_italic_`
  markers so humans can tell emphasis apart in source. Inside fences, italics are
  impossible — leave `UPPER_SNAKE` placeholders bare.
- HTML source style: follow the project's formatter or style config. Fallback when none
  exists: spaces not tabs, two-space indent, lowercase elements/attributes, wrap at 80 —
  never break a URL (long `href` goes on its own line). Don't reflow a file that
  consistently uses another width just because you touched it.

### Emphasis and type conventions

Bold marks UI labels and notice labels — never emphasis. Emphasis and words-as-words take
italics; titles of standalone works italicize unless they're link text; underline is
reserved for links. Write *and*, reserving `&` for code and labels that literally contain it.

## Related skills

- Sentence mechanics, capitalization, punctuation: `doc-style-language`.
- Structuring procedures and step lists around these controls: `doc-style-formatting`.
- Tone and audience rules behind task-first UI writing: `doc-style-principles`.
- Linking UI text and cross-references: `doc-style-references`.

---

Synthesized for agent use. Adapted from the [Google Developer Documentation Style Guide](https://developers.google.com/style/) (content modified), which is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The [Apple Style Guide](https://help.apple.com/applestyleguide/) and the [Red Hat supplementary style guide](https://redhat-documentation.github.io/supplementary-style-guide/) were consulted for comparison only.
