// Compile an AppliedML Program via octra_compileAml. The explicit `true`
// parameter selects Program packaging, formal verification, and source
// admission metadata required by current epoch_time-enabled networks.
//
// Source defaults to contract/main.aml. Override via AML_CONTRACT (relative
// or absolute path) or `AML_CONTRACT=contract/templates/token/main.aml ...`.
//
// Writes per-contract artifacts to build/<contract_name>/:
//   bytecode.b64          — base64 Program envelope (OCTB)
//   program-package.b64   — deploy payload consumed by deploy.js
//   abi.json              — ABI (functions + events)
//   compile.json          — compile metadata, hashes, verification, disassembly

const crypto = require('node:crypto')
const fs     = require('node:fs')
const path   = require('node:path')

const { rpc, setRpcUrl, getRpcUrl } = require('./lib/rpc')
const { buildConfig, buildDir }     = require('./lib/env')

function log(label, value) {
  console.log(`${label.padEnd(18)} ${value}`)
}

// Guard against the compiler label-space bug that shows up as duplicate
// JDEST targets in disassembly. See docs/APPLIEDML_MEMORY.md.
function assertUniqueJumpLabels(disassembly) {
  if (!disassembly) return

  const labels = new Map()
  for (const [index, line] of String(disassembly).split(/\r?\n/).entries()) {
    const match = line.match(/^JDEST\s+(\d+)$/)
    if (!match) continue
    const locations = labels.get(match[1]) ?? []
    locations.push(index + 1)
    labels.set(match[1], locations)
  }

  const duplicates = [...labels.entries()].filter(([, locations]) => locations.length > 1)
  if (duplicates.length > 0) {
    const detail = duplicates
      .map(([label, locations]) => `${label} at lines ${locations.join(', ')}`)
      .join('; ')
    throw new Error(`unsafe compiler output: duplicate jump label(s): ${detail}`)
  }
}

;(async () => {
  const { config } = buildConfig()
  setRpcUrl(config.rpcUrl)

  if (!config.contractExists) {
    console.error(`source not found: ${config.contractPath}`)
    console.error('set AML_CONTRACT to point at a different .aml file, or copy a template into contract/main.aml')
    process.exit(1)
  }

  const source = fs.readFileSync(config.contractPath, 'utf8')

  console.log('─── compile ──────────────────────────────────────')
  log('network',  config.network)
  log('rpc',      getRpcUrl())
  log('source',   path.relative(process.cwd(), config.contractPath))
  log('contract', config.contractName)
  log('size',     `${Buffer.byteLength(source, 'utf8')} bytes`)

  const result = await rpc('octra_compileAml', [source, true])

  if (!result || !result.bytecode || !result.program_envelope || !result.deploy_payload) {
    console.error('compile failed: incomplete Program package returned')
    console.error(JSON.stringify(result, null, 2))
    process.exit(1)
  }

  if (result.bytecode !== result.program_envelope) {
    throw new Error('compiler returned mismatched Program envelope artifacts')
  }

  const disassembly = result.disassembly ?? result.disasm
  assertUniqueJumpLabels(disassembly)

  let abi = result.abi
  if (typeof abi === 'string') {
    try { abi = JSON.parse(abi) } catch { /* keep as string */ }
  }
  const fnCount = Array.isArray(abi)
    ? abi.length
    : (abi?.functions?.length ?? 0)
  const evCount = Array.isArray(abi) ? 0 : (abi?.events?.length ?? 0)

  const outDir      = buildDir(config.contractName)
  const bytecodeOut = path.join(outDir, 'bytecode.b64')
  const packageOut  = path.join(outDir, 'program-package.b64')
  const abiOut      = path.join(outDir, 'abi.json')
  const compileOut  = path.join(outDir, 'compile.json')

  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(bytecodeOut, result.bytecode)
  fs.writeFileSync(packageOut, result.deploy_payload)
  fs.writeFileSync(abiOut, JSON.stringify(abi ?? [], null, 2))
  fs.writeFileSync(compileOut, JSON.stringify({
    contract:          config.contractName,
    program:           true,
    source:            path.relative(outDir, config.contractPath).split(path.sep).join('/'),
    size:              result.size,
    instruction_count: result.instruction_count ?? result.instructions,
    version:           result.version,
    abi,
    disassembly,
    verification:      result.verification,
    certificate:       result.certificate,
    envelope_sha256:   crypto.createHash('sha256').update(Buffer.from(result.program_envelope, 'base64')).digest('hex'),
    package_sha256:    crypto.createHash('sha256').update(Buffer.from(result.deploy_payload, 'base64')).digest('hex'),
  }, null, 2))

  console.log('─── result ───────────────────────────────────────')
  log('bytecode',  `${path.relative(process.cwd(), bytecodeOut)} (${result.bytecode.length} b64 chars)`)
  log('package',   `${path.relative(process.cwd(), packageOut)} (${result.deploy_payload.length} b64 chars)`)
  log('size',      `${result.size ?? '?'} bytes`)
  log('instr',     String(result.instruction_count ?? result.instructions ?? '?'))
  log('functions', String(fnCount))
  log('events',    String(evCount))
  log('version',   result.version ?? 'unknown')
  if (result.verification) {
    const safety = result.verification.safety ?? (result.verification.errors > 0 ? 'error' : 'safe')
    log('formal', `${safety} (errors ${result.verification.errors ?? 0}, warnings ${result.verification.warnings ?? 0})`)
  }

  if (fnCount === 0) {
    console.warn('warning: no functions in ABI — check compiler response')
  }
})().catch((err) => {
  console.error('compile error:', err.message)
  if (err.stack && process.env.AML_DEBUG === '1') console.error(err.stack)
  process.exit(1)
})
