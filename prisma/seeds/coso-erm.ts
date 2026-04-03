// =============================================================================
// COSO ERM — Banking Operations & Financial Reporting Seed Data
// =============================================================================

import type {
  SeedDomain,
  SeedCategory,
  SeedRisk,
  SeedControl,
  SeedProcedure,
  SeedRiskControlMapping,
  SeedControlProcedureMapping,
} from './cobit2019';

// -----------------------------------------------------------------------------
// Domains
// -----------------------------------------------------------------------------
export const cosoDomains: SeedDomain[] = [
  {
    code: 'FIN',
    name: 'Financial Reporting & Controls',
    framework: 'COSO ERM',
    description:
      'Internal controls over financial reporting for banking operations, including loan loss provisioning, revenue recognition, fair value measurement, and regulatory capital reporting.',
    sortOrder: 1,
  },
  {
    code: 'OPS',
    name: 'Banking Operations',
    framework: 'COSO ERM',
    description:
      'Operational risk management covering treasury operations, payment processing, trade finance, credit administration, and branch operations.',
    sortOrder: 2,
  },
  {
    code: 'COMP',
    name: 'Compliance & Regulatory',
    framework: 'COSO ERM',
    description:
      'Regulatory compliance controls including SBV requirements, Basel capital adequacy, liquidity reporting, related-party transaction limits, and prudential ratio compliance.',
    sortOrder: 3,
  },
  {
    code: 'FRAUD',
    name: 'Fraud & Anti-Money Laundering',
    framework: 'COSO ERM',
    description:
      'Fraud prevention, detection, and anti-money laundering controls including transaction monitoring, KYC/CDD procedures, suspicious activity reporting, and sanctions screening.',
    sortOrder: 4,
  },
];

// -----------------------------------------------------------------------------
// Categories
// -----------------------------------------------------------------------------
export const cosoCategories: SeedCategory[] = [
  // FIN
  {
    domainCode: 'FIN',
    code: 'FIN-01',
    name: 'Loan Loss Provisioning',
    description:
      'Controls over credit classification, provisioning calculation methodology, collective and specific provision adequacy, and IFRS 9 expected credit loss model implementation.',
    sortOrder: 1,
  },
  {
    domainCode: 'FIN',
    code: 'FIN-02',
    name: 'Revenue Recognition',
    description:
      'Controls over interest income accrual, fee and commission recognition, suspension of interest on NPLs, and accurate calculation of effective interest rates.',
    sortOrder: 2,
  },
  {
    domainCode: 'FIN',
    code: 'FIN-03',
    name: 'Financial Reporting & Disclosure',
    description:
      'Financial statement preparation, consolidation, regulatory reporting accuracy, and compliance with Vietnamese Accounting Standards (VAS) and IFRS requirements.',
    sortOrder: 3,
  },
  // OPS
  {
    domainCode: 'OPS',
    code: 'OPS-01',
    name: 'Treasury Operations',
    description:
      'Controls over money market transactions, FX dealing, bond portfolio management, liquidity management, and treasury front-to-back reconciliation.',
    sortOrder: 1,
  },
  {
    domainCode: 'OPS',
    code: 'OPS-02',
    name: 'Payment Processing',
    description:
      'Controls over domestic and international payment processing, SWIFT operations, NAPAS interbank transfers, and payment authorization limits.',
    sortOrder: 2,
  },
  {
    domainCode: 'OPS',
    code: 'OPS-03',
    name: 'Credit Administration',
    description:
      'Controls over loan origination, credit approval workflow, collateral management, disbursement verification, and loan documentation completeness.',
    sortOrder: 3,
  },
  // COMP
  {
    domainCode: 'COMP',
    code: 'COMP-01',
    name: 'Regulatory Compliance',
    description:
      'Compliance monitoring for SBV circulars, banking law requirements, consumer protection regulations, and regulatory reporting submissions.',
    sortOrder: 1,
  },
  {
    domainCode: 'COMP',
    code: 'COMP-02',
    name: 'Basel & Capital Adequacy',
    description:
      'Basel II/III capital adequacy ratio calculation, risk-weighted asset computation, capital buffer management, and ICAAP compliance.',
    sortOrder: 2,
  },
  // FRAUD
  {
    domainCode: 'FRAUD',
    code: 'FRAUD-01',
    name: 'Transaction Monitoring',
    description:
      'Automated and manual transaction monitoring for suspicious activities, unusual patterns, structuring, and high-risk transaction typologies in banking channels.',
    sortOrder: 1,
  },
  {
    domainCode: 'FRAUD',
    code: 'FRAUD-02',
    name: 'KYC & Customer Due Diligence',
    description:
      'Customer identification, verification, risk rating, enhanced due diligence for high-risk customers, PEP screening, and ongoing customer monitoring.',
    sortOrder: 2,
  },
];

// -----------------------------------------------------------------------------
// Risks
// -----------------------------------------------------------------------------
export const cosoRisks: SeedRisk[] = [
  // FIN-01
  {
    categoryCode: 'FIN-01',
    code: 'COSO-R01',
    name: 'Inadequate loan loss provisioning',
    description:
      'Loan classification does not reflect true credit quality due to delayed recognition of borrower deterioration, resulting in understated provisions and overstated profits. Risk is elevated during economic downturns when NPL migration accelerates.',
    riskType: 'financial',
    riskRating: 'critical',
    likelihood: 'possible',
    impact: 'catastrophic',
    frameworkRef: 'COSO-FR-01',
  },
  {
    categoryCode: 'FIN-01',
    code: 'COSO-R02',
    name: 'IFRS 9 ECL model parameter estimation errors',
    description:
      'Probability of default (PD), loss given default (LGD), or exposure at default (EAD) model parameters contain errors or use outdated macroeconomic scenarios, leading to material misstatement of expected credit loss provisions.',
    riskType: 'financial',
    riskRating: 'high',
    likelihood: 'possible',
    impact: 'major',
    frameworkRef: 'COSO-FR-02',
  },
  // FIN-02
  {
    categoryCode: 'FIN-02',
    code: 'COSO-R03',
    name: 'Interest income misstatement on restructured loans',
    description:
      'Interest income continues to accrue on loans that should be placed on non-accrual status, or interest suspension is not applied timely upon classification to substandard or lower, overstating reported revenue.',
    riskType: 'financial',
    riskRating: 'high',
    likelihood: 'likely',
    impact: 'major',
    frameworkRef: 'COSO-FR-03',
  },
  // FIN-03
  {
    categoryCode: 'FIN-03',
    code: 'COSO-R04',
    name: 'Material errors in regulatory financial reports',
    description:
      'Financial data submitted to SBV in monthly/quarterly regulatory reports contains errors due to manual data aggregation, system limitations, or incorrect mapping from general ledger to reporting templates.',
    riskType: 'compliance',
    riskRating: 'high',
    likelihood: 'possible',
    impact: 'major',
    frameworkRef: 'COSO-FR-04',
  },
  // OPS-01
  {
    categoryCode: 'OPS-01',
    code: 'COSO-R05',
    name: 'Unauthorized treasury transactions',
    description:
      'Treasury dealers execute FX, money market, or bond transactions exceeding approved limits or outside approved counterparties, exposing the bank to excessive market risk or counterparty credit risk.',
    riskType: 'operational',
    riskRating: 'critical',
    likelihood: 'unlikely',
    impact: 'catastrophic',
    frameworkRef: 'COSO-OPS-01',
  },
  {
    categoryCode: 'OPS-01',
    code: 'COSO-R06',
    name: 'Liquidity risk from maturity mismatch',
    description:
      'Excessive reliance on short-term wholesale funding to support long-term lending creates liquidity risk. Maturity gap reports are not prepared timely or do not capture off-balance sheet commitments accurately.',
    riskType: 'financial',
    riskRating: 'high',
    likelihood: 'possible',
    impact: 'major',
    frameworkRef: 'COSO-OPS-02',
  },
  // OPS-02
  {
    categoryCode: 'OPS-02',
    code: 'COSO-R07',
    name: 'Unauthorized wire transfers or payment fraud',
    description:
      'Wire transfers or interbank payments are processed without proper dual authorization, or payment instructions are manipulated (BEC fraud targeting SWIFT operations), resulting in direct financial loss.',
    riskType: 'operational',
    riskRating: 'critical',
    likelihood: 'possible',
    impact: 'catastrophic',
    frameworkRef: 'COSO-OPS-03',
  },
  {
    categoryCode: 'OPS-02',
    code: 'COSO-R08',
    name: 'Payment processing errors and reconciliation failures',
    description:
      'Domestic payment (NAPAS) or international payment (SWIFT) processing errors due to incorrect beneficiary details, duplicate payments, or system interface failures. End-of-day reconciliation does not detect discrepancies timely.',
    riskType: 'operational',
    riskRating: 'high',
    likelihood: 'likely',
    impact: 'moderate',
    frameworkRef: 'COSO-OPS-04',
  },
  // OPS-03
  {
    categoryCode: 'OPS-03',
    code: 'COSO-R09',
    name: 'Credit approval bypassing established limits',
    description:
      'Loan officers or branch managers approve credits exceeding their delegated authority, or credit committee procedures are circumvented for connected borrowers, exposing the bank to concentration risk.',
    riskType: 'operational',
    riskRating: 'high',
    likelihood: 'possible',
    impact: 'major',
    frameworkRef: 'COSO-OPS-05',
  },
  {
    categoryCode: 'OPS-03',
    code: 'COSO-R10',
    name: 'Inadequate collateral valuation and monitoring',
    description:
      'Collateral (real estate, machinery, inventory) is overvalued at origination or not revalued periodically, resulting in insufficient loss coverage when borrowers default. Third-party appraisers may have conflicts of interest.',
    riskType: 'financial',
    riskRating: 'high',
    likelihood: 'likely',
    impact: 'major',
    frameworkRef: 'COSO-OPS-06',
  },
  // COMP-01
  {
    categoryCode: 'COMP-01',
    code: 'COSO-R11',
    name: 'Late or inaccurate regulatory report submission',
    description:
      'Mandatory reports to SBV (prudential ratios, large exposure reports, related-party lending reports) are submitted late or contain inaccurate data, resulting in regulatory penalties and increased supervisory scrutiny.',
    riskType: 'compliance',
    riskRating: 'high',
    likelihood: 'possible',
    impact: 'major',
    frameworkRef: 'COSO-COMP-01',
  },
  // COMP-02
  {
    categoryCode: 'COMP-02',
    code: 'COSO-R12',
    name: 'Capital adequacy ratio calculation errors',
    description:
      'Risk-weighted asset calculations contain errors in credit risk weight assignment, operational risk charge computation, or market risk measurement, leading to inaccurate CAR reporting and potential breach of minimum requirements.',
    riskType: 'compliance',
    riskRating: 'critical',
    likelihood: 'unlikely',
    impact: 'catastrophic',
    frameworkRef: 'COSO-COMP-02',
  },
  // FRAUD-01
  {
    categoryCode: 'FRAUD-01',
    code: 'COSO-R13',
    name: 'AML transaction monitoring gaps',
    description:
      'Transaction monitoring system rules do not cover emerging money laundering typologies (trade-based ML, crypto-related flows), or alert thresholds are miscalibrated, allowing suspicious transactions to go undetected.',
    riskType: 'compliance',
    riskRating: 'critical',
    likelihood: 'possible',
    impact: 'catastrophic',
    frameworkRef: 'COSO-FRAUD-01',
  },
  // FRAUD-02
  {
    categoryCode: 'FRAUD-02',
    code: 'COSO-R14',
    name: 'Incomplete KYC for high-risk customers',
    description:
      'Enhanced due diligence is not performed or is insufficient for high-risk customer categories (PEPs, correspondent banking, high-risk jurisdictions), creating exposure to sanctions violations and money laundering facilitation.',
    riskType: 'compliance',
    riskRating: 'critical',
    likelihood: 'possible',
    impact: 'catastrophic',
    frameworkRef: 'COSO-FRAUD-02',
  },
  {
    categoryCode: 'FRAUD-02',
    code: 'COSO-R15',
    name: 'Sanctions screening failures',
    description:
      'Customer and transaction screening against OFAC, UN, and EU sanctions lists contains gaps due to name-matching algorithm limitations, outdated lists, or failure to screen all transaction parties including intermediaries.',
    riskType: 'compliance',
    riskRating: 'critical',
    likelihood: 'unlikely',
    impact: 'catastrophic',
    frameworkRef: 'COSO-FRAUD-03',
  },
];

// -----------------------------------------------------------------------------
// Controls
// -----------------------------------------------------------------------------
export const cosoControls: SeedControl[] = [
  // Loan Loss Provisioning Controls
  {
    code: 'COSO-C01',
    name: 'Monthly loan classification review',
    description:
      'Credit Administration reviews all loans monthly against SBV classification criteria (Circular 02/2013). Overdue status, financial condition, and qualitative factors are assessed. Classification changes require Risk Manager approval.',
    controlType: 'detective',
    controlNature: 'manual',
    frequency: 'monthly',
    frameworkRef: 'COSO-FR-01',
  },
  {
    code: 'COSO-C02',
    name: 'IFRS 9 ECL model validation',
    description:
      'Model Risk Management team validates ECL model parameters (PD, LGD, EAD) semi-annually. Validation includes backtesting against actual defaults, sensitivity analysis on macroeconomic scenarios, and benchmarking against peer banks.',
    controlType: 'detective',
    controlNature: 'manual',
    frequency: 'annually',
    frameworkRef: 'COSO-FR-02',
  },
  {
    code: 'COSO-C03',
    name: 'Quarterly provision adequacy review by CFO',
    description:
      'CFO and Chief Risk Officer jointly review total provision adequacy quarterly, comparing provisions to peer benchmarks, historical loss experience, and forward-looking macroeconomic indicators. Adjustments require Board Risk Committee approval.',
    controlType: 'detective',
    controlNature: 'manual',
    frequency: 'quarterly',
    frameworkRef: 'COSO-FR-01',
  },
  // Revenue Recognition Controls
  {
    code: 'COSO-C04',
    name: 'Automated interest accrual suspension',
    description:
      'Core banking system automatically suspends interest accrual when a loan is classified as substandard or lower (Group 3-5). Daily batch process reverses any accrued but uncollected interest and posts to suspense account.',
    controlType: 'preventive',
    controlNature: 'automated',
    frequency: 'daily',
    frameworkRef: 'COSO-FR-03',
  },
  {
    code: 'COSO-C05',
    name: 'Monthly interest income reconciliation',
    description:
      'Accounting team reconciles total interest income per GL to analytical expectation (average loan balance x weighted average rate) monthly. Variances exceeding 5% are investigated and resolved before month-end close.',
    controlType: 'detective',
    controlNature: 'manual',
    frequency: 'monthly',
    frameworkRef: 'COSO-FR-03',
  },
  // Financial Reporting Controls
  {
    code: 'COSO-C06',
    name: 'Four-eye review of regulatory reports',
    description:
      'All regulatory financial reports to SBV are prepared by the Reporting team and independently reviewed by a senior accountant before submission. Review checklist covers data completeness, ratio calculations, and consistency with prior period.',
    controlType: 'detective',
    controlNature: 'manual',
    frequency: 'monthly',
    frameworkRef: 'COSO-FR-04',
  },
  {
    code: 'COSO-C07',
    name: 'GL-to-subledger reconciliation',
    description:
      'Finance Operations performs daily reconciliation of key general ledger control accounts (loans, deposits, securities, interbank) to their respective subledgers. Unreconciled items are escalated if not cleared within 3 business days.',
    controlType: 'detective',
    controlNature: 'it_dependent',
    frequency: 'daily',
    frameworkRef: 'COSO-FR-04',
  },
  // Treasury Controls
  {
    code: 'COSO-C08',
    name: 'Real-time dealing limit monitoring',
    description:
      'Treasury front-office system enforces real-time limits on dealer positions (FX net open position, counterparty exposure, stop-loss limits). Limit breaches trigger automatic alerts to Treasury Manager and Middle Office.',
    controlType: 'preventive',
    controlNature: 'automated',
    frequency: 'continuous',
    frameworkRef: 'COSO-OPS-01',
  },
  {
    code: 'COSO-C09',
    name: 'Daily treasury front-to-back reconciliation',
    description:
      'Middle Office independently reconciles treasury front-office deal records to back-office settlement records and Nostro/Vostro account statements daily. Discrepancies are escalated to Treasury Manager.',
    controlType: 'detective',
    controlNature: 'manual',
    frequency: 'daily',
    frameworkRef: 'COSO-OPS-01',
  },
  {
    code: 'COSO-C10',
    name: 'Daily liquidity position monitoring',
    description:
      'ALCO desk monitors daily cash flow projections, liquidity coverage ratio (LCR), and net stable funding ratio (NSFR). Liquidity stress test results are reported to ALCO weekly. Early warning indicators trigger contingency funding plan.',
    controlType: 'detective',
    controlNature: 'it_dependent',
    frequency: 'daily',
    frameworkRef: 'COSO-OPS-02',
  },
  // Payment Processing Controls
  {
    code: 'COSO-C11',
    name: 'Dual authorization for high-value payments',
    description:
      'All payment instructions exceeding 500M VND or international wire transfers require dual authorization by two authorized signatories. SWIFT messages require 4-eye verification with maker-checker workflow enforced by the payment system.',
    controlType: 'preventive',
    controlNature: 'it_dependent',
    frequency: 'continuous',
    frameworkRef: 'COSO-OPS-03',
  },
  {
    code: 'COSO-C12',
    name: 'End-of-day payment reconciliation',
    description:
      'Payment Operations reconciles total outgoing payments per system to NAPAS settlement reports and SWIFT alliance gateway logs daily. Outstanding items are investigated and resolved within T+1.',
    controlType: 'detective',
    controlNature: 'manual',
    frequency: 'daily',
    frameworkRef: 'COSO-OPS-04',
  },
  // Credit Administration Controls
  {
    code: 'COSO-C13',
    name: 'System-enforced credit approval authority matrix',
    description:
      'Loan origination system enforces delegated credit authority limits. Loans exceeding branch/regional limits are automatically routed to the appropriate credit committee level. System prevents disbursement without required approval.',
    controlType: 'preventive',
    controlNature: 'automated',
    frequency: 'continuous',
    frameworkRef: 'COSO-OPS-05',
  },
  {
    code: 'COSO-C14',
    name: 'Annual collateral revaluation',
    description:
      'Collateral Management unit triggers annual revaluation for all secured loans. Real estate collateral is appraised by approved independent valuers (rotated every 3 years). Loan-to-value ratios are recalculated and margin calls initiated where applicable.',
    controlType: 'detective',
    controlNature: 'manual',
    frequency: 'annually',
    frameworkRef: 'COSO-OPS-06',
  },
  {
    code: 'COSO-C15',
    name: 'Pre-disbursement checklist verification',
    description:
      'Credit Operations verifies completion of all pre-disbursement conditions (signed loan agreement, collateral registration, insurance, credit committee conditions) against a standardized checklist before releasing funds.',
    controlType: 'preventive',
    controlNature: 'manual',
    frequency: 'event_driven',
    frameworkRef: 'COSO-OPS-05',
  },
  // Compliance Controls
  {
    code: 'COSO-C16',
    name: 'Automated prudential ratio calculation',
    description:
      'Regulatory reporting system calculates CAR, single borrower limit, related-party lending limit, and liquidity ratios daily from source data. Compliance team reviews calculated ratios against regulatory thresholds and reports breaches immediately.',
    controlType: 'detective',
    controlNature: 'automated',
    frequency: 'daily',
    frameworkRef: 'COSO-COMP-01',
  },
  {
    code: 'COSO-C17',
    name: 'Quarterly regulatory compliance monitoring',
    description:
      'Compliance department conducts quarterly monitoring of compliance with all applicable SBV circulars, banking law provisions, and consumer protection requirements. Findings are reported to Compliance Committee with remediation timelines.',
    controlType: 'detective',
    controlNature: 'manual',
    frequency: 'quarterly',
    frameworkRef: 'COSO-COMP-01',
  },
  {
    code: 'COSO-C18',
    name: 'Independent RWA calculation validation',
    description:
      'Risk Management independently validates risk-weighted asset calculations quarterly by recalculating a sample of exposures using approved risk weight tables and comparing to system output. Material differences are escalated to CRO.',
    controlType: 'detective',
    controlNature: 'manual',
    frequency: 'quarterly',
    frameworkRef: 'COSO-COMP-02',
  },
  // AML/Fraud Controls
  {
    code: 'COSO-C19',
    name: 'Automated AML transaction monitoring',
    description:
      'AML system monitors all customer transactions against 45+ scenarios covering structuring, rapid movement of funds, unusual cross-border patterns, and cash-intensive business indicators. Alerts are generated for investigation within 24 hours.',
    controlType: 'detective',
    controlNature: 'automated',
    frequency: 'continuous',
    frameworkRef: 'COSO-FRAUD-01',
  },
  {
    code: 'COSO-C20',
    name: 'AML alert investigation and SAR filing',
    description:
      'AML Compliance team investigates all system-generated alerts within 5 business days. Confirmed suspicious activities result in SAR filing to the State Bank Anti-Money Laundering Department within the regulatory timeframe.',
    controlType: 'detective',
    controlNature: 'manual',
    frequency: 'daily',
    frameworkRef: 'COSO-FRAUD-01',
  },
  {
    code: 'COSO-C21',
    name: 'Customer risk rating and EDD for high-risk',
    description:
      'All customers are assigned a risk rating (low, medium, high) at onboarding based on customer type, geography, product usage, and business nature. High-risk customers undergo enhanced due diligence including source of wealth verification.',
    controlType: 'preventive',
    controlNature: 'it_dependent',
    frequency: 'event_driven',
    frameworkRef: 'COSO-FRAUD-02',
  },
  {
    code: 'COSO-C22',
    name: 'Real-time sanctions screening',
    description:
      'All customers, beneficiaries, and transaction parties are screened in real-time against consolidated sanctions lists (OFAC, UN, EU, domestic). Potential matches are held for manual review. False positives are documented with disposition rationale.',
    controlType: 'preventive',
    controlNature: 'automated',
    frequency: 'continuous',
    frameworkRef: 'COSO-FRAUD-03',
  },
  {
    code: 'COSO-C23',
    name: 'Annual KYC refresh for high-risk customers',
    description:
      'KYC information for high-risk customers is refreshed annually (medium-risk every 3 years, low-risk every 5 years). Refresh includes updated identification documents, beneficial ownership verification, and reassessment of risk rating.',
    controlType: 'detective',
    controlNature: 'manual',
    frequency: 'annually',
    frameworkRef: 'COSO-FRAUD-02',
  },
  // Additional controls
  {
    code: 'COSO-C24',
    name: 'Quarterly AML scenario tuning review',
    description:
      'AML team reviews monitoring scenario effectiveness quarterly using above-the-line/below-the-line testing. Scenarios with excessive false positives are tuned, and new typology scenarios are added based on regulatory guidance and industry trends.',
    controlType: 'corrective',
    controlNature: 'manual',
    frequency: 'quarterly',
    frameworkRef: 'COSO-FRAUD-01',
  },
  {
    code: 'COSO-C25',
    name: 'Daily SWIFT message authentication and monitoring',
    description:
      'All outgoing SWIFT messages are authenticated using BIC validation and message authentication codes. Payment Operations monitors SWIFT Alliance Lite2 dashboard for failed messages, authentication errors, and unusual message volumes.',
    controlType: 'preventive',
    controlNature: 'automated',
    frequency: 'daily',
    frameworkRef: 'COSO-OPS-03',
  },
];

// -----------------------------------------------------------------------------
// Procedures
// -----------------------------------------------------------------------------
export const cosoProcedures: SeedProcedure[] = [
  // Loan Loss Provisioning Procedures
  {
    code: 'COSO-P01',
    name: 'Test loan classification accuracy',
    description:
      'Select 30 loans across all classification groups. Independently assess classification based on days past due, financial statements, collateral adequacy, and qualitative factors. Compare auditor classification to bank classification and quantify any provisioning impact.',
    procedureType: 'inspection',
    procedureCategory: 'substantive',
    frameworkRef: 'COSO-FR-01',
  },
  {
    code: 'COSO-P02',
    name: 'Review ECL model governance and validation',
    description:
      'Obtain the most recent ECL model validation report. Verify PD model backtesting results, LGD calibration methodology, and macroeconomic scenario assumptions. Assess whether model risk governance framework is followed and material model limitations are disclosed.',
    procedureType: 'inspection',
    procedureCategory: 'substantive',
    frameworkRef: 'COSO-FR-02',
  },
  {
    code: 'COSO-P03',
    name: 'Recalculate provision adequacy',
    description:
      'Using the loan portfolio data extract, independently recalculate specific provisions for top 20 exposures and collective provisions using the bank\'s approved methodology. Compare results to recorded provisions and investigate variances exceeding materiality threshold.',
    procedureType: 're_performance',
    procedureCategory: 'substantive',
    frameworkRef: 'COSO-FR-01',
  },
  // Revenue Recognition Procedures
  {
    code: 'COSO-P04',
    name: 'Verify interest accrual suspension for NPLs',
    description:
      'Obtain the list of all NPLs (Group 3-5). Select 20 loans and verify that interest accrual was suspended on or before the classification date. Check that previously accrued but uncollected interest was reversed from income. Verify suspense account balances.',
    procedureType: 're_performance',
    procedureCategory: 'substantive',
    frameworkRef: 'COSO-FR-03',
  },
  {
    code: 'COSO-P05',
    name: 'Analytical review of interest income',
    description:
      'Perform analytical procedures on interest income by product segment. Calculate expected interest income using average balances and weighted average rates. Investigate variances exceeding 5% and assess reasonableness of explanations provided by management.',
    procedureType: 'analytical',
    procedureCategory: 'substantive',
    frameworkRef: 'COSO-FR-03',
  },
  // Financial Reporting Procedures
  {
    code: 'COSO-P06',
    name: 'Inspect regulatory report review evidence',
    description:
      'For 3 monthly regulatory report submissions, inspect the preparer and reviewer sign-off, review checklist completion, and query log. Verify that all review comments were resolved before submission. Compare submitted data to general ledger trial balance.',
    procedureType: 'inspection',
    procedureCategory: 'toc',
    frameworkRef: 'COSO-FR-04',
  },
  {
    code: 'COSO-P07',
    name: 'Test GL-to-subledger reconciliation',
    description:
      'Select 3 month-end dates and obtain GL-to-subledger reconciliations for loans, deposits, and securities. Verify reconciling items are clearly identified, aging of outstanding items is reasonable, and items outstanding beyond 3 days were escalated per policy.',
    procedureType: 'inspection',
    procedureCategory: 'toc',
    frameworkRef: 'COSO-FR-04',
  },
  // Treasury Procedures
  {
    code: 'COSO-P08',
    name: 'Test dealing limit monitoring effectiveness',
    description:
      'Review dealing limit configuration in the treasury system. Attempt to enter a test transaction exceeding the limit and verify the system blocks or alerts. Obtain limit breach reports for the past quarter and verify all breaches were investigated by Middle Office.',
    procedureType: 're_performance',
    procedureCategory: 'toc',
    frameworkRef: 'COSO-OPS-01',
  },
  {
    code: 'COSO-P09',
    name: 'Review treasury reconciliation and open items',
    description:
      'Obtain daily treasury front-to-back reconciliation reports for 2 sample weeks. Verify reconciliation was completed daily, discrepancies were identified and investigated, and Nostro/Vostro breaks were resolved within T+1. Analyze aging of unresolved items.',
    procedureType: 'inspection',
    procedureCategory: 'toc',
    frameworkRef: 'COSO-OPS-01',
  },
  {
    code: 'COSO-P10',
    name: 'Assess liquidity risk management adequacy',
    description:
      'Review ALCO meeting minutes for the past 6 months. Verify LCR and NSFR calculations, assess stress test scenario assumptions, and evaluate whether contingency funding plan triggers are calibrated appropriately. Inquire with Treasury Head about current liquidity outlook.',
    procedureType: 'inquiry',
    procedureCategory: 'substantive',
    frameworkRef: 'COSO-OPS-02',
  },
  // Payment Processing Procedures
  {
    code: 'COSO-P11',
    name: 'Test dual authorization for high-value payments',
    description:
      'Select 25 high-value payment transactions (above 500M VND) from the past quarter. Verify dual authorization was obtained in the payment system logs. For SWIFT payments, verify 4-eye principle was applied. Identify any single-authorized exceptions.',
    procedureType: 'inspection',
    procedureCategory: 'toc',
    frameworkRef: 'COSO-OPS-03',
  },
  {
    code: 'COSO-P12',
    name: 'Verify payment reconciliation completeness',
    description:
      'Obtain end-of-day payment reconciliation reports for 5 sample dates. Verify that NAPAS settlement totals and SWIFT message counts reconcile to internal payment system totals. Investigate any unmatched items and assess adequacy of follow-up actions.',
    procedureType: 'inspection',
    procedureCategory: 'toc',
    frameworkRef: 'COSO-OPS-04',
  },
  // Credit Administration Procedures
  {
    code: 'COSO-P13',
    name: 'Test credit approval authority compliance',
    description:
      'Select 20 loan approvals from the past 6 months, including loans near authority limit thresholds. Verify the approving authority had sufficient delegated limits. For credit committee approvals, verify quorum, voting records, and dissenting opinions documentation.',
    procedureType: 'inspection',
    procedureCategory: 'toc',
    frameworkRef: 'COSO-OPS-05',
  },
  {
    code: 'COSO-P14',
    name: 'Review collateral valuation and LTV compliance',
    description:
      'Select 15 secured loans and inspect the most recent collateral valuation reports. Verify valuations were performed by approved independent appraisers, valuation methodology is appropriate, and current LTV ratios comply with the bank\'s credit policy. Check appraiser rotation compliance.',
    procedureType: 'inspection',
    procedureCategory: 'substantive',
    frameworkRef: 'COSO-OPS-06',
  },
  {
    code: 'COSO-P15',
    name: 'Walkthrough loan disbursement process',
    description:
      'Select 3 recent loan disbursements and perform end-to-end walkthrough from credit approval to fund release. Verify pre-disbursement checklist completion, condition precedent satisfaction, proper documentation filing, and system booking accuracy.',
    procedureType: 'walkthrough',
    procedureCategory: 'toc',
    frameworkRef: 'COSO-OPS-05',
  },
  // Compliance Procedures
  {
    code: 'COSO-P16',
    name: 'Recalculate key prudential ratios',
    description:
      'Independently recalculate CAR, single borrower exposure ratio, and related-party lending ratio using source data from GL and loan system. Compare to regulatory system output and the bank\'s submitted figures. Investigate any discrepancies.',
    procedureType: 're_performance',
    procedureCategory: 'substantive',
    frameworkRef: 'COSO-COMP-01',
  },
  {
    code: 'COSO-P17',
    name: 'Review regulatory compliance monitoring results',
    description:
      'Obtain the most recent quarterly compliance monitoring report. Verify coverage of applicable SBV circulars, assess severity of identified findings, and confirm remediation actions have defined owners and deadlines. Review Compliance Committee meeting minutes for oversight evidence.',
    procedureType: 'inspection',
    procedureCategory: 'toc',
    frameworkRef: 'COSO-COMP-01',
  },
  {
    code: 'COSO-P18',
    name: 'Test RWA calculation accuracy',
    description:
      'Select a sample of 30 credit exposures across retail, corporate, and sovereign segments. Independently determine the appropriate risk weight using Basel II standardized approach. Recalculate RWA and compare to the bank\'s reported figures.',
    procedureType: 're_performance',
    procedureCategory: 'substantive',
    frameworkRef: 'COSO-COMP-02',
  },
  // AML/Fraud Procedures
  {
    code: 'COSO-P19',
    name: 'Test AML monitoring scenario effectiveness',
    description:
      'Obtain the AML scenario inventory and alert statistics. Select 5 key scenarios and review calibration parameters, alert volumes, and SAR conversion rates. Inject 3 test transactions designed to trigger specific scenarios and verify alerts are generated.',
    procedureType: 're_performance',
    procedureCategory: 'toc',
    frameworkRef: 'COSO-FRAUD-01',
  },
  {
    code: 'COSO-P20',
    name: 'Review AML alert investigation quality',
    description:
      'Select 20 closed AML alerts (10 filed as SAR, 10 closed as false positive). Review investigation documentation for adequacy: transaction analysis, customer profile review, rationale for disposition, and supervisor approval. Assess whether dispositions were appropriate.',
    procedureType: 'inspection',
    procedureCategory: 'toc',
    frameworkRef: 'COSO-FRAUD-01',
  },
  {
    code: 'COSO-P21',
    name: 'Test KYC completeness for high-risk customers',
    description:
      'Select 15 high-risk customers. Verify KYC files contain required documents: valid ID, proof of address, beneficial ownership declaration, source of wealth documentation, PEP screening results, and enhanced due diligence report. Check KYC refresh was completed within required timeframe.',
    procedureType: 'inspection',
    procedureCategory: 'toc',
    frameworkRef: 'COSO-FRAUD-02',
  },
  {
    code: 'COSO-P22',
    name: 'Test sanctions screening effectiveness',
    description:
      'Inject 5 test names matching known sanctioned entities (with minor spelling variations) into the screening system. Verify all test cases generate alerts. Review screening system configuration for list update frequency and matching algorithm sensitivity settings.',
    procedureType: 're_performance',
    procedureCategory: 'toc',
    frameworkRef: 'COSO-FRAUD-03',
  },
  {
    code: 'COSO-P23',
    name: 'Review sanctions screening false positive management',
    description:
      'Select 20 sanctions screening alerts resolved as false positives. Verify each disposition includes documented rationale, comparison to sanctions list entry, and reviewer approval. Assess whether any true matches were incorrectly dismissed.',
    procedureType: 'inspection',
    procedureCategory: 'toc',
    frameworkRef: 'COSO-FRAUD-03',
  },
  // Additional procedures
  {
    code: 'COSO-P24',
    name: 'Observe ALCO meeting and liquidity reporting',
    description:
      'Attend an ALCO meeting and observe the presentation and discussion of liquidity position, interest rate risk, and funding strategy. Verify that key metrics (LCR, NSFR, maturity gap) are presented and discussed with appropriate challenge from committee members.',
    procedureType: 'observation',
    procedureCategory: 'toc',
    frameworkRef: 'COSO-OPS-02',
  },
  {
    code: 'COSO-P25',
    name: 'Test SWIFT message authentication controls',
    description:
      'Review SWIFT Alliance configuration for message authentication and operator access controls. Obtain SWIFT message logs for 2 sample days and verify all messages were authenticated. Check for any rejected or failed authentication messages and review follow-up actions.',
    procedureType: 'inspection',
    procedureCategory: 'toc',
    frameworkRef: 'COSO-OPS-03',
  },
];

// -----------------------------------------------------------------------------
// Risk-Control Mappings
// -----------------------------------------------------------------------------
export const cosoRiskControlMappings: SeedRiskControlMapping[] = [
  // R01 - Inadequate loan loss provisioning
  { riskCode: 'COSO-R01', controlCode: 'COSO-C01' },
  { riskCode: 'COSO-R01', controlCode: 'COSO-C03' },
  // R02 - IFRS 9 ECL model errors
  { riskCode: 'COSO-R02', controlCode: 'COSO-C02' },
  // R03 - Interest income misstatement
  { riskCode: 'COSO-R03', controlCode: 'COSO-C04' },
  { riskCode: 'COSO-R03', controlCode: 'COSO-C05' },
  // R04 - Regulatory report errors
  { riskCode: 'COSO-R04', controlCode: 'COSO-C06' },
  { riskCode: 'COSO-R04', controlCode: 'COSO-C07' },
  // R05 - Unauthorized treasury transactions
  { riskCode: 'COSO-R05', controlCode: 'COSO-C08' },
  { riskCode: 'COSO-R05', controlCode: 'COSO-C09' },
  // R06 - Liquidity risk
  { riskCode: 'COSO-R06', controlCode: 'COSO-C10' },
  // R07 - Unauthorized wire transfers
  { riskCode: 'COSO-R07', controlCode: 'COSO-C11' },
  { riskCode: 'COSO-R07', controlCode: 'COSO-C25' },
  // R08 - Payment processing errors
  { riskCode: 'COSO-R08', controlCode: 'COSO-C12' },
  // R09 - Credit approval bypassing limits
  { riskCode: 'COSO-R09', controlCode: 'COSO-C13' },
  { riskCode: 'COSO-R09', controlCode: 'COSO-C15' },
  // R10 - Inadequate collateral valuation
  { riskCode: 'COSO-R10', controlCode: 'COSO-C14' },
  // R11 - Late/inaccurate regulatory reports
  { riskCode: 'COSO-R11', controlCode: 'COSO-C16' },
  { riskCode: 'COSO-R11', controlCode: 'COSO-C17' },
  // R12 - CAR calculation errors
  { riskCode: 'COSO-R12', controlCode: 'COSO-C16' },
  { riskCode: 'COSO-R12', controlCode: 'COSO-C18' },
  // R13 - AML monitoring gaps
  { riskCode: 'COSO-R13', controlCode: 'COSO-C19' },
  { riskCode: 'COSO-R13', controlCode: 'COSO-C20' },
  { riskCode: 'COSO-R13', controlCode: 'COSO-C24' },
  // R14 - Incomplete KYC
  { riskCode: 'COSO-R14', controlCode: 'COSO-C21' },
  { riskCode: 'COSO-R14', controlCode: 'COSO-C23' },
  // R15 - Sanctions screening failures
  { riskCode: 'COSO-R15', controlCode: 'COSO-C22' },
];

// -----------------------------------------------------------------------------
// Control-Procedure Mappings
// -----------------------------------------------------------------------------
export const cosoControlProcedureMappings: SeedControlProcedureMapping[] = [
  // C01 - Monthly loan classification
  { controlCode: 'COSO-C01', procedureCode: 'COSO-P01' },
  // C02 - ECL model validation
  { controlCode: 'COSO-C02', procedureCode: 'COSO-P02' },
  // C03 - Provision adequacy review
  { controlCode: 'COSO-C03', procedureCode: 'COSO-P03' },
  // C04 - Automated interest suspension
  { controlCode: 'COSO-C04', procedureCode: 'COSO-P04' },
  // C05 - Interest income reconciliation
  { controlCode: 'COSO-C05', procedureCode: 'COSO-P05' },
  // C06 - Four-eye review of reports
  { controlCode: 'COSO-C06', procedureCode: 'COSO-P06' },
  // C07 - GL-to-subledger reconciliation
  { controlCode: 'COSO-C07', procedureCode: 'COSO-P07' },
  // C08 - Dealing limit monitoring
  { controlCode: 'COSO-C08', procedureCode: 'COSO-P08' },
  // C09 - Treasury reconciliation
  { controlCode: 'COSO-C09', procedureCode: 'COSO-P09' },
  // C10 - Liquidity monitoring
  { controlCode: 'COSO-C10', procedureCode: 'COSO-P10' },
  { controlCode: 'COSO-C10', procedureCode: 'COSO-P24' },
  // C11 - Dual authorization
  { controlCode: 'COSO-C11', procedureCode: 'COSO-P11' },
  // C12 - Payment reconciliation
  { controlCode: 'COSO-C12', procedureCode: 'COSO-P12' },
  // C13 - Credit approval authority
  { controlCode: 'COSO-C13', procedureCode: 'COSO-P13' },
  // C14 - Collateral revaluation
  { controlCode: 'COSO-C14', procedureCode: 'COSO-P14' },
  // C15 - Pre-disbursement checklist
  { controlCode: 'COSO-C15', procedureCode: 'COSO-P15' },
  // C16 - Prudential ratio calculation
  { controlCode: 'COSO-C16', procedureCode: 'COSO-P16' },
  // C17 - Compliance monitoring
  { controlCode: 'COSO-C17', procedureCode: 'COSO-P17' },
  // C18 - RWA validation
  { controlCode: 'COSO-C18', procedureCode: 'COSO-P18' },
  // C19 - AML monitoring
  { controlCode: 'COSO-C19', procedureCode: 'COSO-P19' },
  // C20 - AML alert investigation
  { controlCode: 'COSO-C20', procedureCode: 'COSO-P20' },
  // C21 - Customer risk rating & EDD
  { controlCode: 'COSO-C21', procedureCode: 'COSO-P21' },
  // C22 - Sanctions screening
  { controlCode: 'COSO-C22', procedureCode: 'COSO-P22' },
  { controlCode: 'COSO-C22', procedureCode: 'COSO-P23' },
  // C23 - KYC refresh
  { controlCode: 'COSO-C23', procedureCode: 'COSO-P21' },
  // C24 - AML scenario tuning
  { controlCode: 'COSO-C24', procedureCode: 'COSO-P19' },
  // C25 - SWIFT authentication
  { controlCode: 'COSO-C25', procedureCode: 'COSO-P25' },
];
