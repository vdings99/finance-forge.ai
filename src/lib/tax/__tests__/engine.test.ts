import { describe, it, expect } from 'vitest'
import { calculateTaxWithData } from '../engine'
import { calcBracketTax, marginalRate } from '../brackets'
import type { FederalData, ProvincialData, TaxInputs } from '../types'

// ── Load JSON data directly for testing ──────────────────────────────────────

import fed2025 from '../../../data/tax/2025/federal.json'
import on2025 from '../../../data/tax/2025/ON.json'
import ab2025 from '../../../data/tax/2025/AB.json'
import bc2025 from '../../../data/tax/2025/BC.json'

// ── Helper: default zero inputs ──────────────────────────────────────────────

function zeroInputs(overrides: Partial<TaxInputs>): TaxInputs {
  return {
    year: 2025,
    province: 'ON',
    employment: 0,
    selfEmployment: 0,
    pension: 0,
    oas: 0,
    cpp: 0,
    eligibleDividends: 0,
    nonEligibleDividends: 0,
    capitalGains: 0,
    otherIncome: 0,
    rrspWithdrawal: 0,
    rrspDeduction: 0,
    childCare: 0,
    interestExpense: 0,
    otherDeductions: 0,
    ...overrides,
  }
}

// ── Bracket helpers ──────────────────────────────────────────────────────────

describe('calcBracketTax', () => {
  it('returns 0 for zero income', () => {
    expect(calcBracketTax(0, fed2025.brackets)).toBe(0)
  })

  it('computes tax within first bracket', () => {
    // $50,000 is entirely within 15% bracket (0–57375)
    expect(calcBracketTax(50000, fed2025.brackets)).toBeCloseTo(50000 * 0.15, 2)
  })

  it('computes tax spanning two brackets', () => {
    // $75,000: first 57375 @ 15% + remainder @ 20.5%
    const expected = 57375 * 0.15 + (75000 - 57375) * 0.205
    expect(calcBracketTax(75000, fed2025.brackets)).toBeCloseTo(expected, 2)
  })
})

describe('marginalRate', () => {
  it('returns lowest rate for income in first bracket', () => {
    expect(marginalRate(30000, fed2025.brackets)).toBe(0.15)
  })

  it('returns correct rate for income in second bracket', () => {
    expect(marginalRate(75000, fed2025.brackets)).toBe(0.205)
  })

  it('returns top rate for very high income', () => {
    expect(marginalRate(500000, fed2025.brackets)).toBe(0.33)
  })
})

// ── Full tax calculation tests ───────────────────────────────────────────────

describe('calculateTaxWithData', () => {
  it('Ontario 2025 — $75,000 employment income', () => {
    const inputs = zeroInputs({
      year: 2025,
      province: 'ON',
      employment: 75000,
    })

    const result = calculateTaxWithData(
      inputs,
      fed2025 as FederalData,
      on2025 as ProvincialData,
    )

    // Net income = $75,000 (no deductions)
    expect(result.netIncome).toBe(75000)
    expect(result.taxableIncome).toBe(75000)

    // Federal bracket tax: 57375×15% + 17625×20.5% = 12219.375
    expect(result.federalTaxBeforeCredits).toBeCloseTo(12219, 0)

    // CPP: min(67800 × 5.95%, 3867.50) = 3867.50
    expect(result.cppEmployee).toBeCloseTo(3867.5, 0)

    // CPP2: (75000 - 73200) × 4% = 72
    expect(result.cpp2Employee).toBeCloseTo(72, 0)

    // EI: min(65700 × 1.666%, 1095.12) = 1094.56
    expect(result.eiPremium).toBeCloseTo(1095, 0)

    // Federal credits: BPA(2419) + CPP(580) + EI(164) ≈ 3164
    expect(result.federalCredits).toBeCloseTo(3164, 0)

    // Net federal tax ≈ 12219 - 3164 = 9056
    expect(result.federalTax).toBeCloseTo(9056, 0)

    // Ontario bracket: 51446×5.05% + 23554×9.15% = 4753
    expect(result.provincialTaxBeforeCredits).toBeCloseTo(4753, 0)

    // Ontario BPA credit: 11865 × 5.05% = 599
    expect(result.provincialCredits).toBeCloseTo(599, 0)

    // No surtax (net prov tax < 5554)
    expect(result.surtax).toBe(0)

    // Net Ontario tax ≈ 4154
    expect(result.provincialTax).toBeCloseTo(4154, 0)

    // Total tax includes payroll
    const expectedTotal = result.federalTax + result.provincialTax + result.totalPayroll
    expect(result.totalTax).toBeCloseTo(expectedTotal, 0)

    // After-tax = gross - total tax
    expect(result.afterTaxIncome).toBeCloseTo(75000 - result.totalTax, 0)

    // Average rate
    expect(result.averageRate).toBeCloseTo(result.totalTax / 75000, 4)

    // Combined marginal rate: 20.5% federal + 9.15% Ontario = 29.65%
    expect(result.marginalRate).toBeCloseTo(0.2965, 4)

    // Verified flag (both federal and Ontario are verified)
    expect(result.verified).toBe(true)

    // Line-by-line breakdown exists
    expect(result.lineByLine.length).toBeGreaterThan(10)

    // RRSP savings should be positive
    expect(result.rrspTaxSavings).toBeGreaterThan(0)
  })

  it('Alberta 2025 — $150,000 employment income', () => {
    const inputs = zeroInputs({
      year: 2025,
      province: 'AB',
      employment: 150000,
    })

    const result = calculateTaxWithData(
      inputs,
      fed2025 as FederalData,
      ab2025 as ProvincialData,
    )

    expect(result.netIncome).toBe(150000)

    // Federal bracket tax: 57375×15% + 57375×20.5% + (150000-114750)×26%
    // = 8606.25 + 11761.875 + 9165 = 29533.125
    expect(result.federalTaxBeforeCredits).toBeCloseTo(29533, 0)

    // CPP max: 3867.50
    expect(result.cppEmployee).toBeCloseTo(3867.5, 0)

    // CPP2: (150000-73200)×4% = 3072, capped at 396
    expect(result.cpp2Employee).toBeCloseTo(396, 0)

    // EI: ~1094.56
    expect(result.eiPremium).toBeCloseTo(1095, 0)

    // Alberta bracket: 148269×10% + (150000-148269)×12% = 14826.9 + 207.72 = 15034.62
    expect(result.provincialTaxBeforeCredits).toBeCloseTo(15035, 0)

    // Alberta BPA: 21848 × 10% = 2184.80
    expect(result.provincialCredits).toBeCloseTo(2185, 0)

    // No surtax in Alberta
    expect(result.surtax).toBe(0)

    // Alberta is not verified
    expect(result.verified).toBe(false)

    // Combined marginal: 26% + 12% = 38%
    expect(result.marginalRate).toBeCloseTo(0.38, 4)
  })

  it('BC 2025 — $40,000 employment income', () => {
    const inputs = zeroInputs({
      year: 2025,
      province: 'BC',
      employment: 40000,
    })

    const result = calculateTaxWithData(
      inputs,
      fed2025 as FederalData,
      bc2025 as ProvincialData,
    )

    expect(result.netIncome).toBe(40000)

    // Federal bracket: 40000 × 15% = 6000
    expect(result.federalTaxBeforeCredits).toBeCloseTo(6000, 0)

    // CPP: (40000-3500) × 5.95% = 2171.75
    expect(result.cppEmployee).toBeCloseTo(2172, 0)

    // No CPP2 (below threshold)
    expect(result.cpp2Employee).toBe(0)

    // EI: 40000 × 1.666% = 666.40
    expect(result.eiPremium).toBeCloseTo(666, 0)

    // BC bracket: 40000 × 5.06% = 2024
    expect(result.provincialTaxBeforeCredits).toBeCloseTo(2024, 0)

    // BC BPA: 12336 × 5.06% = 624.20
    expect(result.provincialCredits).toBeCloseTo(624, 0)

    // No surtax in BC
    expect(result.surtax).toBe(0)

    // BC verified
    expect(result.verified).toBe(true)

    // Marginal: 15% + 5.06% = 20.06%
    expect(result.marginalRate).toBeCloseTo(0.2006, 4)

    // After-tax positive
    expect(result.afterTaxIncome).toBeGreaterThan(0)
  })

  it('handles RRSP deduction correctly', () => {
    const inputs = zeroInputs({
      year: 2025,
      province: 'ON',
      employment: 100000,
      rrspDeduction: 10000,
    })

    const result = calculateTaxWithData(
      inputs,
      fed2025 as FederalData,
      on2025 as ProvincialData,
    )

    // Net income should reflect the deduction
    expect(result.netIncome).toBe(90000)
    expect(result.taxableIncome).toBe(90000)

    // Compare with no RRSP deduction
    const noRRSP = calculateTaxWithData(
      zeroInputs({ year: 2025, province: 'ON', employment: 100000 }),
      fed2025 as FederalData,
      on2025 as ProvincialData,
    )

    // Tax should be lower with RRSP deduction
    expect(result.totalTax).toBeLessThan(noRRSP.totalTax)
  })

  it('handles zero income', () => {
    const inputs = zeroInputs({ year: 2025, province: 'ON' })

    const result = calculateTaxWithData(
      inputs,
      fed2025 as FederalData,
      on2025 as ProvincialData,
    )

    expect(result.grossIncome).toBe(0)
    expect(result.netIncome).toBe(0)
    expect(result.federalTax).toBe(0)
    expect(result.provincialTax).toBe(0)
    expect(result.totalTax).toBe(0)
    expect(result.afterTaxIncome).toBe(0)
    expect(result.averageRate).toBe(0)
  })
})
