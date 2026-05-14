---
name: clean-code
description: Use when writing, fixing, editing, reviewing, refactoring, or debugging any TypeScript code. Single source of truth for the OctWa code-quality bar—covers the Boy Scout Rule, naming, functions, comments, general principles, and tests in one place (merge of boy-scout + clean-comments + clean-functions + clean-general + clean-names + clean-tests + typescript-clean-code).
when_to_use: |
  Trigger on any of:
  - Writing new TypeScript or React component code.
  - Editing or refactoring existing TypeScript / React code.
  - Reviewing PR-style changes or generated code.
  - Renaming variables, functions, classes, interfaces, or files (single-letter or cryptic identifiers, Hungarian notation `strName`/`arrUsers`/`nCount`, `I`-prefixed interfaces `IUserRepository`, names that hide side effects).
  - Comment hygiene (commented-out code, TODO/FIXME banners, author/ticket/date metadata, stale TSDoc, redundant comments restating the code).
  - Function signatures with 4+ parameters or props, boolean flag parameters, output-mutated arguments, dead helpers.
  - Duplicated logic (G5), magic numbers (G25), long if/else chains that should be polymorphism (G23), deep `a.b.c.d` chains (G36), one function juggling many responsibilities (G30), clever one-liners with hidden intent (G16).
  - Tests: slow or flaky tests, `test.skip`/`it.skip`/`.todo` without justification, `test.only` left in committed code, happy-path-only coverage, multi-concept assertions, missing boundary cases.
  - Phrases like "while you're at it", "any quick wins", "improve this a bit", "anything else obviously wrong", "rename this", "clearer name", "split this function", "is this still used", "coverage gap", "edge case", "is this comment useful", "why is this block commented".
---

# Clean Code (TypeScript)

Single, merged reference. Combines the Boy Scout Rule with Robert C. Martin's
complete Clean Code catalog (Chapter 17), adapted for TypeScript.

This is **the** code-quality skill. There are no sub-skills to load — every
rule is here.

---

## 1. Mindset — The Boy Scout Rule

> "Always leave the campground cleaner than you found it." — Baden-Powell
> "Always check a module in cleaner than when you checked it out." — R. C. Martin

You don't have to make every module perfect. You just have to make it **a
little bit better** than when you found it. Better compounds into excellent.

### Working on code

Every time you touch code, look for at least one small improvement.

**Quick wins (do these immediately):**
- Rename a poorly named variable → see §2 Names
- Delete a redundant comment → see §4 Comments
- Remove dead code or unused imports
- Replace a magic number with a named constant
- Extract a deeply nested block into a well-named function

**Deeper improvements (when time allows):**
- Split a function that does multiple things → see §3 Functions
- Remove duplication (DRY) → see §5 General
- Add missing boundary checks
- Improve test coverage → see §6 Tests

### Don't / Do

| ❌ Don't                                | ✅ Do                                  |
|-----------------------------------------|----------------------------------------|
| Leave code worse than you found it      | One small improvement per commit       |
| Say "that's not my code"                | Fix what you see, even if you didn't break it |
| Wait for a dedicated refactor sprint    | Keep changes proportional to the task  |
| Bundle unrelated rewrites with a fix    | Leave a trail of small, relevant wins  |

### Worked example

```ts
// Asked to fix a bug in this:
function proc(d: number[], x: number[], flag = false): number[] {
  // process data
  for (const i of d) {
    if (i > 0) {
      if (flag) {
        x.push(i * 1.0825); // tax
      } else {
        x.push(i);
      }
    }
  }
  return x;
}

// Don't just fix it. Leave it cleaner:
const TAX_RATE = 0.0825;

/** Filter positive values, optionally applying tax. */
function processPositiveValues(
  values: readonly number[],
  applyTax = false,
): number[] {
  const rate = applyTax ? 1 + TAX_RATE : 1;
  return values.filter((v) => v > 0).map((v) => v * rate);
}
```

What changed: descriptive name, clear params, explicit types, named
constant, no output-arg mutation, useful TSDoc.

---

## 2. Names (N1–N7)

### N1: Choose descriptive names

If a name needs a comment, it doesn't reveal intent.

```ts
// Bad
const d = 86400;
function proc(values: number[]) {
  return values.filter((v) => v > 0);
}

// Good
const SECONDS_PER_DAY = 86400;
function filterPositiveNumbers(numbers: number[]) {
  return numbers.filter((n) => n > 0);
}
```

### N2: Right level of abstraction

```ts
// Bad — leaks implementation
function getMapOfUserIdsToNames() {}

// Good — abstracts the data structure
function getUserDirectory() {}
```

### N3: Standard nomenclature

Use domain terms, design-pattern names, and well-known conventions.

```ts
class UserFactory { create(data: unknown) {} }
function calculateAmortization(principal: number, rate: number, term: number) {}
```

### N4: Unambiguous

```ts
// Bad
function rename(source: string, target: string) {}

// Good
function renameFile(oldPath: string, newPath: string) {}
```

### N5: Length matches scope

Short names are fine for tiny scopes. Longer scopes need longer names.

```ts
// Good — short for tiny scope
const total = numbers.reduce((sum, n) => sum + n, 0);

// Good — long for module-level constant
const MAX_RETRY_ATTEMPTS_BEFORE_FAILURE = 5;

// Bad — short at module scope
const MAX = 5;
```

### N6: No encodings

Modern editors make Hungarian notation and `I`-prefixes unnecessary.

```ts
// Bad
const strName = "Alice";
const arrUsers: string[] = [];
interface IUserRepository {}

// Good
const name = "Alice";
const users: string[] = [];
interface UserRepository {}
```

### N7: Names describe side effects

```ts
// Bad — name hides the write
function getConfig(path: string) {
  if (!store.has(path)) store.set(path, "{}"); // hidden side effect!
  return JSON.parse(store.get(path) ?? "{}");
}

// Good
function getOrCreateConfig(path: string) { /* ... */ }
```

---

## 3. Functions (F1–F4)

### F1: Maximum 3 arguments

More than 3 means the function is doing too much, or you need a parameter
object.

```ts
// Bad
function createUser(name: string, email: string, age: number,
                    country: string, timezone: string,
                    language: string, newsletter: boolean) {}

// Good
type UserData = {
  name: string;
  email: string;
  age: number;
  country: string;
  timezone: string;
  language: string;
  newsletter: boolean;
};
function createUser(data: UserData) {}
```

### F2: No output arguments

Don't mutate parameters. Return new values.

```ts
type Report = { content: string };

// Bad
function appendFooter(report: Report): void {
  report.content += "\n---\nGenerated by System";
}

// Good
function withFooter(report: Report): Report {
  return { ...report, content: `${report.content}\n---\nGenerated by System` };
}
```

### F3: No flag arguments

Boolean flags mean the function does ≥ 2 things.

```ts
// Bad
function render(isTest: boolean) {
  if (isTest) renderTestPage();
  else        renderProductionPage();
}

// Good — split it
function renderTestPage() {}
function renderProductionPage() {}
```

### F4: Delete dead functions

If it's not called, delete it. No "just in case." Git remembers.

---

## 4. Comments (C1–C5)

### C1: No inappropriate information

No author names, change history, ticket numbers, or dates. Use Git.

### C2: Delete obsolete comments

If a comment describes code that no longer exists or works differently, delete
it immediately.

### C3: No redundant comments

```ts
// Bad — code already says it
i += 1; // increment i
user.save(); // save the user

// Good — explains WHY
i += 1; // compensate for zero-indexing in display
```

### C4: Write comments well

Worth writing → worth writing well: chosen words, correct grammar, brief.

### C5: Never commit commented-out code

```ts
// DELETE THIS
// function oldCalculateTax(income: number): number {
//   return income * 0.15;
// }
```

Git remembers everything.

> The best comment is the code itself. If you need a comment to explain
> *what* the code does, refactor first.

---

## 5. General (G1–G36)

Full catalog. The high-impact rules have worked examples below; the rest are
one-line reminders.

| #   | Rule                                              |
|-----|---------------------------------------------------|
| G1  | One language per file                             |
| G2  | Implement expected behavior                       |
| G3  | Handle boundary conditions                        |
| G4  | Don't override safeties                           |
| G5  | DRY — no duplication                              |
| G6  | Consistent abstraction levels                     |
| G7  | Base classes don't know children                  |
| G8  | Minimize public interface                         |
| G9  | Delete dead code                                  |
| G10 | Variables near usage                              |
| G11 | Be consistent                                     |
| G12 | Remove clutter                                    |
| G13 | No artificial coupling                            |
| G14 | No feature envy                                   |
| G15 | No selector arguments                             |
| G16 | No obscured intent                                |
| G17 | Code where expected                               |
| G18 | Prefer instance methods                           |
| G19 | Use explanatory variables                         |
| G20 | Function names say what they do                   |
| G21 | Understand the algorithm                          |
| G22 | Make dependencies physical                        |
| G23 | Prefer polymorphism to if/else                    |
| G24 | Follow conventions (TypeScript style + ESLint/Prettier) |
| G25 | Named constants, not magic numbers                |
| G26 | Be precise                                        |
| G27 | Structure over convention                         |
| G28 | Encapsulate conditionals                          |
| G29 | Avoid negative conditionals                       |
| G30 | Functions do one thing                            |
| G31 | Make temporal coupling explicit                   |
| G32 | Don't be arbitrary                                |
| G33 | Encapsulate boundary conditions                   |
| G34 | One abstraction level per function                |
| G35 | Config at high levels                             |
| G36 | Law of Demeter (no train wrecks)                  |

### TypeScript-specific (TS1–TS3)

Adaptations of Martin's Java-specific J1–J3:

- **TS1** — explicit, stable imports. Avoid namespace-style overuse and
  implicit dependencies.
- **TS2** — use enums or literal union types, not magic constants.
- **TS3** — type public interfaces explicitly. Avoid `any` at boundaries;
  prefer `unknown` plus narrowing.

### High-impact examples

**G5 — DRY**

```ts
// Bad
const taxRate = 0.0825;
const caTotal = subtotal * 1.0825;
const nyTotal = subtotal * 1.07;

// Good
const TAX_RATES: Record<string, number> = { CA: 0.0825, NY: 0.07 };
function calculateTotal(subtotal: number, state: string): number {
  return subtotal * (1 + TAX_RATES[state]);
}
```

**G16 — No obscured intent**

```ts
// Bad
return ((x & 0x0f) << 4) | (y & 0x0f);

// Good
return packCoordinates(x, y);
```

**G23 — Polymorphism over if/else**

```ts
// Bad — the chain will grow forever
function calculatePay(employee: {
  type: "SALARIED" | "HOURLY" | "COMMISSIONED";
  salary?: number; hours?: number; rate?: number;
  base?: number;   commission?: number;
}): number {
  if (employee.type === "SALARIED")     return employee.salary ?? 0;
  if (employee.type === "HOURLY")       return (employee.hours ?? 0) * (employee.rate ?? 0);
  if (employee.type === "COMMISSIONED") return (employee.base ?? 0) + (employee.commission ?? 0);
  return 0;
}

// Good — open/closed
interface Employee { calculatePay(): number; }

class SalariedEmployee implements Employee {
  constructor(private readonly salary: number) {}
  calculatePay(): number { return this.salary; }
}

class HourlyEmployee implements Employee {
  constructor(private readonly hours: number, private readonly rate: number) {}
  calculatePay(): number { return this.hours * this.rate; }
}

class CommissionedEmployee implements Employee {
  constructor(private readonly base: number, private readonly commission: number) {}
  calculatePay(): number { return this.base + this.commission; }
}
```

**G25 — Named constants**

```ts
// Bad
if (elapsedTime > 86400) {}

// Good
const SECONDS_PER_DAY = 86400;
if (elapsedTime > SECONDS_PER_DAY) {}
```

**G30 — One thing**

If you can extract another function, your function does more than one thing.

**G36 — Law of Demeter (one dot)**

```ts
// Bad — train wreck
const outputDir = context.options.scratchDir.absolutePath;

// Good
const outputDir = context.getScratchDir();
```

---

## 6. Environment (E1–E2)

- **E1** — one command to build (`npm run build`).
- **E2** — one command to test (`npm test`).

---

## 7. Tests (T1–T9)

### T1: Test everything that could break

```ts
// Bad — happy path only
test("divide", () => {
  expect(divide(10, 2)).toBe(5);
});

// Good
test("divide normal", () => { expect(divide(10, 2)).toBe(5); });
test("divide by zero", () => { expect(() => divide(10, 0)).toThrow(RangeError); });
test("divide negative", () => { expect(divide(-10, 2)).toBe(-5); });
```

### T2: Use a coverage tool

```bash
vitest run --coverage
```

Aim for meaningful coverage, not 100%.

### T3: Don't skip trivial tests

Trivial tests document expected behavior and catch regressions.

```ts
test("user default role", () => {
  const user = new User("Alice");
  expect(user.role).toBe("member");
});
```

### T4: An ignored test is a question about an ambiguity

Either fix it or document the reason in the test name.

```ts
// Bad
test.skip("async operation", () => { /* flaky, fix later */ });

// Good
test.skip("cache invalidation - requires Redis (see CONTRIBUTING.md)", () => {});
```

### T5: Test boundary conditions

Bugs cluster at boundaries.

```ts
test("pagination boundaries", () => {
  const items = Array.from({ length: 100 }, (_, i) => i);

  expect(paginate(items, 1, 10)).toEqual(items.slice(0, 10));
  expect(paginate(items, 10, 10)).toEqual(items.slice(90, 100));
  expect(paginate(items, 11, 10)).toEqual([]);
  expect(() => paginate(items, 0, 10)).toThrow(RangeError);
  expect(paginate([], 1, 10)).toEqual([]);
});
```

### T6: Exhaustively test near bugs

Bugs cluster. Found one? Test all similar cases.

```ts
test("month boundaries", () => {
  expect(lastDayOfMonth(2024, 1)).toBe(31);
  expect(lastDayOfMonth(2024, 2)).toBe(29); // leap
  expect(lastDayOfMonth(2023, 2)).toBe(28); // non-leap
  expect(lastDayOfMonth(2024, 4)).toBe(30);
  expect(lastDayOfMonth(2024, 12)).toBe(31);
});
```

### T7: Patterns of failure are revealing

If all async tests fail intermittently, the problem isn't the tests — it's
the async handling.

### T8: Coverage patterns reveal design issues

If you can't easily test a function, it probably does too much. Refactor for
testability.

### T9: Tests must be fast (< 100 ms each)

Slow tests don't get run.

```ts
// Bad — real DB
test("user creation", async () => {
  const db = await connectToDatabase();
  const user = await db.createUser("Alice");
  expect(user.name).toBe("Alice");
});

// Good — in-memory
test("user creation", async () => {
  const db = new InMemoryDatabase();
  const user = await db.createUser("Alice");
  expect(user.name).toBe("Alice");
});
```

### F.I.R.S.T. Principles

- **Fast** — runs quickly
- **Independent** — no inter-test dependencies
- **Repeatable** — same result anywhere, every time
- **Self-Validating** — pass/fail, no manual inspection
- **Timely** — written before or with the code

### One concept per test

```ts
// Bad — multi-concept
test("user", () => {
  const user = new User("Alice", "alice@example.com");
  expect(user.name).toBe("Alice");
  expect(user.email).toBe("alice@example.com");
  expect(user.isValid()).toBe(true);
  user.activate();
  expect(user.isActive).toBe(true);
});

// Good — one concept each
test("user stores name", () => {
  const user = new User("Alice", "alice@example.com");
  expect(user.name).toBe("Alice");
});

test("user stores email", () => {
  const user = new User("Alice", "alice@example.com");
  expect(user.email).toBe("alice@example.com");
});

test("new user is valid", () => {
  const user = new User("Alice", "alice@example.com");
  expect(user.isValid()).toBe(true);
});

test("user can be activated", () => {
  const user = new User("Alice", "alice@example.com");
  user.activate();
  expect(user.isActive).toBe(true);
});
```

---

## 8. Anti-Patterns (Don't → Do)

| ❌ Don't                          | ✅ Do                                            |
|-----------------------------------|--------------------------------------------------|
| Comment every line                | Delete obvious comments                          |
| Helper for a one-liner            | Inline the code                                  |
| `import * as utils` everywhere    | Named imports for explicit dependencies          |
| `any` in public API               | Specific types, or `unknown` + narrowing         |
| Magic number `86400`              | `const SECONDS_PER_DAY = 86400`                  |
| `process(data, true)`             | `processVerbose(data)`                           |
| Deep nesting                      | Guard clauses, early returns                     |
| `obj.a.b.c.value`                 | `obj.getValue()`                                 |
| 100+ line function                | Split by responsibility                          |

---

## 9. Quick Reference

| Category   | Rule | One-liner                                      |
|------------|------|------------------------------------------------|
| Boy Scout  | —    | One small improvement per commit               |
| Names      | N1   | Descriptive (`SECONDS_PER_DAY` not `d`)        |
|            | N4   | Unambiguous (`renameFile`, not `rename`)       |
|            | N5   | Length matches scope                           |
|            | N6   | No encodings (no `arrUsers`, no `I`-prefix)    |
|            | N7   | Describe side effects (`getOrCreateConfig`)    |
| Functions  | F1   | Max 3 arguments                                |
|            | F2   | No output arguments                            |
|            | F3   | No flag arguments                              |
|            | F4   | Delete dead functions                          |
| Comments   | C1   | No metadata (use Git)                          |
|            | C3   | No redundant comments                          |
|            | C5   | No commented-out code                          |
| General    | G5   | DRY — no duplication                           |
|            | G9   | Delete dead code                               |
|            | G16  | No obscured intent                             |
|            | G23  | Polymorphism over if/else                      |
|            | G25  | Named constants, not magic numbers             |
|            | G30  | Functions do one thing                         |
|            | G36  | Law of Demeter (one dot)                       |
| Tests      | T5   | Test boundary conditions                       |
|            | T9   | Tests must be fast                             |

---

## 10. Behavior

When **fixing or editing** code:
1. Complete the requested task first.
2. Identify at least one Boy Scout cleanup opportunity (a violation in
   §2–§7) along the way.
3. Make the cleanup proportional — don't bundle unrelated rewrites.
4. Note the improvement (e.g. `Also: extracted magic number to
   SECONDS_PER_DAY (G25)`).

When **reviewing** code:
1. Walk through §2 → §7 in order. Flag violations by rule number
   (`G5 violation: duplicated tax-rate logic in 3 files`).
2. Suggest incremental improvements, not complete rewrites.
3. Prioritize the high-impact rules (G5, G16, G23, G25, G30, G36, F1, F3,
   N1, N7, T5).

The goal: every piece of code you touch gets a little better. Better
compounds into excellent.
