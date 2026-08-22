# Usage word list

Curated, vendor-neutral usage decisions for technical documentation. Alphabetical;
one row per pattern. When this table conflicts with a project's own word list, the
project wins. Companion to the rules in [`../SKILL.md`](../SKILL.md) (grammar,
punctuation) and the policies in `doc-style-principles`.

Selection priorities: noun/verb and hyphenation pairs agents misuse; casing
authorities; abbreviation policy; inclusive-language swaps; tone traps; frequently
confused technical words.

## Usage table

| Term / pattern | Guidance |
| --- | --- |
| `&` (ampersand) | Don't replace *and* with `&` in headings, body, nav, or TOCs. OK in UI labels that use `&`, tight table/diagram labels, and code. |
| `+` (with numbers) | OK in running text (*300+ attributes*) except formal contexts. |
| a / an | *A* before a consonant *sound*, not letter (*a SQL query*, *an SLI*). |
| A/B testing | Capitalize *A/B*; keep the slash. |
| abort / kill / terminate | Prefer *stop*, *exit*, *cancel*, *end*. *Terminate* only for named signals or telephony/networking. |
| about vs on | Cross-references use *about*: "For more information about indexes…". |
| above / below / under | Not for version ranges or document/UI position (*earlier*, *later*, *following*). OK for hierarchy (*below zero*). |
| access (verb) | Prefer *see*, *edit*, *find*, *use*, *view* when they fit. |
| account name | Write *username*. |
| actionable | Usually filler; prefer *useful* or say what the reader can do. |
| ad hoc | Two words, no hyphen, no italics. |
| admin | Spell out *administrator* unless a UI label says *admin*. |
| agnostic (platform-) | Replace with precise terms: *platform-independent*. |
| aka | Write *also known as* or give the synonym in parentheses. |
| allowlist / denylist (verbs) | Nouns are fine; don't verb them — describe the action. |
| allows you to | Write *lets you*. |
| alpha / beta | Lowercase unless part of a product name. |
| America(n) | Don't mean the US with it; write *the US*, *people in the US*. |
| AM, PM | All caps, no periods, space before (*9:00 AM*). |
| and/or | Avoid; recast (*A or B, or both*). Tables may keep it when space is tight. |
| anti-pattern | Avoid, especially as a heading; name the actual problem. |
| API | A whole interface, not one method or class. |
| app / application | Prefer *app*; *application* for enterprise weight and *application programming interface*. |
| appendixes | Not *appendices*. |
| as / since | Causation takes *because* (they also mean time). |
| as of this writing / currently / now / soon / eventually / future | Drop — time-anchors and roadmap leaks. State the fact plainly. |
| authenticate / authorize | People authenticate; apps send authorized requests. Authenticate *against*. |
| authN / authZ | Spell out *authentication* / *authorization*. |
| autoscaling, autopopulate, autohealing | Closed forms; not *auto-scaling*. No *autoupdate* — *automatically update*. |
| backend / frontend | One word each. |
| bare metal | Two words; hyphenated as modifier (*bare-metal server*). |
| base64 | Lowercase outside proper names; code font only for literals. |
| between / among | *Between* distinct items (even many); *among* an undifferentiated group. |
| big-endian / little-endian | Hyphenate, lowercase. |
| blacklist / whitelist / graylist | Use *blocklist*/*denylist*, *allowlist*, *provisional list*; legacy code identifiers stay in code font only. |
| black-box / white-box testing | Prefer descriptive terms (*synthetic monitoring*, *introspective testing*). |
| blackhat / whitehat | Write *illegal*/*unethical*/*legal*/*ethical* as facts require. |
| blast radius | Write *affected area*. |
| blind (figurative) | *Ignore*, *without reading*, *without confirming*. People-first for literal senses. |
| blue-green deployment | Hyphenated. |
| boolean | Lowercase for abstract type; match code casing for language literals; *Boolean* only in Boolean logic/mathematics. |
| break-glass | Write *emergency access* or *manual fallback*. |
| brown-bag | Write *learning session*. |
| button vs link | A link isn't a button. Press mechanical buttons; tap on-screen ones. |
| can | Ability, permission, optional action, possible outcome. Prefer over *could*/*would*. |
| canary (verb) | Don't verb it; define on first use if kept. |
| cell phone / cellular | *Mobile phone*, *mobile device*, *mobile network*. |
| checkbox | One word. *Select* / *clear* — never check/uncheck/deselect. |
| choose | Generic English fine; UI controls take *select* (menus: see `doc-style-code-and-ui`). |
| chapter | Books only; otherwise *document*, *page*, *section*. |
| click / click here | *Click* the control, never *click on* or *click here*. Hyphenate *right-click*, *double-click*. |
| clickthrough | Noun *clickthrough*; verb *click through*. |
| CLI | Name the actual tool instead of the genericism. |
| codebase | One word. |
| colocate | Not *co-locate*. |
| comprise | Use *consist of*, *contain*, *include*. |
| config | Spell out *configuration* in prose; code font for identifiers named config. |
| Control+S | `Control`+uppercase key (*Control+S*); mention Command/Option for macOS audiences; never *Ctl-S*. |
| copy and paste | Don't instruct mechanics; state what to enter. |
| crazy / insane / lame / retarded / gimp | Never. Describe the system's actual behavior (*unexpected*, *slowed*, *invalid*). |
| create a new | Just *create* unless contrasting items. |
| cripple | Describe the effect (*slowed the server*). |
| curl | Not *cURL*. |
| dash vs hyphen | They are different characters; don't call a hyphen a dash. |
| data | Singular mass noun: *the data is*; *less data*. |
| data center / data source / data type / datastore | Three two-word forms; *datastore* closes up. |
| data cleaning | Not *cleansing*. |
| data flow / dataflow | Two words for flow of data; one word for stream-processing *dataflow*. |
| dead-letter queue | Define on first use. |
| deprecate | *Recommend against; will go away* — not a synonym for removed. |
| desire / wish | Write *want* or *need*. |
| dialog / dialogue | *Dialog* for UI; *dialogue* for conversation. |
| directory / folder | Default *directory*; GUI contexts may say *folder*; match the product. |
| disable | For UI state prefer *turn off* / *deactivate* / *unavailable*; reserve *disable* for deliberate configuration. |
| display | Transitive only: *The area displays the image* or *The area appears*. |
| distributed denial-of-service | Hyphenate; *DDoS* after first use. |
| documentation / this document | Not *article*, *topic*, *doc*, *page*. |
| dummy variable | Write *placeholder*; statistics uses *indicator variable*. |
| each | Not a synonym for *all*. |
| earlier / later | Version relations: *version 2.2 or later*, never higher/lower/plus. |
| easy / simple / quick(ly) | Cut — unverifiable and insulting to stuck readers. |
| ecommerce | Closed; not *e-commerce*. |
| e.g. | Write *for example* or *such as*. |
| email | Closed; not a verb (*send email*). |
| emoji | Unchanged in plural. |
| enable / turn on | Pick one for feature state and stay consistent; capability = *lets you*. |
| endpoint | One word. |
| enter vs type | Prefer *enter*; *type* only when keystrokes matter. |
| etc. / and so on | Avoid; *such as*/*including* introduces non-exhaustive lists. |
| execute | Prefer *run* for functions and queries. |
| exploit | Only for attacks on vulnerabilities. |
| extract | Not *unzip*/*untar*/*uncompress* as instructions. |
| fail over / failover | Verb two words; noun/adjective one. |
| fat / chubby | Write *high-capacity*, *full-featured*, *unused*, *overextended*. |
| female/male adapter | Write *socket*/*plug*. |
| filename / file system | One word; two words respectively. |
| fill in / fill out | Field in; form out. |
| final solution | Avoid the phrase entirely. |
| first-class citizen | Describe the capability instead. |
| foo / bar / baz | Meaningful example names only. |
| for instance | Write *for example*. |
| functionality | Usually *features* or *capabilities*. |
| generative AI | Spelled out, sentence case; not *gen AI*. |
| grandfathered | Write *legacy*/*exempt*/*made an exception*. |
| grayed-out | Write *unavailable*. |
| guys / you guys | *Everyone*, *folks*. |
| gypsy | Slur; use the community's name; never metaphorically. |
| hamburger menu | Use the control's accessible name (*Menu*, *More*). |
| hang / hung | Systems *stop responding*. |
| hardcode(d) | No hyphen. |
| healthcare | One word. |
| health check / healthy | Match the UI's term; prefer *responsive* for nodes. |
| high availability | Noun open; adjective hyphenated (*high-availability cluster*); *HA* after first use. |
| hostname | One word. |
| housekeeping | Write *maintenance* or *cleanup*. |
| hover | *Hold the pointer over* (waiting) or *point to* (not waiting). |
| HTTPS | Not *HTTPs*. |
| IaaS / PaaS / SaaS | Expand at first mention. |
| ID | Caps except in code; *identifier* when clearer. |
| i.e. | Write *that is*. |
| if…then | Keep *then* in technical conditionals. |
| image | Qualify: *disk image*, *container image*. |
| impact (verb) | Noun only; *affects* as the verb. |
| in order to | *To*, unless ambiguous. |
| index(es) | *Indexes* outside math/finance. |
| ingest | Simple moves are *import*/*load*/*copy*. |
| inline | One word as adjective. |
| interface (verb) | Don't; *interact with*. |
| internet | Lowercase. |
| I/O | Not IO or I-O. |
| IoT | Lowercase *o*. |
| IPsec | Exact casing. |
| just | Usually delete; else *only*. |
| k8s | Write *Kubernetes*. |
| kebab-case | Call it *dash-case*. |
| key (adjective) | Avoid meaning *crucial*. |
| key pair / key-value pair | Two keys vs name-and-value (hyphenated). |
| latest / new / old(er) | Version talk uses *later*/*earlier* plus number/date. |
| learnings | *Knowledge* or *what you learned*. |
| left-nav / right-nav | Directional names break translation; *navigation menu*. |
| let's | Don't. |
| leverage | *Use*. |
| lifecycle | One word. |
| load balancing | Noun open; adjective hyphenated. |
| login / log in / sign-in / sign in | Prefer *sign in* (verb) / *sign-in* (noun/adj); *sign in to*, never *sign into*; match a product that truly says *log in*. |
| man hours / manpower / manned | *Person hours*, *staff*, *crewed*. |
| man-in-the-middle | Prefer *on-path attacker* or spell out *person-in-the-middle*. |
| Markdown | Always capitalized. |
| master / slave | Replace pairs (*primary*/*replica*, *leader*/*follower*, *active*/*standby*); legacy identifiers in code font only. |
| may | Policy/legal permission only; possibility is *might*, permission is *can*. |
| media type | Prefer over *MIME type*; *content type* for headers. |
| method | In OOP docs, don't reuse for *approach*. |
| microservices | Lowercase, closed. |
| might | Uncertain outcomes. |
| mobile | Adjective only; *mobile phone*/*mobile device*. |
| mom test / monkey test | Name the behavior (*novice-user test*, *randomized automated tests*). |
| must | Required action/state; *you need* also acceptable. |
| N/A | With slash; expand at first use when space allows. |
| name server / namespace | Open vs closed as shown. |
| native (of people) | Don't; for software prefer *built-in*; avoid vague *cloud-native*. |
| neither | *Neither A nor B*. |
| ninja / guru / sherpa / dojo | *Expert*, *guide*, *training*, *workshop* (proper names exempt). |
| nonce | Define; end-user docs say *a number used only once*. |
| NoSQL | One word, exact casing. |
| OAuth 2.0 | Not *OAuth2*. |
| once | Temporal only; causation/sequence takes *after*/*when*. |
| on-premises | Always hyphenated, never *on-premise*; prefer *on-premises environment*. |
| path | Over *filepath*/*pathname*. |
| per | Rates only (*requests per day*); never *as per*. |
| performant | Name the quality instead. |
| persist (transitive) | *Make persistent*. |
| personally identifiable information | Standard term; PII after first use. |
| pets versus cattle | Write *persistent versus dynamic*. |
| plain text / plaintext | Open generally; closed in cryptography. |
| please | Omit in procedures; only genuine burden-apologies keep it. |
| plugin / plug-in / plug in | Noun / adjective / verb. |
| pop-up | Write *dialog* or *menu*. |
| populate | Processes populate tables; people fill in forms. |
| possible / impossible | Say what the reader *can* or *can't* do. |
| postmortem | Prefer *retrospective*; incident writing may keep *blameless postmortem*. |
| prebuilt / prerecorded / presubmit | Closed; exceptions like *pre-existing*, *pre-shared key*. |
| preferred pronouns | Just *pronouns*. |
| read-only | Always hyphenated. |
| regex | Write *regular expression*. |
| repo | Write *repository*. |
| REST | Don't expand. |
| RFC 2318 | Space before the number. |
| review vs read | *Read* first pass; *review* critical examination. |
| roll out | Only for genuinely gradual launches; else *release*. |
| RTFM | Never. |
| runtime / run time | Environment vs duration of execution. |
| sane / sanity check | *Valid*/*sensible*; *quick check* / *coherence check*. |
| scale | Directional: *scale up/down/out/in*; never bare *at scale*. |
| screenshot | Noun only; *take a screenshot*. |
| scroll | Prefer *go to*; never *scroll up/down* if avoidable. |
| see | Acceptable for cross-references. |
| sensitive / confidential | Harm-on-release vs access-controlled. |
| setup / set up | Noun/adjective vs verb. |
| sexy | Never; *fast*, *powerful*, *elegant*. |
| SHA-1 | Hyphenated except in code compounds. |
| shall / should | Avoid both; state required vs recommended explicitly. |
| she/he generics | Singular *they* only. |
| shift left | *Shift earlier* (direction assumption breaks in RTL locales). |
| single pane of glass | *Single interface*. |
| single sign-on | Hyphenate *sign-on* only there. |
| slice and dice | Write *segment*. |
| spin up | *Create* or *start* instances. |
| SQL | *a SQL* (pronounced "sequel"). |
| ssh / SSH | Protocol vs utility; never a verb. |
| startup / start up | Noun/adjective vs verb. |
| sub-command | Hyphenated. |
| such as | Non-exhaustive; no trailing *etc.* |
| surface (verb) | *Expose* or *make available*. |
| tag / element | Marker vs whole construct in HTML/XML. |
| tarball | *tar file*. |
| target (people) | *Intended for* / *aimed at*. |
| they (singular) | Gender-neutral default; plural verb agreement. |
| third party / third-party | Noun open; adjective hyphenated; never *3rd party*. |
| this / that | Follow with a noun (*this setting*) or recast. |
| timeframe / timeout / timestamp / time zone | Prefer *period*/*deadline*; noun *timeout* vs verb *time out*; *timestamp*; zone nouns open, adjective hyphenated. |
| tl;dr | Never. |
| toolkit | One word. |
| traditional | Name the older system specifically. |
| transpile | Not *transcompile*. |
| tribal knowledge | *Undocumented team knowledge*. |
| trojan | Lowercase malware term. |
| typically | Don't open sentences with it. |
| UI | An adjective/initialism, not a synonym for page or console. |
| Unicode / UTF-8 | Exact casings; hyphenated encodings. |
| Unix-like | Hyphenated; *Unix epoch time* for epoch seconds. |
| US | No periods. |
| user / you / we | Reader is *you*; *user* builds-software-under-discussion; *we* documents the authoring org. |
| user base | Two words. |
| using / by using | Disambiguate agency with *by using*. |
| utilize | *Use*; *utilization* survives for resource consumption. |
| v1.2 | Lowercase v. |
| via | Avoid. |
| vice versa | Spell out both directions. |
| voila | Never. |
| voodoo | Never; *nondeterministic*. |
| vs. | Write *versus*. |
| walkthrough | One word. |
| war room | *Incident-response team*. |
| web | Lowercase; no *World Wide Web*. |
| WebAssembly / Wasm | Spec capitalization. |
| webmaster | *Website owner*/*website administrator*. |
| web server | Two words. |
| while | Time only; contrast takes *although*. |
| white glove / white label | *High-touch*; *unbranded*. |
| whitepaper | One word, sparingly. |
| whitespace | One word. |
| wildcard | One word. |
| will / would | Present tense by default. |
| with (possession/instrument) | *that has* / *using*. |
| ymmv | *Your results might vary*. |

---

Adapted from the [Google developer documentation style guide word list](https://developers.google.com/style/word-list) — vendor entries removed and wording modified — which is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The Apple Style Guide and the Red Hat supplementary style guide were consulted for divergences only.
