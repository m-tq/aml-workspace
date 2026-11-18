# aml-workspace

Octra AppliedML (AML) contract workspace: compile, static-audit, deploy,
verify, and test AML Programs on local, devnet or mainnet.

```text
contract/
  main.aml                          active contract (override via AML_CONTRACT)
  templates/                        starter contracts
    amm/        token/      vault/
    escrow/     multisig/   private_ml/
    empty/                          minimal scaffold
frontend/                            optional dApp surface
scripts/
  compile.js   deploy.js   save_abi.js   verify.js   test.js
  static_verify.js
  lib/
    env.js     rpc.js      aml.js
  tests/                            per-contract test suites
  static_checks/                    per-contract static checks
docs/
  APPLIEDML_MEMORY.md               language, limits, security memory
  PROGRAM_TOOLCHAIN.md              Program RPC and artifact reference
skills/
  clean-code/ octra-contract/
  octra-design/                     Synteq UI 2.2.0 source and docs
build/
  <contract>/
    bytecode.b64                    Program envelope
    program-package.b64             deploy payload
    abi.json
    compile.json
    deployment.<network>.json
    verification.<network>.json
    static-verification.json
```

## Quick start

```bash
npm install

cp .env.example         .env
cp .env.devnet.example  .env.devnet
# fill in AML_DEPLOYER_ADDR / AML_DEPLOYER_PRIV in .env.devnet

npm run compile:devnet
npm run static-verify:devnet
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

Never deploy to mainnet without explicit human approval. Deployment also
requires `AML_CONFIRM_MAINNET=1`.

## Network model

Resolution order (first match wins per key):

```text
1. shell env        AML_NETWORK=mainnet npm run deploy
2. .env.<network>   e.g. .env.mainnet
3. .env             defaults shared across networks
```

```text
network    rpc default                   explorer
local      http://127.0.0.1:18080        http://127.0.0.1:18080
devnet     https://devnet.octrascan.io/rpc   https://devnet.octrascan.io
mainnet    https://octrascan.io/rpc          https://octrascan.io
```

Per-contract artifacts live under `build/<contract_name>/`. Devnet and mainnet
deployments coexist as `deployment.devnet.json` and `deployment.mainnet.json`
so you can inspect both.

The compile step requests Program packaging with
`octra_compileAml(source, true)` and writes both the Program envelope and the
deploy payload. See `docs/PROGRAM_TOOLCHAIN.md` for the RPC mapping and safety
gates.

## Templates

Each starter under `contract/templates/<name>/` is a standalone `main.aml`
plus `readme.md`. Available:

```text
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
# option A - point AML_CONTRACT at the template
AML_CONTRACT=contract/templates/escrow/main.aml npm run compile

# option B - copy it in place
cp contract/templates/escrow/main.aml contract/main.aml
npm run compile
```

## Static audit

`npm run static-verify` runs generic source checks and writes
`build/<contract_name>/static-verification.json`. Contract-specific checks can
be added at:

```text
scripts/static_checks/<contract_name>.js
```

See `scripts/static_checks/README.md`.

## Custom test suites

`scripts/test.js` runs a generic smoke pass that calls every zero-arg view
method in the ABI, then optionally executes a per-contract suite:

```text
scripts/tests/<contract_name>.js
```

The suite is a plain CommonJS module:

```js
module.exports = async ({ aml, rpc, config, deployment, contract, helpers }) => {
  const { run } = helpers
  await run('view get_owner == deployer', async () => {
    const v = await rpc('contract_call', [contract, 'get_owner', []])
    if ((v?.result ?? v) !== config.deployer) throw new Error(`got ${v}`)
  })
}
```

Use `aml.buildCallTx` + `aml.submitTx` + `aml.waitForTx` for write tests.
`waitForTx` reads `contract_receipt(hash).success` so reverted calls do not
silently pass. See `scripts/tests/README.md`.

## Skills

Three skills define the quality bar for any task in this repo. Load the
matching skill before writing code in its domain.

```text
skills/clean-code/SKILL.md        writing / reviewing TS or JS code
skills/octra-contract/skill.md    AML authoring + security + Groth16 BN254
skills/octra-design/SKILL.md      Synteq UI 2.2.0 design system (frontend/)
```

`skills/octra-design/` is the default UI source for this workspace. It
contains the full Synteq UI 2.2.0 package: `css/`, `js/`, `fonts/`,
`examples/`, `SKILL.md`, `DESIGN.md` and `README.md`.

## Agent entrypoint

`AGENTS.md` is the single, vendor-neutral entrypoint for agent tooling. No
agent-specific adapter files are maintained.

## Docs

- AppliedML memory: `docs/APPLIEDML_MEMORY.md`
- Toolchain reference: `docs/PROGRAM_TOOLCHAIN.md`
- Synteq UI: `skills/octra-design/README.md` and `skills/octra-design/DESIGN.md`
- Octra docs: https://docs.octra.org
- Explorer:
  - mainnet  https://octrascan.io
  - devnet   https://devnet.octrascan.io
