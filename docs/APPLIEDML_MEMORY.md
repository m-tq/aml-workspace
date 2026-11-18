# AppliedML Working Memory

Project-local knowledge base for AppliedML `Program` development in this
workspace. Keep it current when compiler behavior or network rules change.

Sources: Octra docs and `lite_node` commit `c49de45`
(devnet `octra-devnet-9871-cluster`).

## 1. Program model

- Unit is `Program Name { ... }` compiled to OCTB bytecode with persistent state.
- Older networks may still use `contract` syntax. Compile against the target
  network before deploying.
- State fields are declared under `state` and accessed as `self.field`.
- Maps use `map[K]V`; nested maps use `map[K1]map[K2]V`. Missing entries read as
  the type default; do not rely on absent-key errors.
- Entrypoints: `constructor`, `fn` (public), `view fn` (read-only),
  `private fn`, `payable fn`, `nonreentrant fn`.
- `caller` is the immediate caller. `origin` is initialized from `caller` in the
  current runtime, so never use `origin` to preserve the initial sender.
- `self_addr` is the current program address. `value` is attached native OCT.
- `epoch` is the execution epoch id. `epoch_time` is finalized consensus Unix
  milliseconds, subject to section 4.
- External `call(target, method, ...)` is rejected by the current network
  compiler (`Program effect policy: external XCALL ... has no checked ABI`).
  Design without cross-program calls.
- `deploy(bytecode)` exists for child programs; treat it as privileged and rare.

## 2. Type rules

- `address` and `string` are distinct. There is no implicit conversion.
- Convert with `to_string(address)` before writing an address into
  `map[...]string`, comparing it to a string, or concatenating it.
- Address-typed function parameters cannot index string-keyed maps directly.
  Either key the map by `address`, or convert the parameter once.
- Address-typed maps cannot store `""` or `"0"` sentinels. Use `self_addr` as an
  unreachable sentinel and a separate presence flag, or store addresses as
  strings and validate with `assert_address`.
- Old sources may compile under older rules but fail under current rules.
  Always recompile against the target network; never trust old build artifacts.
- `int` is arbitrary precision, but byte-work is charged by size. Bound
  user-supplied magnitudes to keep effort predictable.
- Use `safe_add` / `require(a >= b)` patterns for unsigned token amounts.

## 3. Language and runtime limits

- Program source limit: **65,536 bytes per file**. Multi-file total is 262,144
  bytes across 32 files. Exceeding it fails with `Program source too large`.
- Program instruction limit: 65,536. ABI function counts around 49 are normal.
- Compiler label space bug/limit: internal labels start at 10,000 while function
  labels are `200 + i*100`. Keep the number of functions below ~98. Crossing it
  produces `jump destination N is repeated`.
- View execution budget: 10,000,000 OU and 4 MiB byte work. Large snapshot pages
  are expensive because repeated `concat` copies are quadratic in payload size.
- View calls have a wall-clock cap and a single-flight lock; a busy node returns
  `Program view busy`. Clients need retry/backoff and bounded concurrency.
- `contract_call` is read-only. Use a signed program call transaction for any
  state change.
- Compiler mode and enabled features come from the connected node's active
  network rules at the current epoch.

## 4. Consensus timestamp semantics

- Finalized epoch timestamps are real Unix seconds, monotonic, and at least
  10,000 ms apart on the verified devnet. They may lag wall clock.
- Transaction execution receives `epoch_time` in **milliseconds** from the
  finalized epoch header. This is the authoritative clock for writes.
- Read-only RPC `contract_call` currently executes with `epoch_time = 0`. Do not
  require `epoch_time > 0` in views or all reads fail.
- Recommended pattern: use `epoch_time` when it is greater than zero; otherwise
  extrapolate from a consensus-calibrated anchor. Refresh the anchor on writes.
- Do not assume a hardcoded epoch cadence. Real epoch intervals vary.
- Expose clock provenance so clients can distinguish consensus time from
  extrapolated time.

## 5. Storage, events and indexing

- Each map entry is a separate storage key. Nested maps multiply keys.
- Swap-and-pop indexes are cheap for add/remove and bounded for pagination:
  `keys[i]`, `index[key] = i + 1`, `count`.
- Every mutating path must keep index, count, version and generation coherent.
  Increment a generation on ownership or registration change so stale dependent
  records cannot revive.
- Emit one canonical event per logical change. Events are the practical way to
  build an off-chain index.
- Version counters let clients cache records and reject stale pages.

## 6. Security checklist

- Checks-effects-interactions: clear escrow, listing and ownership state before
  any native transfer.
- Keep `nonreentrant` on every native-value exit.
- Always check the `transfer(...)` return value.
- Validate every dynamic storage key before reading or writing. Invalid keys
  must return typed empty values in views.
- Validate destinations with `assert_address`; reject `self_addr` where it would
  lock value or ownership.
- Keep admin powers bounded and observable: max values, two-step ownership and
  events for parameter changes.
- Never put secrets in client env vars or commit wallet material.

## 7. Toolchain workflow

```bash
npm run compile
npm run static-verify
npm run deploy
npm run save-abi
npm run verify
npm test
```

- Env resolution: `process.env` > `.env.<network>` > `.env`.
- `AML_CONTRACT` selects the source; `AML_CONTRACT_NAME` names the artifact
  directory under `build/`.
- Mainnet deploy requires `AML_CONFIRM_MAINNET=1`.
- Keep `build/` out of git; keep deployment receipts and verification output
  archived outside the repo or in ignored storage.
- Release gate: compile, static verify, read formal verification, deploy,
  `save-abi`, on-chain `verify`, then run tests.

## 8. Debugging rules

- `Program source too large` = byte size, not character count. Strip non-ASCII
  comments and keep each file under 65,536 bytes.
- `jump destination N is repeated` = too many functions or labels. Merge or
  remove views before adding features.
- `indexed assignment type differs expected = X actual = Y` = address/string
  mismatch or map value type mismatch. Fix the state type.
- `Program compiler busy` / `Program view busy` = retry with backoff; avoid
  unbounded parallel calls.
- If a view returns 1970-era timestamps, `epoch_time` is zero and the fallback
  anchor is uncalibrated.
