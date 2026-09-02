# Election Compass — Israel 2026

A Hebrew, English, and Russian election compass that compares a user's policy opinions with a manually curated matrix of Israeli party positions. The current app contains 20 policy statements and 15 party profiles, runs entirely in the browser, and has no build step or runtime dependencies.

The tool is intended for exploration and discussion. Its scores are similarity measures—not voting recommendations, predictions, or assessments of a party's competence, credibility, or conduct.

## Current state

The application is split into small static assets suitable for GitHub Pages:

- [`index.html`](./index.html), [`en.html`](./en.html), and [`ru.html`](./ru.html) are the Hebrew, English, and Russian entry pages;
- [`styles.css`](./styles.css) contains shared responsive, RTL/LTR, and print styles;
- [`data.js`](./data.js) contains shared source URLs, party IDs, confidence values, and position vectors;
- [`translations.js`](./translations.js) contains all localized UI, questions, party names, people, and descriptions;
- [`app.js`](./app.js) renders the page and implements scoring, results, navigation, and browser persistence.

All three pages use the same data and behavior. Only their locale, text direction, metadata, and localized content differ. The language selector links directly between static pages and marks the active language accessibly.

There is currently no package manager, framework, server component, test suite, analytics, or network request made by the application itself. External pages are opened only when a user follows a source link.

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

Each party has one position on the same scale for every question. For each answered question, the app calculates the absolute distance between the user's answer and the party's position. Questions marked “especially important” receive weight `2`; all others receive weight `1`. Unanswered questions are excluded.

For a party, the displayed score is:

```text
score = round(100 × (1 − weightedDistance / maximumWeightedDistance))
```

The maximum distance on one question is `4`, so `maximumWeightedDistance` is the sum of `4 × questionWeight` across answered questions. Results are sorted from highest to lowest score. The top three appear as highlighted cards, followed by the full ranking.

At least one answer is required. Answers and importance weights are saved under `electionMatcherAnswers` in `localStorage`; they never leave the browser. Resetting the form removes that entry. Saved answers are restored on page load, but results are not recalculated until the form is submitted.

## Code and data map

The main JavaScript structures are:

- `TRANSLATIONS`: localized UI, ordered questions, and party presentation text.
- `SOURCES`: reusable source URLs.
- `PARTIES`: the 15 language-independent party profiles and position vectors.
- `values`: the shared numeric scale values.
- `scoreParty(...)`: normalized distance calculation in `app.js`.
- form `change`, `submit`, and reset handlers: progress, result generation, and persistence.

Each item in `PARTIES` has this shape:

```js
{
  id: "stableTranslationKey",
  confidence: "high | medium | low",
  links: [["sourceLabelKey", "https://example.com"]],
  p: [/* one numeric position per question, in identical order */]
}
```

The question order is the implicit schema for every `p` array and must be identical in all three translations. Consequently, adding, removing, or reordering a question requires updating every locale and every party vector at the same time. Core invariants are:

```js
TRANSLATIONS.he.questions.length === TRANSLATIONS.en.questions.length
TRANSLATIONS.en.questions.length === TRANSLATIONS.ru.questions.length
party.p.length === TRANSLATIONS.he.questions.length
```

Values in a party vector should be integers from `-2` through `2`. In the current methodology, `0` can mean either a genuinely neutral/mixed stance or the absence of a sufficiently clear position. The `confidence` field describes confidence in the profile as a whole; it does not affect the score.

## Updating political data

Party names, candidates, alliances, platforms, source URLs, descriptions, confidence labels, and numeric positions are editorial data and may become stale quickly. Before publishing an update:

1. Verify the party/list landscape against current authoritative information.
2. Prefer official platforms and party statements; use reputable reporting where official material is incomplete.
3. Keep source links close to the relevant party profile.
4. Reassess all 20 positions rather than editing only the most visible issues.
5. Use `0` conservatively when evidence is unclear, and lower the profile confidence where appropriate.
6. Update the visible “last updated” date and any election-cycle wording in the page.
7. Preserve the disclaimer that the matrix is an editorial interpretation rather than an official questionnaire completed by the parties.

The current page says its political snapshot is based on sources available in August 2026 and displays a last-updated date of 31 August 2026. Those claims describe the embedded dataset and should be changed only alongside a substantive source review.

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

There is no automated test suite yet. A lightweight manual check should cover:

1. Load the page with a clean `localStorage` entry.
2. Confirm that submitting without answers shows the validation alert.
3. Answer one question at both scale extremes and verify sensible score ordering.
4. Mark it important and confirm scores remain valid (importance changes weighting relative to other answered questions).
5. Complete several questions, reload, and confirm answers and importance flags are restored.
6. Submit and confirm 15 parties appear, sorted by descending percentage, with the top three repeated in the highlighted section.
7. Reset and confirm answers, results, progress, and saved browser data are cleared.
8. Switch among Hebrew, English, and Russian; verify the active selector, page direction, translated content, and restored answers.
9. Check that all party source links open and that the mobile layout stacks answer choices and result cards.

Useful console-level data checks after loading the page are:

```js
PARTIES.length === 15
Object.values(TRANSLATIONS).every(({ questions }) => questions.length === 20)
PARTIES.every(({ p }) => p.length === TRANSLATIONS.he.questions.length)
PARTIES.every(({ p }) => p.every(value => Number.isInteger(value) && value >= -2 && value <= 2))
```

## Known limitations

- Party positions are manually interpreted and are not independently audited.
- A single confidence label applies to an entire party profile rather than to individual answers.
- Unknown positions and neutral positions both use `0`.
- Similarity is based only on answered statements and does not express uncertainty from a small sample.
- Tied scores rely on JavaScript's stable sort behavior and have no explicit tie-break rule.
- Restored answers do not automatically restore the previously rendered ranking.
- The application contains time-sensitive 2026 political information and requires editorial maintenance.

## Possible next improvements

- Add per-position citations and confidence values.
- Represent unknown party positions separately from neutral positions and exclude them from that party's denominator.
- Show how many questions contributed to each result and warn when confidence is low.
- Add an issue-by-issue comparison explaining matches and disagreements.
- Add automated schema and scoring tests.
- Separate content, styles, and logic once continued maintenance justifies it.
- Add accessible status announcements for progress and newly rendered results.

## Repository notes for AI agents

Start by reading this README and all seven static app files; there are no generated files or hidden application layers. Before editing, inspect `git status` and preserve unrelated user changes. Do not assume that political facts, links, names, alliances, or translations are current merely because they exist in the files—verify time-sensitive data when the task requires factual updates. Keep all question translations and party vectors synchronized by array index, validate the invariants above, and report any methodology changes explicitly.

The project currently has one historical commit (`elections compass`) and no additional repository-specific agent instructions.
