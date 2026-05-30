// ── Tax calculation engine ───────────────────────────────────────────────────

import type {
  FederalData,
  ProvincialData,
  TaxInputs,
  TaxResult,
  LineItem,
} from './types'
import { calcFederal } from './federal'
import { calcProvincial } from './provincial'
import { marginalRate } from './brackets'

// ── Data loading ─────────────────────────────────────────────────────────────

/** Static imports for all year/province JSON files (Vite handles tree-shaking). */
const dataModules: Record<string, () => Promise<unknown>> = import.meta.glob(
  '/src/data/tax/**/*.json',
  { eager: false },
)

async function loadJson<T>(path: string): Promise<T> {
  const loader = dataModules[path]
  if (!loader) {
    throw new Error(`Tax data not found: ${path}`)
  }
  const mod = (await loader()) as { default: T }
  return mod.default
}

export async function loadFederalData(year: number): Promise<FederalData> {
  return loadJson<FederalData>(`/src/data/tax/${year}/federal.json`)
}

export async function loadProvincialData(
  year: number,
  province: string,
): Promise<ProvincialData> {
  return loadJson<ProvincialData>(`/src/data/tax/${year}/${province}.json`)
}

// ── Main entry point ─────────────────────────────────────────────────────────

/**
 * Calculate complete Canadian income tax for the given inputs.
 * Returns a detailed TaxResult including a line-by-line breakdown.
 */
export async function calculateTax(inputs: TaxInputs): Promise<TaxResult> {
  const [fed, prov] = await Promise.all([
    loadFederalData(inputs.year),
    loadProvincialData(inputs.year, inputs.province),
  ])

  return calculateTaxWithData(inputs, fed, prov)
}

/**
 * Calculate tax using pre-loaded data (useful for tests and RRSP delta).
 */
export function calculateTaxWithData(
  inputs: TaxInputs,
  fed: FederalData,
  prov: ProvincialData,
): TaxResult {
  // ── Federal calculation ────────────────────────────────────────────────
  const fedResult = calcFederal(inputs, fed)

  // ── Provincial calculation ─────────────────────────────────────────────
  const provResult = calcProvincial(
    fedResult.taxableIncome,
    fedResult.grossedUpEligibleDiv,
    fedResult.grossedUpNonEligibleDiv,
    prov,
  )

  // ── Payroll totals ─────────────────────────────────────────────────────
  const totalPayroll =
    fedResult.cppEmployee + fedResult.cpp2Employee + fedResult.eiPremium

  // ── Total tax ──────────────────────────────────────────────────────────
  const totalTax =
    fedResult.federalTax + provResult.provincialTax + totalPayroll

  // ── After-tax income (based on actual cash income, not grossed-up) ─────
  const cashIncome =
    inputs.employment +
    inputs.selfEmployment +
    inputs.pension +
    inputs.oas +
    inputs.cpp +
    inputs.eligibleDividends +
    inputs.nonEligibleDividends +
    inputs.capitalGains +
    inputs.otherIncome +
    inputs.rrspWithdrawal

  const afterTaxIncome = cashIncome - totalTax

  // ── Rates ──────────────────────────────────────────────────────────────
  const averageRate = cashIncome > 0 ? totalTax / cashIncome : 0
  const combinedMarginalRate =
    fedResult.federalMarginalRate + provResult.provincialMarginalRate

  // ── RRSP tax savings estimate ──────────────────────────────────────────
  // Delta method: recalculate with +$1,000 RRSP deduction
  const rrspDelta = 1000
  const inputsWithMoreRRSP: TaxInputs = {
    ...inputs,
    rrspDeduction: inputs.rrspDeduction + rrspDelta,
  }
  const fedWithRRSP = calcFederal(inputsWithMoreRRSP, fed)
  const provWithRRSP = calcProvincial(
    fedWithRRSP.taxableIncome,
    fedWithRRSP.grossedUpEligibleDiv,
    fedWithRRSP.grossedUpNonEligibleDiv,
    prov,
  )
  const taxWithRRSP =
    fedWithRRSP.federalTax +
    provWithRRSP.provincialTax +
    fedWithRRSP.cppEmployee +
    fedWithRRSP.cpp2Employee +
    fedWithRRSP.eiPremium
  const rrspTaxSavings = ((totalTax - taxWithRRSP) / rrspDelta) * 1000

  // ── Line-by-line breakdown ─────────────────────────────────────────────
  const lineByLine: LineItem[] = buildLineByLine(inputs, fedResult, provResult, fed, prov)

  // ── Verification flag ──────────────────────────────────────────────────
  const verified = fed.verified && prov.verified

  return {
    grossIncome: cashIncome,
    netIncome: fedResult.netIncome,
    taxableIncome: fedResult.taxableIncome,
    federalTaxBeforeCredits: fedResult.federalTaxBeforeCredits,
    federalCredits: fedResult.federalCredits,
    federalTax: fedResult.federalTax,
    provincialTaxBeforeCredits: provResult.provincialTaxBeforeCredits,
    provincialCredits: provResult.provincialCredits,
    surtax: provResult.surtax,
    provincialTax: provResult.provincialTax,
    cppEmployee: fedResult.cppEmployee,
    cpp2Employee: fedResult.cpp2Employee,
    eiPremium: fedResult.eiPremium,
    totalPayroll,
    totalTax,
    afterTaxIncome,
    averageRate,
    marginalRate: combinedMarginalRate,
    rrspTaxSavings,
    lineByLine,
    verified,
  }
}

// ── Line-by-line builder ─────────────────────────────────────────────────────

function buildLineByLine(
  inputs: TaxInputs,
  fedResult: ReturnType<typeof calcFederal>,
  provResult: ReturnType<typeof calcProvincial>,
  fed: FederalData,
  prov: ProvincialData,
): LineItem[] {
  const lines: LineItem[] = []

  const add = (label: string, amount: number, indent = false) => {
    lines.push({ label, amount, indent })
  }

  // ── Income ─────────────────────────────────────────────────────────────
  add('Income', 0)
  if (inputs.employment) add('Employment income', inputs.employment, true)
  if (inputs.selfEmployment) add('Self-employment income', inputs.selfEmployment, true)
  if (inputs.pension) add('Pension income', inputs.pension, true)
  if (inputs.oas) add('OAS benefits', inputs.oas, true)
  if (inputs.cpp) add('CPP/QPP benefits', inputs.cpp, true)
  if (inputs.eligibleDividends) {
    add('Eligible dividends (actual)', inputs.eligibleDividends, true)
    add('Eligible dividends (grossed-up)', fedResult.grossedUpEligibleDiv, true)
  }
  if (inputs.nonEligibleDividends) {
    add('Non-eligible dividends (actual)', inputs.nonEligibleDividends, true)
    add('Non-eligible dividends (grossed-up)', fedResult.grossedUpNonEligibleDiv, true)
  }
  if (inputs.capitalGains) {
    add('Capital gains', inputs.capitalGains, true)
    add('Taxable capital gains (50%)', fedResult.taxableCapitalGains, true)
  }
  if (inputs.otherIncome) add('Other income', inputs.otherIncome, true)
  if (inputs.rrspWithdrawal) add('RRSP withdrawal', inputs.rrspWithdrawal, true)
  add('Total income', fedResult.totalIncome)

  // ── Deductions ─────────────────────────────────────────────────────────
  if (fedResult.totalDeductions > 0) {
    add('Deductions', 0)
    if (inputs.rrspDeduction) add('RRSP deduction', inputs.rrspDeduction, true)
    if (inputs.childCare) add('Child care expenses', inputs.childCare, true)
    if (inputs.interestExpense) add('Interest expense', inputs.interestExpense, true)
    if (inputs.otherDeductions) add('Other deductions', inputs.otherDeductions, true)
    add('Total deductions', fedResult.totalDeductions)
  }

  add('Net income', fedResult.netIncome)
  add('Taxable income', fedResult.taxableIncome)

  // ── Federal tax ────────────────────────────────────────────────────────
  add('Federal Tax', 0)
  add('Federal tax on taxable income', fedResult.federalTaxBeforeCredits, true)
  add(`Basic personal amount credit (${fmt(fed.bpa)} × ${pct(fed.brackets[0].rate)})`, fed.bpa * fed.brackets[0].rate, true)
  add('Total federal credits', fedResult.federalCredits, true)
  add('Net federal tax', fedResult.federalTax)

  // ── Provincial tax ─────────────────────────────────────────────────────
  add(`${prov.name} Tax`, 0)
  add(`${prov.name} tax on taxable income`, provResult.provincialTaxBeforeCredits, true)
  add(`${prov.name} credits`, provResult.provincialCredits, true)
  if (provResult.surtax > 0) {
    add(`${prov.name} surtax`, provResult.surtax, true)
  }
  add(`Net ${prov.name} tax`, provResult.provincialTax)

  // ── Payroll deductions ─────────────────────────────────────────────────
  add('Payroll Deductions', 0)
  add('CPP employee contribution', fedResult.cppEmployee, true)
  if (fedResult.cpp2Employee > 0) {
    add('CPP2 employee contribution', fedResult.cpp2Employee, true)
  }
  add('EI premium', fedResult.eiPremium, true)
  add('Total payroll deductions', fedResult.cppEmployee + fedResult.cpp2Employee + fedResult.eiPremium)

  return lines
}

// ── Formatting helpers (internal) ────────────────────────────────────────────

function fmt(n: number): string {
  return '$' + n.toLocaleString('en-CA', { maximumFractionDigits: 0 })
}

function pct(r: number): string {
  return (r * 100).toFixed(1) + '%'
}
