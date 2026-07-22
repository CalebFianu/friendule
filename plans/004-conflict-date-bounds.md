# Plan 004: Fix conflict detection to respect dateFrom/dateTo bounds on recurring rules

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**:
> `git diff --stat 3bc5ec2..HEAD -- src/hooks/useFriendule.js`
> If the file changed, compare the "Current state" excerpts against the live
> code before proceeding; on a mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug / correctness
- **Planned at**: commit `3bc5ec2`, 2026-07-21

## Why this matters

Recurring rules can have optional `dateFrom` / `dateTo` bounds (e.g. "busy on
Mondays in January", "free on Mondays in March"). These bounds mean the rule
only fires within a date window. However, `rulesOverlap()` — the function that
drives conflict detection — never reads these bounds. Two rules that share a
weekday but cover completely different months are incorrectly flagged as
conflicting. The `ConflictBanner` component shows a warning for rules that will
never actually co-occur on any calendar day.

## Current state

All code is in `src/hooks/useFriendule.js`.

```js
// src/hooks/useFriendule.js:15-23 — timesOverlap (unchanged by this plan)
function timesOverlap(a, b) {
  if (a.allDay || b.allDay) return true;
  const aStart = toMins(a.timeStart);
  const aEnd   = toMins(a.timeEnd);
  const bStart = toMins(b.timeStart);
  const bEnd   = toMins(b.timeEnd);
  if (aStart === null || aEnd === null || bStart === null || bEnd === null) return true;
  return aStart < bEnd && bStart < aEnd;
}

// src/hooks/useFriendule.js:25-41 — rulesOverlap (needs fix)
function rulesOverlap(a, b) {
  let sharesDay;
  if (a.recurrence === 'daily' || b.recurrence === 'daily') {
    sharesDay = true;
  } else if (a.recurrence === 'once' && b.recurrence === 'once') {
    sharesDay = a.date === b.date;
  } else if (a.recurrence === 'once' && b.recurrence === 'weekly') {
    sharesDay = b.weekdays?.includes(parseYmd(a.date).getDay());
  } else if (a.recurrence === 'weekly' && b.recurrence === 'once') {
    sharesDay = a.weekdays?.includes(parseYmd(b.date).getDay());
  } else if (a.recurrence === 'weekly' && b.recurrence === 'weekly') {
    sharesDay = a.weekdays?.some(wd => b.weekdays?.includes(wd));
  } else {
    sharesDay = false;
  }
  return sharesDay && timesOverlap(a, b);
}
```

`parseYmd` is imported from `'../utils/dateUtils'` (line 2) and returns a
`Date` object. `once` rules have a `rule.date` field (YYYY-MM-DD string).
Recurring rules have `rule.dateFrom` and `rule.dateTo`, both nullable
YYYY-MM-DD strings (null means unbounded).

**Rule schema for reference** (from `CLAUDE.md`):
- `recurrence`: `"once"` | `"weekly"` | `"daily"`
- `date`: YYYY-MM-DD, required for `"once"` rules only
- `dateFrom` / `dateTo`: YYYY-MM-DD or null, optional bounds for weekly/daily rules

## Commands you will need

| Purpose | Command         | Expected on success |
|---------|-----------------|---------------------|
| Lint    | `npm run lint`  | exit 0              |

No automated tests cover `rulesOverlap` directly; the done criteria include
manual verification cases below.

## Scope

**In scope** (the only file you should modify):
- `src/hooks/useFriendule.js` — replace `rulesOverlap` and add a new
  `dateRangesOverlap` helper immediately before it

**Out of scope** (do NOT touch):
- `timesOverlap` — correct, unchanged
- Any backend file — conflict detection is frontend-only
- Any component file

## Git workflow

- Branch: `advisor/004-conflict-date-bounds`
- Commit message style: match repo convention:
  `"fix conflict detection ignoring dateFrom/dateTo bounds on recurring rules"`
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Add `dateRangesOverlap` helper

Immediately **before** the existing `rulesOverlap` function (i.e., after line 23
where `timesOverlap` ends), insert the following new function:

```js
// Two date ranges [aFrom, aTo] and [bFrom, bTo] overlap when it is NOT the
// case that one ends before the other starts. null means unbounded.
function dateRangesOverlap(a, b) {
  const aFrom = a.dateFrom || null;
  const aTo   = a.dateTo   || null;
  const bFrom = b.dateFrom || null;
  const bTo   = b.dateTo   || null;
  // a ends before b starts
  if (aTo && bFrom && aTo < bFrom) return false;
  // b ends before a starts
  if (bTo && aFrom && bTo < aFrom) return false;
  return true;
}
```

The comparison `aTo < bFrom` works correctly for YYYY-MM-DD strings because
lexicographic order equals chronological order for ISO dates.

### Step 2: Replace `rulesOverlap`

Replace the existing `rulesOverlap` function (lines 25-41) with:

```js
function rulesOverlap(a, b) {
  let sharesDay;
  if (a.recurrence === 'daily' || b.recurrence === 'daily') {
    // daily rules fire every day — the only question is whether their active
    // date ranges overlap at all
    sharesDay = dateRangesOverlap(a, b);
  } else if (a.recurrence === 'once' && b.recurrence === 'once') {
    sharesDay = a.date === b.date;
  } else if (a.recurrence === 'once' && b.recurrence === 'weekly') {
    // The once rule fires on exactly a.date — check if that date falls within
    // the weekly rule's bounds and on a matching weekday
    if (b.dateFrom && a.date < b.dateFrom) return false;
    if (b.dateTo   && a.date > b.dateTo)   return false;
    sharesDay = b.weekdays?.includes(parseYmd(a.date).getDay());
  } else if (a.recurrence === 'weekly' && b.recurrence === 'once') {
    // Symmetric: the once rule fires on b.date
    if (a.dateFrom && b.date < a.dateFrom) return false;
    if (a.dateTo   && b.date > a.dateTo)   return false;
    sharesDay = a.weekdays?.includes(parseYmd(b.date).getDay());
  } else if (a.recurrence === 'weekly' && b.recurrence === 'weekly') {
    // Both recurring: ranges must overlap AND they must share a weekday
    if (!dateRangesOverlap(a, b)) return false;
    sharesDay = a.weekdays?.some(wd => b.weekdays?.includes(wd));
  } else {
    sharesDay = false;
  }
  return sharesDay && timesOverlap(a, b);
}
```

**Verify**: `grep -c 'dateRangesOverlap' src/hooks/useFriendule.js` → `4`
(the function definition + 3 call sites inside `rulesOverlap`).

### Step 3: Lint

```
npm run lint
```

Expected: exit 0, no errors.

## Test plan

No existing automated test covers `rulesOverlap`. After this plan lands, verify
the fix manually with the following cases in the running app (or by reading
the logic in the browser console):

**Case A — should NOT conflict (currently a false positive, fixed by this plan):**
- Rule 1: status `busy`, recurrence `weekly`, weekdays `[1]` (Monday), dateFrom `2026-01-01`, dateTo `2026-01-31`
- Rule 2: status `free`, recurrence `weekly`, weekdays `[1]` (Monday), dateFrom `2026-03-01`, dateTo `2026-03-31`
- Expected: `rulesOverlap(a, b)` returns `false`. No conflict banner.

**Case B — SHOULD conflict (must still be detected):**
- Rule 1: status `busy`, recurrence `weekly`, weekdays `[1]`, dateFrom `2026-01-01`, dateTo `2026-02-28`
- Rule 2: status `free`, recurrence `weekly`, weekdays `[1]`, dateFrom `2026-02-01`, dateTo `2026-03-31`
- Expected: ranges overlap (Feb 1–28), `rulesOverlap` returns `true`. Conflict banner shows.

**Case C — once vs weekly with disjoint bounds (should NOT conflict):**
- Rule 1: status `busy`, recurrence `once`, date `2026-01-05` (a Monday)
- Rule 2: status `free`, recurrence `weekly`, weekdays `[1]`, dateFrom `2026-02-01`, dateTo null
- Expected: `rulesOverlap` returns `false` (once rule's date is before the weekly rule's dateFrom).

**Case D — once vs weekly within bounds (SHOULD conflict):**
- Rule 1: status `busy`, recurrence `once`, date `2026-03-02` (a Monday)
- Rule 2: status `free`, recurrence `weekly`, weekdays `[1]`, dateFrom `2026-02-01`, dateTo null
- Expected: `rulesOverlap` returns `true`.

**Case E — unbounded rules (existing behaviour preserved):**
- Rule 1: status `busy`, recurrence `weekly`, weekdays `[1]`, dateFrom null, dateTo null
- Rule 2: status `free`, recurrence `weekly`, weekdays `[1]`, dateFrom null, dateTo null
- Expected: `rulesOverlap` returns `true` (unchanged from before).

## Done criteria

- [ ] `npm run lint` exits 0
- [ ] `grep -c 'dateRangesOverlap' src/hooks/useFriendule.js` outputs `4`
- [ ] Manual Case A: no conflict banner for rules with disjoint date ranges
- [ ] Manual Case B: conflict banner still appears for overlapping ranges
- [ ] Manual Case E: unbounded recurring rules still conflict as before
- [ ] Only `src/hooks/useFriendule.js` is modified (`git status`)
- [ ] `plans/README.md` status row updated to DONE

## STOP conditions

- The `rulesOverlap` function at lines 25-41 does not match the excerpt above
  (the codebase has drifted since this plan was written).
- `parseYmd` is not in scope in `useFriendule.js` at the point where
  `rulesOverlap` is defined (it should be — it's imported at line 2; if the
  import changed, stop and report).
- Any fix requires touching a file outside the in-scope list.

## Maintenance notes

- If a new recurrence type is added (e.g. `"monthly"`), both `rulesOverlap`
  and `dateRangesOverlap` must be updated. The `default: return false` branch
  is intentional — unknown recurrence types are treated as non-overlapping to
  fail safe.
- The same `rulesOverlap` function is used in two places: `friendConflicts`
  (the memoised conflict array shown in `ConflictBanner`) and `hasStatusConflict`
  (which guards rule creation). Both benefit from this fix automatically.
- `dateRangesOverlap` uses string comparison of YYYY-MM-DD dates, which is
  safe as long as dates stay in ISO 8601 format. The backend validates this
  format before persisting.
