# Election Compass — Israel 2026

A Hebrew, English, and Russian election compass that compares a user's policy opinions with a manually curated matrix of Israeli party positions. The current app contains 22 policy statements and 15 party profiles, runs entirely in the browser, and has no build step or runtime dependencies.

The tool is intended for exploration and discussion. Its scores are similarity measures—not voting recommendations, predictions, or assessments of a party's competence, credibility, or conduct.

## Current state

The application is split into small static assets suitable for GitHub Pages:

- [`index.html`](./index.html), [`en.html`](./en.html), and [`ru.html`](./ru.html) are the Hebrew, English, and Russian entry pages;
- [`styles.css`](./styles.css) contains shared responsive, RTL/LTR, and print styles;
- [`data.js`](./data.js) contains shared source URLs, party IDs, confidence values, and position vectors;
- [`translations.js`](./translations.js) contains all localized UI, questions, party names, people, and descriptions;
- [`app.js`](./app.js) renders the page and implements scoring, results, navigation, and browser persistence.

All three pages use the same data and behavior. Only their locale, text direction, metadata, and localized content differ. The language selector links directly between static pages and marks the active language accessibly.

There is currently no package manager, framework, server component, analytics, or network request made by the application itself. A dependency-free validation script runs with `node validate.js`. External pages are opened only when a user follows a source link.

## Run locally

Because the app is static, either open `index.html` directly in a browser or serve the directory with any static file server. For example:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

Serving over HTTP is preferable during development because it matches normal hosting behavior more closely than a `file://` URL.

## How it works

Each question uses a five-point scale:

| Value | Meaning in the UI |
| ---: | --- |
| `-2` | Strongly disagree |
| `-1` | Disagree |
| `0` | Neutral or mixed |
| `1` | Agree |
| `2` | Strongly agree |

Each party has a position on the same scale, or `null` when no position was established on that specific statement. For each answered question with a known party position, the app calculates the absolute distance between the user's answer and the party's position. Questions marked “especially important” receive weight `2`; all others receive weight `1`. Unanswered questions and unknown party positions are excluded from both the distance and that party’s denominator. Documented neutral/mixed positions remain numeric `0` and are included.

For a party, the displayed score is:

```text
score = round(100 × (1 − weightedDistance / maximumWeightedDistance))
```

The maximum distance on one question is `4`, so `maximumWeightedDistance` is the sum of `4 × questionWeight` across answered questions with known party positions. No comparable evidence produces `null`, displayed as a dash, never 0% or 100%.

Each result displays a count of compared/answered questions and weighted evidence coverage: `knownAnsweredWeight / totalAnsweredWeight`. Main-ranking eligibility requires at least 50% weighted coverage and at least `min(5, answeredCount)` comparable questions. This editorial display safeguard is not a statistical confidence threshold. Eligible results are sorted by score, then coverage on ties; up to three appear as highlighted cards. Remaining results appear separately without ranks, ordered by coverage, with limited/no-evidence labels. Fewer than five answers produces a visible caution.

Silence is not interpreted as indifference, neutrality or disagreement. A gap can mean an inaccessible source, insufficiently specific language or no located position. It is not proof of absence from all party communications. Scores can use different issue subsets, so coverage must be read alongside similarity. Expand each party’s “Positions and evidence gaps” panel to inspect individual statements; the three new topics have direct citations wherever a numeric position is assigned.

At least one answer is required. Answers and importance weights are saved under `electionMatcherAnswers` in `localStorage`; they never leave the browser. Resetting the form removes that entry. Saved answers with the current `DATA_VERSION` are restored on page load, but results are not recalculated until the form is submitted. Older answers, including the initial October review, are ignored: Q4 and Q12 were replaced, Q21 was added and unknown-position scoring changed in v2. In v3, Hebrew wording is clarified and the combined civil-marriage/Shabbat-transport statement is split into Q7 and Q22, so v2 answers also require a fresh response. The saved object is `{version, answers, weights}`. Change `DATA_VERSION` whenever question meanings or order change.

## Code and data map

The main JavaScript structures are:

- `TRANSLATIONS`: localized UI, ordered questions, and party presentation text.
- `SOURCES`: reusable source URLs.
- `DATA_VERSION`: questionnaire schema version, currently `2026-10-23-v3`.
- `PARTIES`: the 15 language-independent party profiles and position vectors.
- `values`: the shared numeric scale values.
- `assessParty(...)`: similarity, evidence coverage and ranking eligibility in `app.js`.
- `scoreParty(...)`: numeric-score wrapper for the same calculation.
- form `change`, `submit`, and reset handlers: progress, result generation, and persistence.

Each item in `PARTIES` has this shape:

```js
{
  id: "stableTranslationKey",
  confidence: "high | medium | low",
  status: "competitive | borderline | below",
  links: [["sourceLabelKey", "https://example.com"]],
  topicEvidence: {3: "https://example.com/education"}, // zero-based question indices
  p: [/* one integer or null per question, in identical order */]
}
```

The question order is the implicit schema for every `p` array and must be identical in all three translations. Consequently, adding, removing, or reordering a question requires updating every locale and every party vector at the same time. Core invariants are:

```js
TRANSLATIONS.he.questions.length === TRANSLATIONS.en.questions.length
TRANSLATIONS.en.questions.length === TRANSLATIONS.ru.questions.length
party.p.length === TRANSLATIONS.he.questions.length
```

Values in a party vector must be integers from `-2` through `2`, or `null`. Use `0` only for a documented neutral/mixed stance, never for missing evidence. Earlier ambiguous zeroes were conservatively migrated to `null`; their old coding alone did not establish neutrality. The `confidence` field describes confidence in the profile as a whole; it does not affect the score.

## Updating political data

Party names, candidates, alliances, platforms, source URLs, descriptions, confidence labels, and numeric positions are editorial data and may become stale quickly. Before publishing an update:

1. Verify the party/list landscape against current authoritative information.
2. Prefer official platforms and party statements; use reputable reporting where official material is incomplete.
3. Keep source links close to the relevant party profile.
4. Reassess all 22 positions rather than editing only the most visible issues.
5. Use `null` when evidence is unclear; do not infer a position from silence or general topic support. Lower profile confidence where appropriate and supply direct evidence for new numeric positions.
6. Update the visible “last updated” date and any election-cycle wording in the page.
7. Preserve the disclaimer that the matrix is an editorial interpretation rather than an official questionnaire completed by the parties.

The current political review is dated **23 October 2026**, for the 27 October election. See [the source review and scoring notes](./RESEARCH-2026-10-23.md) for withdrawals, mergers, electoral prospects, party evidence and interpretation limits. The dataset keeps 15 campaigning lists and 22 questions. Blue and White is excluded after its withdrawal; the Joint List, Religious Zionism–Zehut and Reservists–Economic are represented as combined lists. Haredi Public and Noam are included with low evidence confidence and below-threshold polling labels. Polling status does not affect similarity scoring.

## Development guidance

This repository uses dependency-free static files so it can be deployed directly through GitHub Pages. Keep language-independent behavior and political scores shared; do not fork application logic or party position vectors by language. If the dataset grows substantially, it may be moved to versioned JSON, which should then be loaded over HTTP.

When changing the app:

- preserve RTL Hebrew and LTR English/Russian layouts, testing all three on desktop and a narrow mobile viewport;
- add every user-facing string and every question/party translation to all three locales;
- keep keyboard focus visible and all answer controls associated with labels;
- do not silently change the scoring formula or scale;
- treat question wording and party-vector edits as methodology changes, not cosmetic edits;
- avoid adding tracking or transmitting answers without explicit disclosure and consent;
- ensure links opened in a new tab retain `rel="noreferrer"` or an equivalent safe setting;
- maintain usable print output if layout CSS changes.

## Suggested validation

Run `node validate.js` for schema, translation, roster and scoring checks. A lightweight browser check should also cover:

1. Load the page with a clean `localStorage` entry.
2. Confirm that submitting without answers shows the validation alert.
3. Answer one question at both scale extremes and verify sensible score ordering.
4. Mark it important and confirm scores remain valid (importance changes weighting relative to other answered questions).
5. Complete several questions, reload, and confirm answers and importance flags are restored.
6. Submit and confirm all 15 parties appear: eligible parties ranked by similarity, others separately labelled. Only eligible parties may appear in the top cards. Answer school autonomy alone to check that unknown parties show no percentage. Inspect evidence gaps in each party card.
7. Reset and confirm answers, results, progress, and saved browser data are cleared.
8. Switch among Hebrew, English, and Russian; verify the active selector, page direction, translated content, and restored answers.
9. Check that all party source links open and that the mobile layout stacks answer choices and result cards.

Useful console-level data checks after loading the page are:

```js
PARTIES.length === 15
Object.values(TRANSLATIONS).every(({ questions }) => questions.length === 22)
PARTIES.every(({ p }) => p.length === TRANSLATIONS.he.questions.length)
PARTIES.every(({ p }) => p.every(value => value === null || (Number.isInteger(value) && value >= -2 && value <= 2)))
```

## Known limitations

- Party positions are manually interpreted and are not independently audited.
- A single confidence label applies to an entire party profile rather than to individual answers.
- Unknown positions reduce evidence coverage. A missing position does not measure a party’s priorities or motivation.
- Similarity may compare different subsets of answers across parties; coverage safeguards do not quantify statistical uncertainty.
- Score ties prefer higher evidence coverage; remaining ties preserve dataset order.
- Restored answers do not automatically restore the previously rendered ranking.
- The application contains time-sensitive 2026 political information and requires editorial maintenance.

## Possible next improvements

- Extend per-position citations beyond the three new topics, and add per-position confidence values.
- Add an issue-by-issue comparison explaining matches and disagreements.
- Separate content, styles, and logic once continued maintenance justifies it.
- Add accessible status announcements for progress and newly rendered results.

## Repository notes for AI agents

Start by reading this README and all seven static app files; there are no generated files or hidden application layers. Before editing, inspect `git status` and preserve unrelated user changes. Do not assume that political facts, links, names, alliances, or translations are current merely because they exist in the files—verify time-sensitive data when the task requires factual updates. Keep all question translations and party vectors synchronized by array index, validate the invariants above, and report any methodology changes explicitly.

The October review is recorded in `RESEARCH-2026-10-23.md`. Keep its sources and methodology notes synchronized with subsequent political updates.

## Question wording and translation

Hebrew is the reference language. English and Russian must preserve the actor, policy, scope, exceptions, strength and tradeoff of each Hebrew statement. Review translations side by side; matching array lengths does not establish semantic equivalence. Avoid adding policy commitments in a translation. Questions use agreement with a proposal, not factual true/false answers.

The v3 review clarified all 22 statements, including conscription eligibility, legally required service, judicial review, the date of the October 7 attack, coalition support from outside government, and the school-age core curriculum. Q7 concerns civil marriage in Israel; Q22 concerns municipal authority over Shabbat transport. Civil partnerships alone do not establish a position on civil marriage. Broad policy tradeoffs remain qualitative: no percentages, budget amounts or territorial boundaries should be inferred where the question does not specify them. See the v3 research note for the separate evidence assessment.
