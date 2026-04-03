// =============================================================================
// COBIT 2019 — Banking IT Governance Seed Data
// =============================================================================

export interface SeedDomain {
  code: string;
  name: string;
  framework: string;
  description: string;
  sortOrder: number;
}

export interface SeedCategory {
  domainCode: string;
  code: string;
  name: string;
  description: string;
  sortOrder: number;
}

export interface SeedRisk {
  categoryCode: string;
  code: string;
  name: string;
  description: string;
  riskType: string;
  riskRating: string;
  likelihood?: string;
  impact?: string;
  frameworkRef?: string;
}

export interface SeedControl {
  code: string;
  name: string;
  description: string;
  controlType: string;
  controlNature: string;
  frequency: string;
  frameworkRef?: string;
}

export interface SeedProcedure {
  code: string;
  name: string;
  description: string;
  procedureType: string;
  procedureCategory: string;
  frameworkRef?: string;
}

export interface SeedRiskControlMapping {
  riskCode: string;
  controlCode: string;
}

export interface SeedControlProcedureMapping {
  controlCode: string;
  procedureCode: string;
}

// -----------------------------------------------------------------------------
// Domains
// -----------------------------------------------------------------------------
export const cobitDomains: SeedDomain[] = [
  {
    code: 'IT-GOV',
    name: 'IT Governance & Strategy',
    framework: 'COBIT 2019',
    description:
      'Governance framework ensuring IT strategy alignment with business objectives, IT investment oversight, and IT resource optimization for banking operations.',
    sortOrder: 1,
  },
  {
    code: 'IT-OPS',
    name: 'IT Operations & Security',
    framework: 'COBIT 2019',
    description:
      'Operational controls over IT infrastructure, cybersecurity, data protection, incident management, and business continuity for core banking systems.',
    sortOrder: 2,
  },
  {
    code: 'IT-CHG',
    name: 'Change & Project Management',
    framework: 'COBIT 2019',
    description:
      'Controls over IT change management, project delivery, and solution development lifecycle for banking application changes and new system implementations.',
    sortOrder: 3,
  },
];

// -----------------------------------------------------------------------------
// Categories
// -----------------------------------------------------------------------------
export const cobitCategories: SeedCategory[] = [
  // IT-GOV
  {
    domainCode: 'IT-GOV',
    code: 'IT-GOV-01',
    name: 'IT Strategy Alignment',
    description:
      'Ensuring IT strategy is aligned with the bank\'s business strategy, digital transformation roadmap, and regulatory technology requirements.',
    sortOrder: 1,
  },
  {
    domainCode: 'IT-GOV',
    code: 'IT-GOV-02',
    name: 'IT Investment Management',
    description:
      'Oversight of IT investment decisions, cost-benefit analysis for technology initiatives, and IT budget governance for banking systems.',
    sortOrder: 2,
  },
  {
    domainCode: 'IT-GOV',
    code: 'IT-GOV-03',
    name: 'IT Risk & Compliance Governance',
    description:
      'Governance over IT risk appetite, regulatory compliance monitoring (SBV circulars, PCI-DSS), and IT audit coordination.',
    sortOrder: 3,
  },
  // IT-OPS
  {
    domainCode: 'IT-OPS',
    code: 'IT-OPS-01',
    name: 'Access Management',
    description:
      'Logical and physical access controls for core banking systems, internet banking platforms, payment gateways, and database infrastructure.',
    sortOrder: 1,
  },
  {
    domainCode: 'IT-OPS',
    code: 'IT-OPS-02',
    name: 'Data Backup & Recovery',
    description:
      'Backup procedures, disaster recovery planning, and data restoration capabilities for transaction data, customer records, and financial databases.',
    sortOrder: 2,
  },
  {
    domainCode: 'IT-OPS',
    code: 'IT-OPS-03',
    name: 'Network & Cybersecurity',
    description:
      'Network segmentation, firewall management, intrusion detection, vulnerability management, and cybersecurity operations for banking infrastructure.',
    sortOrder: 3,
  },
  {
    domainCode: 'IT-OPS',
    code: 'IT-OPS-04',
    name: 'Incident Management',
    description:
      'IT incident detection, escalation, resolution, and post-incident review processes for system outages, security breaches, and service disruptions.',
    sortOrder: 4,
  },
  // IT-CHG
  {
    domainCode: 'IT-CHG',
    code: 'IT-CHG-01',
    name: 'Change Management',
    description:
      'Controls over change requests, approval workflows, testing requirements, and deployment procedures for core banking and ancillary system modifications.',
    sortOrder: 1,
  },
  {
    domainCode: 'IT-CHG',
    code: 'IT-CHG-02',
    name: 'Project Management',
    description:
      'IT project governance, milestone tracking, resource allocation, and quality assurance for banking technology initiatives and system implementations.',
    sortOrder: 2,
  },
  {
    domainCode: 'IT-CHG',
    code: 'IT-CHG-03',
    name: 'Solution Development',
    description:
      'Software development lifecycle controls, code review practices, security testing, and release management for banking applications.',
    sortOrder: 3,
  },
];

// -----------------------------------------------------------------------------
// Risks
// -----------------------------------------------------------------------------
export const cobitRisks: SeedRisk[] = [
  // IT-GOV-01
  {
    categoryCode: 'IT-GOV-01',
    code: 'COBIT-R01',
    name: 'IT strategy misaligned with banking business objectives',
    description:
      'IT strategic initiatives do not support the bank\'s core business priorities (digital banking expansion, branch optimization, regulatory compliance), resulting in wasted investment and missed market opportunities.',
    riskType: 'strategic',
    riskRating: 'high',
    likelihood: 'possible',
    impact: 'major',
    frameworkRef: 'EDM01',
  },
  // IT-GOV-02
  {
    categoryCode: 'IT-GOV-02',
    code: 'COBIT-R02',
    name: 'Inadequate cost-benefit analysis for IT investments',
    description:
      'Technology investment decisions for core banking upgrades, digital channels, or infrastructure modernization lack rigorous financial analysis, leading to budget overruns or underperforming systems.',
    riskType: 'financial',
    riskRating: 'medium',
    likelihood: 'possible',
    impact: 'moderate',
    frameworkRef: 'EDM02',
  },
  // IT-GOV-03
  {
    categoryCode: 'IT-GOV-03',
    code: 'COBIT-R03',
    name: 'Non-compliance with SBV IT regulations',
    description:
      'Failure to comply with State Bank of Vietnam circulars on IT risk management, information security standards, and technology outsourcing requirements, exposing the bank to regulatory sanctions.',
    riskType: 'compliance',
    riskRating: 'critical',
    likelihood: 'unlikely',
    impact: 'catastrophic',
    frameworkRef: 'EDM03',
  },
  // IT-OPS-01
  {
    categoryCode: 'IT-OPS-01',
    code: 'COBIT-R04',
    name: 'Unauthorized access to core banking system',
    description:
      'Inadequate access controls allow unauthorized users to access core banking modules (loans, deposits, treasury), enabling fraudulent transactions or unauthorized data disclosure.',
    riskType: 'it',
    riskRating: 'critical',
    likelihood: 'possible',
    impact: 'catastrophic',
    frameworkRef: 'APO13/DSS05',
  },
  {
    categoryCode: 'IT-OPS-01',
    code: 'COBIT-R05',
    name: 'Excessive privileged access rights in production environment',
    description:
      'Database administrators, system administrators, or application support staff retain excessive privileges in the production core banking environment, bypassing segregation of duties controls.',
    riskType: 'it',
    riskRating: 'high',
    likelihood: 'likely',
    impact: 'major',
    frameworkRef: 'DSS05',
  },
  // IT-OPS-02
  {
    categoryCode: 'IT-OPS-02',
    code: 'COBIT-R06',
    name: 'Inadequate backup of transaction data',
    description:
      'Backup procedures fail to capture all critical transaction data (real-time payments, SWIFT messages, ATM transactions), or backup media is not tested regularly, risking permanent data loss during system failure.',
    riskType: 'it',
    riskRating: 'high',
    likelihood: 'unlikely',
    impact: 'catastrophic',
    frameworkRef: 'DSS04',
  },
  // IT-OPS-03
  {
    categoryCode: 'IT-OPS-03',
    code: 'COBIT-R07',
    name: 'Cyber attack on internet banking platform',
    description:
      'Sophisticated cyber attacks (SQL injection, DDoS, phishing campaigns targeting customers) compromise the internet banking platform, causing financial losses, customer data theft, and reputational damage.',
    riskType: 'it',
    riskRating: 'critical',
    likelihood: 'possible',
    impact: 'catastrophic',
    frameworkRef: 'APO13/DSS05',
  },
  {
    categoryCode: 'IT-OPS-03',
    code: 'COBIT-R08',
    name: 'Unpatched vulnerabilities in banking infrastructure',
    description:
      'Critical security patches for operating systems, databases, and middleware supporting core banking are not applied timely, leaving known vulnerabilities exploitable by threat actors.',
    riskType: 'it',
    riskRating: 'high',
    likelihood: 'likely',
    impact: 'major',
    frameworkRef: 'DSS05',
  },
  // IT-OPS-04
  {
    categoryCode: 'IT-OPS-04',
    code: 'COBIT-R09',
    name: 'Delayed detection and response to security incidents',
    description:
      'Security incidents affecting banking operations (data breaches, malware infections, unauthorized access attempts) are not detected or escalated promptly, increasing the blast radius and recovery cost.',
    riskType: 'it',
    riskRating: 'high',
    likelihood: 'possible',
    impact: 'major',
    frameworkRef: 'DSS02',
  },
  // IT-CHG-01
  {
    categoryCode: 'IT-CHG-01',
    code: 'COBIT-R10',
    name: 'Unauthorized changes to core banking application',
    description:
      'Changes to core banking system configurations, business rules, or interest rate parameters are implemented without proper authorization, testing, or documentation, causing calculation errors or system instability.',
    riskType: 'it',
    riskRating: 'critical',
    likelihood: 'possible',
    impact: 'catastrophic',
    frameworkRef: 'BAI06',
  },
  // IT-CHG-02
  {
    categoryCode: 'IT-CHG-02',
    code: 'COBIT-R11',
    name: 'IT project delivery failures for banking systems',
    description:
      'Major IT projects (core banking replacement, payment system upgrades, regulatory reporting systems) exceed budget, miss deadlines, or fail to deliver required functionality.',
    riskType: 'strategic',
    riskRating: 'high',
    likelihood: 'possible',
    impact: 'major',
    frameworkRef: 'BAI01',
  },
  // IT-CHG-03
  {
    categoryCode: 'IT-CHG-03',
    code: 'COBIT-R12',
    name: 'Insufficient security testing of new banking applications',
    description:
      'New or modified banking applications (mobile banking, API banking services) are deployed without adequate security testing (penetration testing, code review), introducing exploitable vulnerabilities.',
    riskType: 'it',
    riskRating: 'high',
    likelihood: 'possible',
    impact: 'major',
    frameworkRef: 'BAI03',
  },
  {
    categoryCode: 'IT-CHG-03',
    code: 'COBIT-R13',
    name: 'Inadequate separation of development and production environments',
    description:
      'Developers have direct access to production core banking databases or can deploy code without independent review, enabling unauthorized modifications to live transaction processing.',
    riskType: 'it',
    riskRating: 'high',
    likelihood: 'likely',
    impact: 'major',
    frameworkRef: 'BAI03/BAI07',
  },
  // IT-OPS-01 (additional)
  {
    categoryCode: 'IT-OPS-01',
    code: 'COBIT-R14',
    name: 'Weak authentication for remote banking access',
    description:
      'Staff accessing banking systems remotely (VPN, virtual desktop) use single-factor authentication or shared credentials, increasing the risk of account compromise and unauthorized system access.',
    riskType: 'it',
    riskRating: 'high',
    likelihood: 'likely',
    impact: 'major',
    frameworkRef: 'DSS05',
  },
  // IT-OPS-02 (additional)
  {
    categoryCode: 'IT-OPS-02',
    code: 'COBIT-R15',
    name: 'Untested disaster recovery plan for core banking',
    description:
      'The disaster recovery plan for core banking systems has not been tested within the required timeframe, and recovery time objectives (RTO/RPO) for critical banking services are not validated.',
    riskType: 'it',
    riskRating: 'high',
    likelihood: 'possible',
    impact: 'catastrophic',
    frameworkRef: 'DSS04',
  },
];

// -----------------------------------------------------------------------------
// Controls
// -----------------------------------------------------------------------------
export const cobitControls: SeedControl[] = [
  // Access Management Controls
  {
    code: 'COBIT-C01',
    name: 'Role-based access control for core banking',
    description:
      'Access to core banking modules is granted based on predefined role profiles approved by department heads. Each role profile specifies permitted transactions, account types, and monetary limits.',
    controlType: 'preventive',
    controlNature: 'automated',
    frequency: 'continuous',
    frameworkRef: 'DSS05.04',
  },
  {
    code: 'COBIT-C02',
    name: 'Quarterly access rights review',
    description:
      'IT Security team generates access rights reports for all core banking users quarterly. Department heads review and confirm the appropriateness of access rights, with exceptions remediated within 5 business days.',
    controlType: 'detective',
    controlNature: 'manual',
    frequency: 'quarterly',
    frameworkRef: 'DSS05.04',
  },
  {
    code: 'COBIT-C03',
    name: 'Privileged access monitoring and logging',
    description:
      'All privileged account activities (DBA, sysadmin, application admin) in production banking systems are logged and reviewed daily by IT Security. Alerts trigger for off-hours access or bulk data extraction.',
    controlType: 'detective',
    controlNature: 'it_dependent',
    frequency: 'daily',
    frameworkRef: 'DSS05.05',
  },
  {
    code: 'COBIT-C04',
    name: 'Multi-factor authentication for critical systems',
    description:
      'All access to core banking, internet banking admin console, payment switches, and remote VPN requires multi-factor authentication (hardware token or mobile OTP in addition to password).',
    controlType: 'preventive',
    controlNature: 'automated',
    frequency: 'continuous',
    frameworkRef: 'DSS05.04',
  },
  {
    code: 'COBIT-C05',
    name: 'User access provisioning and de-provisioning',
    description:
      'Formal access request process requires line manager and system owner approval before IT grants access. HR termination triggers automatic account deactivation within 24 hours via integration with HRIS.',
    controlType: 'preventive',
    controlNature: 'it_dependent',
    frequency: 'event_driven',
    frameworkRef: 'DSS05.04',
  },
  // Backup & DR Controls
  {
    code: 'COBIT-C06',
    name: 'Automated daily backup of core banking databases',
    description:
      'Full database backups of core banking, payment systems, and customer data are performed daily at 23:00. Incremental backups run every 4 hours. Backup completion is monitored and failures trigger immediate alerts.',
    controlType: 'preventive',
    controlNature: 'automated',
    frequency: 'daily',
    frameworkRef: 'DSS04.07',
  },
  {
    code: 'COBIT-C07',
    name: 'Semi-annual disaster recovery testing',
    description:
      'Full DR failover test for core banking systems is conducted semi-annually. Tests validate RTO (4 hours) and RPO (1 hour) targets. Test results are documented and gaps are tracked to remediation.',
    controlType: 'detective',
    controlNature: 'manual',
    frequency: 'annually',
    frameworkRef: 'DSS04.04',
  },
  // Cybersecurity Controls
  {
    code: 'COBIT-C08',
    name: 'Web application firewall for internet banking',
    description:
      'WAF deployed in front of internet banking and mobile banking APIs inspects all inbound traffic for SQL injection, XSS, and OWASP Top 10 attack patterns. Rules are updated weekly based on threat intelligence.',
    controlType: 'preventive',
    controlNature: 'automated',
    frequency: 'continuous',
    frameworkRef: 'DSS05.02',
  },
  {
    code: 'COBIT-C09',
    name: 'Monthly vulnerability scanning and patch management',
    description:
      'Automated vulnerability scans of all banking infrastructure (servers, databases, network devices) run monthly. Critical vulnerabilities are patched within 7 days; high within 30 days per the patch management policy.',
    controlType: 'detective',
    controlNature: 'it_dependent',
    frequency: 'monthly',
    frameworkRef: 'DSS05.03',
  },
  {
    code: 'COBIT-C10',
    name: 'Security Operations Center 24/7 monitoring',
    description:
      'SOC monitors SIEM alerts, network traffic anomalies, and endpoint detection events around the clock. Security incidents are classified by severity and escalated per the incident response playbook.',
    controlType: 'detective',
    controlNature: 'it_dependent',
    frequency: 'continuous',
    frameworkRef: 'DSS05.07',
  },
  // Incident Management Controls
  {
    code: 'COBIT-C11',
    name: 'IT incident escalation and tracking process',
    description:
      'All IT incidents are logged in the ITSM tool with severity classification. P1 incidents (core banking down, payment system failure) require immediate escalation to IT Director and notification to business within 15 minutes.',
    controlType: 'detective',
    controlNature: 'manual',
    frequency: 'event_driven',
    frameworkRef: 'DSS02.02',
  },
  {
    code: 'COBIT-C12',
    name: 'Post-incident review for major incidents',
    description:
      'Root cause analysis is conducted within 5 business days of resolving any P1/P2 incident. Review documents root cause, timeline, business impact, and preventive actions. Results reported to IT Steering Committee.',
    controlType: 'corrective',
    controlNature: 'manual',
    frequency: 'event_driven',
    frameworkRef: 'DSS02.07',
  },
  // Change Management Controls
  {
    code: 'COBIT-C13',
    name: 'Change advisory board approval for production changes',
    description:
      'All changes to production banking systems require CAB approval. CAB meets weekly and evaluates change risk, rollback plan, test results, and deployment schedule. Emergency changes require post-implementation CAB ratification.',
    controlType: 'preventive',
    controlNature: 'manual',
    frequency: 'weekly',
    frameworkRef: 'BAI06.01',
  },
  {
    code: 'COBIT-C14',
    name: 'Segregation of duties in SDLC',
    description:
      'Developers cannot deploy code to production. Separate teams handle development, testing, and production deployment. Version control enforces branch protection requiring peer code review before merge.',
    controlType: 'preventive',
    controlNature: 'it_dependent',
    frequency: 'continuous',
    frameworkRef: 'BAI07.01',
  },
  {
    code: 'COBIT-C15',
    name: 'UAT sign-off before production deployment',
    description:
      'Business users perform user acceptance testing for all significant changes. Formal UAT sign-off from the business process owner is required before deployment to production. UAT scripts cover key transaction scenarios.',
    controlType: 'preventive',
    controlNature: 'manual',
    frequency: 'event_driven',
    frameworkRef: 'BAI07.05',
  },
  // Project Management Controls
  {
    code: 'COBIT-C16',
    name: 'IT project steering committee oversight',
    description:
      'IT projects exceeding 500M VND or classified as high-risk are overseen by a steering committee that meets monthly to review progress, budget variance, risk status, and milestone delivery.',
    controlType: 'detective',
    controlNature: 'manual',
    frequency: 'monthly',
    frameworkRef: 'BAI01.06',
  },
  // Security Testing Controls
  {
    code: 'COBIT-C17',
    name: 'Mandatory penetration testing before go-live',
    description:
      'All new banking applications and major version releases undergo independent penetration testing by a qualified third party. Critical and high findings must be remediated before production deployment.',
    controlType: 'detective',
    controlNature: 'manual',
    frequency: 'event_driven',
    frameworkRef: 'BAI03.08',
  },
  // IT Governance Controls
  {
    code: 'COBIT-C18',
    name: 'Annual IT strategic plan review',
    description:
      'IT strategic plan is reviewed and updated annually by IT Steering Committee with input from business unit heads. Review assesses alignment with bank strategy, technology trends, and regulatory requirements.',
    controlType: 'detective',
    controlNature: 'manual',
    frequency: 'annually',
    frameworkRef: 'EDM01.01',
  },
  {
    code: 'COBIT-C19',
    name: 'IT investment business case approval',
    description:
      'IT investments above 200M VND require a formal business case with NPV/ROI analysis, approved by CFO and IT Steering Committee. Post-implementation benefits realization review conducted 6 months after go-live.',
    controlType: 'preventive',
    controlNature: 'manual',
    frequency: 'event_driven',
    frameworkRef: 'EDM02.01',
  },
  {
    code: 'COBIT-C20',
    name: 'Regulatory compliance self-assessment',
    description:
      'IT Compliance team conducts quarterly self-assessment against SBV Circular 09/2020/TT-NHNN requirements, PCI-DSS controls, and internal IT policies. Gaps are reported to IT Risk Committee with remediation plans.',
    controlType: 'detective',
    controlNature: 'manual',
    frequency: 'quarterly',
    frameworkRef: 'EDM03.02',
  },
  // Backup verification
  {
    code: 'COBIT-C21',
    name: 'Monthly backup restoration testing',
    description:
      'IT Operations restores a sample of backup tapes/snapshots to an isolated environment monthly. Test validates data integrity, completeness, and restoration time for core banking and payment system databases.',
    controlType: 'detective',
    controlNature: 'manual',
    frequency: 'monthly',
    frameworkRef: 'DSS04.07',
  },
  // Network segmentation
  {
    code: 'COBIT-C22',
    name: 'Network segmentation for banking zones',
    description:
      'Core banking, internet banking DMZ, ATM network, SWIFT network, and office LAN are segmented via firewalls with strict ACL rules. Inter-zone traffic is limited to explicitly approved flows reviewed quarterly.',
    controlType: 'preventive',
    controlNature: 'automated',
    frequency: 'continuous',
    frameworkRef: 'DSS05.02',
  },
  // Code review
  {
    code: 'COBIT-C23',
    name: 'Mandatory code review for banking applications',
    description:
      'All code changes to core banking, payment, and internet banking applications require peer code review by a senior developer. Static application security testing (SAST) is integrated into the CI/CD pipeline.',
    controlType: 'preventive',
    controlNature: 'it_dependent',
    frequency: 'event_driven',
    frameworkRef: 'BAI03.05',
  },
  // Remote access
  {
    code: 'COBIT-C24',
    name: 'VPN access policy enforcement',
    description:
      'Remote access to banking network requires approved VPN connection with MFA, device compliance check (antivirus, OS patches), and session timeout of 30 minutes idle. Split tunneling is prohibited.',
    controlType: 'preventive',
    controlNature: 'automated',
    frequency: 'continuous',
    frameworkRef: 'DSS05.04',
  },
  // Incident response
  {
    code: 'COBIT-C25',
    name: 'Cybersecurity incident response plan',
    description:
      'Documented incident response plan covers detection, containment, eradication, and recovery phases for cyber incidents. Plan is tested via tabletop exercise annually and updated based on lessons learned.',
    controlType: 'corrective',
    controlNature: 'manual',
    frequency: 'annually',
    frameworkRef: 'DSS02.01',
  },
];

// -----------------------------------------------------------------------------
// Procedures
// -----------------------------------------------------------------------------
export const cobitProcedures: SeedProcedure[] = [
  // Access Management Procedures
  {
    code: 'COBIT-P01',
    name: 'Inspect user access provisioning forms',
    description:
      'Select a sample of 25 new user access requests from the past quarter. Inspect access request forms for completeness: requester, approver signatures (line manager + system owner), role requested, and date. Verify access granted matches approved request.',
    procedureType: 'inspection',
    procedureCategory: 'toc',
    frameworkRef: 'DSS05.04',
  },
  {
    code: 'COBIT-P02',
    name: 'Re-perform quarterly access review',
    description:
      'Obtain the most recent quarterly access review report. Select 15 users and independently verify their access rights are appropriate for their current job functions by comparing to HR records and role matrices. Document any excessive access not identified by the review.',
    procedureType: 're_performance',
    procedureCategory: 'toc',
    frameworkRef: 'DSS05.04',
  },
  {
    code: 'COBIT-P03',
    name: 'Review privileged access activity logs',
    description:
      'Obtain privileged account activity logs for 2 sample weeks. Verify all activities were reviewed by IT Security within 24 hours. Investigate any flagged anomalies (off-hours access, bulk data queries) and confirm appropriate follow-up actions were taken.',
    procedureType: 'inspection',
    procedureCategory: 'toc',
    frameworkRef: 'DSS05.05',
  },
  {
    code: 'COBIT-P04',
    name: 'Test terminated user access deactivation',
    description:
      'Obtain HR termination list for the past 6 months. Select 20 terminated employees and verify their core banking, email, VPN, and Active Directory accounts were deactivated within 24 hours of termination date.',
    procedureType: 're_performance',
    procedureCategory: 'toc',
    frameworkRef: 'DSS05.04',
  },
  {
    code: 'COBIT-P05',
    name: 'Verify MFA enforcement on critical systems',
    description:
      'Attempt to log into core banking, internet banking admin, payment switch, and VPN without the second authentication factor. Confirm that access is denied. Review MFA configuration settings to verify enforcement scope.',
    procedureType: 're_performance',
    procedureCategory: 'toc',
    frameworkRef: 'DSS05.04',
  },
  // Backup & DR Procedures
  {
    code: 'COBIT-P06',
    name: 'Inspect backup completion reports',
    description:
      'Obtain daily backup completion reports for 3 sample months. Verify all scheduled backups completed successfully. For any failures, confirm that alerts were generated and backups were re-run within the defined recovery window.',
    procedureType: 'inspection',
    procedureCategory: 'toc',
    frameworkRef: 'DSS04.07',
  },
  {
    code: 'COBIT-P07',
    name: 'Review DR test results and gap remediation',
    description:
      'Obtain the most recent DR test report. Verify that the test covered core banking failover, RTO/RPO measurement, and key transaction processing. Review any identified gaps and confirm remediation actions were completed.',
    procedureType: 'inspection',
    procedureCategory: 'toc',
    frameworkRef: 'DSS04.04',
  },
  {
    code: 'COBIT-P08',
    name: 'Observe backup restoration test',
    description:
      'Attend and observe a scheduled monthly backup restoration test. Verify the restoration process follows documented procedures, data integrity checks are performed, and results are formally recorded and signed off.',
    procedureType: 'observation',
    procedureCategory: 'toc',
    frameworkRef: 'DSS04.07',
  },
  // Cybersecurity Procedures
  {
    code: 'COBIT-P09',
    name: 'Analyze vulnerability scan results and remediation',
    description:
      'Obtain vulnerability scan reports for the past 3 months. Verify critical vulnerabilities were remediated within 7 days and high vulnerabilities within 30 days. Analyze any exceptions and assess compensating controls.',
    procedureType: 'analytical',
    procedureCategory: 'toc',
    frameworkRef: 'DSS05.03',
  },
  {
    code: 'COBIT-P10',
    name: 'Review WAF configuration and rule updates',
    description:
      'Inspect WAF configuration for internet banking. Verify OWASP Top 10 rules are enabled, custom rules are documented, and rule updates were applied within the past 30 days. Review blocked traffic logs for a sample week.',
    procedureType: 'inspection',
    procedureCategory: 'toc',
    frameworkRef: 'DSS05.02',
  },
  {
    code: 'COBIT-P11',
    name: 'Review SOC incident handling effectiveness',
    description:
      'Select 10 security alerts from the past quarter. Trace each alert through the SOC workflow: detection time, triage, escalation decision, and resolution. Verify SLA compliance and adequacy of response actions.',
    procedureType: 'walkthrough',
    procedureCategory: 'toc',
    frameworkRef: 'DSS05.07',
  },
  // Change Management Procedures
  {
    code: 'COBIT-P12',
    name: 'Inspect change request documentation and CAB approval',
    description:
      'Select 20 production changes from the past quarter. For each, verify: change request form completeness, risk assessment, test evidence, rollback plan, CAB approval, and post-implementation verification. Identify any unauthorized or emergency changes.',
    procedureType: 'inspection',
    procedureCategory: 'toc',
    frameworkRef: 'BAI06.01',
  },
  {
    code: 'COBIT-P13',
    name: 'Verify segregation of duties in deployment pipeline',
    description:
      'Review version control system access controls and CI/CD pipeline configuration. Verify that the same individual cannot both commit code and approve deployment. Test by attempting to self-approve a merge request.',
    procedureType: 're_performance',
    procedureCategory: 'toc',
    frameworkRef: 'BAI07.01',
  },
  {
    code: 'COBIT-P14',
    name: 'Review UAT sign-off documentation',
    description:
      'For 10 significant changes deployed in the past 6 months, inspect UAT documentation: test scripts, test results, defect logs, and business sign-off. Verify sign-off was obtained from the designated business process owner before production deployment.',
    procedureType: 'inspection',
    procedureCategory: 'toc',
    frameworkRef: 'BAI07.05',
  },
  // Project Management Procedures
  {
    code: 'COBIT-P15',
    name: 'Review IT project steering committee minutes',
    description:
      'Obtain steering committee meeting minutes for 2 major IT projects over the past year. Verify that meetings occurred monthly, key risks were discussed, budget variance was reported, and action items were tracked to closure.',
    procedureType: 'inspection',
    procedureCategory: 'toc',
    frameworkRef: 'BAI01.06',
  },
  // Security Testing Procedures
  {
    code: 'COBIT-P16',
    name: 'Review penetration test reports for banking applications',
    description:
      'Obtain penetration test reports for all banking applications released in the past year. Verify tests were conducted by qualified independent parties, all critical/high findings were remediated before go-live, and retest confirmed remediation.',
    procedureType: 'inspection',
    procedureCategory: 'toc',
    frameworkRef: 'BAI03.08',
  },
  // Governance Procedures
  {
    code: 'COBIT-P17',
    name: 'Assess IT strategic plan alignment',
    description:
      'Obtain the current IT strategic plan and bank business strategy. Map IT initiatives to business objectives and assess coverage. Inquire with CIO and business unit heads about perceived alignment gaps and unfunded IT priorities.',
    procedureType: 'inquiry',
    procedureCategory: 'substantive',
    frameworkRef: 'EDM01.01',
  },
  {
    code: 'COBIT-P18',
    name: 'Review IT investment business cases',
    description:
      'Select 5 IT investments approved in the past year. Inspect business cases for completeness of financial analysis (NPV, ROI, payback period). Verify CFO and steering committee approval. For completed projects, review benefits realization reports.',
    procedureType: 'inspection',
    procedureCategory: 'substantive',
    frameworkRef: 'EDM02.01',
  },
  {
    code: 'COBIT-P19',
    name: 'Review regulatory compliance self-assessment',
    description:
      'Obtain the most recent quarterly IT compliance self-assessment report. Verify assessment covers all applicable SBV circulars and PCI-DSS requirements. Review identified gaps and confirm remediation plans have defined owners and deadlines.',
    procedureType: 'inspection',
    procedureCategory: 'toc',
    frameworkRef: 'EDM03.02',
  },
  // Network Procedures
  {
    code: 'COBIT-P20',
    name: 'Review network segmentation and firewall rules',
    description:
      'Obtain firewall rule sets for inter-zone traffic between core banking, DMZ, ATM, SWIFT, and office networks. Verify rules follow least-privilege principle, any-any rules are absent, and the last quarterly review was completed and documented.',
    procedureType: 'inspection',
    procedureCategory: 'toc',
    frameworkRef: 'DSS05.02',
  },
  // Code review procedures
  {
    code: 'COBIT-P21',
    name: 'Verify code review enforcement in CI/CD pipeline',
    description:
      'Review repository branch protection settings for core banking applications. Verify that pull request approval from at least one senior developer is mandatory. Select 15 recent merges and confirm code review was completed before merge.',
    procedureType: 're_performance',
    procedureCategory: 'toc',
    frameworkRef: 'BAI03.05',
  },
  // Remote access procedures
  {
    code: 'COBIT-P22',
    name: 'Test VPN access policy compliance',
    description:
      'Attempt VPN connection with a non-compliant device (outdated antivirus, missing patches). Verify that the access policy check blocks the connection. Review VPN configuration for session timeout and split tunneling settings.',
    procedureType: 're_performance',
    procedureCategory: 'toc',
    frameworkRef: 'DSS05.04',
  },
  // Incident response procedure
  {
    code: 'COBIT-P23',
    name: 'Walkthrough cybersecurity incident response plan',
    description:
      'Conduct a walkthrough of the incident response plan with the SOC manager. Verify the plan covers all phases (detection, containment, eradication, recovery, lessons learned). Review the most recent tabletop exercise report and corrective actions.',
    procedureType: 'walkthrough',
    procedureCategory: 'toc',
    frameworkRef: 'DSS02.01',
  },
  // Post-incident review
  {
    code: 'COBIT-P24',
    name: 'Review post-incident analysis reports',
    description:
      'Obtain root cause analysis reports for all P1/P2 incidents in the past year. Verify reports were completed within 5 business days, root causes were identified, and preventive actions were implemented. Track repeat incidents by root cause category.',
    procedureType: 'inspection',
    procedureCategory: 'toc',
    frameworkRef: 'DSS02.07',
  },
  // IT incident SLA
  {
    code: 'COBIT-P25',
    name: 'Analyze IT incident resolution SLA compliance',
    description:
      'Extract incident tickets for the past 6 months from the ITSM tool. Calculate SLA compliance rates by severity level. For P1 incidents, verify escalation occurred within 15 minutes and business notification was sent. Identify trends in recurring incidents.',
    procedureType: 'analytical',
    procedureCategory: 'toc',
    frameworkRef: 'DSS02.02',
  },
];

// -----------------------------------------------------------------------------
// Risk-Control Mappings
// -----------------------------------------------------------------------------
export const cobitRiskControlMappings: SeedRiskControlMapping[] = [
  // R01 - IT strategy misalignment
  { riskCode: 'COBIT-R01', controlCode: 'COBIT-C18' },
  { riskCode: 'COBIT-R01', controlCode: 'COBIT-C19' },
  // R02 - Inadequate IT investment analysis
  { riskCode: 'COBIT-R02', controlCode: 'COBIT-C19' },
  { riskCode: 'COBIT-R02', controlCode: 'COBIT-C16' },
  // R03 - Non-compliance with SBV IT regulations
  { riskCode: 'COBIT-R03', controlCode: 'COBIT-C20' },
  // R04 - Unauthorized access to core banking
  { riskCode: 'COBIT-R04', controlCode: 'COBIT-C01' },
  { riskCode: 'COBIT-R04', controlCode: 'COBIT-C04' },
  { riskCode: 'COBIT-R04', controlCode: 'COBIT-C05' },
  // R05 - Excessive privileged access
  { riskCode: 'COBIT-R05', controlCode: 'COBIT-C02' },
  { riskCode: 'COBIT-R05', controlCode: 'COBIT-C03' },
  // R06 - Inadequate backup
  { riskCode: 'COBIT-R06', controlCode: 'COBIT-C06' },
  { riskCode: 'COBIT-R06', controlCode: 'COBIT-C21' },
  // R07 - Cyber attack on internet banking
  { riskCode: 'COBIT-R07', controlCode: 'COBIT-C08' },
  { riskCode: 'COBIT-R07', controlCode: 'COBIT-C10' },
  { riskCode: 'COBIT-R07', controlCode: 'COBIT-C22' },
  // R08 - Unpatched vulnerabilities
  { riskCode: 'COBIT-R08', controlCode: 'COBIT-C09' },
  // R09 - Delayed incident detection
  { riskCode: 'COBIT-R09', controlCode: 'COBIT-C10' },
  { riskCode: 'COBIT-R09', controlCode: 'COBIT-C11' },
  { riskCode: 'COBIT-R09', controlCode: 'COBIT-C25' },
  // R10 - Unauthorized changes to core banking
  { riskCode: 'COBIT-R10', controlCode: 'COBIT-C13' },
  { riskCode: 'COBIT-R10', controlCode: 'COBIT-C14' },
  { riskCode: 'COBIT-R10', controlCode: 'COBIT-C15' },
  // R11 - IT project delivery failures
  { riskCode: 'COBIT-R11', controlCode: 'COBIT-C16' },
  // R12 - Insufficient security testing
  { riskCode: 'COBIT-R12', controlCode: 'COBIT-C17' },
  { riskCode: 'COBIT-R12', controlCode: 'COBIT-C23' },
  // R13 - Inadequate dev/prod separation
  { riskCode: 'COBIT-R13', controlCode: 'COBIT-C14' },
  { riskCode: 'COBIT-R13', controlCode: 'COBIT-C23' },
  // R14 - Weak remote authentication
  { riskCode: 'COBIT-R14', controlCode: 'COBIT-C04' },
  { riskCode: 'COBIT-R14', controlCode: 'COBIT-C24' },
  // R15 - Untested DR plan
  { riskCode: 'COBIT-R15', controlCode: 'COBIT-C07' },
  { riskCode: 'COBIT-R15', controlCode: 'COBIT-C21' },
];

// -----------------------------------------------------------------------------
// Control-Procedure Mappings
// -----------------------------------------------------------------------------
export const cobitControlProcedureMappings: SeedControlProcedureMapping[] = [
  // C01 - RBAC
  { controlCode: 'COBIT-C01', procedureCode: 'COBIT-P01' },
  { controlCode: 'COBIT-C01', procedureCode: 'COBIT-P02' },
  // C02 - Quarterly access review
  { controlCode: 'COBIT-C02', procedureCode: 'COBIT-P02' },
  // C03 - Privileged access monitoring
  { controlCode: 'COBIT-C03', procedureCode: 'COBIT-P03' },
  // C04 - MFA
  { controlCode: 'COBIT-C04', procedureCode: 'COBIT-P05' },
  // C05 - Provisioning/de-provisioning
  { controlCode: 'COBIT-C05', procedureCode: 'COBIT-P01' },
  { controlCode: 'COBIT-C05', procedureCode: 'COBIT-P04' },
  // C06 - Daily backup
  { controlCode: 'COBIT-C06', procedureCode: 'COBIT-P06' },
  // C07 - DR testing
  { controlCode: 'COBIT-C07', procedureCode: 'COBIT-P07' },
  // C08 - WAF
  { controlCode: 'COBIT-C08', procedureCode: 'COBIT-P10' },
  // C09 - Vulnerability scanning
  { controlCode: 'COBIT-C09', procedureCode: 'COBIT-P09' },
  // C10 - SOC monitoring
  { controlCode: 'COBIT-C10', procedureCode: 'COBIT-P11' },
  // C11 - Incident escalation
  { controlCode: 'COBIT-C11', procedureCode: 'COBIT-P25' },
  // C12 - Post-incident review
  { controlCode: 'COBIT-C12', procedureCode: 'COBIT-P24' },
  // C13 - CAB approval
  { controlCode: 'COBIT-C13', procedureCode: 'COBIT-P12' },
  // C14 - SoD in SDLC
  { controlCode: 'COBIT-C14', procedureCode: 'COBIT-P13' },
  // C15 - UAT sign-off
  { controlCode: 'COBIT-C15', procedureCode: 'COBIT-P14' },
  // C16 - Steering committee
  { controlCode: 'COBIT-C16', procedureCode: 'COBIT-P15' },
  // C17 - Pen testing
  { controlCode: 'COBIT-C17', procedureCode: 'COBIT-P16' },
  // C18 - IT strategic plan review
  { controlCode: 'COBIT-C18', procedureCode: 'COBIT-P17' },
  // C19 - Investment business case
  { controlCode: 'COBIT-C19', procedureCode: 'COBIT-P18' },
  // C20 - Regulatory self-assessment
  { controlCode: 'COBIT-C20', procedureCode: 'COBIT-P19' },
  // C21 - Backup restoration testing
  { controlCode: 'COBIT-C21', procedureCode: 'COBIT-P08' },
  // C22 - Network segmentation
  { controlCode: 'COBIT-C22', procedureCode: 'COBIT-P20' },
  // C23 - Code review
  { controlCode: 'COBIT-C23', procedureCode: 'COBIT-P21' },
  // C24 - VPN policy
  { controlCode: 'COBIT-C24', procedureCode: 'COBIT-P22' },
  // C25 - Incident response plan
  { controlCode: 'COBIT-C25', procedureCode: 'COBIT-P23' },
];
