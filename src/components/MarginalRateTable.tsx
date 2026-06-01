// ── Marginal Rate Table — Preact Island ──────────────────────────────────────
// Renders combined federal+provincial marginal tax rate tables by province.
// Data is passed in from the Astro island wrapper at build time.
// To update annually: edit src/data/tax/combined-marginal-YYYY.json.

import { useState } from 'preact/hooks'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Bracket {
  max: number | null
  other: number
  capGains: number
  eligDiv: number
  nonEligDiv: number
}

interface Province {
  code: string
  name: string
  note?: string
  brackets: Bracket[]
}

interface CombinedRatesData {
  year: number
  provinces: Province[]
}

interface Props {
  data: CombinedRatesData
  defaultProvince?: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtIncome(n: number): string {
  return '$' + n.toLocaleString('en-CA')
}

function fmtRate(r: number): string {
  const s = r.toFixed(2).replace(/\.?0+$/, '')
  return r < 0 ? s + '%' : s + '%'
}

function rangeLabel(i: number, brackets: Bracket[]): string {
  const b = brackets[i]
  const prev = brackets[i - 1]
  const min = prev ? prev.max! : 0
  if (b.max === null) return `Over ${fmtIncome(min)}`
  if (i === 0) return `Up to ${fmtIncome(b.max)}`
  return `${fmtIncome(min)} – ${fmtIncome(b.max)}`
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MarginalRateTable({ data, defaultProvince = 'ON' }: Props) {
  const [selected, setSelected] = useState(defaultProvince)

  const province = data.provinces.find(p => p.code === selected) ?? data.provinces[0]

  const topRates = province.brackets[province.brackets.length - 1]

  return (
    <div class="mrt">
      {/* Controls */}
      <div class="mrt__controls">
        <label class="mrt__label" for="mrt-province-select">
          Province / Territory
        </label>
        <select
          id="mrt-province-select"
          class="mrt__select"
          value={selected}
          onChange={(e) => setSelected((e.target as HTMLSelectElement).value)}
        >
          {data.provinces.map(p => (
            <option key={p.code} value={p.code}>{p.name}</option>
          ))}
        </select>
        <span class="mrt__year-badge">{data.year}</span>
      </div>

      {/* Top rates summary strip */}
      <div class="mrt__top-strip">
        <span class="mrt__top-label">Top marginal rates</span>
        <div class="mrt__top-rates">
          <span class="mrt__top-rate mrt__top-rate--other">
            <span class="mrt__dot mrt__dot--other" />
            Other income <strong>{fmtRate(topRates.other)}</strong>
          </span>
          <span class="mrt__top-rate mrt__top-rate--capgains">
            <span class="mrt__dot mrt__dot--capgains" />
            Capital gains <strong>{fmtRate(topRates.capGains)}</strong>
          </span>
          <span class="mrt__top-rate mrt__top-rate--elig">
            <span class="mrt__dot mrt__dot--elig" />
            Elig. dividends <strong>{fmtRate(topRates.eligDiv)}</strong>
          </span>
          <span class="mrt__top-rate mrt__top-rate--nonelig">
            <span class="mrt__dot mrt__dot--nonelig" />
            Non-elig. dividends <strong>{fmtRate(topRates.nonEligDiv)}</strong>
          </span>
        </div>
      </div>

      {/* Main table */}
      <div class="table-scroll">
        <table class="data-table mrt__table">
          <thead>
            <tr>
              <th>Taxable Income</th>
              <th class="num mrt__th--other">
                <span class="mrt__dot mrt__dot--other" /> Other Income
              </th>
              <th class="num mrt__th--capgains">
                <span class="mrt__dot mrt__dot--capgains" /> Capital Gains
              </th>
              <th class="num mrt__th--elig">
                <span class="mrt__dot mrt__dot--elig" /> Eligible Dividends
              </th>
              <th class="num mrt__th--nonelig">
                <span class="mrt__dot mrt__dot--nonelig" /> Non-Elig. Dividends
              </th>
            </tr>
          </thead>
          <tbody>
            {province.brackets.map((b, i) => {
              const isTop = b.max === null
              return (
                <tr key={i} class={isTop ? 'mrt__row--top' : ''}>
                  <td class="mrt__cell--range">{rangeLabel(i, province.brackets)}</td>
                  <td class="num">{fmtRate(b.other)}</td>
                  <td class="num">{fmtRate(b.capGains)}</td>
                  <td class={`num ${b.eligDiv < 0 ? 'mrt__cell--negative' : ''}`}>
                    {fmtRate(b.eligDiv)}
                  </td>
                  <td class="num">{fmtRate(b.nonEligDiv)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Note */}
      {province.note && (
        <p class="mrt__note">{province.note}</p>
      )}

      {/* Legend */}
      <div class="mrt__legend">
        <p class="mrt__legend-text">
          All rates are <strong>% of actual amount received</strong>: dividend rates apply to actual dividends
          (not the grossed-up taxable amount), and capital gains rates apply to the total gain
          (not the 50% taxable inclusion). A negative eligible dividend rate means the dividend tax
          credit exceeds the gross-up, resulting in a net tax refund on that income.
        </p>
      </div>
    </div>
  )
}
