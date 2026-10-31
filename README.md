# ✓ Jobs Done

**Everything you do, made visible.**

A tiny, dependency-free web app for logging the jobs you get through in a day, and sharing the list with your family in one tap.

**Live:** [jobsdone.kerryclements.com](https://jobsdone.kerryclements.com)

![Jobs Done showing three logged jobs with timestamps, and the email, copy and clear buttons](screenshot.png)

## The story

So much of the work that keeps a household running is invisible: laundry, floors, school snacks, feeding the dog, the hundred small things that happen quietly in the background. Jobs Done makes that work visible. You log each job as you do it, then send the day's list to your family group chat or inbox. It isn't score-keeping, it's sharing.

It started as a brainstorming conversation with Claude (Anthropic's AI assistant) about the overwhelm of unseen daily work, and how to log it _simply_, with no set-up, no accounts and no app installs. The idea, the framing and the design direction came from that conversation; Claude acted as a sounding board and pair-programmer to build it. It was in real family use within hours.

It was built for busy parents (by a busy mum) who wanted a frictionless way to say _"here's what my day looked like."_

📖 Read the full [case study](CASE_STUDY.md) for the story, design decisions and learnings behind the app, or the [portfolio write-up](https://kerryclements.com/portfolio/jobs-done).

## Features

- **One-line logging:** type a job, press Enter, done. Each entry is timestamped automatically.
- **Day grouping:** jobs are grouped under Today, Yesterday and weekday headings.
- **Share anywhere:** one button opens a pre-filled email (`mailto:`); another copies a neatly formatted list to the clipboard, perfect for WhatsApp.
- **Accidental-close protection:** if there are unsent jobs on the list, the browser warns before the tab closes.
- **Storage-aware:** when run inside an environment that provides a persistent key-value store (`window.storage`), the list survives between sessions. In a plain browser tab it gracefully degrades to in-page memory, with the close warning as the safety net.
- **Zero dependencies:** a single HTML file. No frameworks, no build step, no install. Open it and go.

## Accessibility

The target is WCAG 2.2 AA with zero violations.

- An audit of a Figma recreation of v1 traced almost every failure to two colour tokens, the muted text and the gold. Both were darkened (the muted text from `#8a8378` to `#6f685e`, and a new darker gold for small text), and the page now passes the 4.5:1 contrast minimum for text.
- An automated axe scan runs against the page in the empty and populated states, so a colour change that fails contrast can't be merged unnoticed.
- Focus styles, `aria-label`s on icon buttons, and `prefers-reduced-motion` respected.

## Tests

The app has no dependencies, but its tests do. They are [Playwright](https://playwright.dev) tests that open `index.html` straight from disk, plus an [axe](https://github.com/dequelabs/axe-core) accessibility scan.

```sh
npm ci
npx playwright install chromium
npm test
```

They cover adding, deleting and clearing jobs, grouping by day, the text that gets copied for sharing, storage behaviour, the close-tab warning, keyboard use and the accessibility scan. The email button isn't covered, because it opens a `mailto:` link that a browser test can't observe.

GitHub Actions runs the tests on every push and pull request to `main` and `dev`, and Dependabot keeps the test tools and the workflow up to date.

## Run it

Open `index.html` in any browser. That's it.

## Design decisions

- **Single file, no framework.** The app is small enough that a framework would be pure overhead; vanilla JS keeps it instantly portable and easy to read.
- **Graceful degradation over hard dependency.** Rather than requiring a backend or browser storage, the app detects what's available and adapts, warning the user before data could be lost.
- **`mailto:` + clipboard instead of an email API.** Sharing goes through apps the user already trusts, so there are no accounts, keys or privacy concerns.
- **Tests outside the app.** The test tools live in `package.json` only; the app itself still has nothing to install.

## Roadmap

- [x] Meet WCAG 2.2 AA colour contrast, with an automated check
- [ ] Optional localStorage persistence for plain-browser use
- [ ] Style themes
- [ ] Weekly summary view
- [ ] PWA install (add to home screen)

## Licence

MIT. Use it, fork it, share it with your family.
