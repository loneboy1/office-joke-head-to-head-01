// Office joke writer for "The Funniest Office Joke, Judged Head to Head"
// (make.fun). Writes one funny one-line joke about office life to
// $MAKEFUN_OUTPUT_DIR/entry.txt.
// Deterministic: no clock, no randomness, no network, no unordered iteration.
// Node 22, zero dependencies, erasable TypeScript only.
//
// The judge (a comedy club compere who has heard every office joke twice)
// weighs, most important first:
//   1. a real one-line joke about office life, a setup and a turn, with
//      the punchline last;
//   2. it turns on something anyone who has worked in an office knows;
//   3. it surprises, with a turn the reader does not see coming, rather
//      than stating a complaint plainly;
//   4. it lands in one line, every word earning its place;
//   5. it feels new rather than like a joke already going round the office.
// The scorer below mirrors that brief in the same order. Candidates are
// original lines written for this entry; the program scores every one and
// picks the winner by deterministic argmax: highest score, then shortest,
// then lexicographic. Flooded angles are avoided on purpose: no
// "this meeting could have been an email", no reply-all, no printer jam,
// no "got a minute", no Monday morning, no "per my last email" — the
// brief's own examples, which the field of 900+ entries is already
// saturated with.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------- candidates
// Every line is one joke about office life, under 200 characters, written
// for this entry. The strongest lines share one shape: a recognisable
// office truth stated flatly, then a turn in the final clause that lands
// somewhere the reader did not see coming. Rubric totals (originality /
// punch / tightness / relatability / freshness, each out of 5) were worked
// out by hand while drafting and are recorded in the comment above each
// line, so the scorer's weights can be checked against them.

const CANDIDATES: string[] = [
  // 5/5/5/5/5 = 25. The winner. Two voices, one contrast: the boss's
  // flattering phrase against payroll's flat truth. Setup, turn,
  // punchline last, 68 characters, nothing wasted.
  "My boss calls it 'wearing many hats'; payroll calls it 'one salary'.",
  // 4/5/4/4/4 = 21. The intern's innocent question exposes that nobody
  // in charge knows either; the promotion is the turn.
  "The intern asked what we do here and three managers gave four different answers, so we promoted the intern.",
  // 4/3/4/5/4 = 20. Open-plan collaboration, defeated by the stairwell.
  "Our open-plan office is so collaborative that I now do my best work in the stairwell.",
  // 4/4/4/4/4 = 20. A room named for innovation, betrayed by its markers.
  "The meeting room is called 'Innovation Lab', but the whiteboard markers have been dry since 2019.",
  // 4/3/4/4/4 = 19. The form for the form's sake; the single monitor is
  // the punchline.
  "I asked IT for a second monitor and got a form to fill out, which I filled out on my one monitor.",
  // 3/3/3/4/3 = 16. The auto-reply as the year's only honest writing.
  "My out-of-office reply says 'I'll respond when I return', which is the only honest thing I've written at work all year.",
  // 4/4/4/4/4 = 20. The Friday email that cancels the weekend it wishes.
  "The Friday 4:59 pm email is how my boss says 'have a great weekend, and also, don't'.",
  // 3/3/3/5/3 = 17. The catch-all clause, translated.
  "My job description says 'other duties as assigned', which is corporate for 'we'll figure it out later, and so will you'.",
  // 3/3/4/4/3 = 17. The labelled lunch, eaten by a grateful stranger.
  "I put my name on my lunch in the fridge, so now someone else eats it and leaves a thank-you note.",
  // 4/4/3/4/4 = 19. Transparency, locked in a drawer.
  "Our company's core value is 'transparency', which is why the salary bands are locked in a drawer labelled 'do not open'.",
  // 4/4/4/4/4 = 20. The corner office, technically.
  "I finally got the corner office — it's the corner of the open plan, next to the bathroom, but it's mine.",
  // 3/3/3/4/3 = 16. Burnout, treated with carbs and breathing.
  "HR's wellness programme is a meditation app and a pizza party, which is how they treat burnout: with carbs and breathing.",
  // 3/3/3/4/3 = 16. Two climates, zero in between, decided by vibes.
  "The thermostat has two settings: Arctic research station and sauna, and facilities switches it based on vibes.",
  // 4/4/3/4/4 = 19. Seventeen birthday wishes, one resignation.
  "The birthday card made it around the whole office and came back with seventeen 'Happy Birthday!!'s and one resignation letter.",
  // 3/4/3/3/3 = 16. Trust falls, from a company that sacked trust.
  "Our team-building exercise was trust falls, which is bold for a company that just laid off the entire trust department.",
  // 3/3/3/3/3 = 15. Permission that was never permission.
  "I told my boss I'd be five minutes late and he said 'take your time', which HR later clarified was not a policy.",
  // 3/3/2/4/3 = 15. The most secure system is the one nobody can find.
  "The Wi-Fi password is on a Post-it on the router, which is the most secure system in the building, because nobody can find the router.",
  // 3/3/4/5/3 = 18. Scheduling time to schedule meetings.
  "My calendar is so full of 'quick syncs' that I've started scheduling time to schedule meetings.",
  // 3/3/4/5/3 = 18. The quick question, itemised.
  "The 'quick question' took forty minutes, two whiteboards, and one person saying 'let's circle back'.",
  // 3/4/3/4/3 = 17. Unlimited time off, conditional on invisibility.
  "We call it unlimited PTO: you can take as much time off as you want, as long as nobody notices you took it.",
  // 4/4/5/3/4 = 20. The plant's death, processed properly.
  "The office plant died, so we held a retrospective and assigned it a Jira ticket.",
  // 3/4/2/4/3 = 16. A raise that pays in exposure.
  "I asked for a raise and my boss gave me more responsibility instead — turns out 'growth opportunity' is just a raise that pays in exposure.",
  // 4/4/4/4/4 = 20. Silence, officially measured as satisfaction.
  "The suggestion box has been empty for three years, which HR calls 'overwhelming satisfaction'.",
  // 3/3/4/5/3 = 18. Headphones as a meeting-prevention device.
  "I wear headphones so people think I'm on a call, which is the only meeting I ever enjoy.",
];

// The truth of the office: words that place a line inside office life.
const OFFICE_TRUTH: string[] = [
  "boss", "payroll", "salary", "intern", "manager", "office", "meeting",
  "calendar", "hr", "desk", "thermostat", "fridge", "lunch", "whiteboard",
  "email", "pto", "jira", "wi-fi", "headphones", "suggestion box",
  "monitor", "corporate", "trust falls",
];

// The turn: a sting that lands in the final 45 characters.
const TAIL_TURNS: string[] = [
  "one salary", "we promoted the intern", "in the stairwell",
  "dry since 2019", "on my one monitor", "and also, don't",
  "a thank-you note", "do not open", "but it's mine",
  "with carbs and breathing", "based on vibes", "resignation letter",
  "trust department", "was not a policy", "nobody can find the router",
  "to schedule meetings", "let's circle back", "nobody notices",
  "a jira ticket", "pays in exposure", "overwhelming satisfaction",
  "i ever enjoy",
];

// ------------------------------------------------------------------- scoring
// Rubric mirroring the judge's brief, most important first.

function recognitionScore(text: string): number {
  const lower = text.toLowerCase();
  const seen = new Set<string>();
  for (const w of OFFICE_TRUTH) {
    if (lower.includes(w)) seen.add(w);
  }
  return Math.min(seen.size, 3) * 4; // the truth of the office, with a wince
}

function turnScore(text: string): number {
  // A real turn or surprise at the end, where the line lands somewhere
  // the reader did not see coming. The turn must land late.
  const tail = text.toLowerCase().slice(-45);
  for (const t of TAIL_TURNS) {
    if (tail.includes(t)) return 12;
  }
  return 0;
}

function economyScore(text: string): number {
  const len = text.length;
  if (len >= 60 && len <= 110) return 8;
  if (len <= 150) return 4;
  return 0;
}

function freshnessScore(text: string): number {
  const lower = text.toLowerCase();
  let s = 0;
  // Flooded angles: the brief's own examples and the obvious lines.
  if (lower.includes("could have been an email")) s -= 12;
  if (lower.includes("reply-all") || lower.includes("reply all")) s -= 12;
  if (lower.includes("printer jam") || lower.includes("printer is jammed")) s -= 12;
  if (lower.includes("got a minute")) s -= 12;
  if (lower.includes("monday")) s -= 12;
  if (lower.includes("per my last email")) s -= 12;
  if (lower.includes("because")) s -= 2; // a joke that explains itself
  return s;
}

function score(text: string): number {
  return (
    recognitionScore(text) +
    turnScore(text) +
    economyScore(text) +
    freshnessScore(text)
  );
}

function isValid(text: string): boolean {
  if (text.length < 1 || text.length > 199) return false;
  if (text.trim() !== text || text.trim().length === 0) return false;
  if (!text.endsWith(".")) return false;
  if (/\s{2,}/.test(text)) return false;
  if (text.includes("\n")) return false;
  // On subject: a genuine one-line joke about office life.
  const lower = text.toLowerCase();
  if (!OFFICE_TRUTH.some((w) => lower.includes(w))) return false;
  return true;
}

// -------------------------------------------------------------- composition
interface Candidate {
  text: string;
  score: number;
}

function buildCandidates(): Candidate[] {
  const out: Candidate[] = [];
  for (const text of CANDIDATES) {
    if (!isValid(text)) continue;
    out.push({ text, score: score(text) });
  }
  return out;
}

function pickBest(candidates: Candidate[]): Candidate {
  // Deterministic argmax: higher score, then shorter, then lexicographic.
  const sorted = [...candidates].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.text.length !== b.text.length) return a.text.length - b.text.length;
    return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
  });
  return sorted[0];
}

// --------------------------------------------------------------------- main
function main(): void {
  const candidates = buildCandidates();
  if (candidates.length === 0) throw new Error("no valid office joke candidate");
  const best = pickBest(candidates);
  if (process.env.OFFICE_DEBUG) {
    const ranked = [...candidates].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.text.length !== b.text.length) return a.text.length - b.text.length;
      return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
    });
    for (const c of ranked.slice(0, 8)) {
      console.log(`[${c.score}] (${c.text.length}) ${c.text}`);
    }
  }
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "entry.txt"), best.text, "utf8");
  console.log(best.text);
  console.log(
    `chars: ${best.text.length} score: ${best.score} candidates: ${candidates.length}`,
  );
}

main();
