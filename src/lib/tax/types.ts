// ── Tax engine types ─────────────────────────────────────────────────────────

export type ProvinceCode =
  | 'AB' | 'BC' | 'MB' | 'NB' | 'NL' | 'NS'
  | 'NT' | 'NU' | 'ON' | 'PE' | 'SK' | 'YT'

export const PROVINCE_NAMES: Record<ProvinceCode, string> = {
  AB: 'Alberta',
  BC: 'British Columbia',
  MB: 'Manitoba',
  NB: 'New Brunswick',
  NL: 'Newfoundland & Labrador',
  NS: 'Nova Scotia',
  NT: 'Northwest Territories',
  NU: 'Nunavut',
  ON: 'Ontario',
  PE: 'Prince Edward Island',
  SK: 'Saskatchewan',
  YT: 'Yukon',
}

export const PROVINCE_CODES: ProvinceCode[] = Object.keys(PROVINCE_NAMES) as ProvinceCode[]

export interface TaxBracket {
  min: number
  max: number | null
  rate: number
}

export interface SurtaxThreshold {
  threshold: number
  rate: number
}

export interface FederalData {
  year: number
  brackets: TaxBracket[]
  bpa: number
  ageAmount: number
  cpp: {
    employeeRate: number
    maxContrib: number
    exemption: number
    maxPensionableEarnings: number
  }
  cpp2: {
    employeeRate: number
    maxContrib: number
    additionalWage: number
  }
  ei: {
    employeeRate: number
    maxInsEarnings: number
    maxPremium: number
  }
  dividendGrossUp: {
    eligible: number
    nonEligible: number
  }
  dividendTaxCredit: {
    eligible: number
    nonEligible: number
  }
  capitalGainsInclusion: number
  rrspDeductionLimit: number
  tfsaLimit: number
  verified: boolean
}

export interface ProvincialData {
  province: ProvinceCode
  name: string
  year: number
  brackets: TaxBracket[]
  bpa: number
  surtax: SurtaxThreshold[]
  dividendTaxCredit: {
    eligible: number
    nonEligible: number
  }
  verified: boolean
}

export interface TaxInputs {
  year: number
  province: ProvinceCode
  employment: number
  selfEmployment: number
  pension: number
  oas: number
  cpp: number
  eligibleDividends: number
  nonEligibleDividends: number
  capitalGains: number
  otherIncome: number
  rrspWithdrawal: number
  rrspDeduction: number
  childCare: number
  interestExpense: number
  otherDeductions: number
  age?: number
}

export interface LineItem {
  label: string
  amount: number
  indent?: boolean
}

export interface TaxResult {
  grossIncome: number
  netIncome: number
  taxableIncome: number
  federalTaxBeforeCredits: number
  federalCredits: number
  federalTax: number
  provincialTaxBeforeCredits: number
  provincialCredits: number
  surtax: number
  provincialTax: number
  cppEmployee: number
  cpp2Employee: number
  eiPremium: number
  totalPayroll: number
  totalTax: number
  afterTaxIncome: number
  averageRate: number
  marginalRate: number
  rrspTaxSavings: number
  lineByLine: LineItem[]
  verified: boolean
}
