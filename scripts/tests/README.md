# Contract test suites

`npm test` runs a generic view smoke pass, then loads an optional suite named
after the active contract:

```text
scripts/tests/<contract_name>.js
```

Export a function:

```js
module.exports = async ({ aml, rpc, config, deployment, contract, helpers }) => {
  const { run } = helpers

  await run('view get_owner == deployer', async () => {
    const result = await rpc('contract_call', [contract, 'get_owner', []])
    const owner = result?.result ?? result
    if (owner !== config.deployer) throw new Error(`got ${owner}`)
  })
}
```

Use `aml.buildCallTx` + `aml.submitTx` + `aml.waitForTx` for write tests.
`waitForTx` checks `contract_receipt(hash).success`, so reverted calls do not
silently pass.
