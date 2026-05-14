---
name: octra-contract-skill
description: Security-first skill for developing, auditing, and deploying AppliedML (AML) smart contracts on Octra Chain — language reference, security patterns, Groth16 BN254 ZK proof verification, and complete deployment workflow.
version: "1.0"
---

# Octra Smart Contract Development Skill

> Skill for developing, auditing, and deploying smart contracts on Octra Chain using AppliedML (AML).
> Security-first. Every contract must be reviewed for access control, reentrancy, and state integrity before deployment.

---

## 1. Language: AppliedML (AML)

AML is Octra's high-level smart contract language. It compiles to OCTB bytecode for the Octra VM.
**Visible lowering** — source maps directly to VM operations. Storage, dispatch, and events are all inspectable.

### Correct Contract Structure

```aml
import IOCS01 from "interfaces/IOCS01.aml"   // optional

contract MyContract implements IOCS01 {

  state {
    owner:   address
    paused:  bool
    counter: int
    data:    map[address]int
  }

  event Transfer(from: address, to: address, amount: int)

  constructor(admin: address) {
    assert_address(admin)
    self.owner = admin
    self.paused = false
    self.counter = 0
  }

  private fn only_owner() {
    require(caller == self.owner, "not owner")
  }

  view fn get_owner(): address { return self.owner }
  view fn is_paused(): bool    { return self.paused }

  fn pause(): bool {
    only_owner()
    self.paused = true
    return true
  }

  payable fn deposit(): int {
    require(!self.paused, "paused")
    require(value > 0, "must send OCT")
    self.data[caller] += value
    return self.data[caller]
  }

  nonreentrant fn withdraw(amt: int): bool {
    require(!self.paused, "paused")
    let bal = self.data[caller]
    require(bal >= amt, "insufficient")
    self.data[caller] = bal - amt   // state BEFORE transfer
    transfer(caller, amt)
    return true
  }
}
```

**CRITICAL**: Use `contract Name { }` — NOT `program Name { }` (compile error).

---

## 2. Types

### Primitive
```
int       — integer (arbitrary precision)
bool      — true / false
string    — UTF-8 string
address   — Octra address ("octXXX...")
bytes     — raw byte sequence
```

### Composite
```
map[K]V                    — key-value map (NOT iterable)
map[address]map[address]int — nested map (grants/allowances)
list[T]                    — ordered list
option[T]                  — optional value
struct { field: type }     — named fields
enum { Variant1, Variant2 } — variants
```

---

## 3. Function Types

```aml
view fn name(p: type): type { }      // read-only, no state change
fn name(p: type): type { }           // public state-changing
payable fn name(): type { }          // receives OCT via `value`
nonreentrant fn name(): type { }     // reentrancy guard (use for withdrawals)
private fn name() { }                // internal helper, not callable externally
```

---

## 4. Execution Context (Built-ins)

```aml
caller      // address that called this method (immediate caller)
origin      // address that initiated the transaction (original signer)
self_addr   // this contract's own address
value       // OCT attached to this call (raw units: 1 OCT = 1,000,000)
epoch       // current epoch number (~10s per epoch, ~8,640/day)
```

**`caller` vs `origin`**: For direct user calls they are the same. For contract-to-contract calls, `caller` is the calling contract, `origin` is the original user. Use `origin` for ownership checks when you want to prevent contract-mediated attacks.

---

## 5. Built-in Functions

```aml
assert_address(addr)      // revert if addr is not a valid Octra address
is_address(addr)          // returns bool — check without reverting
transfer(addr, amount)    // send OCT from contract to addr (raw units)
len(str)                  // string length
require(cond, "msg")      // revert with message if false
revert                    // unconditional rollback
revert "message"          // rollback with message
emit EventName(args)      // emit event
call(addr, method, params) // call another deployed contract
deploy(bytecode_b64)      // deploy a child contract
```

---

## 6. Events

```aml
// Declare inside contract body
event Transfer(from: address, to: address, amount: int)
event Paused(by: address)
event Deposit(who: address, amount: int)

// Emit inside function
emit Transfer(caller, to, amt)
emit Paused(caller)
```

Events are positional — order matters for off-chain parsing.
Always emit events AFTER state changes (not before).

---

## 7. Storage Model

State fields lower into string-addressed storage keys:

```
self.owner              → key: "owner"
self.balances[caller]   → key: "balances:" + caller_address
self.grants[a][b]       → key: "grants:" + a + ":" + b
self.data[42]           → key: "data:42"
```

**Reading non-existent key returns zero value:**
- `int` → `0`
- `string` → `""`
- `bool` → `false`
- `address` → `"0"` (NOT empty string)

**Maps are NOT iterable** — you cannot loop over all keys.

---

## 8. Interfaces

```aml
// interfaces/IOCS01.aml
interface IOCS01 {
  fn transfer(to: address, amount: int): bool
  fn grant(spender: address, amount: int): bool
  fn pull(from: address, to: address, amount: int): bool
  fn balance_of(addr: address): int
  fn allowance(owner: address, spender: address): int
  fn get_name(): string
  fn get_symbol(): string
  fn get_total_supply(): int
}

// main.aml
import IOCS01 from "interfaces/IOCS01.aml"
contract Token implements IOCS01 { ... }
```

---

## 9. Reference Contracts

### Vault (deposit/withdraw with reentrancy guard)
```aml
contract Vault {
  state {
    owner:    address
    deposits: map[address]int
    total:    int
  }

  event Deposit(who: address, amount: int)
  event Withdraw(who: address, amount: int)

  constructor() {
    self.owner = origin
    self.total = 0
  }

  payable fn deposit(): int {
    require(value > 0, "must send OCT")
    self.deposits[caller] += value
    self.total += value
    emit Deposit(caller, value)
    return self.deposits[caller]
  }

  nonreentrant fn withdraw(amt: int): bool {
    let bal = self.deposits[caller]
    require(bal >= amt, "insufficient deposit")
    self.deposits[caller] = bal - amt   // state BEFORE transfer
    self.total -= amt
    transfer(caller, amt)
    emit Withdraw(caller, amt)
    return true
  }

  view fn balance_of(addr: address): int { return self.deposits[addr] }
  view fn total_locked(): int            { return self.total }
}
```

### Escrow (three-party with arbiter)
```aml
contract Escrow {
  state {
    seller:   address
    buyer:    address
    arbiter:  address
    amount:   int
    funded:   bool
    released: bool
  }

  event Created(seller: address, buyer: address, arbiter: address)
  event Funded(amount: int)
  event Released(to: address, amount: int)
  event Refunded(to: address, amount: int)

  constructor(s: address, b: address, a: address) {
    assert_address(s)
    assert_address(b)
    assert_address(a)
    self.seller = s
    self.buyer = b
    self.arbiter = a
    self.amount = 0
    self.funded = false
    self.released = false
    emit Created(s, b, a)
  }

  payable fn fund(): bool {
    require(caller == self.buyer, "only buyer")
    require(!self.funded, "already funded")
    require(value > 0, "must send OCT")
    self.amount = value
    self.funded = true
    emit Funded(value)
    return true
  }

  fn release(): bool {
    require(caller == self.buyer || caller == self.arbiter, "not authorized")
    require(self.funded && !self.released, "invalid state")
    self.released = true
    transfer(self.seller, self.amount)
    emit Released(self.seller, self.amount)
    return true
  }

  fn refund(): bool {
    require(caller == self.seller || caller == self.arbiter, "not authorized")
    require(self.funded && !self.released, "invalid state")
    self.released = true
    transfer(self.buyer, self.amount)
    emit Refunded(self.buyer, self.amount)
    return true
  }

  view fn status(): string {
    return !self.funded ? "awaiting_funding" : self.released ? "completed" : "funded"
  }
}
```

### OCS-01 Token (fungible token standard)
```aml
import IOCS01 from "interfaces/IOCS01.aml"

contract Token implements IOCS01 {
  state {
    name:         string
    symbol:       string
    total_supply: int
    decimals:     int
    owner:        address
    balances:     map[address]int
    grants:       map[address]map[address]int
  }

  event Transfer(from: address, to: address, amount: int)
  event Grant(owner: address, spender: address, amount: int)

  constructor(n: string, s: string, supply: int, dec: int) {
    require(len(n) > 0, "name empty")
    self.name = n
    self.symbol = s
    self.total_supply = supply
    self.decimals = dec
    self.owner = origin
    self.balances[origin] = supply
    emit Transfer(origin, origin, supply)
  }

  view fn decimals(): int          { return self.decimals }
  view fn balance_of(addr: address): int { return self.balances[addr] }
  view fn allowance(owner: address, spender: address): int {
    return self.grants[owner][spender]
  }
  view fn get_name(): string       { return self.name }
  view fn get_symbol(): string     { return self.symbol }
  view fn get_total_supply(): int  { return self.total_supply }

  fn transfer(to: address, amt: int): bool {
    assert_address(to)
    let bal = self.balances[caller]
    require(bal >= amt, "insufficient balance")
    self.balances[caller] = bal - amt
    self.balances[to] = self.balances[to] + amt
    emit Transfer(caller, to, amt)
    return true
  }

  fn grant(spender: address, amt: int): bool {
    assert_address(spender)
    self.grants[caller][spender] = amt
    emit Grant(caller, spender, amt)
    return true
  }

  fn pull(from: address, to: address, amt: int): bool {
    assert_address(to)
    let allowed = self.grants[from][caller]
    require(allowed >= amt, "not allowed")
    let bal = self.balances[from]
    require(bal >= amt, "insufficient balance")
    self.balances[from] = bal - amt
    self.balances[to] = self.balances[to] + amt
    self.grants[from][caller] = allowed - amt
    emit Transfer(from, to, amt)
    return true
  }
}
```

### Multisig (threshold voting)
```aml
contract Multisig {
  const MAX_OWNERS: int = 5
  state {
    owners:      list[address]
    threshold:   int
    next_id:     int
    proposals:   map[int]string
    prop_amounts: map[int]int
    prop_targets: map[int]address
    votes:       map[int]map[address]bool
    vote_counts: map[int]int
    executed:    map[int]bool
  }

  event Proposed(id: int, target: address, amount: int)
  event Voted(id: int, voter: address)
  event Executed(id: int)

  constructor(threshold_val: int) {
    require(threshold_val > 0, "threshold must be > 0")
    self.threshold = threshold_val
    self.next_id = 0
    self.owners.push(origin)
  }

  fn propose(target: address, amount: int, desc: string): int {
    assert_address(target)
    let id = self.next_id
    self.proposals[id] = desc
    self.prop_amounts[id] = amount
    self.prop_targets[id] = target
    self.vote_counts[id] = 0
    self.executed[id] = false
    self.next_id = id + 1
    emit Proposed(id, target, amount)
    return id
  }

  fn vote(id: int): bool {
    require(!self.executed[id], "already executed")
    require(!self.votes[id][caller], "already voted")
    self.votes[id][caller] = true
    self.vote_counts[id] += 1
    emit Voted(id, caller)
    if self.vote_counts[id] >= self.threshold {
      self.executed[id] = true
      transfer(self.prop_targets[id], self.prop_amounts[id])
      emit Executed(id)
    }
    return true
  }

  view fn get_proposal(id: int): string { return self.proposals[id] }
}
```

---

## 10. Security Design — MANDATORY CHECKLIST

Every contract MUST be reviewed against this checklist before deployment.

### 10.1 Access Control

```aml
// ALWAYS use private fn for access checks
private fn only_owner() {
  require(caller == self.owner, "not owner")
}

private fn only_operator() {
  require(caller == self.operator, "not operator")
}

// Use origin for ownership when preventing contract-mediated attacks
private fn only_origin_owner() {
  require(origin == self.owner, "not origin owner")
}
```

**Rules:**
- Every admin function MUST have an access check
- Use `private fn` helpers — never repeat `require(caller == self.owner)` inline
- Distinguish `caller` (immediate) vs `origin` (original signer) for cross-contract scenarios
- Two-step ownership transfer: propose → accept (prevents locking out)

### 10.2 Reentrancy

```aml
// CORRECT: state change BEFORE external call
nonreentrant fn withdraw(amt: int): bool {
  let bal = self.deposits[caller]
  require(bal >= amt, "insufficient")
  self.deposits[caller] = bal - amt   // ← UPDATE STATE FIRST
  self.total -= amt
  transfer(caller, amt)               // ← THEN transfer
  emit Withdraw(caller, amt)
  return true
}

// WRONG: transfer before state update (reentrancy vulnerability)
fn withdraw_unsafe(amt: int): bool {
  require(self.deposits[caller] >= amt, "insufficient")
  transfer(caller, amt)               // ← DANGEROUS: state not updated yet
  self.deposits[caller] -= amt        // ← too late
  return true
}
```

**Rules:**
- Always use `nonreentrant fn` for any function that calls `transfer()`
- Follow Checks-Effects-Interactions: validate → update state → external call
- Never call `transfer()` before updating the sender's balance

### 10.3 Integer Arithmetic

```aml
// CORRECT: check before arithmetic
fn transfer(to: address, amt: int): bool {
  let bal = self.balances[caller]
  require(bal >= amt, "insufficient")   // ← check first
  self.balances[caller] = bal - amt     // ← safe subtraction
  self.balances[to] = self.balances[to] + amt
  return true
}

// Fee calculation — use basis points (avoid division precision loss)
let fee = value * fee_rate / 10000   // fee_rate: 100 = 1%, 50 = 0.5%
let net = value - fee
require(net > 0, "fee exceeds value")
```

**Rules:**
- Always check `bal >= amt` before subtraction
- Use basis points (10000 = 100%) for fee calculations
- Verify `net > 0` after fee deduction
- AML integers are arbitrary precision — no overflow, but underflow is possible

### 10.4 Address Validation

```aml
// ALWAYS validate addresses before storing or transferring
constructor(admin: address, operator: address) {
  assert_address(admin)      // revert if invalid
  assert_address(operator)
  self.owner = admin
  self.operator = operator
}

fn set_operator(new_op: address): bool {
  only_owner()
  assert_address(new_op)     // validate before storing
  self.operator = new_op
  return true
}

fn transfer(to: address, amt: int): bool {
  assert_address(to)         // validate recipient
  ...
}
```

**Rules:**
- Use `assert_address()` on ALL address parameters before use
- Never store an unvalidated address
- Never `transfer()` to an unvalidated address

### 10.5 Pause Mechanism

```aml
state {
  owner:  address
  paused: bool
}

private fn only_owner() {
  require(caller == self.owner, "not owner")
}

private fn not_paused() {
  require(!self.paused, "contract paused")
}

fn pause(): bool {
  only_owner()
  self.paused = true
  emit Paused(caller)
  return true
}

fn unpause(): bool {
  only_owner()
  self.paused = false
  emit Unpaused(caller)
  return true
}

// Apply to all state-changing user functions
fn deposit(): bool {
  not_paused()
  ...
}
```

**Rules:**
- Every production contract MUST have a pause mechanism
- Pause should block all user-facing state-changing functions
- Only owner (or guardian) can pause/unpause
- Emit events on pause/unpause for off-chain monitoring

### 10.6 Daily Limits (for bridge/vault contracts)

```aml
state {
  daily_limit:  int
  last_day:     int
  used_today:   int
}

private fn check_daily_limit(amount: int) {
  let current_day = epoch / 8640
  if current_day > self.last_day {
    self.used_today = 0
    self.last_day = current_day
  }
  require(self.used_today + amount <= self.daily_limit, "daily limit exceeded")
  self.used_today += amount
}
```

### 10.7 Replay Protection

```aml
// For operations that must only execute once
state {
  processed: map[string]bool
}

fn process(id: string): bool {
  require(!self.processed[id], "already processed")
  self.processed[id] = true
  ...
}
```

### 10.8 Two-Step Ownership Transfer

```aml
state {
  owner:          address
  pending_owner:  address
}

fn propose_ownership(new_owner: address): bool {
  only_owner()
  assert_address(new_owner)
  self.pending_owner = new_owner
  return true
}

fn accept_ownership(): bool {
  require(caller == self.pending_owner, "not pending owner")
  self.owner = self.pending_owner
  self.pending_owner = ""
  emit OwnershipTransferred(self.owner, caller)
  return true
}
```

---

## 11. Common Patterns

### Fee Collection
```aml
state {
  fee_rate:       int    // basis points (100 = 1%)
  fees_collected: int
}

fn process_payment(): bool {
  require(value > 0, "no value")
  let fee = value * self.fee_rate / 10000
  let net = value - fee
  require(net > 0, "fee exceeds value")
  self.fees_collected += fee
  // process net amount
  return true
}

fn withdraw_fees(to: address): bool {
  only_owner()
  assert_address(to)
  require(self.fees_collected > 0, "no fees")
  let amount = self.fees_collected
  self.fees_collected = 0
  transfer(to, amount)
  emit FeeWithdrawn(to, amount)
  return true
}
```

### Nonce-based Record Keeping
```aml
state {
  nonce:   int
  records: map[int]string
  amounts: map[int]int
  senders: map[int]address
}

fn create_record(data: string): int {
  self.nonce += 1
  self.records[self.nonce] = data
  self.amounts[self.nonce] = value
  self.senders[self.nonce] = caller
  return self.nonce
}
```

### Epoch-based Time Logic
```aml
// ~8,640 epochs per day at 10s/epoch
let current_day = epoch / 8640
let deadline = self.created_epoch + self.timeout_epochs
require(epoch <= deadline, "expired")
```

---

## 12. Compilation & Deployment

### Compile via RPC
```bash
# Single file
POST /rpc
{
  "jsonrpc": "2.0", "id": 1,
  "method": "octra_compileAml",
  "params": ["<aml_source_string>"]
}

# Multi-file (token with interface)
{
  "method": "octra_compileAmlMulti",
  "params": [
    { "main.aml": "...", "interfaces/IOCS01.aml": "..." },
    "main.aml"
  ]
}
```

### Compile Response
```json
{
  "bytecode":          "base64...",
  "size":              1234,
  "instruction_count": 606,
  "abi":               [{ "name": "transfer", "view": false }],
  "version":           "1.0 Rehovot",
  "disassembly":       "..."
}
```

### Preview Address Before Deploy
```bash
# MUST include the nonce the deploy tx will use — otherwise the node predicts
# a different address and the deploy is rejected with `contract_address_mismatch`.
# See section 15.2 for the full recipe.
{ "method": "octra_computeContractAddress",
  "params": ["<bytecode_b64>", "<deployer_addr>", <next_nonce>] }
```

### Deploy Transaction
```json
{
  "op_type":   "deploy",
  "message":   "[\"param1\", \"param2\"]",
  "ou":        "10000",
  "amount":    "0"
}
```
Constructor params go in `message` as JSON array (positional order).

### Call Transaction
```json
{
  "op_type":        "call",
  "encrypted_data": "method_name",
  "message":        "[\"param1\", \"param2\"]",
  "amount":         "1000000",
  "ou":             "1000"
}
```

### Read-only Call (no tx, no fee)
```bash
{ "method": "contract_call", "params": ["octCONTRACT...", "balance_of", ["octUSER..."], "octCALLER..."] }
```

### Inspect After Deploy
```bash
{ "method": "vm_contract",           "params": ["octCONTRACT..."] }
{ "method": "octra_contractAbi",     "params": ["octCONTRACT..."] }
{ "method": "octra_contractStorage", "params": ["octCONTRACT...", "key_name"] }
{ "method": "contract_receipt",      "params": ["tx_hash"] }
{ "method": "contract_verify",       "params": ["octCONTRACT...", "source..."] }
{ "method": "contract_source",       "params": ["octCONTRACT..."] }
```

---

## 13. Key Limits & Constants

```
Epoch duration:     ~10 seconds
Epochs per day:     ~8,640
OCT decimals:       6  (1 OCT = 1,000,000 raw units)
Recommended fee:    1,000 OU for contract calls
Deploy fee:         ~10,000 OU
```

---

## 14. What AML CAN and CANNOT Do

### CAN ✅
- Receive OCT via `value` (payable fn)
- Store arbitrary state in maps
- Emit events (off-chain indexing)
- Access epoch for time-based logic
- FHE/encrypted computation primitives
- Multi-file projects with interfaces
- Revert with full state rollback
- Private helper functions
- Cross-contract calls via `call()` — **including `call()` from inside a `view fn`** (since the 2026-05 node fix). Composable DeFi programs are now practical: routers, oracles, verifier orchestrators, multi-contract vaults.
- Native Groth16 BN254 proof verification via `groth16_verify_bn254(vk, proof, inputs)`
- Deploy child contracts via `deploy()`
- Send OCT via `transfer()`
- Address validation via `is_address()` / `assert_address()`

### CANNOT ❌
- Loop over map keys (maps are NOT iterable)
- Async operations
- External HTTP calls
- Access Ethereum chain data directly

---

## 15. Common Mistakes to Avoid

| Mistake | Correct |
|---|---|
| `program Name { }` | `contract Name { }` |
| `fn init(): bool { }` | `constructor(params) { }` |
| Transfer before state update | Update state FIRST, then `transfer()` |
| No `assert_address()` on params | Always validate address params |
| No pause mechanism | Add `paused: bool` + `not_paused()` check |
| Inline `require(caller == self.owner)` everywhere | Use `private fn only_owner()` |
| `require(addr != "", "invalid")` | Use `assert_address(addr)` |
| Storing unvalidated address | `assert_address()` before storing |
| Fee calculation with integer division first | Multiply before divide: `value * rate / 10000` |
| No replay protection for one-time ops | Use `map[string]bool` processed tracking |
| `encrypted_data` contains params | `encrypted_data` = method name only; params go in `message` |
| Using `cipher` / `pubkey` / `caller` / `origin` / `value` / `self` / `self_addr` as parameter names | Rename (e.g. `cipher_val`, `public_key`, `sender_addr`). These are reserved context / wire tokens and collide with the grammar. |
| Submitting a deploy tx without the pending nonce | `octra_computeContractAddress(bytecode, deployer, next_nonce)`; see section 15.1 |
| Treating `octra_transaction(hash).status = "confirmed"` as success | Reverted calls still confirm. Always read `contract_receipt(hash).success` for contract call outcomes. See section 16.1. |

### 15.1 Reserved Parameter Names (compiler gotcha)

AML's parser reserves several identifiers that also appear in the contract
execution context. Using them as parameter names produces a confusing
`expected identifier` compile error at the function header line (not at the
parameter itself, which makes bisecting painful):

```
cipher       → reserved (wire type token)
pubkey       → reserved
caller       → reserved (context builtin)
origin       → reserved (context builtin)
value        → reserved (context builtin, attached OCT)
self         → reserved (state reference)
self_addr    → reserved (context builtin)
```

Safe renames:

```aml
// WRONG — fails to compile
payable fn register(commitment: string, owner_tag: string, cipher: string, years: int): bool { ... }

// RIGHT
payable fn register(commitment: string, owner_tag: string, cipher_val: string, years: int): bool { ... }
```

When you see `line N: expected identifier` and line N is a function header,
scan the parameter list for reserved words first.

### 15.2 Deterministic Contract Address — Always Pass the Nonce

`octra_computeContractAddress` is deterministic on `(bytecode, deployer, nonce)`.
If you call it with only two arguments the node assumes `nonce = 0` (or its
current notion of the deployer's nonce), which will **not** match the nonce
your deploy tx actually uses unless it happens to be the first tx. The tx
will confirm as `rejected` with `contract_address_mismatch`.

```js
// WRONG — predicts a wrong address on any non-first deploy
const addr = await rpc('octra_computeContractAddress', [bytecode, deployer])

// RIGHT — compute next nonce from account, use it both for the prediction
// and for the deploy tx body
const acct = await rpc('octra_balance', [deployer])
const nonce = Number(acct.pending_nonce ?? acct.nonce ?? 0) + 1
const { address } = await rpc('octra_computeContractAddress', [bytecode, deployer, nonce])
// ... build tx with the same `nonce`, `to_ = address`
```

---

## 16. Security Review Checklist (run before every deploy)

```
□ Every admin function has access control (only_owner / only_operator)
□ All address parameters validated with assert_address()
□ All withdrawal functions use nonreentrant fn
□ State updated BEFORE transfer() in all withdrawal paths
□ Integer subtraction always guarded by require(bal >= amt)
□ Fee calculation: multiply before divide, verify net > 0
□ Pause mechanism present and applied to all user functions
□ Events emitted for all state-changing operations
□ No unvalidated addresses stored in state
□ Replay protection for any one-time operations
□ Ownership transfer is two-step (propose + accept) for production
□ Daily limits for high-value operations (bridge/vault)
□ Constructor validates all address params
□ All view functions are marked view fn
□ Contract compiled and ABI inspected before deploy
□ Source verified on-chain after deploy
```

### 16.1 Testing Contract Calls — Receipt-Based Revert Detection

> Critical for any test harness or dApp that submits write calls.

`octra_transaction(hash)` reports the tx-level status: `confirmed`,
`rejected`, `pending`, `dropped`. **A reverting contract call still reports
`confirmed`.** The revert lives one level down in the execution receipt.

This matters because:

- Polling only `octra_transaction` makes your tests silently accept reverts
  as success.
- Your dApp's UX will claim "success" while the state mutation never
  happened.
- During audits, "we have test coverage" is worthless if rejection cases
  always pass.

Always pair the tx-level wait with a receipt check:

```js
async function waitForContractCall(hash) {
  // Step 1 — wait for tx-level commitment
  for (let i = 0; i < 60; i++) {
    const info = await rpc('octra_transaction', [hash])
    if (info.status === 'rejected') throw new Error(`rejected: ${JSON.stringify(info.error)}`)
    if (info.status === 'confirmed' || info.epoch_id || info.epoch) break
    await new Promise(r => setTimeout(r, 2500))
  }

  // Step 2 — inspect the contract receipt for success / revert
  try {
    const receipt = await rpc('contract_receipt', [hash])
    if (receipt.success === false) {
      const detail = typeof receipt.error === 'string' ? receipt.error : JSON.stringify(receipt.error)
      throw new Error(`revert: ${detail}`)
    }
    return receipt
  } catch (err) {
    // Some nodes briefly 404 on a fresh receipt — treat as soft success
    if (/not found/i.test(String(err.message))) return null
    throw err
  }
}
```

Receipt shape:

```json
{
  "contract": "oct...",
  "method":   "transfer",
  "success":  true,
  "effort":   624,
  "events":   [{ "event": "Transfer", "values": [...] }],
  "error":    null,
  "epoch":    648594
}
```

Test-harness pattern for "should revert" assertions:

```js
async function expectRevert(label, fn) {
  try {
    await fn()
    console.log(`${label}: FAIL — no revert`)
  } catch (_err) {
    console.log(`${label}: pass (reverted)`)
  }
}

await expectRevert('register on paused contract', () =>
  sendContractCallAndWait('register', [...params])
)
```

Without this, your rejection tests will claim to pass because the underlying
submission succeeded at the tx level while the contract silently reverted
and rolled back all state.

---

## 17. Groth16 BN254 Zero-Knowledge Proof Verification (NATIVE)

> Source: Live mainnet contract `oct3rzJZucw9BsS7LRWBNoKRoaBsXAhhSK4LmfRvg45ppSs`
> Confirmed from `contract_source` RPC on mainnet.

AML natively supports **Groth16 zkSNARK verification over BN254** (alt_bn128) via a single built-in:

```aml
groth16_verify_bn254(vk: bytes, proof: bytes, inputs: bytes): bool
```

This is the same curve used by Ethereum's `ecPairing` precompile — meaning proofs generated with **snarkjs + circom** work directly on Octra.

---

### 17.1 Reference Contract (from mainnet)

```aml
// Deployed: oct3rzJZucw9BsS7LRWBNoKRoaBsXAhhSK4LmfRvg45ppSs
// Source verified on-chain via contract_source RPC

contract ZkVerifier {
  state {
    vk:     bytes
    owner:  address
    paused: bool
  }

  event VKUpdated(by: address)
  event Paused(by: address)
  event Unpaused(by: address)

  constructor(vk_bytes: bytes) {
    self.vk = vk_bytes
    self.owner = origin
    self.paused = false
  }

  // Verify a Groth16 proof against stored VK
  // proof:  serialized Groth16 proof bytes
  // inputs: serialized public inputs bytes
  view fn verify(proof: bytes, inputs: bytes): bool {
    if (self.paused) {
      return false
    }
    return groth16_verify_bn254(self.vk, proof, inputs)
  }

  view fn get_vk(): bytes    { return self.vk }
  view fn is_paused(): bool  { return self.paused }
  view fn get_owner(): address { return self.owner }

  fn pause(): bool {
    require(caller == self.owner, "not owner")
    self.paused = true
    emit Paused(caller)
    return true
  }

  fn unpause(): bool {
    require(caller == self.owner, "not owner")
    self.paused = false
    emit Unpaused(caller)
    return true
  }

  fn update_vk(new_vk: bytes): bool {
    require(caller == self.owner, "not owner")
    self.vk = new_vk
    emit VKUpdated(caller)
    return true
  }
}
```

---

### 17.2 Verification Key (VK) Binary Format

The VK is stored as `bytes` in the contract state. Format confirmed against the
Elixir reference encoder at `github.com/lambda0xE/octra-groth16-bn254` and by
decoding the live mainnet VK (586 bytes total):

```
Offset  Size    Field
──────────────────────────────────────────────────────
0-5     6       Magic header: "OG16V1"  (ASCII)
6-9     4       nPublic:   uint32 big-endian  (= # public inputs)
                           NOTE: the IC array has nPublic + 1 entries
10-73   64      alpha_g1:  G1 point uncompressed (2 × 32 bytes)
74-201  128     beta_g2:   G2 point uncompressed (4 × 32 bytes)
202-329 128     gamma_g2:  G2 point uncompressed (4 × 32 bytes)
330-457 128     delta_g2:  G2 point uncompressed (4 × 32 bytes)
458+    64×n    ic[]:      (nPublic + 1) G1 points uncompressed
──────────────────────────────────────────────────────
Total = 6 + 4 + 64 + 128 + 128 + 128 + ((nPublic + 1) × 64)

Example: nPublic = 1  →  IC has 2 points  →  586 bytes total
```

**G1 point** = 64 bytes = x (32 bytes BE) + y (32 bytes BE)
**G2 point** = 128 bytes = x_c0 (32) + x_c1 (32) + y_c0 (32) + y_c1 (32)

Validation enforced by the native verifier (and by the reference encoder):

- Magic must be exactly `OG16V1` (ASCII, 6 bytes).
- `nPublic` must be in `[0, 1024]`.
- Every field element must be in `[0, bn254_p)` — values `≥ p` are rejected.
- Points at infinity are **not allowed** for alpha / beta / gamma / delta / IC.
- The snarkjs JSON usually includes a trailing `z` coordinate. In affine form
  both `vk_alpha_1.z` and IC entries have `z = 1`; for G2 points the flag is
  `[1, 0]`. The encoder rejects anything else so you catch out-of-affine-form
  outputs immediately.

---

### 17.3 Proof Binary Format

The `proof` bytes passed to `verify()`:

```
Offset  Size    Field
──────────────────────────────────────────────────────
0-5     6       Magic header: "OG16P1"  (ASCII)
6-69    64      pi_a:  G1 point (A)
70-197  128     pi_b:  G2 point (B)
198-261 64      pi_c:  G1 point (C)
──────────────────────────────────────────────────────
Total = 6 + 64 + 128 + 64 = 262 bytes
```

Earlier drafts of this doc omitted the `OG16P1` header and quoted 256 bytes;
the correct wire size is **262 bytes with the magic**. The native verifier
rejects proofs without the header.

---

### 17.4 Public Inputs Format

The `inputs` bytes are the serialized public signals:

```
Each public input = 32 bytes (big-endian field element, BN254 scalar field)
Total = num_public_inputs × 32 bytes
```

---

### 17.5 Generating VK and Proof with snarkjs

```bash
# 1. Write circuit in Circom
# example: circuit.circom
# pragma circom 2.0.0;
# template Example() {
#   signal input secret;
#   signal input hash;
#   signal output valid;
#   valid <== secret * secret - hash;
# }
# component main {public [hash]} = Example();

# 2. Compile circuit
circom circuit.circom --r1cs --wasm --sym

# 3. Powers of Tau ceremony (or use existing)
snarkjs powersoftau new bn128 12 pot12_0000.ptau
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau

# 4. Circuit-specific setup
snarkjs groth16 setup circuit.r1cs pot12_final.ptau circuit_0000.zkey
snarkjs zkey contribute circuit_0000.zkey circuit_final.zkey

# 5. Export verification key (JSON)
snarkjs zkey export verificationkey circuit_final.zkey verification_key.json

# 6. Generate proof
snarkjs groth16 prove circuit_final.zkey witness.wtns proof.json public.json

# 7. Verify locally
snarkjs groth16 verify verification_key.json public.json proof.json
```

---

### 17.6 Converting snarkjs VK → Octra bytes format

```javascript
// Convert snarkjs verification_key.json → OG16V1 bytes for Octra.
// Cross-checked against lambda0xE/octra-groth16-bn254 (Elixir reference).

const fs = require('fs')

const BN254_P = 0x30644E72E131A029B85045B68181585D97816A916871CA8D3C208C16D87CFD47n

function feToBytes(value, modulus) {
  const n = BigInt(value)
  if (n < 0n || n >= modulus) throw new Error(`field element out of range: ${n}`)
  const hex = n.toString(16).padStart(64, '0')
  return Buffer.from(hex, 'hex')
}

function g1ToBytes(point) {
  // snarkjs G1 = [x, y] or [x, y, z]. Reject points at infinity and non-affine
  // representations — the native verifier only accepts z = 1.
  const [x, y, z = '1'] = point
  if (String(z) !== '1') throw new Error('G1.z must be 1 (affine form)')
  if (String(x) === '0' && String(y) === '0') throw new Error('G1 point at infinity rejected')
  return Buffer.concat([feToBytes(x, BN254_P), feToBytes(y, BN254_P)])
}

function g2ToBytes(point) {
  // snarkjs G2 = [[x_c0, x_c1], [y_c0, y_c1], [1, 0]] — affine form.
  // Wire order is c0 || c1 for both x and y. DO NOT swap — the ordering in this
  // encoder matches the Elixir reference exactly; the naming in older drafts
  // of this skill was misleading.
  const [x, y, z = ['1', '0']] = point
  if (String(z[0]) !== '1' || String(z[1]) !== '0') throw new Error('G2.z must be [1, 0]')
  if (x.every(v => String(v) === '0') && y.every(v => String(v) === '0')) {
    throw new Error('G2 point at infinity rejected')
  }
  return Buffer.concat([
    feToBytes(x[0], BN254_P),
    feToBytes(x[1], BN254_P),
    feToBytes(y[0], BN254_P),
    feToBytes(y[1], BN254_P),
  ])
}

function vkToOctraBytes(vk) {
  if (vk.curve && vk.curve !== 'bn128') throw new Error(`curve must be bn128, got ${vk.curve}`)
  if (vk.protocol && vk.protocol !== 'groth16') throw new Error(`protocol must be groth16, got ${vk.protocol}`)

  const nPublic = Number(vk.nPublic)
  if (!Number.isInteger(nPublic) || nPublic < 0 || nPublic > 1024) {
    throw new Error(`nPublic out of range: ${vk.nPublic}`)
  }
  if (vk.IC.length !== nPublic + 1) {
    throw new Error(`IC must have nPublic + 1 entries (got ${vk.IC.length}, expected ${nPublic + 1})`)
  }

  const magic    = Buffer.from('OG16V1', 'ascii')                    //  6 bytes
  const nPubBuf  = Buffer.alloc(4); nPubBuf.writeUInt32BE(nPublic, 0) // 4 bytes
  const alpha    = g1ToBytes(vk.vk_alpha_1)                          // 64 bytes
  const beta     = g2ToBytes(vk.vk_beta_2)                           // 128 bytes
  const gamma    = g2ToBytes(vk.vk_gamma_2)                          // 128 bytes
  const delta    = g2ToBytes(vk.vk_delta_2)                          // 128 bytes
  const ic       = Buffer.concat(vk.IC.map(g1ToBytes))               // 64 × (nPublic + 1)

  return Buffer.concat([magic, nPubBuf, alpha, beta, gamma, delta, ic])
}

// Usage
const vk = JSON.parse(fs.readFileSync('verification_key.json'))
const vkBytes = vkToOctraBytes(vk)
console.log('VK base64 :', vkBytes.toString('base64'))
console.log('VK length :', vkBytes.length) // 586 for nPublic = 1
// Pass the base64 string as the constructor argument when deploying ZkVerifier.
```

---

### 17.7 Converting snarkjs proof → Octra bytes format

```javascript
const BN254_R = 0x30644E72E131A029B85045B68181585D2833E84879B9709143E1F593F0000001n

function proofToOctraBytes(proof) {
  if (proof.protocol && proof.protocol !== 'groth16') {
    throw new Error(`protocol must be groth16, got ${proof.protocol}`)
  }
  const magic = Buffer.from('OG16P1', 'ascii')  //   6 bytes
  const a = g1ToBytes(proof.pi_a)               //  64 bytes
  const b = g2ToBytes(proof.pi_b)               // 128 bytes
  const c = g1ToBytes(proof.pi_c)               //  64 bytes
  return Buffer.concat([magic, a, b, c])        // 262 bytes total
}

function inputsToOctraBytes(publicSignals) {
  // public.json is an array of decimal strings in the BN254 *scalar* field.
  return Buffer.concat(publicSignals.map((s) => feToBytes(s, BN254_R)))
}

// Usage
const proof         = JSON.parse(fs.readFileSync('proof.json'))
const publicSignals = JSON.parse(fs.readFileSync('public.json'))

const proofB64  = proofToOctraBytes(proof).toString('base64')
const inputsB64 = inputsToOctraBytes(publicSignals).toString('base64')

// Call contract via contract_call (view, no tx, no fee):
//   contract_call(ZK_VERIFIER, "verify", [proofB64, inputsB64], caller)
```

---

### 17.7.1 Elixir Reference Toolkit

If you prefer Elixir or want a second reference implementation to sanity-check
your encoder, the canonical bindings are:

```
github.com/lambda0xE/octra-groth16-bn254   (reference program on mainnet: oct3rzJZucw9BsS7LRWBNoKRoaBsXAhhSK4LmfRvg45ppSs)
```

The workflow mirrors the JS version 1:1:

```
mix deps.get
mix run -e 'Groth16.run()'        # runs the bundled circuit/ fixture against the reference contract

# With your own snarkjs output:
Groth16.run(
  contract:    "oct...",
  caller:      "oct...",
  circuit_dir: "path/to/circuit"   # must contain verification_key.json + proof.json + public.json
)
```

Key invariants both encoders agree on:

```
BN254 base field    p = 0x30644E72…CFD47   (field elements in VK + proof body)
BN254 scalar field  r = 0x30644E72…000001   (public inputs in public.json)
nPublic ∈ [0, 1024]
VK magic   OG16V1   + uint32 BE nPublic
Proof magic OG16P1  + pi_a (G1) ‖ pi_b (G2) ‖ pi_c (G1)
All points must be affine (z = 1 for G1, z = [1, 0] for G2), no points at infinity
```

If your own encoder disagrees on any of these, the native verifier will
reject — the earlier draft of this skill called the length field `num_ic` and
omitted the `OG16P1` proof header. Both are fixed above; update any code you
generated before this entry.

---

### 17.8 ZK-Enabled Contract Patterns

#### Pattern 1: ZK-Gated Action (prove knowledge without revealing)

```aml
contract ZkGated {
  state {
    verifier:  address   // ZkVerifier contract address
    used_nullifiers: map[string]bool
  }

  event ActionExecuted(nullifier: string)

  constructor(verifier_addr: address) {
    assert_address(verifier_addr)
    self.verifier = verifier_addr
  }

  // Execute action only if ZK proof is valid
  // nullifier prevents replay (same proof used twice)
  fn execute_with_proof(proof: bytes, inputs: bytes, nullifier: string): bool {
    require(!self.used_nullifiers[nullifier], "proof already used")

    // Call ZkVerifier contract to verify proof
    let valid = call(self.verifier, "verify", [proof, inputs])
    require(valid, "invalid proof")

    self.used_nullifiers[nullifier] = true
    emit ActionExecuted(nullifier)
    return true
  }
}
```

#### Pattern 2: Private Name Registration (ONS use case)

```aml
// User proves they know a secret that hashes to a commitment
// without revealing the secret or their identity
contract PrivateONS {
  state {
    owner:       address
    verifier:    address
    // name_commitment → registered (bool)
    commitments: map[string]bool
    // commitment → expiry epoch
    expiry:      map[string]int
    // nullifier → used (replay protection)
    nullifiers:  map[string]bool
  }

  event NameCommitted(commitment: string, expiry: int)

  constructor(verifier_addr: address) {
    assert_address(verifier_addr)
    self.owner = origin
    self.verifier = verifier_addr
  }

  // Register a name commitment with ZK proof
  // proof: proves knowledge of (name, secret) such that H(name, secret) = commitment
  // inputs: [commitment_field_element]
  // nullifier: H(secret) — prevents double registration
  payable fn register_private(
    proof:      bytes,
    inputs:     bytes,
    commitment: string,
    nullifier:  string,
    years:      int
  ): bool {
    require(value > 0, "must pay")
    require(!self.commitments[commitment], "already registered")
    require(!self.nullifiers[nullifier], "nullifier used")

    // Verify ZK proof on-chain
    let valid = call(self.verifier, "verify", [proof, inputs])
    require(valid, "invalid proof")

    self.commitments[commitment] = true
    self.nullifiers[nullifier] = true
    self.expiry[commitment] = epoch + (3153600 * years)

    emit NameCommitted(commitment, self.expiry[commitment])
    return true
  }

  // Reveal name (prove you own the commitment)
  fn reveal_name(
    name:       string,
    proof:      bytes,
    inputs:     bytes,
    commitment: string
  ): bool {
    require(self.commitments[commitment], "commitment not found")
    require(epoch <= self.expiry[commitment], "expired")

    // Proof: H(name, secret) = commitment
    let valid = call(self.verifier, "verify", [proof, inputs])
    require(valid, "invalid reveal proof")

    return true
  }
}
```

#### Pattern 3: Standalone ZkVerifier (deploy once, reuse)

```aml
// Deploy this once per circuit, reuse across many contracts
contract ZkVerifier {
  state {
    vk:     bytes
    owner:  address
    paused: bool
  }

  constructor(vk_bytes: bytes) {
    self.vk = vk_bytes
    self.owner = origin
    self.paused = false
  }

  view fn verify(proof: bytes, inputs: bytes): bool {
    if (self.paused) { return false }
    return groth16_verify_bn254(self.vk, proof, inputs)
  }

  view fn get_vk(): bytes      { return self.vk }
  view fn is_paused(): bool    { return self.paused }
  view fn get_owner(): address { return self.owner }

  fn update_vk(new_vk: bytes): bool {
    require(caller == self.owner, "not owner")
    self.vk = new_vk
    return true
  }

  fn pause(): bool {
    require(caller == self.owner, "not owner")
    self.paused = true
    return true
  }

  fn unpause(): bool {
    require(caller == self.owner, "not owner")
    self.paused = false
    return true
  }
}
```

---

### 17.9 ZK Use Cases for ONS (Private Domain System)

| Feature | ZK Circuit | What's Proven |
|---|---|---|
| **Private registration** | H(name, salt) = commitment | Know name+salt without revealing name |
| **Anonymous ownership** | Merkle membership | Own a name in the registry without revealing which |
| **Private transfer** | Nullifier + new commitment | Transfer name without linking sender/receiver |
| **Age/KYC gate** | Credential check | Meet requirement without revealing identity |
| **Whitelist access** | Merkle proof | In whitelist without revealing who |
| **Commit-reveal** | Preimage knowledge | Committed to a value, now revealing it |

---

### 17.10 Deployment Workflow for ZK Contracts

```
1. Write Circom circuit
   ↓
2. snarkjs setup (Powers of Tau + circuit-specific)
   ↓
3. Export verification_key.json
   ↓
4. Convert VK → OG16V1 bytes (vkToOctraBytes)
   ↓
5. Deploy ZkVerifier contract with vk_bytes as constructor param
   ↓
6. Deploy your main contract with ZkVerifier address
   ↓
7. Client: generate proof with snarkjs groth16 prove
   ↓
8. Client: convert proof + public signals → bytes (proofToOctraBytes)
   ↓
9. Call contract method with proof bytes + inputs bytes
   ↓
10. Contract calls ZkVerifier.verify(proof, inputs) → bool
    ↓
11. If true → execute protected logic
```

---

### 17.11 Security Notes for ZK Contracts

```
□ Always use nullifiers to prevent proof replay attacks
□ Nullifier = H(secret) — unique per proof, stored in map[string]bool
□ VK is immutable after deploy (or use update_vk with timelock)
□ Verify the circuit's trusted setup (Powers of Tau ceremony)
□ Public inputs must match what the circuit expects — wrong inputs = false
□ groth16_verify_bn254 is a view fn — no state change, no fee for reads
□ For write operations: verify proof first, then update state
□ Never trust proof bytes from untrusted sources without on-chain verification
□ Circuit must constrain all inputs — unconstrained signals are a vulnerability
```


---

## 18. Execution Model — What Really Happens On Chain

This section is the audit-level addendum. Pair it with section 17 (Groth16 BN254) whenever you are reviewing privacy-sensitive code.

### 18.1 Storage is Observable

AML storage is not an abstract engine. It lowers into string-addressed keys that anyone with the contract address can read via `octra_contractStorage(addr, key)`.

```
self.owner              → "owner"
self.paused             → "paused"
self.balances[caller]   → "balances:" + caller_address
self.grants[a][b]       → "grants:" + a_addr + ":" + b_addr
self.items[42]          → "items:42"
```

This means:
- anyone can enumerate balance-of for a known address without calling a view function
- you cannot "hide" values by omitting a view method — use HFHE if the value must be private
- key naming is part of the contract's public API surface — do not rely on obscurity
- the explorer can visualize keys it recognizes

**Rule:** if a field must be confidential, store it as an HFHE ciphertext (`hfhe_v1|...`) and compute on it with the encrypted-value helpers exposed by the VM/PVAC runtime. Never store plaintext "secrets".

### 18.2 Gas and OU Economy

The node charges fees in OU. Cost per op type is driven by proof work and state writes:

```
standard transfer        ~10,000 ou baseline
contract call            ~1,000 ou baseline
encrypt                  ~10,000 ou (lighter proof path)
decrypt                  ~10,000 ou + encrypted-spend proof overhead
stealth send             heavier — two range proofs + zero proof + AES envelope
claim                    ~3,000 ou + claim zero proof
deploy                   ~50,000,000 ou (bytecode + ABI + constructor run)
key_switch               ~3,000 ou
```

Always fetch `octra_recommendedFee(op_type)` before submission. Users may override, but default to `recommended`. Contracts should NOT hardcode fee assumptions — they affect UX, not contract correctness (fees live on the transaction, not inside the call).

### 18.3 `value` Semantics

`value` inside AML is raw OU attached to the call:

```aml
payable fn deposit(): int {
  require(value > 0, "must send OCT")       // value is already in raw units (ou)
  self.balances[caller] += value            // store as raw
  return self.balances[caller]
}
```

Display-side code must convert `raw / 1_000_000` → OCT for the user.

### 18.4 `caller` vs `origin` — Exact Behavior

```
direct user call:          caller == origin == user_address
contract A calls contract B:
  inside A:  caller = user, origin = user
  inside B:  caller = A_address, origin = user
nested A → B → C:
  inside C:  caller = B_address, origin = user
```

Practical consequences:

```aml
// WRONG for admin checks that should be contract-proof
private fn only_owner() {
  require(caller == self.owner, "not owner")   // passes if a trusted contract calls on owner's behalf
}

// RIGHT when the admin action should only come from an actual user
private fn only_origin_owner() {
  require(origin == self.owner, "not origin owner")
}
```

Choose based on your threat model. Wrapping contracts, multisigs, and time-locks typically want `caller`-based checks (they call on behalf of users). Direct admin actions on vault-like contracts want `origin`-based checks.

### 18.5 Epoch-Based Time

```
epoch               current epoch number
epoch_duration      ~10 seconds
epochs_per_day      8,640
epochs_per_hour     360
epochs_per_week     60,480
epochs_per_year     ~3,153,600
```

Usage patterns:

```aml
// 7-day timeout
let deadline = self.created_epoch + (8640 * 7)
require(epoch <= deadline, "expired")

// daily rolling window
let day_id = epoch / 8640
if day_id > self.last_day {
  self.used_today = 0
  self.last_day = day_id
}
```

`epoch` is a monotonic non-resetting counter. Use division for window aggregation. Do not assume exact 10s — budget for ~10s ± 20%.

### 18.6 Cross-Contract `call()`

```aml
let ok = call(target_addr, "transfer", [to, amount])
```

- Arguments are passed positionally, as a JSON-array-shaped value.
- The return value is whatever the target `view` or `fn` returned.
- Reverts in the callee propagate up by default (the calling tx reverts too unless wrapped).
- Attached value goes with the normal `transfer()` primitive, not through `call()` parameters.

**Since the node RPC fix (2026-05):** cross-contract **view** calls work
end-to-end. The previous "`call(addr, method, args)` inside a `view fn`
returns a phantom revert" bug is fixed on the node side. This unlocks the
full suite of DeFi primitives — TWAP oracles reading other contracts, AMM
routers composing with registries, vault strategies querying price feeds,
ZK-verifier orchestrators calling `verify()` on sibling ZkVerifier
contracts from inside their own view methods. You can now build layered
programs, not just single-contract tx locks.

```aml
// Works — view-only composition across contracts
view fn effective_price(asset: address): int {
  let raw   = call(self.oracle, "spot", [asset])       // view on oracle
  let floor = call(self.guard,  "min_price", [asset])  // view on guard
  if raw > floor { return raw }
  return floor
}
```

Same rule still applies to writes: a `fn` calling another `fn` mutates
state in both contracts atomically. A revert anywhere unwinds everything.

**Security rule:** treat every cross-contract call as untrusted. Follow
Checks-Effects-Interactions even when the target is your own contract. Use
`nonreentrant fn` when value may flow outward. Cross-contract view calls
look cheap but still spend effort — budget for them in tight loops.

### 18.7 Child Deployment

```aml
let child_addr = deploy(bytecode_b64)
```

- `bytecode_b64` is a base64 string of compiled OCTB.
- Deployment runs the child's constructor.
- The deployer (your contract) becomes `origin` for the child's constructor unless the child itself calls something else.
- Deterministic: child address = f(deployer, deployer_nonce, bytecode). Use `octra_computeContractAddress` to preview off-chain before committing.

Use this for factory contracts (token factories, escrow factories, AMM pair creation).

### 18.8 Events — What the Node Actually Records

```aml
event Transfer(from: address, to: address, amount: int)

emit Transfer(caller, to, amt)
```

Node serializes each emit into the transaction's **receipt** with:
- event name
- positional arguments
- position in the call trace

Off-chain indexers consume receipts. Rules:
- event order matters; emit after the state change that caused it
- never emit inside a branch that may revert afterward — if the revert fires, emits are rolled back (safe default), but code review becomes harder
- argument names are not part of the wire format; only positions are
- do not include entire ciphertexts as event arguments unless absolutely required — events are part of the receipt payload and inflate storage

Good pattern:

```aml
// emit a compact reference, not the full ciphertext
emit PrivateTransfer(caller, to, commitment_hash)   // 32-byte ref
```

### 18.9 Return Values

Every `fn` and `view fn` returns a typed value, recorded in the receipt.

```aml
view fn balance_of(a: address): int { return self.balances[a] }

fn transfer(to: address, amt: int): bool {
  // ... state changes ...
  return true
}
```

Never mix side-effecting work into a `view fn` — the compiler prohibits state writes from view methods.

### 18.10 Dynamic Storage Keys — The CONCAT Pattern

When the source says `self.balances[addr]`, the compiler emits:

```asm
LDI   r5, "balances:"
CONCAT r5, r5, r_addr
SSTOREK r5, r_value          // for write
SLOADK  r_out, r5            // for read
```

Implication: **you can absolutely craft storage keys manually in OASM** (if you ever drop to assembly). AML hides this but does not prevent it. Maps are just structured key prefixes.

### 18.11 Revert Propagation

```aml
fn outer() {
  require(true, "ok")
  call(other_contract, "inner", [])     // if inner reverts, outer reverts too
  self.counter += 1                     // never executes if inner reverts
}
```

Catching reverts is **not** a language feature in AML today. If you need resilience against a callee's failure, isolate it by checking preconditions before the call.

### 18.12 Effort Metering

Each call has a bounded "effort" budget (what other chains call gas). Exceeding it reverts with an effort error.

Things that consume significant effort:
- storage writes (more than reads)
- string concatenation and hashing
- cross-contract calls (each call is a sub-budget)
- Groth16 verification (fixed cost per `groth16_verify_bn254`)

Reduce effort by:
- computing keys and strings off-chain when possible
- batching writes per call
- preferring view functions for heavy reads (no tx fee)
- short-circuiting with `require` early

---

## 19. Working With HFHE / PVAC Inside AML

This goes hand-in-hand with section 17 (Groth16). HFHE primitives give you encrypted arithmetic; Groth16 gives you verifiable proofs about circuits. Use them together for privacy-preserving contracts.

### 19.1 The Three Wire Prefixes

```
hfhe_v1|<base64>     HFHE ciphertext (from PVAC)
rp_v1|<base64>       range proof (aggregated or single)
zkzp_v2|<base64>     zero proof (amount or bound variant)
```

Any time a user-supplied value hits a contract method expecting a ciphertext, it **must** start with `hfhe_v1|`. Validate the prefix before trusting the payload:

```aml
fn submit_bid(enc_bid: string): bool {
  require(len(enc_bid) > 8, "bid too short")
  // Prefix check: "hfhe_v1|" is 8 bytes
  // (AML strings are UTF-8; substring ops are available via helpers)
  self.bids[caller] = enc_bid
  emit BidSubmitted(caller)
  return true
}
```

### 19.2 Canonical Private Auction Pattern

```aml
contract SealedBidAuction {
  state {
    owner:         address
    end_epoch:     int
    revealed:      bool
    winner:        address
    winning_bid:   int
    encrypted_bids: map[address]string    // hfhe_v1|... from bidder's wallet
    bid_nonces:    map[address]int
  }

  event BidSubmitted(bidder: address, epoch: int)
  event WinnerRevealed(winner: address, amount: int)

  constructor(duration_days: int) {
    self.owner = origin
    self.end_epoch = epoch + (8640 * duration_days)
    self.revealed = false
  }

  fn submit_bid(enc_bid: string): bool {
    require(epoch < self.end_epoch, "auction ended")
    require(len(enc_bid) > 8, "invalid cipher")
    self.encrypted_bids[caller] = enc_bid
    self.bid_nonces[caller] = epoch
    emit BidSubmitted(caller, epoch)
    return true
  }

  // After deadline: owner submits winner + ZK proof that
  //   (a) winner is in encrypted_bids
  //   (b) winner's bid >= every other bid
  //   (c) claimed amount matches winner's bid
  fn reveal_winner(
    winner_addr:  address,
    amount:       int,
    proof:        bytes,
    inputs:       bytes
  ): bool {
    require(caller == self.owner, "not owner")
    require(epoch >= self.end_epoch, "auction still live")
    require(!self.revealed, "already revealed")
    // Groth16 verification happens in a ZkVerifier contract (see section 17)
    // inputs encode: [winner_commit, amount_commit, all_bids_commit]
    let valid = call(self.verifier, "verify", [proof, inputs])
    require(valid, "invalid reveal")
    self.winner = winner_addr
    self.winning_bid = amount
    self.revealed = true
    emit WinnerRevealed(winner_addr, amount)
    return true
  }
}
```

### 19.3 Commit-Reveal Without ZK (cheaper)

If you only need sealed bids for a small number of participants, plain commit-reveal with `sha256` works:

```aml
state {
  commits:  map[address]string    // sha256(bid || salt)
  bids:     map[address]int
  salts:    map[address]string
}

fn commit(hash: string): bool {
  require(self.commits[caller] == "", "already committed")
  self.commits[caller] = hash
  return true
}

fn reveal(bid: int, salt: string): bool {
  // compute sha256(bid || salt) off-chain helper needed;
  // AML does not expose raw sha256 to plain fields
  // use the platform's native hash helper or a ZK verifier
  return true
}
```

Reveal must reject mismatched hashes — in practice, use Groth16 to avoid exposing hash code in the contract.

### 19.4 Using `groth16_verify_bn254` Directly

```aml
view fn check(proof: bytes, inputs: bytes): bool {
  return groth16_verify_bn254(self.vk, proof, inputs)
}
```

This is a native VM built-in. It costs a fixed effort slice (bounded by curve arithmetic). One call ~= one pairing check. It is **a view-side primitive** — safe to call from `view fn` and from `fn` alike.

Inputs:
- `vk` (bytes): serialized VK in `OG16V1` format (see section 17.2)
- `proof` (bytes): 262 bytes — `OG16P1 ‖ pi_a ‖ pi_b ‖ pi_c` (see section 17.3). The older "256 bytes" figure omitted the magic header.
- `inputs` (bytes): `num_public_inputs × 32` bytes BE, BN254 scalar field elements

Returns `true` iff the pairing equation holds.

### 19.5 Nullifier Rail (Mandatory for ZK Privacy)

Whenever you accept a proof, store a nullifier keyed to it:

```aml
state {
  used: map[string]bool
}

fn act(proof: bytes, inputs: bytes, nullifier: string): bool {
  require(!self.used[nullifier], "replay")
  let ok = call(self.verifier, "verify", [proof, inputs])
  require(ok, "invalid proof")
  self.used[nullifier] = true
  // ... effect ...
  return true
}
```

Nullifier is typically `H(secret)` baked into the circuit. Without a nullifier rail, any proof can be replayed.

---

## 20. Audit Heuristics — Quick Pattern Spotting

When reviewing a contract, walk through these heuristics in order:

```
□ Does the contract have explicit visibility on every method?
  (view vs fn vs payable vs nonreentrant vs private)

□ Is every payable fn inside a guard?
  not paused, not ended, not empty, not duplicate

□ Is every state-changing fn behind at least one require/assert?
  "functions that can be called with zero checks are suspicious"

□ Are admin paths guarded with only_owner (or only_origin_owner)?
  (separate function, not inline)

□ Are all address params validated with assert_address?

□ Is every `transfer(addr, amt)` preceded by a state update?
  the sender's balance MUST decrement before the outflow

□ Is every recursive-risk fn marked nonreentrant?

□ Is the pause bit checked in every user-facing write fn?
  not just the first one

□ For fee flows: value × rate / 10000, and net > 0 check?

□ For replay-protected flows: map[string]bool of processed IDs?

□ For ZK flows: nullifier map + verifier.verify() before effect?

□ For encrypted flows: hfhe_v1| prefix validated?
  ciphertext length sanity-checked?

□ For bridge flows: daily limit + rolling window + event?

□ For multisig: threshold > 0, owners list bounded, vote dedupe?

□ Does constructor set `owner = origin` (not `caller`)?
  deployment origin is the deployer wallet; using `caller` can be wrong
  if deployed via a factory

□ Is there an emergency pause with a sane unpause path?

□ Are events emitted AFTER state changes, not before?

□ Is the contract upgradable? If yes, who can upgrade, and with what delay?

□ Are there any unbounded loops? AML has no for-loop over maps,
  so rare — but watch list.push inside external calls

□ Are there hidden math precision losses?
  a / b followed by × c is lossy; reorder to × c / b
```

### Red Flags

- `transfer(addr, ...)` on a user-supplied address without `assert_address`
- `require(amount > 0)` missing on payable function
- Fee rate stored as percent (e.g., 5) instead of basis points (e.g., 500 for 5%)
- `self.X = caller` in constructor instead of `self.X = origin`
- State update after `transfer()` in a withdrawal path
- No pause mechanism on a production contract
- Accepting `proof: bytes` without a nullifier store
- Admin methods guarded only by a single shared `only_owner` that never actually reads from `self.owner`

---

## 21. Deploy Checklist (Production)

```
□ compile → inspect ABI → confirm method surface matches intent
□ compile → inspect disassembly → confirm storage keys + caller/origin usage
□ test on devnet with realistic parameters
□ verify security review against section 16 + section 20
□ compute contract address with octra_computeContractAddress + intended deployer
□ deploy with precise constructor params (JSON array, correct order)
□ record deployed address + deploy tx hash
□ octra_contractAbi should show the same methods as your local ABI
□ contract_saveAbi to register canonical ABI (optional but recommended)
□ contract_verify against source (and interface files for multi-file projects)
□ transfer admin ownership to a multisig (or time-locked wallet)
□ announce the address, ABI, verified source via your official channel
□ monitor: vm_contract(addr), contract_receipt for early calls
```

---

## 22. Quick Reference Card

```
Contract keyword:       contract (not program)
Constructor:            constructor(args) { ... }   (runs at deploy)
State:                  state { field: type, ... }
Types:                  int bool string address bytes, map/list/option/struct/enum
Visibility:             view fn, fn, payable fn, nonreentrant fn, private fn
Context:                caller, origin, self_addr, value, epoch
Transfer:               transfer(addr, raw_amount)
Cross-call:             call(addr, "method", [p1, p2, ...])
Child deploy:           deploy(bytecode_b64)
Assert:                 require(cond, "msg")   assert expr   revert "msg"
Event:                  event Name(args); emit Name(vals)
Address check:          assert_address(a) / is_address(a): bool
Length:                 len(s)
Hash helpers:           via ZkVerifier or off-chain (no raw sha256 surface in AML)
ZK verify:              groth16_verify_bn254(vk, proof, inputs): bool (NATIVE BN254)

On-chain write tx:      op_type="call", encrypted_data=method, message=JSON params
On-chain deploy tx:     op_type="deploy", encrypted_data=bytecode_b64, message=params, to_=computed_addr
On-chain read:          RPC contract_call(addr, method, params?, caller?)
                        → no tx, no fee, no state change

Denomination:           1 OCT = 1,000,000 OU (raw units). Amounts internally are raw.
Epoch:                  ~10s. Use epoch/8640 for day-rollover.
Storage keys:           "field", "map:" + key, "map:" + k1 + ":" + k2
Maps:                   not iterable, unset returns zero value
```
