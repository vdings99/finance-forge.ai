---
title: "Statistics & Other Information"
description: "Where the figures on finance-forge.ai come from — official Canadian statistical and tax data sources."
breadcrumb: ["Home"]
section: "statistics"
archetype: "utility"
revised: "2026-05-30"
toc: false
---

The figures published on finance-forge.ai are sourced from the underlying
Canadian statistical and tax authorities, and refreshed on a deliberate annual
cadence (see [our editing guide](/content-use-policy) for details).

## Primary data sources

- **Tax brackets and credit amounts** — Canada Revenue Agency annual indexation
  notices, supplemented by each province's finance ministry.
- **CPP, CPP2, and EI rates** — CRA payroll deduction tables, published each
  November for the following calendar year.
- **Inflation factor** — Statistics Canada Consumer Price Index, all-items,
  October-over-October.
- **Dividend gross-up and credit rates** — *Income Tax Act* references; the
  federal rates are set in statute and provincial rates are set in each
  provincial *Income Tax Act* equivalent.
- **TFSA and RRSP limits** — CRA, indexed annually except where statutorily
  fixed.

## How we publish

Each rate and limit on this site lives in a versioned JSON file under
`src/data/tax/{year}/`. Updating to a new tax year is a single data-file edit;
the calculator and every rate table on the site advance in lockstep. Any
figure that has not yet been confirmed by the relevant authority is flagged
as a "preliminary estimate" on the page where it appears.

## What's coming

The next planned data additions are historical rate tables for prior years
(2004 onward) and a tax-year comparison view. These are content-only additions
and will not affect the current-year calculator or rate pages.
