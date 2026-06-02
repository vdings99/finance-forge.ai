// ── ProvinceRatePage — Preact Island ─────────────────────────────────────────
// Main interactive component for a province's combined Rates & Brackets page.
// Receives all multi-year personal and corporate data as props; manages its
// own year selection state so the whole page reacts to the year picker.

import { useState } from 'preact/hooks'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Bracket {
  max: number | null
  other: number
  capGains: number
  eligDiv: number
  nonEligDiv: number
}

interface CorpYearData {
  generalRate: number       // combined fed + prov general rate, e.g. 26.5
  smallBusinessRate: number // combined fed + prov SB/CCPC rate, e.g. 12.2
  smallBusinessLimit: number // CCPC active business income limit, e.g. 500000
}

interface Props {
  provinceName: string
  provinceCode: string
  yearData: { [year: number]: { brackets: Bracket[]; note?: string } }
  corpData: { [year: number]: CorpYearData }
  availableYears: number[]
  defaultYear?: number
}

// ── Constants ─────────────────────────────────────────────────────────────────

// 2023 data is not yet available; treat it as a "coming soon" year.
const COMING_SOON_YEARS = new Set([2023])

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtIncome(n: number): string {
  return '$' + n.toLocaleString('en-CA')
}

function fmtRate(r: number): string {
  // Preserve meaningful decimals, strip trailing zeros, always show sign if negative.
  const fixed = r.toFixed(2).replace(/\.?0+$/, '')
  return fixed + '%'
}

function fmtRateSigned(r: number): string {
  if (r === 0) return '—'
  const fixed = Math.abs(r).toFixed(2).replace(/\.?0+$/, '')
  return (r > 0 ? '+' : '−') + fixed + '%'
}

function rangeLabel(i: number, brackets: Bracket[]): string {
  const b = brackets[i]
  const prev = brackets[i - 1]
  const min = prev ? prev.max! : 0
  if (b.max === null) return `Over ${fmtIncome(min)}`
  if (i === 0) return `Up to ${fmtIncome(b.max)}`
  return `${fmtIncome(min)} – ${fmtIncome(b.max)}`
}

// Integrated rate: corp pays corp tax, distributes remainder as dividend.
// integrated = corpRate + (1 - corpRate/100) * divRate/100, expressed as %.
function integratedRate(corpRate: number, divRate: number): number {
  return corpRate + (1 - corpRate / 100) * divRate
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface YearTabsProps {
  years: number[]
  active: number
  onSelect: (y: number) => void
}

function YearTabs({ years, active, onSelect }: YearTabsProps) {
  return (
    <nav className="prp__year-tabs" aria-label="Select tax year">
      {years.map(y => {
        const comingSoon = COMING_SOON_YEARS.has(y)
        const isActive = y === active
        return (
          <button
            key={y}
            type="button"
            className={[
              'prp__year-tab',
              isActive && 'prp__year-tab--active',
              comingSoon && 'prp__year-tab--coming-soon',
            ].filter(Boolean).join(' ')}
            aria-pressed={isActive}
            disabled={comingSoon}
            onClick={() => !comingSoon && onSelect(y)}
          >
            {comingSoon ? `${y} — coming soon` : y}
          </button>
        )
      })}
    </nav>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ProvinceRatePage({
  provinceName,
  provinceCode,
  yearData,
  corpData,
  availableYears,
  defaultYear,
}: Props) {
  // Default to the most recent non-coming-soon year if not specified.
  const firstActive =
    defaultYear ??
    [...availableYears].reverse().find(y => !COMING_SOON_YEARS.has(y)) ??
    availableYears[availableYears.length - 1]

  const [year, setYear] = useState(firstActive)

  const personal = yearData[year]
  const corp = corpData[year]

  const brackets = personal?.brackets ?? []
  const topBracket = brackets[brackets.length - 1]

  // ── Integrated rate calculations ──────────────────────────────────────────
  const salaryRate = topBracket ? topBracket.other : 0

  const genCorpRate = corp?.generalRate ?? 0
  const sbCorpRate = corp?.smallBusinessRate ?? 0
  const topEligDiv = topBracket ? topBracket.eligDiv : 0
  const topNonEligDiv = topBracket ? topBracket.nonEligDiv : 0

  const intGenElig = integratedRate(genCorpRate, topEligDiv)
  const intSbNonElig = integratedRate(sbCorpRate, topNonEligDiv)

  const diffGenElig = intGenElig - salaryRate
  const diffSbNonElig = intSbNonElig - salaryRate

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="prp">

      {/* ── Year picker ───────────────────────────────────────────────────── */}
      <YearTabs years={availableYears} active={year} onSelect={setYear} />

      {/* ── Page heading ──────────────────────────────────────────────────── */}
      <div className="prp__heading-row">
        <h1 className="prp__province-name">{provinceName}</h1>
        <span className="prp__year-badge">{year} Tax Rates</span>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          Section 1 — Personal Income Tax
      ════════════════════════════════════════════════════════════════════ */}
      <section className="prp__section" aria-labelledby="prp-personal-heading">
        <h2 id="prp-personal-heading" className="prp__section-heading">
          Personal Income Tax — Combined Federal + Provincial
        </h2>

        {brackets.length > 0 ? (
          <>
            {/* Top-rates summary strip */}
            <div className="mrt__top-strip prp__top-strip">
              <span className="mrt__top-label">Top marginal rates — {year}</span>
              <div className="mrt__top-rates">
                <span className="mrt__top-rate mrt__top-rate--other">
                  <span className="mrt__dot mrt__dot--other" />
                  Other income <strong>{fmtRate(topBracket.other)}</strong>
                </span>
                <span className="mrt__top-rate mrt__top-rate--capgains">
                  <span className="mrt__dot mrt__dot--capgains" />
                  Capital gains <strong>{fmtRate(topBracket.capGains)}</strong>
                </span>
                <span className="mrt__top-rate mrt__top-rate--elig">
                  <span className="mrt__dot mrt__dot--elig" />
                  Elig. dividends <strong>{fmtRate(topBracket.eligDiv)}</strong>
                </span>
                <span className="mrt__top-rate mrt__top-rate--nonelig">
                  <span className="mrt__dot mrt__dot--nonelig" />
                  Non-elig. dividends <strong>{fmtRate(topBracket.nonEligDiv)}</strong>
                </span>
              </div>
            </div>

            {/* Full marginal bracket table */}
            <div className="table-scroll">
              <table className="data-table mrt__table">
                <thead>
                  <tr>
                    <th>Income Range</th>
                    <th className="num mrt__th--other">
                      <span className="mrt__dot mrt__dot--other" /> Other Income
                    </th>
                    <th className="num mrt__th--capgains">
                      <span className="mrt__dot mrt__dot--capgains" /> Capital Gains
                    </th>
                    <th className="num mrt__th--elig">
                      <span className="mrt__dot mrt__dot--elig" /> Eligible Dividends
                    </th>
                    <th className="num mrt__th--nonelig">
                      <span className="mrt__dot mrt__dot--nonelig" /> Non-Elig. Dividends
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {brackets.map((b, i) => {
                    const isTop = b.max === null
                    return (
                      <tr key={i} className={isTop ? 'mrt__row--top' : ''}>
                        <td className="mrt__cell--range">{rangeLabel(i, brackets)}</td>
                        <td className="num">{fmtRate(b.other)}</td>
                        <td className="num">{fmtRate(b.capGains)}</td>
                        <td className={`num ${b.eligDiv < 0 ? 'mrt__cell--negative' : ''}`}>
                          {fmtRate(b.eligDiv)}
                        </td>
                        <td className="num">{fmtRate(b.nonEligDiv)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {personal.note && (
              <p className="mrt__note">{personal.note}</p>
            )}
          </>
        ) : (
          <p className="prp__no-data">Personal tax bracket data for {year} is not yet available.</p>
        )}
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          Section 2 — Corporate Income Tax
      ════════════════════════════════════════════════════════════════════ */}
      <section className="prp__section" aria-labelledby="prp-corporate-heading">
        <h2 id="prp-corporate-heading" className="prp__section-heading">
          Corporate Income Tax
        </h2>

        {corp ? (
          <div className="prp__rate-cards">
            <div className="prp__rate-card">
              <span className="prp__rate-card-label">General Rate</span>
              <span className="prp__rate-card-value">{fmtRate(corp.generalRate)}</span>
              <span className="prp__rate-card-sub">Combined fed + prov</span>
            </div>
            <div className="prp__rate-card">
              <span className="prp__rate-card-label">Small Business Rate</span>
              <span className="prp__rate-card-value">{fmtRate(corp.smallBusinessRate)}</span>
              <span className="prp__rate-card-sub">CCPC active business income</span>
            </div>
            <div className="prp__rate-card">
              <span className="prp__rate-card-label">Business Limit</span>
              <span className="prp__rate-card-value">{fmtIncome(corp.smallBusinessLimit)}</span>
              <span className="prp__rate-card-sub">SB rate applies up to this limit</span>
            </div>
          </div>
        ) : (
          <p className="prp__no-data">Corporate tax data for {year} is not yet available.</p>
        )}
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          Section 3 — Integrated Rates
      ════════════════════════════════════════════════════════════════════ */}
      <section className="prp__section" aria-labelledby="prp-integrated-heading">
        <h2 id="prp-integrated-heading" className="prp__section-heading">
          Integrated Rates — Corporate + Personal
        </h2>

        {corp && topBracket ? (
          <>
            <p className="prp__integrated-intro">
              Integration analysis shows the total tax cost when income flows through a corporation
              and is then distributed to a top-bracket individual shareholder, compared with
              earning the same income directly as salary.
            </p>
            <div className="table-scroll">
              <table className="data-table prp__integrated-table">
                <thead>
                  <tr>
                    <th>Route</th>
                    <th className="num">Corp Rate</th>
                    <th className="num">Top Personal Rate</th>
                    <th className="num">Combined Integrated Rate</th>
                    <th className="num prp__th--diff">vs. Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Row 1 — Salary baseline */}
                  <tr>
                    <td className="prp__route-label">
                      <strong>Salary / Direct</strong>
                      <span className="prp__route-sub">Baseline</span>
                    </td>
                    <td className="num prp__cell--neutral">—</td>
                    <td className="num">{fmtRate(salaryRate)}</td>
                    <td className="num"><strong>{fmtRate(salaryRate)}</strong></td>
                    <td className="num prp__cell--neutral">—</td>
                  </tr>

                  {/* Row 2 — General corp → eligible dividend */}
                  <tr>
                    <td className="prp__route-label">
                      <strong>Corp (General) → Eligible Dividend</strong>
                      <span className="prp__route-sub">Public company or CCPC above limit</span>
                    </td>
                    <td className="num">{fmtRate(genCorpRate)}</td>
                    <td className={`num ${topEligDiv < 0 ? 'mrt__cell--negative' : ''}`}>
                      {fmtRate(topEligDiv)}
                    </td>
                    <td className="num"><strong>{fmtRate(intGenElig)}</strong></td>
                    <td className={`num ${diffGenElig < 0 ? 'prp__cell--cheaper' : 'prp__cell--costlier'}`}>
                      {fmtRateSigned(diffGenElig)}
                    </td>
                  </tr>

                  {/* Row 3 — CCPC/SB → non-eligible dividend */}
                  <tr>
                    <td className="prp__route-label">
                      <strong>Corp (CCPC/SB) → Non-Eligible Dividend</strong>
                      <span className="prp__route-sub">CCPC within small-business limit</span>
                    </td>
                    <td className="num">{fmtRate(sbCorpRate)}</td>
                    <td className="num">{fmtRate(topNonEligDiv)}</td>
                    <td className="num"><strong>{fmtRate(intSbNonElig)}</strong></td>
                    <td className={`num ${diffSbNonElig < 0 ? 'prp__cell--cheaper' : 'prp__cell--costlier'}`}>
                      {fmtRateSigned(diffSbNonElig)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="prp__no-data">Integrated rate data for {year} requires both personal and corporate rate data.</p>
        )}
      </section>

      {/* ── Notes / Disclaimer ────────────────────────────────────────────────── */}
      <div className="mrt__legend prp__notes">
        <p className="mrt__legend-text">
          All rates are <strong>% of actual amount received</strong>: dividend rates apply to
          the actual dividend (not the grossed-up taxable amount) and capital gains rates apply
          to the total gain (not the 50% taxable inclusion). A negative eligible dividend rate
          means the dividend tax credit exceeds the gross-up, resulting in a net tax refund on
          that income. Corporate rates shown are combined federal and {provinceName} provincial
          rates and may differ from federal-only figures. The integration analysis compares
          routes for a top-bracket individual shareholder and is an approximation only; actual
          results depend on individual circumstances.
        </p>
      </div>

    </div>
  )
}
