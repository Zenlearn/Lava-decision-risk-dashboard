export const DASHBOARD_DEFINITIONS = {
  kpiCalculations: [
    {
      title: 'Estimated monthly leakage exposure',
      definition: 'Calculated strictly for Service at Home (S@H / Doorstep) work orders (excluding Customer Walk-in and Trade Walk-in calls): (PCBA count × PCBA cost) + (LCD count × LCD cost) across anomalous doorstep repairs, plus (repeat home-visit bounces × travel cost). Board-level parts only — battery/charger swaps are excluded as legitimate doorstep work. Unit costs align with Part Exposure settings. Annualised run-rate = monthly × 12.'
    },
    {
      title: 'First-time fix rate (FTFR)',
      definition: '1 − (work orders with a repeat visit on the same device ÷ total work orders that month) × 100. A "repeat" is the same valid IMEI returning for service (accessories excluded). The inverse of the repeat-bounce signal.'
    },
    {
      title: 'Customer satisfaction (C-SAT)',
      definition: 'Share of responding customers who rated 4 or 5, on Lava\'s 1–5 post-service scale: (ratings of 4 or 5 ÷ all ratings of 1–5) × 100. "No Response" rows are excluded from both numerator and denominator. Roughly half of customers do not respond.'
    },
    {
      title: 'Net Promoter Score (NPS)',
      definition: 'Calculated on Lava\'s 1–5 post-service survey scale as: % Promoters (Rating 5) − % Detractors (Ratings 1 & 2). Ratings 3 & 4 are classified as Passives and excluded from the net score calculation. NPS Score = % Promoters − % Detractors. Expressed as a net score from −100% to +100%. Default view shows Smart Phone surveys only — toggle "All Devices" to include Feature Phones.'
    },
    {
      title: 'Response Rate (RR %)',
      definition: 'Share of total dispatched customer surveys that returned a completed rating: (Total Responded Surveys [Ratings 1 to 5] ÷ Total Surveys Sent [Grand Total]) × 100. "No Response" and Language/System error calls (LS) are excluded from the numerator.'
    },
    {
      title: 'DSAT — Detractor Satisfaction Rate',
      definition: 'Share of responding customers who gave a Detractor rating (1 or 2 stars out of 5). DSAT = Detractor Count ÷ Total Responses × 100. DSAT root causes are captured via a follow-up IVR question and classified into six categories: Delay in Service, Repair Quality, ASP Behaviour, Replacement / Product Quality Issue, High Repair Cost, and Deny in Service.'
    },
    {
      title: 'CPC — Cost Per Complaint (₹)',
      definition: 'Total estimated doorstep-repair cost exposure for a BUSM or ASM region in the month, divided by the number of flagged work orders. CPC = Total Leakage Exposure (₹) ÷ Total Flagged Work Orders. A higher CPC indicates higher average financial risk per complaint event. Calculated using part-cost settings in the Part Exposure tab.'
    },
    {
      title: 'TAT % — Turnaround Time Adherence',
      definition: 'Percentage of work orders closed within the target resolution window. TAT % = (Work orders closed within target days ÷ Total work orders) × 100. Closure speed bands tracked: 1-day (same-day), 2-day, 3-day, and 5+ day (breach). A lower 5+-day closure % and higher 1-day closure % indicate better speed performance. "Still Open" = work orders with no closure date at time of data extract.'
    },
    {
      title: 'S@H Adherence % — Service at Home Compliance',
      definition: 'Share of doorstep (Service at Home) work orders that comply with Lava\'s S@H policy: (S@H WOs without board-level PCBA/LCD repairs ÷ Total S@H WOs) × 100. Board-level parts (PCBA = Printed Circuit Board Assembly, LCD = display module) must be repaired at the ASP workshop per policy; repairs logged as completed at the customer\'s home contradict this policy and reduce adherence. Higher is better.'
    },
    {
      title: 'CAG Scorecard — Composite Aggregate Grade',
      definition: 'A weighted composite score combining TAT adherence, CPC risk, S@H compliance, NPS, and Diagnostic Accuracy for each BUSM or ASM region. Ranked 1 (best) to 5 (worst) within the national peer group. Designed for executive triage: rank 1–3 = immediate coaching, rank 4–10 = watch-list monitoring, rank 11+ = within acceptable range.'
    },
    {
      title: 'Mean time to repair (MTTR)',
      definition: 'Average turnaround in days for that month = mean of (Delivery Date − Creation Date) across all work orders. Reported to two decimals.'
    },
    {
      title: 'Diagnostic accuracy',
      definition: '1 − (mismatch-that-bounced work orders ÷ total work orders) × 100. A "mismatch-that-bounced" is a hardware symptom closed with a software-only action that then returned for service — a confirmed mis-diagnosis. A leading indicator of FTFR.'
    }
  ],

  kpiNote: 'All counts are for the latest month unless stated. Leakage calculations filter strictly for Service at Home (S@H) work orders, excluding Customer Walk-in and Trade Walk-in calls. NPS scale: Promoters = Rating 5 ★, Passives = Ratings 3–4 ★, Detractors = Ratings 1–2 ★. NPS Score = % Promoters − % Detractors. Default NPS view shows Smart Phone surveys only (Feature Phones excluded) — toggle "All Devices" to include both. C-SAT = % respondents rating 4 or 5. Response Rate = responded surveys ÷ total surveys sent. Targets: C-SAT 95% is Lava\'s published standard; FTFR, MTTR and diagnostic-accuracy targets are indicative and should be confirmed with Lava.',

  executiveFootnote: 'These KPIs are expressed in Lava\'s own service language. Each is driven by an underlying decision-risk signal measured in the Score Card and Evidence tabs: bounces → first-time fix, detractors → satisfaction & NPS, turnaround → MTTR & TAT, mis-fixes that bounce → diagnostic accuracy, doorstep board-repairs → S@H adherence, cost per complaint → CPC. Rupee figures reflect Service at Home (S@H) doorstep exposure using component costs set in the Part Exposure tab (excluding walk-in calls). CSAT target (95%) is Lava\'s published standard; other targets are indicative and should be confirmed with Lava.',

  orgKpiFootnote: 'Abbreviations & definitions for this page — BUSM: Business Unit Sales Manager (regional head). ASM: Area Sales Manager (territory supervisor). ASP: Authorised Service Partner (repair centre). S@H: Service at Home (doorstep repair). CPC (₹): Cost Per Complaint = estimated leakage exposure ÷ flagged work orders. CAG: Composite Aggregate Grade — a weighted performance score across TAT, CPC, S@H adherence, NPS and Diagnostic Accuracy. TAT: Turnaround Time (work-order closure speed). DSAT: Detractor Satisfaction — customers who rated 1 or 2 ★ on the post-service survey. NPS rating categories: Promoters = Rating 5 ★ | Passives = Ratings 3–4 ★ | Detractors = Ratings 1–2 ★. NPS Score = % Promoters − % Detractors. Default NPS scope = Smart Phone surveys only; Feature Phones are excluded to isolate smartphone service quality. PCBA = Printed Circuit Board Assembly (main board); LCD = display module. All rupee values are provisional pending confirmation of the Lava part-cost master.',

  globalFooter: 'ZenLearn Decision Risk Measurement - built for verification, not accusation - all rupee values provisional pending Lava part-cost master',
  
  cohortThresholds: {
    plainTerms: 'In plain terms: we compare every ASM\'s flag rate against their peers. The "investigate-first line" marks ASMs who are clearly worse than the pack — start with them. The "watch line" marks the worst 10% — the focus group for training. The two right columns count how many ASMs cross each line. Click any row to see their names.',
    statistics: 'The statistics, if you want them: for each indicator we take every ASM with 100+ workorders (smaller ASMs are excluded as statistically unreliable) and compute that ASM\'s rate = flagged workorders / total workorders for that indicator. We then look at the spread of those rates across all qualifying ASMs. Cohort mean % is the average rate; Std dev is how much ASMs vary around it. Strict = mean + 2 standard deviations — an ASM above this is a genuine statistical outlier (only ~2% of a normal distribution sits here), so investigate these first. Focus = P90 — the 90th-percentile rate, i.e. the worst 10% of peers, useful for where to concentrate training even if not extreme. Click any row to see exactly which ASMs are over each line and their actual rate.'
  },

  homeIntegrity: {
    policyText: 'Lava\'s Service-At-Home policy allows software and minor repairs at the doorstep (legitimate, same-day). But the policy also states that major / board-level repairs must return to the ASP. Board-level (PCBA / LCD) repairs logged as completed at the customer\'s home therefore contradict the written policy - the home-visit equivalent of a ghost repair, and arguably the strongest single integrity signal in the dataset.',
    partsGlossary: 'PCBA = Printed Circuit Board Assembly (the phone\'s main board). LCD = the display module. Both are board-level parts that, per policy, require workshop tools and cannot be swapped reliably at a doorstep.'
  },

  detectability: {
    intro: 'Known service-industry fraud types (from published warranty-fraud research), mapped to whether this dataset can surface them. Being explicit about the boundary is what makes the findings defensible.',
    benchmark: 'Industry benchmark: published estimates put up to ~10% of total warranty cost as fraudulent (across customers, service partners and dealers). Treat this as an industry figure to test against Lava\'s own warranty cost base - not a claim about Lava.'
  },

  costMaster: {
    disclaimer: '⚠ These are assumed placeholder costs, not real Lava prices. Edit the values below - every rupee figure across all tabs recalculates live. Your edits are remembered in this browser. Click "Reset to defaults" to restore. Currently PCBA, LCD and Travel Fee drive the exposure calculations; the other families are here so Lava can price them as the flag set expands.',
    exposureLogic: 'Exposure logic: Same-day swap exposure = (PCBA count × PCBA cost) + (LCD count × LCD cost) on same-day walk-in board jobs. Board-at-home exposure = same logic on board-at-home counts. Travel exposure = home-visit bounce count × travel cost. Counts come from the data; you control the unit costs.'
  },

  evidence: {
    disclaimer: 'Every flagged workorder carries its exact unedited Excel row number from the source file, so any case can be pulled and verified before action. Use the filters for a targeted spot-check by city, ASP, ASM, part or model.'
  }
};
