// ── Detailed Tax Calculator — Preact Island ──────────────────────────────────

import { useState, useCallback } from 'preact/hooks'
import type { TaxInputs, TaxResult } from '../lib/tax/types'
import { PROVINCE_NAMES, PROVINCE_CODES } from '../lib/tax/types'
import type { ProvinceCode } from '../lib/tax/types'
import { calculateTax } from '../lib/tax/engine'

// ── Currency formatter ───────────────────────────────────────────────────────

function fmtCurrency(n: number): string {
  return n.toLocaleString('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function fmtPct(n: number): string {
  return (n * 100).toFixed(1) + '%'
}

// ── Component ────────────────────────────────────────────────────────────────

export default function DetailedTaxCalc() {
  // ── Form state ─────────────────────────────────────────────────────────
  const [year, setYear] = useState(2025)
  const [province, setProvince] = useState<ProvinceCode>('ON')
  const [employment, setEmployment] = useState(0)
  const [selfEmployment, setSelfEmployment] = useState(0)
  const [pension, setPension] = useState(0)
  const [oas, setOas] = useState(0)
  const [cppBenefits, setCppBenefits] = useState(0)
  const [eligibleDividends, setEligibleDividends] = useState(0)
  const [nonEligibleDividends, setNonEligibleDividends] = useState(0)
  const [capitalGains, setCapitalGains] = useState(0)
  const [otherIncome, setOtherIncome] = useState(0)
  const [rrspWithdrawal, setRrspWithdrawal] = useState(0)
  const [rrspDeduction, setRrspDeduction] = useState(0)
  const [childCare, setChildCare] = useState(0)
  const [interestExpense, setInterestExpense] = useState(0)
  const [otherDeductions, setOtherDeductions] = useState(0)
  const [age65Plus, setAge65Plus] = useState(false)

  // ── Calculation state ──────────────────────────────────────────────────
  const [result, setResult] = useState<TaxResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Handler ────────────────────────────────────────────────────────────
  const handleCalculate = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const inputs: TaxInputs = {
        year,
        province,
        employment,
        selfEmployment,
        pension,
        oas,
        cpp: cppBenefits,
        eligibleDividends,
        nonEligibleDividends,
        capitalGains,
        otherIncome,
        rrspWithdrawal,
        rrspDeduction,
        childCare,
        interestExpense,
        otherDeductions,
        age: age65Plus ? 65 : undefined,
      }

      const taxResult = await calculateTax(inputs)
      setResult(taxResult)
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'An unexpected error occurred. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }, [
    year, province, employment, selfEmployment, pension, oas,
    cppBenefits, eligibleDividends, nonEligibleDividends,
    capitalGains, otherIncome, rrspWithdrawal, rrspDeduction,
    childCare, interestExpense, otherDeductions, age65Plus,
  ])

  // ── Number input helper ────────────────────────────────────────────────
  const numInput = (
    id: string,
    label: string,
    value: number,
    setter: (v: number) => void,
  ) => (
    <div class="calc-field">
      <label class="calc-field__label" for={id}>{label}</label>
      <input
        class="calc-field__input"
        type="number"
        id={id}
        value={value || ''}
        min={0}
        step={100}
        onInput={(e) => setter(Number((e.target as HTMLInputElement).value) || 0)}
        placeholder="0"
      />
    </div>
  )

  return (
    <div class="calc-detailed">
      {/* ── Inputs ──────────────────────────────────────────────────────── */}
      <div class="calc-detailed__inputs">
        <div class="calc-detailed__group">
          <p class="calc-detailed__group-label">Tax Year &amp; Province</p>

          <div class="calc-field">
            <label class="calc-field__label" for="calc-year">Tax Year</label>
            <select
              class="calc-field__select"
              id="calc-year"
              value={year}
              onChange={(e) => setYear(Number((e.target as HTMLSelectElement).value))}
            >
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
            </select>
          </div>

          <div class="calc-field">
            <label class="calc-field__label" for="calc-province">Province / Territory</label>
            <select
              class="calc-field__select"
              id="calc-province"
              value={province}
              onChange={(e) => setProvince((e.target as HTMLSelectElement).value as ProvinceCode)}
            >
              {PROVINCE_CODES.map((code) => (
                <option key={code} value={code}>
                  {PROVINCE_NAMES[code]} ({code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div class="calc-detailed__group">
          <p class="calc-detailed__group-label">Income</p>
          {numInput('calc-employment', 'Employment Income', employment, setEmployment)}
          {numInput('calc-self-employment', 'Self-Employment Income', selfEmployment, setSelfEmployment)}
          {numInput('calc-pension', 'Pension Income', pension, setPension)}
          {numInput('calc-oas', 'OAS Benefits', oas, setOas)}
          {numInput('calc-cpp-benefits', 'CPP/QPP Benefits', cppBenefits, setCppBenefits)}
          {numInput('calc-eligible-div', 'Eligible Dividends', eligibleDividends, setEligibleDividends)}
          {numInput('calc-non-eligible-div', 'Non-Eligible Dividends', nonEligibleDividends, setNonEligibleDividends)}
          {numInput('calc-cap-gains', 'Capital Gains', capitalGains, setCapitalGains)}
          {numInput('calc-other-income', 'Other Income', otherIncome, setOtherIncome)}
          {numInput('calc-rrsp-withdrawal', 'RRSP Withdrawal', rrspWithdrawal, setRrspWithdrawal)}
        </div>

        <div class="calc-detailed__group">
          <p class="calc-detailed__group-label">Deductions</p>
          {numInput('calc-rrsp', 'RRSP Deduction', rrspDeduction, setRrspDeduction)}
          {numInput('calc-childcare', 'Child Care Expenses', childCare, setChildCare)}
          {numInput('calc-interest', 'Interest Expense', interestExpense, setInterestExpense)}
          {numInput('calc-other-ded', 'Other Deductions', otherDeductions, setOtherDeductions)}
        </div>

        <div class="calc-detailed__group">
          <p class="calc-detailed__group-label">Credits</p>
          <div class="calc-field">
            <label class="calc-field__label calc-field__label--inline" for="calc-age65">
              <input
                type="checkbox"
                id="calc-age65"
                checked={age65Plus}
                onChange={(e) => setAge65Plus((e.target as HTMLInputElement).checked)}
              />
              Age 65 or older (age amount credit)
            </label>
          </div>
        </div>

        <button
          class="calc-detailed__btn"
          type="button"
          onClick={handleCalculate}
          disabled={loading}
        >
          {loading ? 'Calculating…' : 'Calculate'}
        </button>
      </div>

      {/* ── Results ─────────────────────────────────────────────────────── */}
      {error && (
        <div class="calc-detailed__error" role="alert">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      {result && !error && (
        <div class="calc-detailed__results">
          {!result.verified && (
            <span class="calc-detailed__badge">Preliminary estimate</span>
          )}

          <p class="calc-detailed__results-heading">
            {year} Tax Estimate — {PROVINCE_NAMES[province]}
          </p>

          {/* ── Summary row ───────────────────────────────────────────── */}
          <div class="calc-detailed__summary">
            <div class="calc-detailed__summary-item">
              <span class="calc-detailed__summary-label">Total Tax</span>
              <span class="calc-detailed__summary-value">{fmtCurrency(result.totalTax)}</span>
            </div>
            <div class="calc-detailed__summary-item">
              <span class="calc-detailed__summary-label">After-Tax Income</span>
              <span class="calc-detailed__summary-value">{fmtCurrency(result.afterTaxIncome)}</span>
            </div>
            <div class="calc-detailed__summary-item">
              <span class="calc-detailed__summary-label">Average Rate</span>
              <span class="calc-detailed__summary-value calc-detailed__summary-value--accent">
                {fmtPct(result.averageRate)}
              </span>
            </div>
            <div class="calc-detailed__summary-item">
              <span class="calc-detailed__summary-label">Marginal Rate</span>
              <span class="calc-detailed__summary-value">{fmtPct(result.marginalRate)}</span>
            </div>
            <div class="calc-detailed__summary-item">
              <span class="calc-detailed__summary-label">RRSP Tax Savings</span>
              <span class="calc-detailed__summary-value">{fmtCurrency(result.rrspTaxSavings)}</span>
            </div>
          </div>

          {/* ── Line-by-line breakdown ─────────────────────────────────── */}
          <div class="calc-detailed__breakdown">
            <p class="calc-detailed__breakdown-heading">Detailed Breakdown</p>
            <div class="calc-detailed__table" role="table" aria-label="Tax breakdown">
              {result.lineByLine.map((line, i) => {
                const isSection = !line.indent && line.amount === 0
                return (
                  <div
                    key={i}
                    class={
                      isSection
                        ? 'calc-detailed__row calc-detailed__row--section'
                        : line.indent
                          ? 'calc-detailed__row calc-detailed__row--indent'
                          : 'calc-detailed__row calc-detailed__row--total'
                    }
                    role="row"
                  >
                    <span class="calc-detailed__row-label" role="cell">{line.label}</span>
                    {!isSection && (
                      <span class="calc-detailed__row-amount" role="cell">
                        {fmtCurrency(line.amount)}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <p class="calc-detailed__updated">
            Tax year {year} · Updated {new Date().toLocaleDateString('en-CA')}
          </p>
        </div>
      )}

      {/* ── Privacy note ──────────────────────────────────────────────── */}
      <p class="calc-detailed__privacy">
        All calculations are performed in your browser. No data is sent to any server.
      </p>
    </div>
  )
}
