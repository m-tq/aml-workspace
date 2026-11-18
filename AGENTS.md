# Agent Notes

Project: Octra AppliedML workspace for compiling, deploying, verifying and
testing AML contracts on local, devnet or mainnet.

Read `docs/APPLIEDML_MEMORY.md` before changing contract code. Read
`docs/PROGRAM_TOOLCHAIN.md` before changing scripts. Both record compiler
limits, RPC names and safety gates that are easy to break.

## Layout

```text
contract/                active contract source
contract/templates/      starter contracts
scripts/                 compile, deploy, verify, static audit, tests
scripts/lib/             env, RPC and signing helpers
scripts/tests/           per-contract test suites
scripts/static_checks/   per-contract static audit checks
docs/                    AppliedML notes and toolchain reference
frontend/                optional dApp surface
skills/                  domain skills for agents
skills/octra-design/     Synteq UI 2.2.0 source, docs and examples
build/                   ignored generated artifacts
```

## Commands

```bash
npm install
npm run compile
npm run static-verify
npm run deploy
npm run save-abi
npm run verify
npm test
```

Network selection: `AML_NETWORK=local|devnet|mainnet` or the matching
`.env.<network>` file.

## Non-negotiables

- Never deploy to mainnet without explicit human approval.
  `scripts/deploy.js` also requires `AML_CONFIRM_MAINNET=1`.
- Never commit `.env`, wallet files, deployment receipts, verification output
  or private keys.
- Recompile against the target network. Old bytecode may not match current
  compiler rules.
- Keep each Program source file under 65,536 bytes and below ~98 functions.
- Read-only RPC views execute with `epoch_time = 0`. Do not require consensus
  time in views.
- Every native-value exit: clear state first, keep `nonreentrant`, check the
  `transfer` result.
- Do not invent RPC names. Use the mapping in `docs/PROGRAM_TOOLCHAIN.md`.

## Skills

Load the matching skill before working in its domain:

```text
skills/clean-code/SKILL.md        TypeScript / JavaScript quality
skills/octra-contract/skill.md    AML authoring, security, Groth16 BN254
skills/octra-design/SKILL.md      Synteq UI 2.2.0 design system
```

`skills/octra-design/` is the default UI source for this workspace. It
contains `css/`, `js/`, `fonts/`, `examples/`, `SKILL.md`, `DESIGN.md` and
`README.md` from Synteq UI 2.2.0. Copy or import those assets instead of
reimplementing the design system.

## Agent entrypoint

`AGENTS.md` is the only agent entrypoint. No vendor-specific adapter files are
maintained in this repository.
