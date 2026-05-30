// ── Provincial tax calculation ───────────────────────────────────────────────

import type { ProvincialData } from './types'
import { calcBracketTax, marginalRate } from './brackets'

export interface ProvincialResult {
  provincialTaxBeforeCredits: number
  provincialCredits: number
  surtax: number
  provincialTax: number
  provincialMarginalRate: number
}

/**
 * Compute provincial/territorial income tax including surtax and credits.
 *
 * @param taxableIncome - taxable income after deductions
 * @param grossedUpEligibleDiv - grossed-up eligible dividend amount
 * @param grossedUpNonEligibleDiv - grossed-up non-eligible dividend amount
 * @param prov - provincial data (brackets, BPA, surtax thresholds, dividend credits)
 */
export function calcProvincial(
  taxableIncome: number,
  grossedUpEligibleDiv: number,
  grossedUpNonEligibleDiv: number,
  prov: ProvincialData,
): ProvincialResult {
  // ── Provincial bracket tax ─────────────────────────────────────────────
  const provincialTaxBeforeCredits = calcBracketTax(taxableIncome, prov.brackets)

  // ── Provincial non-refundable credits ──────────────────────────────────
  const lowestRate = prov.brackets[0]?.rate ?? 0

  // Basic Personal Amount credit
  const bpaCredit = prov.bpa * lowestRate

  // Provincial dividend tax credits
  const eligibleDivCredit = grossedUpEligibleDiv * prov.dividendTaxCredit.eligible
  const nonEligibleDivCredit = grossedUpNonEligibleDiv * prov.dividendTaxCredit.nonEligible

  const provincialCredits = bpaCredit + eligibleDivCredit + nonEligibleDivCredit

  // ── Net provincial tax before surtax ───────────────────────────────────
  const netProvBeforeSurtax = Math.max(0, provincialTaxBeforeCredits - provincialCredits)

  // ── Surtax (Ontario, PEI) ──────────────────────────────────────────────
  let surtax = 0
  for (const s of prov.surtax) {
    if (netProvBeforeSurtax > s.threshold) {
      surtax += (netProvBeforeSurtax - s.threshold) * s.rate
    }
  }

  // ── Total provincial tax ───────────────────────────────────────────────
  const provincialTax = netProvBeforeSurtax + surtax

  // ── Marginal rate ──────────────────────────────────────────────────────
  const provincialMarginalRate = marginalRate(taxableIncome, prov.brackets)

  return {
    provincialTaxBeforeCredits,
    provincialCredits,
    surtax,
    provincialTax,
    provincialMarginalRate,
  }
}
