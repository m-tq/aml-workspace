# aml-workspace

Octra AppliedML (AML) contract workspace — compile, deploy, verify, and
test AML contracts on devnet or mainnet.

```
contract/
  main.aml                          ← active contract (override via AML_CONTRACT)
  templates/                        ← starter contracts
    amm/        token/      vault/
    escrow/     multisig/   private_ml/
    empty/                          ← minimal scaffold
frontend/                            ← optional dApp surface
scripts/
  compile.js   deploy.js   save_abi.js   verify.js   test.js
  lib/
    env.js     rpc.js      aml.js
build/
  <contract>/
    bytecode.b64
    abi.json
    compile.json
    deployment.<network>.json
```

## Quick start

```bash
# 1. install
npm install

# 2. configure
cp .env.example         .env
cp .env.devnet.example  .env.devnet
# fill in AML_DEPLOYER_ADDR / AML_DEPLOYER_PRIV in .env.devnet

# 3. compile + deploy on devnet
npm run compile:devnet
npm run deploy:devnet
npm run save-abi:devnet
npm run verify:devnet
npm run test:devnet
```

To target a different contract, point `AML_CONTRACT` at it:

```bash
AML_CONTRACT=contract/templates/token/main.aml \
AML_CONSTRUCTOR_ARGS='["MyToken","MTK",1000000000,6]' \
  npm run compile:devnet && npm run deploy:devnet
```

## Network model

Resolution order (first match wins per key):

```
1. shell env        AML_NETWORK=mainnet npm run deploy
2. .env.<network>   e.g. .env.mainnet
3. .env             defaults shared across networks
```

```
network    rpc default                   explorer
devnet     http://165.227.225.79:8080    https://devnet.octrascan.io
mainnet    http://46.101.86.250:8080     https://octrascan.io
```

Per-contract artifacts live under `build/<contract_basename>/`. Devnet and
mainnet deployments coexist as `deployment.devnet.json` and
`deployment.mainnet.json` so you can inspect both.

## Templates

Each starter under `contract/templates/<name>/` is a standalone `main.aml`
plus `readme.md`. Available:

```
amm           constant-product AMM
empty         minimal scaffold
escrow        three-party with arbiter
multisig      threshold voting
private_ml    ZK-gated example
token         OCS-01 fungible token (with interface)
vault         deposit / withdraw with reentrancy guard
```

To use one as your active contract:

```bash
# option A — point AML_CONTRACT at the template
AML_CONTRACT=contract/templates/escrow/main.aml npm run compile

# option B — copy it in place
cp contract/templates/escrow/main.aml contract/main.aml
npm run compile
```

## Custom test suites

`scripts/test.js` runs a generic smoke pass that calls every zero-arg
view method in the ABI, then optionally executes a per-contract suite:

```
scripts/tests/<contract_name>.js
```

The suite is a plain CommonJS module:

```js
module.exports = async ({ aml, rpc, config, deployment, contract, helpers }) => {
  const { run } = helpers
  await run('view get_owner == deployer', async () => {
    const v = await rpc('contract_call', [contract, 'get_owner', []])
    if (v !== config.deployer) throw new Error(`got ${v}`)
  })
}
```

Use `aml.buildCallTx` + `aml.submitTx` + `aml.waitForTx` for write tests.
`waitForTx` reads `contract_receipt(hash).success` so reverted calls do
not silently pass — see `.kiro/skills/octra-contract/skill.md` §16.1.

## Skills

Three skills define the quality bar for any task in this repo. Activate
the matching skill before writing code in its domain.

```
.kiro/skills/clean-code/SKILL.md       writing / reviewing TS or JS code
.kiro/skills/octra-contract/skill.md   AML authoring + security + Groth16 BN254
.kiro/skills/octra-design/SKILL.md     octrascan UI language (frontend/)
```

## Agent IDE wiring

The same skills are surfaced to every popular agent IDE:

```
Kiro              .kiro/steering/aml-workspace.md  +  .kiro/skills/*
Claude Code       CLAUDE.md
Cursor            .cursor/rules/aml-workspace.mdc
GitHub Copilot    .github/copilot-instructions.md
Gemini CLI        GEMINI.md
Windsurf          .windsurfrules
Codex / generic   AGENTS.md
```

`AGENTS.md` is the single source of truth for repo behavior — every
adapter file points back to it.

## Docs

- Octra docs: https://docs.octra.org
- AML reference: `appliedML/` in the parent OctWa workspace
- Explorer:
  - mainnet  https://octrascan.io
  - devnet   https://devnet.octrascan.io
