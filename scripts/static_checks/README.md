# Contract-specific static checks

`npm run static-verify` runs generic source checks, then loads an optional
module named after the active contract:

```text
scripts/static_checks/<contract_name>.js
```

Export a function or an array:

```js
module.exports = ({ source }) => [
  {
    code: 'OWNER_ONLY_WITHDRAW',
    ok: /fn\s+withdraw[\s\S]*?require\s*\(\s*caller\s*==\s*self\.owner/.test(source),
    detail: 'withdrawals are restricted to the owner',
  },
]
```

Each check must return `{ code, ok, detail }`. A failed check makes the command
exit non-zero and writes `build/<contract_name>/static-verification.json`.
