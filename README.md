# John Wei — Portfolio website

## Tech stack

- **HTML / CSS / JS** — one shared stylesheet ([`styles.css`](styles.css)) and one script ([`script.js`](script.js)).
- **Typography** — [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans) from Google Fonts (loaded the same way on every page).

## Project structure

- [`index.html`](index.html) — home / landing
- [`about.html`](about.html) — about
- [`projects.html`](projects.html) — projects 
- [`skills.html`](skills.html) — skills
- [`experiences.html`](experiences.html) — work experience
- [`contact.html`](contact.html) — contact form
- [`styles.css`](styles.css) — layout, navigation, sections, projects, skills, experiences, contact
- [`script.js`](script.js) — contact form 

## Experiences page

Work history is grouped **by employer**:

**Timeline line:** For grouped employers, a single vertical accent line is drawn on `.experience-group .experience-list` so the rule reads as one continuous column for that company. Individual `.experience-item` left borders are turned off inside a group (see `.experience-group .experience-item` in [`styles.css`](styles.css)).

## Contact form

Submissions are sent with Form Submit