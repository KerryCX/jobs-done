# Case Study: Jobs Done

**Making invisible household work visible — a micro-app for busy mums**

*Role: Research, UX, UI, and direction (solo), with Claude AI as brainstorming partner and pair-programmer · Tools: HTML, CSS, vanilla JavaScript, Claude · Timeline: One day, iterated in production*

---

## Overview

Jobs Done is a single-file web app that lets busy parents log the jobs they complete through the day and share the list with their family in one tap — via email or straight into the family WhatsApp group.

It began as a personal itch and was in real use, with real family reactions, within hours of the first version.

---

## The problem

Household and family work is largely invisible. Laundry gets washed, floors get scrubbed, the dog gets fed, school snacks get prepared — and because it all happens quietly while everyone else is out, it goes unseen. The person doing it can feel unappreciated; the family genuinely doesn't realise the volume of work involved.

The existing options don't fit:

- **Chore apps** are built around assigning and nagging — the wrong emotional framing entirely.
- **To-do apps** centre on what *hasn't* been done, which is demoralising.
- **Just telling people** gets forgotten, and reciting a list out loud feels like complaining.

**The insight:** the need wasn't task *management* — it was task *celebration and communication*. A "done" list, not a to-do list.

---

## Process: brainstorming with AI

The project began as a conversation with Claude about a feeling, not a feature: the overwhelm of doing dozens of unseen jobs a day, and wanting a way to log them *simply* — no set-up, no accounts, nothing to install.

The collaboration worked as a dialogue. The initial idea was an automated hourly email; talking it through surfaced the constraints honestly (a chat assistant can't run on a schedule), and we weighed three options — a simple in-page tool, a full automation via Make.com/Google Sheets, or a hybrid. Choosing the simplest one was a deliberate scoping decision: ship the core loop first, automate later if it earns it.

I set the problem, the emotional framing, the option choices, and the real-world testing; Claude acted as sounding board and pair-programmer. When real use surfaced a data-loss bug, I reported it from lived experience and we redesigned the persistence model together. Working this way compressed idea-to-real-family-use into a single morning.

---

## The user

The primary user is a busy parent — often a mum working from home or between roles — who:

- does dozens of small jobs a day across housework, childcare, pets, and admin
- wants family to *see* that work, without it feeling like score-keeping
- has near-zero patience for friction: no sign-ups, no apps to install, no learning curve
- lives in WhatsApp and email already

Design principle that followed: **the app must be faster than a notebook.** If logging a job takes more than a few seconds, it won't happen between actual jobs.

---

## Design decisions

### Tone: celebration, not surveillance

Every detail pushes towards warmth. Completed jobs get a green tick in a soft circle; the counter says *"12 jobs done — nice work"*; the empty state reassures that *"even 'walked the dog' counts."* The pre-filled email opens with *"Thought you might like to see what my day looked like!"* — framing the share as an invitation, not an invoice.

### Frictionless capture

One text box, always at the top. Type, press Enter, it's logged with a timestamp. No categories, no priorities, no due dates — those concepts belong to to-do apps and would slow capture down.

### Share through trusted channels

Rather than building accounts or sending email server-side, the app uses a `mailto:` link (opens the user's own mail app, pre-filled) and a copy-to-clipboard button (formatted for pasting into WhatsApp). The user stays in control of who sees what, and there is nothing to set up and no privacy surface at all.

### Honest handling of persistence

The first version assumed a persistent storage API that wasn't available when the app was opened as a plain browser file — and a user lost a list. The fix was twofold:

1. **Graceful degradation** — the app detects whether storage exists and adapts silently instead of showing error toasts.
2. **A safety net** — if there are unsent jobs, the browser warns before the tab closes.

This turned a failure into the app's most considered feature: it never pretends data is safer than it is.

---

## Validation

The app went into genuine daily use immediately. Lists were shared to the family WhatsApp group and drew warm reactions (the first message received a ❤️ within minutes). Twenty jobs were logged before midday on day one — covering laundry, cleaning, pet care, a job application, and coursework — exactly the invisible-work mix the app was designed to surface.

Early real-world use also surfaced an unplanned behaviour worth noting: the user naturally settled into a *send-then-clear* rhythm, sharing several small batches a day rather than one big evening list. The design supports both without forcing either.

---

## Outcomes & learnings

- **Real problem, real user, real reactions** — the strongest validation a side project can have.
- **Failures are design material.** The storage issue produced the app's clearest design thinking (degrade gracefully, warn honestly).
- **Constraints sharpen products.** A single HTML file with no dependencies forced focus on the core loop: log → see → share.
- **Emotional framing is a feature.** The difference between this and a chore app is almost entirely tone — and tone is a design decision.
- **AI collaboration works best with a clear owner.** Bringing a well-defined problem, making the scoping calls, and testing in the real world kept the human firmly in the driving seat — the AI accelerated the build, it didn't direct it.

---

## What's next

- Optional `localStorage` persistence so plain-browser use survives a closed tab
- Style themes
- A weekly summary view ("your week in jobs")
- PWA support so it can live on a phone home screen like a native app

---

*Jobs Done is open source under the MIT licence.*
