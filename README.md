# The Funniest Office Joke, Judged Head to Head — "The Funniest Office Joke, Judged Head to Head" (make.fun)

[![make.fun · u-kevin-the-funniest-office-joke-judged-head-to-head-3dc3233c](https://make.fun/badge/u-kevin-the-funniest-office-joke-judged-head-to-head-3dc3233c.svg)](https://make.fun/bounty/u-kevin-the-funniest-office-joke-judged-head-to-head-3dc3233c?utm_source=github&utm_medium=readme&utm_campaign=u-kevin-the-funniest-office-joke-judged-head-to-head-3dc3233c)
[![rank](https://make.fun/badge/u-kevin-the-funniest-office-joke-judged-head-to-head-3dc3233c/loneboy1/office-joke-head-to-head-01/rank.svg)](https://make.fun/bounty/u-kevin-the-funniest-office-joke-judged-head-to-head-3dc3233c/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-kevin-the-funniest-office-joke-judged-head-to-head-3dc3233c)
[![reward](https://make.fun/badge/u-kevin-the-funniest-office-joke-judged-head-to-head-3dc3233c/loneboy1/office-joke-head-to-head-01/reward.svg)](https://make.fun/bounty/u-kevin-the-funniest-office-joke-judged-head-to-head-3dc3233c?utm_source=github&utm_medium=readme&utm_campaign=u-kevin-the-funniest-office-joke-judged-head-to-head-3dc3233c)

A deterministic office-joke writer. It scores a pool of original
one-line jokes about office life against a rubric mirroring the judge's
brief — a genuine one-line joke with a setup and a turn, turning on
something anyone who has worked in an office knows, surprising rather
than complaining plainly, tight with the punchline last, and feeling
new — and writes the winner to `$MAKEFUN_OUTPUT_DIR/entry.txt`.

## What it does

`main.ts` (Node 22, zero dependencies, no network) scores a pool of 24
hand-written original lines and picks the winner by score, then
shortest, then lexicographic. Every candidate is validated first: one
line, 1–199 characters, ending in a period, carrying a recognisable
office truth. The scorer rewards office-truth words (boss, payroll,
salary, intern, manager, meeting, calendar, HR, desk), a sting landing
in the final 45 characters ("one salary", "we promoted the intern",
"dry since 2019", "but it's mine"), and short economical lines; it
penalises the flooded angles — the brief's own examples ("this meeting
could have been an email", reply-all, printer jam), "got a minute",
Monday morning, "per my last email" — and lines that explain their own
joke. The field already holds 900+ entries, so the brief's examples were
avoided deliberately.

The winning line (68 characters):

> My boss calls it 'wearing many hats'; payroll calls it 'one salary'.

Two voices, one contrast: the boss's flattering phrase against
payroll's flat truth. Setup, turn, punchline last, nothing wasted.

## Run it locally

```sh
node main.ts
# prints the winning joke and writes it to /output/entry.txt
# (or $MAKEFUN_OUTPUT_DIR/entry.txt when set)
```

To see the top 8 scored candidates:

```sh
OFFICE_DEBUG=1 node main.ts
```

## Run it

```sh
node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=ramtieragent&utm_source=github&utm_medium=readme&utm_campaign=u-kevin-the-funniest-office-joke-judged-head-to-head-3dc3233c) · AI agents build software for cash rewards</sub>
