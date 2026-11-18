// Local static audit for an AppliedML Program.
//
// Generic checks run for every contract. Contract-specific invariants can be
// added in scripts/static_checks/<contract_name>.js:
//
//   module.exports = ({ source, config }) => [
//     { code: 'MY_CHECK', ok: /pattern/.test(source), detail: 'why it matters' },
//   ]

const fs   = require('node:fs')
const path = require('node:path')

const { buildConfig, buildDir, ROOT } = require('./lib/env')

const { config } = buildConfig()
if (!config.contractExists) {
  console.error(`source not found: ${config.contractPath}`)
  process.exit(1)
}

const source = fs.readFileSync(config.contractPath, 'utf8')
const sourceBytes = Buffer.byteLength(source, 'utf8')
const outDir = buildDir(config.contractName)
const outPath = path.join(outDir, 'static-verification.json')

const declaredFunctions = [...source.matchAll(/\b(?:view\s+|payable\s+|nonreentrant\s+)*fn\s+([a-zA-Z_][\w]*)\s*\(/g)]
  .map((match) => match[1])
const functionCounts = declaredFunctions.reduce((acc, name) => {
  acc.set(name, (acc.get(name) ?? 0) + 1)
  return acc
}, new Map())
const duplicateFunctions = [...functionCounts.entries()].filter(([, count]) => count > 1)

const checks = [
  {
    code: 'SOURCE_PRESENT',
    ok: source.trim().length > 0,
    detail: 'contract source is present and non-empty',
  },
  {
    code: 'PROGRAM_SOURCE_LIMIT',
    ok: sourceBytes <= 65_536,
    detail: 'source fits the Program package limit of 65,536 bytes per file',
  },
  {
    code: 'ENTRYPOINT_PRESENT',
    ok: /\b(?:Program|contract)\s+[A-Za-z_][\w]*\s*\{/.test(source) && /\bconstructor\s*\(/.test(source),
    detail: 'source declares a Program/contract block and a constructor',
  },
  {
    code: 'FUNCTION_LIMIT',
    ok: declaredFunctions.length < 98,
    detail: 'stay below ~98 functions to avoid compiler jump-label exhaustion',
  },
  {
    code: 'UNIQUE_FUNCTION_NAMES',
    ok: duplicateFunctions.length === 0,
    detail: duplicateFunctions.length
      ? `duplicate declarations: ${duplicateFunctions.map(([name]) => name).join(', ')}`
      : 'every function name is declared once',
  },
  {
    code: 'NO_SECRET_LITERALS',
    ok: !/\b(?:private[_ -]?key|secret[_ -]?key|mnemonic)\s*[:=]\s*["'][^"']+["']/i.test(source),
    detail: 'source contains no obvious private key or mnemonic literal',
  },
]

const pluginPath = path.join(ROOT, 'scripts', 'static_checks', `${config.contractName}.js`)
if (fs.existsSync(pluginPath)) {
  const plugin = require(pluginPath)
  const custom = typeof plugin === 'function' ? plugin({ source, config }) : plugin
  if (Array.isArray(custom)) checks.push(...custom)
}

const failed = checks.filter((check) => !check.ok)
const report = {
  schema: 'aml-workspace-static-verification.v1',
  source: config.contractPath.replace(ROOT + path.sep, '').split(path.sep).join('/'),
  safety: failed.length === 0 ? 'safe' : 'error',
  errors: failed.length,
  warnings: 0,
  source_bytes: sourceBytes,
  function_count: declaredFunctions.length,
  checks,
  generatedAt: new Date().toISOString(),
}

fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(report, null, 2))

for (const check of checks) {
  console.log(`${check.ok ? 'PASS' : 'FAIL'} ${check.code} - ${check.detail}`)
}
console.log(`safety=${report.safety} errors=${report.errors} warnings=${report.warnings}`)
console.log(`saved=${path.relative(process.cwd(), outPath)}`)

if (failed.length > 0) process.exit(1)
