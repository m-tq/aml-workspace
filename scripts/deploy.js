// Deploy the compiled AppliedML Program to the configured network.
//
// Reads the Program envelope and deploy package emitted by compile.js.
// Constructor params come from AML_CONSTRUCTOR_ARGS (JSON array). Defaults
// to [] for parameter-less constructors.
//
// Deployment metadata is written to build/<contract>/deployment.<network>.json
// so devnet and mainnet artifacts coexist cleanly.

const fs   = require('node:fs')
const path = require('node:path')

const { rpc, setRpcUrl, getRpcUrl } = require('./lib/rpc')
const aml = require('./lib/aml')
const { buildConfig, buildDir, deploymentPath } = require('./lib/env')

function log(label, value) {
  console.log(`${label.padEnd(18)} ${value}`)
}

function unwrapView(value) {
  return value && typeof value === 'object' && 'result' in value ? value.result : value
}

async function readViewWithRetry(address, method, params = []) {
  let lastError
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      return unwrapView(await rpc('contract_call', [address, method, params]))
    } catch (err) {
      lastError = err
      await new Promise((resolve) => setTimeout(resolve, 1500))
    }
  }
  throw lastError ?? new Error(`unable to read ${method}`)
}

async function assertConstructorState({ address, abiPath, deployer }) {
  if (!fs.existsSync(abiPath)) return
  const raw = JSON.parse(fs.readFileSync(abiPath, 'utf8'))
  const functions = Array.isArray(raw) ? raw : (raw?.functions ?? [])
  const names = new Set(functions.map((fn) => typeof fn === 'string' ? fn : fn?.name).filter(Boolean))

  if (names.has('get_owner')) {
    const owner = String(await readViewWithRetry(address, 'get_owner'))
    if (!owner || owner === '0') throw new Error('constructor sanity failed: owner is unset')
    if (owner !== deployer) throw new Error(`constructor sanity failed: owner ${owner} != deployer ${deployer}`)
    log('owner_check', owner)
  }
}

;(async () => {
  const { config, missing } = buildConfig()
  if (missing.length) {
    console.error(`missing required env vars: ${missing.join(', ')}`)
    console.error(`set them in .env / .env.${config.network} or as shell overrides.`)
    process.exit(1)
  }

  if (config.network === 'mainnet' && process.env.AML_CONFIRM_MAINNET !== '1') {
    console.error('refusing mainnet deploy: set AML_CONFIRM_MAINNET=1 after review')
    process.exit(1)
  }

  setRpcUrl(config.rpcUrl)

  const outDir       = buildDir(config.contractName)
  const envelopePath = path.join(outDir, 'bytecode.b64')
  const packagePath  = path.join(outDir, 'program-package.b64')
  const pendingPath  = path.join(outDir, `deployment.${config.network}.pending.json`)

  if (!fs.existsSync(envelopePath) || !fs.existsSync(packagePath)) {
    console.error(`Program artifacts not found: ${envelopePath}, ${packagePath}`)
    console.error(`run: npm run compile:${config.network}  (or set AML_CONTRACT first)`)
    process.exit(1)
  }
  const envelopeB64       = fs.readFileSync(envelopePath, 'utf8').trim()
  const programPackageB64 = fs.readFileSync(packagePath, 'utf8').trim()

  const keypair = aml.keyPairFromBase64(config.privKey)
  const constructorParams = config.constructorArgs ?? []

  console.log('─── deploy ───────────────────────────────────────')
  log('network',     config.network)
  log('rpc',         getRpcUrl())
  log('contract',    config.contractName)
  log('deployer',    config.deployer)
  log('envelope',    `${envelopeB64.length} b64 chars`)
  log('package',     `${programPackageB64.length} b64 chars`)
  log('constructor', JSON.stringify(constructorParams))

  const account = await aml.getAccountState(config.deployer)
  log('nonce',         String(account.nonce))
  log('pending_nonce', String(account.pendingNonce))
  log('balance_raw',   String(account.balanceRaw))

  if (account.pendingNonce !== account.nonce) {
    throw new Error(
      `deployer has an unconfirmed transaction (nonce ${account.pendingNonce}); ` +
      'wait for confirmation or expiry before deploying again')
  }

  const nextNonce = account.nonce + 1
  log('next_nonce', String(nextNonce))

  const addrResult = await rpc('octra_computeProgramAddress',
    [envelopeB64, config.deployer, nextNonce])
  const computedAddress = typeof addrResult === 'string' ? addrResult : addrResult.address
  log('predicted_addr', computedAddress)

  if (!computedAddress || !computedAddress.startsWith('oct')) {
    throw new Error(`unexpected address response: ${JSON.stringify(addrResult)}`)
  }

  // Program deployment fees scale with the base64 wire payload. Supplying
  // the exact package length also lets the RPC include current usage tiers.
  const recommended = await aml.getRecommendedFee('program_deploy', programPackageB64.length)
  const ou = Math.max(recommended, config.deployFeeOu)
  log('fee_ou', `${ou} (recommended ${recommended})`)

  if (account.balanceRaw < ou) {
    throw new Error(`insufficient balance: ${account.balanceRaw} < ${ou}`)
  }

  const deployTx = aml.buildProgramDeployTx({
    deployer:        config.deployer,
    computedAddress,
    programPackageB64,
    constructorParams,
    nonce:           nextNonce,
    ou,
    keypair,
  })

  console.log('─── submit ───────────────────────────────────────')
  const hash = await aml.submitTx(deployTx)
  log('hash', hash)
  log('explorer', `${config.explorerHost}/tx.html?hash=${hash}`)

  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(pendingPath, JSON.stringify({
    status:            'pending',
    contract:          config.contractName,
    address:           computedAddress,
    deployer:          config.deployer,
    deployTxHash:      hash,
    nonce:             nextNonce,
    feeOu:             ou,
    constructorParams,
    rpc:               config.rpcUrl,
    network:           config.network,
    submittedAt:       new Date().toISOString(),
  }, null, 2))
  log('pending_saved', path.relative(process.cwd(), pendingPath))

  console.log('─── wait ─────────────────────────────────────────')
  const { tx, receipt } = await aml.waitForTx(hash, { timeoutMs: 240_000 })
  log('status', tx.status ?? 'confirmed')
  log('epoch',  String(tx.epoch_id ?? tx.epoch ?? '?'))
  if (receipt) {
    log('success', String(receipt.success))
    log('effort',  String(receipt.effort ?? '?'))
    log('events',  String((receipt.events ?? []).length))
  }

  await assertConstructorState({
    address: computedAddress,
    abiPath: path.join(outDir, 'abi.json'),
    deployer: config.deployer,
  })

  const deployment = {
    contract:          config.contractName,
    address:           computedAddress,
    deployer:          config.deployer,
    deployTxHash:      hash,
    epoch:             tx.epoch_id ?? tx.epoch ?? null,
    nonce:             nextNonce,
    constructorParams,
    rpc:               config.rpcUrl,
    network:           config.network,
    deployedAt:        new Date().toISOString(),
  }

  const outPath = deploymentPath(config.contractName, config.network)
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(deployment, null, 2))
  if (fs.existsSync(pendingPath)) fs.unlinkSync(pendingPath)

  console.log('─── done ─────────────────────────────────────────')
  log('address', computedAddress)
  log('saved',   path.relative(process.cwd(), outPath))
  log('explorer', `${config.explorerHost}/address.html?addr=${computedAddress}`)
})().catch((err) => {
  console.error('deploy error:', err.message)
  if (err.stack && process.env.AML_DEBUG === '1') console.error(err.stack)
  process.exit(1)
})
