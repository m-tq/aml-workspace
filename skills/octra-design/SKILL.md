---
name: octra-design-skill
description: Use when building, reviewing, or refactoring any UI for Octra explorer, wallet, dashboard, bridge, or DeFi interfaces. Enforces the octrascan visual language — dense, exact, scanner-first design with semantic tokens, table-first data, and zero decoration.
when_to_use: |
  Trigger on: building any Octra UI component, refactoring existing app surfaces, adding DeFi widgets, creating explorer pages, styling wallet/bridge/dashboard screens, or when the user asks about octrascan design system, CSS tokens, component patterns, or UI consistency across octra.app.
---

# Octra Design Skill

> Design brief for generating, reviewing, or refactoring Octra explorer, wallet, dashboard, and DeFi interfaces in the octrascan visual language.
> Read this before editing any UI. Scanner-first. Dense. Exact. Zero decoration.

---

## 1. Design Thesis

The octrascan style is a **dense, task-first explorer interface** for blockchain data. It should feel like a precise network instrument: small type, exact labels, rule-based layout, muted blue-gray surfaces, table-first data, and visible status text.

**Target personality words:**
- dense · exact · quiet · technical · transparent · inspectable
- low decoration · high signal · scanner-like · terminal-adjacent · protocol-literate

**Avoid:**
- glossy · luxury · neon · bubbly · hero-heavy · illustration-led
- card-stacked marketing pages · vague DeFi copy · color-only status communication

---

## 2. CSS Token Contract

**All new UI MUST use these CSS variables.** Never hardcode colors, spacing, font stacks, or row heights in component CSS.

### Light Theme

```css
--oct-color-bg: #ffffff;
--oct-color-text: #000000;
--oct-color-surface: #e5e9ef;
--oct-color-surface-soft: #f6f7f9;
--oct-color-header: #d0d7e2;
--oct-color-border: #d0d7e2;
--oct-color-border-strong: #c0c6d0;
--oct-color-primary: #3b567f;
--oct-color-primary-soft: #516e9a;
--oct-color-muted: #8c9db6;
--oct-color-success: #15803d;
--oct-color-warning: #ca8a04;
--oct-color-warning-bg: #fffbeb;
--oct-color-danger: #dc2626;
--oct-color-danger-bg: #fef2f2;
--oct-color-code-bg: #172033;
--oct-color-code-text: #e5e9ef;
```

### Dark Theme

```css
--oct-color-bg: #111722;
--oct-color-text: #edf2f7;
--oct-color-surface: #1e293b;
--oct-color-surface-soft: #172033;
--oct-color-header: #263449;
--oct-color-border: #334155;
--oct-color-border-strong: #475569;
--oct-color-primary: #a9c4ee;
--oct-color-primary-soft: #6f8dbb;
--oct-color-muted: #94a3b8;
--oct-color-warning-bg: #302712;
--oct-color-danger-bg: #351a1a;
```

### Typography Tokens

```css
--oct-type-ui: Tahoma, Arial, sans-serif;
--oct-type-mono: "SF Mono", Consolas, Monaco, monospace;
--oct-type-size-01: 10px;   /* tags, metadata, token values */
--oct-type-size-02: 11px;   /* default body, tables, labels, nav, buttons */
--oct-type-size-03: 12px;   /* header title, key metric values */
--oct-type-size-04: 16px;   /* docs H1 only */
--oct-line-height: 150%;
--oct-letter-space: 1px;
```

### Spacing Tokens

```css
--oct-space-01: 2px;
--oct-space-02: 4px;
--oct-space-03: 6px;
--oct-space-04: 8px;
--oct-space-05: 10px;
--oct-space-06: 14px;
--oct-space-07: 18px;
--oct-space-08: 24px;
```

### Component Tokens

```css
--oct-radius-none: 0;
--oct-shadow-focus: 0 0 0 2px rgba(59, 86, 127, 0.24);
--oct-component-header-height: 38px;
--oct-component-sidebar-width: 220px;
--oct-component-table-row-height: 28px;
```

### Compact Density Overrides

```css
--oct-space-04: 6px;
--oct-space-05: 8px;
--oct-component-table-row-height: 24px;
```

---

## 3. Color Rules

| Token | Use for |
|---|---|
| `--oct-color-bg` | Pages and repeated cards |
| `--oct-color-surface` | Headers, search bands, metric rows, toolbar zones |
| `--oct-color-surface-soft` | Table headers, secondary panels |
| `--oct-color-header` | App bars, section bars |
| `--oct-color-primary` | Product title, links, key metric values, selected nav, primary actions |
| `--oct-color-muted` | Labels, helper text, subtitles, inactive controls |

**Support colors — use sparingly:**
- **Success**: verified, active, done, safe, encrypted-ready
- **Warning**: staging, relay, priority, vote-in-progress, non-final settlement
- **Danger**: rejected, invalid, destructive, liquidation risk, RPC failure

**CRITICAL**: Never communicate status with color alone. Every status must have visible text: `staging`, `rejected`, `confirmed`, `pending`, `safe`, `proof`, `relay`.

---

## 4. Typography Rules

- Base UI: `Tahoma, Arial, sans-serif`, 11px, line-height 150%, letter-spacing 1px
- **Use mono** (`SF Mono, Consolas, Monaco, monospace`) for: tx hashes, wallet addresses, epochs, amounts, prices, APY/APR, code, token names, protocol identifiers, route strings, build IDs

**Type scale:**
- 10px — tags, metadata, token values, source links
- 11px — default body, tables, labels, nav, buttons
- 12px — header title, key metric values, compact headings
- 16px — documentation H1 only (never in app panels)

Do not use oversized hero typography in app panels.

---

## 5. Layout Rules

- **Square edges, 1px borders, border-radius: 0** by default
- Use full-width section bands, not floating cards inside cards
- Divide sections with `.section-title` bars and 1px rules

**Desktop defaults:**
- Header height: 38px
- Sidebar width: 220px
- Table row height: 28px (compact: 24px)
- Section padding: 8px–14px
- Large preview padding: 24px

**Responsive breakpoints:**
- Below 1100px: grids move from 3–4 columns to 2 columns
- Below 760px: sidebar → horizontal nav, metrics wrap to 3 cols, tables scroll or convert to cards

---

## 6. Core Page Anatomy

```
1. Top header       — title, network/build subtitle, status chip, optional actions
2. Optional sidebar — docs/search/navigation
3. Main content     — full-width sections separated by 1px rules
4. Search/query bar — one global search or scoped filter
5. Metrics row      — dense stat boxes
6. Primary data     — tables first on desktop
7. Mobile fallback  — cards preserving same labels as table headers
8. Footer/status    — product/legal/build/network note
```

**Do not build a marketing hero as the first product screen.** For product tools, the first viewport must be usable.

---

## 7. Components Reference

### Header

```html
<header class="oct-header">
  <div class="oct-header__left">
    <a class="oct-header__title" href="#">octrascan (lite) | main net</a>
    <div class="oct-header__subtitle">build axFH017/2026</div>
  </div>
  <span class="status-chip status-chip--static">epoch 282,119</span>
</header>
```

Header title examples: `octrascan (lite) | main net` · `octra app | private defi` · `octra wallet | encrypted balance`
Subtitle examples: `build axFH017/2026` · `main net` · `devnet` · `proof queue online` · `wallet offline`

---

### Metrics Row

```html
<div class="metrics-row">
  <div class="metric"><span>epoch</span><strong>282,119</strong></div>
  <div class="metric"><span>transactions</span><strong>15,924,002</strong></div>
  <div class="metric"><span>staging</span><strong>18</strong></div>
</div>
```

Explorer metrics: epoch · transactions · supply · staging · mcap · price · total txs · total volume · total accounts · validators · peak tps

DeFi metrics: supply apy · borrow apy · utilization · tvl · 24h vol · apr · health · mark · claimable

---

### Buttons

```
.button           — secondary/navigation
.button--primary  — submit, load, preview, stake, connect, confirm
.button--quiet    — toolbar actions (update list)
.button--danger   — destructive/rejected flows
```

Button text: short, lowercase — `load more` · `back to scanner` · `update list` · `preview swap` · `stake` · `unstake` · `reject`

Disabled buttons must remain visible with muted text.

---

### Status Chips & Tags

**`.status-chip`** — persistent system/network state:
`connecting...` · `epoch 282,119` · `wallet offline` · `health 1.82` · `3 pending`

**`.tag` variants:**
- `.tag--op` — operation type: `transfer`
- `.tag--confirmed` — `confirmed` · `done` · `safe` · `active`
- `.tag--staging` — `staging` · `relay` · `normal` · `epoch vote`
- `.tag--rejected` — `rejected` · `invalid` · `failed`
- `.tag--ocs` — `ocs01` · `encrypted`
- `.tag--pending` — `pending` · `proof`

Tags are 10px, compact, textual, square. **No unlabeled dots.**

---

### Tables

```html
<table class="data-table">
  <thead>
    <tr><th>hash</th><th>epoch</th><th>time</th><th>from</th><th>to</th><th>amount</th></tr>
  </thead>
  <tbody>
    <tr class="row--staging">
      <td><a class="hash" href="#">8bb4f1...ad90</a></td>
      <td class="mono">282119</td>
      <td class="muted">14:08</td>
      <td class="mono">oct3z...p2</td>
      <td class="mono">oct7q...d1</td>
      <td><span class="tag tag--staging">normal</span></td>
    </tr>
  </tbody>
</table>
```

Table rules:
- `table-layout: fixed` for predictable truncation
- Headers: lowercase, muted/primary-soft, on soft surface
- Cells: ellipsis, no wrapping
- Mono for hashes, addresses, prices, amounts
- `.row--staging` / `.row--rejected` for state rows
- Hover: subtle surface-soft only

**Do not replace comparable blockchain/DeFi data with decorative cards on desktop.**

---

### Detail Table

```html
<table class="detail-table">
  <tbody>
    <tr><td>route</td><td class="mono">OCT -> pUSD</td></tr>
    <tr><td>fee</td><td class="mono">0.30%</td></tr>
    <tr><td>settlement</td><td><span class="tag tag--pending">staging</span></td></tr>
  </tbody>
</table>
```

First column: muted label, fixed ~150px. Second column: can wrap, use mono where appropriate.

---

### Search Fields

```
.search-bar    — full-width scanner query
.query-field   — compact filters in toolbars
```

Placeholder copy: `search by tx hash, address, or epoch id...` · `search transactions, addresses and blocks`

Use 1px strong border and primary focus ring. **Never remove focus indicators.**

---

### Loading / Empty / Alert / Toast

```
.loading-line   → "loading..."
.empty-line     → "no recent transactions"
.alert.alert--error → "rpc timeout - retrying in 4s"
.toast          → "copied token name"
```

Error messages must name the failed thing: `rpc timeout` · `proof missing` · `invalid epoch` · `wallet locked` · `insufficient balance` · `route unavailable`

---

### Mobile Cards

```html
<div class="card-list">
  <div class="tx-card">
    <div class="card-row"><span class="card-label">hash</span><span class="card-val mono">8bb4f1...ad90</span></div>
    <div class="card-row"><span class="card-label">epoch</span><span class="card-val mono">282119</span></div>
  </div>
</div>
```

Card labels must match desktop table headers exactly.

---

## 8. DeFi Interface Recipes

DeFi examples should look like protocol tools grafted onto octrascan, not generic web3 dashboards.

### Swap Ticket

```html
<article class="defi-window defi-window--swap">
  <div class="defi-window__header">
    <div>
      <h2>swap ticket</h2>
      <span class="muted">private AMM route</span>
    </div>
    <span class="tag tag--ocs">ocs01</span>
  </div>
  <div class="defi-ticket">
    <label class="defi-field"><span>pay</span><input class="mono" value="100.00 OCT"></label>
    <div class="swap-direction">to</div>
    <label class="defi-field"><span>receive</span><input class="mono" value="781.42 pUSD"></label>
  </div>
  <table class="detail-table">
    <tbody>
      <tr><td>route</td><td class="mono">OCT -> pUSD</td></tr>
      <tr><td>fee</td><td class="mono">0.30%</td></tr>
      <tr><td>price impact</td><td class="mono">0.18%</td></tr>
      <tr><td>settlement</td><td><span class="tag tag--pending">staging</span></td></tr>
    </tbody>
  </table>
  <button class="button button--primary" type="button">preview swap</button>
</article>
```

Required anatomy: header + protocol tag · pay field · receive field · route row · fee row · price impact row · settlement row · primary action

---

### Lending Market

Required anatomy: header with health chip · metrics row (supply APY, borrow APY, utilization) · risk meter · detail table (supplied, borrowed, liquidation, status)

**Never show a lending action without risk context.**

---

### Liquidity Pools

Required anatomy: header with update action · table columns: pool, tvl, 24h vol, apr · mono values for numbers

Pools must be table-first — users compare rows.

---

### Staking Vault

Required anatomy: header with active state · staked amount · pending rewards · unbonding period · validator allocation bars · stake/unstake actions

**Do not hide unbonding time.**

---

### Bridge Queue

Required anatomy: header with pending count · table columns: tx, asset, side, state · state tags: proof, relay, done

Bridge states must be textual — users need to understand transaction progress.

---

### Portfolio

Required anatomy: total value · allocation strip · detail table for daily pnl, claimable, private balance, last sync

Use mono for totals and epoch sync.

---

### Perp / Orderbook

Required anatomy: header with mark price · bid/ask table · compact market depth chart · mono prices and sizes

Orderbook: table + chart on desktop, stacked on smaller screens.

---

### Governance Proposal

Required anatomy: proposal summary · for/against/quorum rows · vote bar · state tag (`epoch vote`)

Must show quorum and vote split, not only a CTA.

---

## 9. States Matrix

| State | Description |
|---|---|
| default | Normal control or row |
| hover | Subtle border/surface strengthening |
| focus | Visible 2px focus ring via `--oct-shadow-focus` |
| pressed | Primary-soft or active border |
| disabled | Muted text, soft surface, no pointer affordance |
| loading | Visible text `loading...` |
| empty | Visible text, often italic muted |
| error | Danger text/background + specific message |
| selected | Primary text and active bottom rule |
| staging | Warning background or tag |
| rejected | Danger background or tag |
| confirmed | Textual confirmed/done/safe state |
| pending | Textual pending/proof with limited pulse |

Do not invent synonyms that split the state vocabulary.

---

## 10. Motion Rules

Motion is nearly absent. The only built-in animation is `.tag--pending` pulse (steps). Use it only for pending/proof/staging states.

**Never add:** animated gradient backgrounds · floating blobs · particle effects · decorative parallax · constant chart wiggles with no data meaning

---

## 11. Content Design

**Voice:** concise · literal · protocol-aware · no hype · no vague "magic" · no unexplained risk

**Label style:** lowercase labels · short nouns for table headers · exact state names · no decorative punctuation

**Good labels:** epoch · transactions · supply · staging · validators · peak tps · route · fee · price impact · settlement · proof · relay · claimable · liquidation

**Bad labels:** explore the future · unleash privacy · supercharge your journey · next-gen dashboard experience · amazing rewards

DeFi action copy must reveal important trade information before the action: route, fee, price impact, settlement state, collateral/health, liquidation, bridge state, and proof state.

---

## 12. Accessibility Requirements

- Visible focus ring for links, buttons, and inputs
- Real `<table>` markup for tabular data
- Table headers must describe columns
- Mobile cards must preserve labels
- Color-coded states must include visible text
- Buttons must have readable text labels
- Inputs must have labels or screen-reader labels
- Do not use tooltip-only explanations for critical risk
- Error messages must identify the failed action
- Do not trap users in unnecessary dialogs

---

## 13. Navigation

Use `.kit-sidebar` for design-system docs or multi-module tools. Contains `.docs-search`, `.kit-nav`, `.sidebar-note`.

Navigation labels: lowercase, short, literal — `overview` · `tokens` · `components` · `patterns` · `defi examples` · `accessibility`

Active nav: primary color/text contrast + bottom border.

---

## 14. Implementation Class Reference

### Layout
`.app-shell` · `.oct-header` · `.oct-header__left` · `.oct-header__title` · `.oct-header__subtitle` · `.oct-header__right` · `.kit-layout` · `.kit-sidebar` · `.kit-main` · `.section` · `.section-title` · `.section-title--nested`

### Components
`.button` · `.button--primary` · `.button--quiet` · `.button--danger` · `.status-chip` · `.status-chip--static` · `.search-bar` · `.query-field` · `.metrics-row` · `.metrics-row--mini` · `.metric` · `.data-table` · `.detail-table` · `.tag` · `.tag--op` · `.tag--confirmed` · `.tag--staging` · `.tag--rejected` · `.tag--ocs` · `.tag--pending` · `.card-list` · `.tx-card` · `.tx-card--rejected` · `.loading-line` · `.empty-line` · `.alert` · `.alert--error` · `.toast`

### DeFi
`.defi-intro` · `.defi-grid` · `.defi-window` · `.defi-window--swap` · `.defi-window--portfolio` · `.defi-window--wide` · `.defi-window__header` · `.defi-ticket` · `.defi-field` · `.swap-direction` · `.risk-meter` · `.vault-stack` · `.vault-row` · `.validator-bars` · `.portfolio-strip` · `.orderbook-layout` · `.mini-chart` · `.vote-bar` · `.vote-bar__for` · `.vote-bar__against`

### State Helpers
`.muted` · `.helper-text` · `.mono` · `.amount` · `.row--staging` · `.row--rejected` · `.is-hidden` · `.is-filtered` · `.sr-only`

---

## 15. Do / Don't

**Do:**
- Use semantic token names in component CSS
- Show exact fees, routes, epochs, hashes, and settlement state
- Keep actions near the affected data
- Prefer tables for scanner and DeFi comparisons
- Make loading, empty, rejected, and staging states explicit
- Use mono for protocol values
- Keep copy short and literal

**Don't:**
- Do not hide risk behind color-only badges
- Do not use marketing hero layouts inside app surfaces
- Do not create one-off DeFi widgets without a reusable contract
- Do not truncate amounts, routes, or error causes without a detail view
- Do not use cards inside cards
- Do not add gradient blobs, bokeh, or ambient decorations
- Do not make the palette one-note purple/blue crypto neon
- Do not remove focus outlines
- Do not invent new state names when existing ones fit

---

## 16. Applying to octra.app

When refactoring `octra.app`, preserve product functionality and replace only the interface layer unless explicitly asked to change behavior.

**Migration order:**
1. Add root design tokens from section 2
2. Replace top navigation/header with `.oct-header`
3. Convert dashboard stats to `.metrics-row`
4. Convert transaction/pool/position/bridge/governance lists to `.data-table`
5. Convert object metadata/quotes to `.detail-table`
6. Replace pill/badge styling with `.tag` variants
7. Add visible loading/empty/error states
8. Verify desktop and mobile
9. Run the repo's existing lint/build/tests

Do not rewrite wallet, bridge, contract, or transaction logic just for styling. Keep behavioral diffs small.

---

## 17. Component Completeness Checklist

A component is not design-system ready unless it documents:

```
□ Purpose and usage scope
□ Anatomy and slots
□ Variants
□ States
□ Layout rules
□ Overflow/truncation behavior
□ Responsive behavior
□ Keyboard/focus behavior
□ Accessibility notes
□ Content rules
□ Tokens used
□ Implementation classes
□ Test strings
□ "Do not use when" guidance
□ Maturity phase
```

---

## 18. Maturity Phases

| Phase | Meaning |
|---|---|
| experimental | New recipe or visual idea, prototype only |
| beta | Usable, API may move, allowed with owner approval |
| stable | Contract frozen, default for product UI |
| deprecated | Replacement exists, migration required |

**Contribution checklist:**
- Appears in at least three product surfaces or one critical flow
- Uses existing tokens unless a semantic gap is proven
- Includes desktop and mobile examples
- Includes loading, empty, error, disabled, and focus states
- Names owner, maturity, migration notes, and test strings
