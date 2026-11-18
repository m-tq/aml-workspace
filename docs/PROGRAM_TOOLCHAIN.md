# Program Toolchain

The scripts target the current Octra AppliedML Program RPC surface. Older
`contract_*` calls were replaced by Program calls.

## RPC mapping

| Purpose | RPC method |
| --- | --- |
| Compile with Program packaging | `octra_compileAml(source, true)` |
| Predict Program address | `octra_computeProgramAddress` |
| Submit deploy transaction | `octra_submit` with `op_type: "program_deploy"` |
| Submit call transaction | `octra_submit` with `op_type: "program_exec"` |
| Verify source | `octra_programVerify` |
| Read stored source | `octra_programSource` |
| Publish ABI | `octra_programSaveAbi` |
| Read stored ABI | `octra_programAbi` |
| Read contract receipt | `contract_receipt` |

`AML_RPC` may be a base URL or end with `/rpc`; the client normalizes it.

## Compile artifacts

`npm run compile` writes to `build/<contract_name>/`:

```text
bytecode.b64          Program envelope, base64 OCTB
program-package.b64   deploy payload
abi.json              functions and events
compile.json          size, instruction count, verification, hashes, disassembly
```

`npm run deploy` requires both `bytecode.b64` and `program-package.b64`. A
`deployment.<network>.pending.json` file is written before submission and
removed after confirmation. Do not start a second deploy while a pending
deployment is unconfirmed.

## Safety gates

- `octra_compileAml` must return matching `bytecode` and `program_envelope`.
- Duplicate `JDEST` labels in disassembly fail the compile.
- `program_deploy` fees are quoted with the package length.
- Deploy refuses an unconfirmed deployer nonce.
- Mainnet deploy requires `AML_CONFIRM_MAINNET=1`.
- Deploy sanity-checks `get_owner` against the deployer when the ABI exposes it.
