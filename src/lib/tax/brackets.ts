// ── Bracket tax helpers ──────────────────────────────────────────────────────

import type { TaxBracket } from './types'

/**
 * Calculate total tax on `income` using a progressive bracket table.
 * Each bracket's `min` is inclusive, `max` is exclusive (null = unbounded).
 */
export function calcBracketTax(income: number, brackets: TaxBracket[]): number {
  if (income <= 0) return 0

  let tax = 0
  for (const b of brackets) {
    if (income <= b.min) break
    const upper = b.max !== null ? Math.min(income, b.max) : income
    tax += (upper - b.min) * b.rate
  }
  return tax
}

/**
 * Return the marginal tax rate for a given income level.
 * Falls back to the highest bracket rate if income exceeds all brackets.
 */
export function marginalRate(income: number, brackets: TaxBracket[]): number {
  if (income <= 0 || brackets.length === 0) return 0

  for (let i = brackets.length - 1; i >= 0; i--) {
    if (income > brackets[i].min) return brackets[i].rate
  }
  return brackets[0].rate
}
