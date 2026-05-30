// ── Federal tax calculation ──────────────────────────────────────────────────

import type { FederalData, TaxInputs } from './types'
import { calcBracketTax, marginalRate } from './brackets'

export interface FederalResult {
  grossIncome: number
  grossedUpEligibleDiv: number
  grossedUpNonEligibleDiv: number
  taxableCapitalGains: number
  totalIncome: number
  totalDeductions: number
  netIncome: number
  taxableIncome: number
  federalTaxBeforeCredits: number
  federalCredits: number
  federalTax: number
  cppEmployee: number
  cpp2Employee: number
  eiPremium: number
  federalMarginalRate: number
}

/**
 * Compute federal income tax, CPP/CPP2/EI payroll deductions, and credits.
 */
export function calcFederal(inputs: TaxInputs, fed: FederalData): FederalResult {
  // ── Gross-up dividends ─────────────────────────────────────────────────
  const grossedUpEligibleDiv = inputs.eligibleDividends * fed.dividendGrossUp.eligible
  const grossedUpNonEligibleDiv = inputs.nonEligibleDividends * fed.dividendGrossUp.nonEligible

  // ── Capital gains inclusion ────────────────────────────────────────────
  const taxableCapitalGains = inputs.capitalGains * fed.capitalGainsInclusion

  // ── Total income (line 15000) ──────────────────────────────────────────
  const totalIncome =
    inputs.employment +
    inputs.selfEmployment +
    inputs.pension +
    inputs.oas +
    inputs.cpp +
    grossedUpEligibleDiv +
    grossedUpNonEligibleDiv +
    taxableCapitalGains +
    inputs.otherIncome +
    inputs.rrspWithdrawal

  // ── Deductions (line 23600) ────────────────────────────────────────────
  const totalDeductions =
    inputs.rrspDeduction +
    inputs.childCare +
    inputs.interestExpense +
    inputs.otherDeductions

  // ── Net income (line 23600) ────────────────────────────────────────────
  const netIncome = Math.max(0, totalIncome - totalDeductions)

  // ── Taxable income (line 26000) ────────────────────────────────────────
  const taxableIncome = Math.max(0, netIncome)

  // ── Federal tax (Schedule 1) ───────────────────────────────────────────
  const federalTaxBeforeCredits = calcBracketTax(taxableIncome, fed.brackets)

  // ── CPP employee contribution ──────────────────────────────────────────
  const pensionableEarnings = inputs.employment + inputs.selfEmployment
  const cppPensionableIncome = Math.max(0,
    Math.min(pensionableEarnings, fed.cpp.maxPensionableEarnings) - fed.cpp.exemption
  )
  const cppEmployee = Math.min(cppPensionableIncome * fed.cpp.employeeRate, fed.cpp.maxContrib)

  // ── CPP2 employee contribution ─────────────────────────────────────────
  let cpp2Employee = 0
  if (pensionableEarnings > fed.cpp2.additionalWage) {
    // CPP2 applies on earnings between the first ceiling and second ceiling
    // The second ceiling = additionalWage + (additionalWage - maxPensionableEarnings) roughly
    // For 2025: additionalWage = 73200, rate = 4%, maxContrib = 396
    const cpp2Pensionable = pensionableEarnings - fed.cpp2.additionalWage
    cpp2Employee = Math.min(cpp2Pensionable * fed.cpp2.employeeRate, fed.cpp2.maxContrib)
  }

  // ── EI premium ─────────────────────────────────────────────────────────
  const insEarnings = Math.min(inputs.employment, fed.ei.maxInsEarnings)
  const eiPremium = Math.min(insEarnings * fed.ei.employeeRate, fed.ei.maxPremium)

  // ── Federal non-refundable credits ─────────────────────────────────────
  const lowestRate = fed.brackets[0].rate // 15%

  // Basic Personal Amount
  const bpaCredit = fed.bpa * lowestRate

  // Age amount credit (if age >= 65, clawed back at higher incomes)
  let ageCredit = 0
  if (inputs.age !== undefined && inputs.age >= 65) {
    // Age amount reduced by 15% of net income exceeding threshold (~$44,325 for 2025)
    // Simplified: use full ageAmount for now (clawback would need threshold data)
    ageCredit = fed.ageAmount * lowestRate
  }

  // CPP contribution credit
  const cppCredit = cppEmployee * lowestRate

  // EI premium credit
  const eiCredit = eiPremium * lowestRate

  // Dividend tax credits (federal)
  const eligibleDivTaxCredit = grossedUpEligibleDiv * fed.dividendTaxCredit.eligible
  const nonEligibleDivTaxCredit = grossedUpNonEligibleDiv * fed.dividendTaxCredit.nonEligible

  const federalCredits =
    bpaCredit +
    ageCredit +
    cppCredit +
    eiCredit +
    eligibleDivTaxCredit +
    nonEligibleDivTaxCredit

  // ── Net federal tax ────────────────────────────────────────────────────
  const federalTax = Math.max(0, federalTaxBeforeCredits - federalCredits)

  // ── Marginal rate ──────────────────────────────────────────────────────
  const federalMarginalRate = marginalRate(taxableIncome, fed.brackets)

  return {
    grossIncome: totalIncome,
    grossedUpEligibleDiv,
    grossedUpNonEligibleDiv,
    taxableCapitalGains,
    totalIncome,
    totalDeductions,
    netIncome,
    taxableIncome,
    federalTaxBeforeCredits,
    federalCredits,
    federalTax,
    cppEmployee,
    cpp2Employee,
    eiPremium,
    federalMarginalRate,
  }
}
