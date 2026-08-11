// One row per ticker mentioned anywhere in the dashboard.
//
// TRANSCRIPTION, NOT RESEARCH. Every figure here was copied out of an existing
// section or research note. Nothing was re-derived, re-estimated or refreshed.
// Where a source does not state a number, the field is absent — never guessed.
//
// ---------------------------------------------------------------------------
// asOf — the date the market data was true
// ---------------------------------------------------------------------------
//   photonics  2026-08-07  stated: "market data as of the 7 August 2026 close"
//   crypto     2026-07-09  stated: single CoinGecko snapshot, July 9 2026
//   quantum    2026-07-09  page says "point-in-time (early/mid-July 2026)" with
//                          no exact date; the page build date is used as the
//                          latest possible date the figures were true.
//   agentic    2026-07-09  page says figures are "as supplied" from a note
//                          "dated July 2026", not independently re-verified;
//                          same upper-bound convention as quantum.
//   robotics   2026-07-09  page says data vintage "Q1 2026 reported"; no market
//                          caps exist in the source at all (see below).
//   biology    2026-07-07  page says data vintage "Q1 2026 reported"; only two
//                          market caps appear anywhere in the source.
//
// ---------------------------------------------------------------------------
// Market-cap coverage — read this before trusting any weighted number
// ---------------------------------------------------------------------------
// The photonics table is the only section that carries a market cap per row.
// Agentic, quantum and crypto carry one too. Robotics carries NONE (its table
// columns are revenue and cash) and biology carries two. Any "% by market cap"
// therefore covered a subset. Live data closes most of that gap at read time —
// see src/data/market-data.ts — and the exposure tab states its own coverage
// per row rather than implying it is complete.
//
// ---------------------------------------------------------------------------
// conviction — DERIVED, NOT MATTHIAS'S OWN JUDGEMENT
// ---------------------------------------------------------------------------
// Matthias has not set convictions. On his instruction (2026-08-08) these are
// derived mechanically from each dashboard's own risk-profile tier:
//
//     Profile A (lower variance)      -> 4
//     Profile B (platform / gov bet)  -> 3
//     Profile C (option value)        -> 2
//     no tier in the source           -> 1
//
// with two caps applied on top, both of them the source's own words:
//   1. No documented `edge` -> capped at 2 (the brief's rule).
//   2. A source that explicitly says the name is NOT real exposure to its
//      theme -> capped at 2, whatever its tier. This catches NVDA in
//      robotics/quantum/biology, the adjacent photonics names (IPGP, LASR,
//      LPTH, 6965), ZTE, and the quantum large caps.
//
// Risk tier is not conviction. Treat this column as a placeholder with a
// documented rule, not as a view.
//
// ---------------------------------------------------------------------------
// edge — filled only where a source makes an explicit "the market is wrong"
// claim. Analyst target gaps are deliberately NOT treated as edge: sell-side
// targets lag price mechanically, so a wide gap mostly means targets have not
// been marked down yet.

export type Factor =
  | 'ai-capex' // hyperscaler capital expenditure
  | 'ai-adoption' // software/services monetisation of AI
  | 'risk-appetite' // speculative-tech and crypto beta
  | 'gov-capital' // federal/state programme spend
  | 'biotech-idio' // trial and regulatory outcomes
  | 'industrial-cycle' // non-AI industrial demand
  | 'rates-macro'

export const FACTOR_LABELS: Record<Factor, string> = {
  'ai-capex': 'Hyperscaler AI capex',
  'ai-adoption': 'AI adoption / monetisation',
  'risk-appetite': 'Risk appetite',
  'gov-capital': 'Government capital',
  'biotech-idio': 'Biotech idiosyncratic',
  'industrial-cycle': 'Industrial cycle',
  'rates-macro': 'Rates / macro',
}

/** Which side the dashboard describes. Several names are flagged by their own
 *  section as context, not exposure — counting one as a long would misstate
 *  the book. 'short' and 'pair' are retained: the removed Citrini section used
 *  them, and a future section may. */
export type Stance = 'long' | 'short' | 'pair' | 'context'

/** Which side of a named technical fork a position sits on.
 *
 *  Several `edge` fields in this file describe the SAME fork from opposite
 *  sides — Marvell owns ~70% of the optical DSP market, Semtech is "the direct
 *  short leg against Marvell's DSP TAM" — and nothing downstream noticed.
 *  Sized side by side, the idiosyncratic half of each bet cancels and what is
 *  left is sector beta paid for twice. `fork` names the disagreement, `side`
 *  names the position taken. Only filled where a source in this repo states
 *  the relationship; left absent for names their own source calls
 *  architecture-agnostic (Fabrinet, Tower). */
export interface ArchitecturalBet {
  fork: string
  side: string
}

export interface Position {
  ticker: string
  exchange: string
  name: string
  /** Which tabs mention it. Length > 1 is the overlap signal. */
  sections: string[]
  /** Ordered, primary driver first. A name with only ['ai-capex'] is pure beta. */
  factors: Factor[]
  /** Where in the value chain the economics sit. */
  chainLayer?: 'substrate' | 'component' | 'module' | 'system' | 'demand-setter'
  marketCapUsd?: number
  /** ISO date the market data was true. Required. */
  asOf: string
  conviction: 1 | 2 | 3 | 4 | 5
  /** Why the market is wrong, specifically. If this is empty, cap conviction at 2. */
  edge?: string
  stance: Stance
  /** Which side of a named technical fork this position takes, where a source
   *  states it. See ArchitecturalBet. */
  architecturalBet?: ArchitecturalBet
  /** Set only where the source itself frames the name as a hedge against the
   *  book's own thesis rather than an expression of it. Lets a deliberate
   *  offset sit next to its opposite without the allocator treating it as an
   *  accident. */
  hedge?: boolean
  /** Transcription caveats: what the source did not say, and what was assumed. */
  note?: string
}

// The six thematic research sections — since 11 Aug 2026 the whole book.
// Kept as an explicit list rather than derived from the data, so a section
// added later has to be classified deliberately instead of silently joining
// the concentration figures.
export const THEMATIC_SECTIONS = [
  'photonics',
  'biology',
  'robotics',
  'quantum',
  'agentic',
  'crypto',
] as const

export const positions: Position[] = [
  // =========================================================================
  // PHOTONICS — 33 tickers. Market data 7 Aug 2026 close.
  // Market caps transcribed from the `capUsd` field of the section's own
  // comparison table (USD bn). Asian caps there are already converted at the
  // note's stated FX assumption (USD/CNY 6.7372, USD/JPY 157.65,
  // USD/TWD ~32.25) — carried across as-is, not recomputed.
  // =========================================================================
  {
    ticker: 'LITE',
    exchange: 'Nasdaq',
    name: 'Lumentum',
    sections: ['photonics'],
    factors: ['ai-capex'],
    chainLayer: 'component',
    marketCapUsd: 69.26,
    asOf: '2026-08-07',
    conviction: 3,
    edge: 'Volume supplier of the 200G-per-lane EML — the component that gates 1.6T module production. 200G EML revenue more than doubled sequentially and management guides EML units up >50% by the Dec 2026 quarter.',
    architecturalBet: { fork: 'interconnect', side: 'optical' },
    stance: 'long',
    note: 'The section\'s own bear case is duration, not demand: a 169x trailing multiple assumes the two-supplier structure persists for years.',
  },
  {
    ticker: 'COHR',
    exchange: 'NYSE',
    name: 'Coherent',
    sections: ['photonics'],
    factors: ['ai-capex'],
    chainLayer: 'component',
    marketCapUsd: 74.17,
    asOf: '2026-08-07',
    conviction: 3,
    edge: 'Nvidia took a $2bn equity stake (2 Mar 2026) with a multi-year supply agreement, funding a doubling of six-inch InP capacity a quarter ahead of plan and more than a quadrupling by end-2027. The customer is funding the supplier.',
    architecturalBet: { fork: 'interconnect', side: 'optical' },
    stance: 'long',
    note: 'Section flags that price has essentially met consensus, and that the move came on the FCC headline rather than company news.',
  },
  {
    ticker: 'AXTI',
    exchange: 'Nasdaq',
    name: 'AXT',
    sections: ['photonics'],
    factors: ['ai-capex'],
    chainLayer: 'substrate',
    marketCapUsd: 5.65,
    asOf: '2026-08-07',
    conviction: 3,
    edge: 'The purest listed expression of the indium phosphide bottleneck, which the section calls the hardest constraint in the chain; doubling capacity by end-2027.',
    architecturalBet: { fork: 'interconnect', side: 'optical' },
    stance: 'long',
    note: '$126m of revenue against a $5.65bn cap; +17.8% in the 7 Aug session.',
  },
  {
    ticker: '688498',
    exchange: 'Shanghai STAR',
    name: 'Yuanjie Semiconductor',
    sections: ['photonics'],
    factors: ['ai-capex', 'gov-capital', 'risk-appetite'],
    chainLayer: 'component',
    marketCapUsd: 25.0,
    asOf: '2026-08-07',
    conviction: 2,
    stance: 'long',
    note: '472x PE on ¥872m of revenue. Section reads the multiple as a domestic-supply premium: "China is paying almost any multiple for domestic laser-chip supply."',
  },
  {
    ticker: '3081',
    exchange: 'Taipei Exchange',
    name: 'LandMark Optoelectronics',
    sections: ['photonics'],
    factors: ['ai-capex', 'risk-appetite'],
    chainLayer: 'substrate',
    marketCapUsd: 7.27,
    asOf: '2026-08-07',
    conviction: 2,
    stance: 'long',
    note: 'EML/DFB/APD epiwafers, upstream of the EML shortage. 333x PE, +555% over 12 months.',
  },
  {
    ticker: '4979',
    exchange: 'Taipei Exchange',
    name: 'LuxNet',
    sections: ['photonics'],
    factors: ['ai-capex', 'risk-appetite'],
    chainLayer: 'component',
    marketCapUsd: 2.13,
    asOf: '2026-08-07',
    conviction: 2,
    stance: 'long',
    note: 'Section calls it the worst multiple-to-growth fit in the set: 90x PE on 16.8% growth.',
  },
  {
    ticker: '300308',
    exchange: 'Shenzhen (+3308.HK)',
    name: 'Zhongji Innolight',
    sections: ['photonics'],
    factors: ['ai-capex'],
    chainLayer: 'module',
    marketCapUsd: 160.0,
    asOf: '2026-08-07',
    conviction: 3,
    edge: 'Earmarked roughly a quarter of its HK$53.4bn IPO proceeds for strategic inventory of InP and laser chips — an unusually direct signal about where the scarcity actually is.',
    architecturalBet: { fork: 'interconnect', side: 'optical' },
    stance: 'long',
    note: 'Global #1 at ~27% transceiver share, and therefore the most exposed name to the reported (unpublished, unconfirmed) FCC import ban.',
  },
  {
    ticker: '300502',
    exchange: 'Shenzhen',
    name: 'Eoptolink',
    sections: ['photonics'],
    factors: ['ai-capex', 'risk-appetite'],
    chainLayer: 'module',
    marketCapUsd: 87.1,
    asOf: '2026-08-07',
    conviction: 4,
    edge: 'Fastest revenue growth in the entire covered universe at +151.4%, on a 54.7x PE — the lowest multiple among the high-growth Chinese module names.',
    architecturalBet: { fork: 'interconnect', side: 'optical' },
    stance: 'long',
    note: 'Same FCC ban exposure as Innolight; +216% over 12 months.',
  },
  {
    ticker: '002281',
    exchange: 'Shenzhen',
    name: 'Accelink',
    sections: ['photonics'],
    factors: ['ai-capex', 'gov-capital'],
    chainLayer: 'module',
    marketCapUsd: 23.7,
    asOf: '2026-08-07',
    conviction: 2,
    stance: 'long',
    note: '147x PE on 36% growth; state-linked.',
  },
  {
    ticker: 'AAOI',
    exchange: 'Nasdaq',
    name: 'Applied Optoelectronics',
    sections: ['photonics'],
    factors: ['ai-capex', 'risk-appetite'],
    chainLayer: 'module',
    marketCapUsd: 11.47,
    asOf: '2026-08-07',
    conviction: 3,
    edge: 'The clearest sentiment split in the report: short interest 21.8% of float and RISING into a record quarter (12.9m -> 14.4m shares) while the sell side sits neutral. Mechanical, checkable, and not a target gap.',
    architecturalBet: { fork: 'interconnect', side: 'optical' },
    stance: 'long',
    note: 'Beta 3.79. Bear case is a ~30% gross-margin manufacturer priced like a technology franchise. Microsoft was ~29% of 2025 revenue.',
  },
  {
    ticker: 'TSEM',
    exchange: 'Nasdaq',
    name: 'Tower Semiconductor',
    sections: ['photonics'],
    factors: ['ai-capex', 'gov-capital'],
    chainLayer: 'component',
    marketCapUsd: 28.47,
    asOf: '2026-08-07',
    conviction: 3,
    edge: 'The merchant silicon-photonics foundry — the only listed way to own the manufacturing layer without picking an architecture. $3bn Japan expansion carries $1bn of government grants.',
    stance: 'long',
    note: 'Slowest revenue growth (+14.9%) in the high-multiple cohort; the multiple is on the silicon-photonics option, not the current P&L.',
  },
  {
    ticker: 'POET',
    exchange: 'Nasdaq / TSXV',
    name: 'POET Technologies',
    sections: ['photonics'],
    factors: ['risk-appetite', 'ai-capex'],
    chainLayer: 'component',
    marketCapUsd: 1.54,
    asOf: '2026-08-07',
    conviction: 2,
    stance: 'long',
    note: 'Section is explicit: "$1.5bn valuation on ~$1.4m of revenue is option value, not a business." Marvell cancelled major purchase orders in April 2026; shareholder suits followed.',
  },
  {
    ticker: 'MRVL',
    exchange: 'Nasdaq',
    name: 'Marvell',
    sections: ['photonics'],
    factors: ['ai-capex'],
    chainLayer: 'component',
    marketCapUsd: 191.55,
    asOf: '2026-08-07',
    conviction: 3,
    edge: 'DSP unit volume and optical module unit volume are the same number — one DSP per module — and Marvell holds ~70% of the optical DSP market. It is a unit-volume claim on the whole module layer without module-maker margins.',
    architecturalBet: { fork: 'module-dsp', side: 'dsp' },
    stance: 'long',
    note: 'Two live risks named: Broadcom\'s Sian3/Sian2M DSP attack, and LPO removing the DSP from the module entirely.',
  },
  {
    ticker: 'AVGO',
    exchange: 'Nasdaq',
    name: 'Broadcom',
    sections: ['photonics'],
    factors: ['ai-capex'],
    chainLayer: 'component',
    marketCapUsd: 2040,
    asOf: '2026-08-07',
    conviction: 3,
    edge: 'Cheapest forward multiple in the set (27.1x) while owning the switching ASIC, the CPO platform and a credible 200G/lane DSP line — the section calls it the lowest-purity, highest-quality way to own the theme.',
    stance: 'long',
    note: 'Photonics is a minority of a business dominated by custom AI accelerators and software.',
  },
  {
    ticker: 'CRDO',
    exchange: 'Nasdaq',
    name: 'Credo Technology',
    sections: ['photonics'],
    factors: ['ai-capex'],
    chainLayer: 'component',
    marketCapUsd: 46.6,
    asOf: '2026-08-07',
    conviction: 3,
    edge: 'Owns active electrical cables — the copper answer to short-reach optics — which makes it a partial HEDGE against the optical thesis rather than a pure expression of it. Every quarter in-rack copper holds is a quarter Credo wins and the module makers lose.',
    architecturalBet: { fork: 'interconnect', side: 'copper' },
    hedge: true,
    stance: 'long',
    note: 'Revenue +205.7%; FY2027 guidance implies >80% growth.',
  },
  {
    ticker: 'ALAB',
    exchange: 'Nasdaq',
    name: 'Astera Labs',
    sections: ['photonics', 'quantum'],
    factors: ['ai-capex'],
    chainLayer: 'component',
    marketCapUsd: 57.97,
    asOf: '2026-08-07',
    conviction: 3,
    edge: '72% non-GAAP gross margin while growing 100%+ separates it from every optical-module name. The comparison that matters is not optics at all — it is Marvell (48.2x fwd) and Broadcom (27.1x), which compete for the same silicon budget with far more diversified revenue.',
    architecturalBet: { fork: 'interconnect', side: 'copper' },
    hedge: true,
    stance: 'long',
    note: 'Concentration is the central risk and the exact figure could not be verified: the section states SEC EDGAR blocked automated retrieval of the Q2 2026 10-Q table, so the ">70% of 2025 revenue from one customer" figure is approximate and unconfirmed. Also carried by the quantum section as an indirect enabler (QTUM holding), where that section itself calls the exposure indirect.',
  },
  {
    ticker: 'SMTC',
    exchange: 'Nasdaq',
    name: 'Semtech',
    sections: ['photonics'],
    factors: ['ai-capex'],
    chainLayer: 'component',
    marketCapUsd: 12.99,
    asOf: '2026-08-07',
    conviction: 3,
    edge: 'The listed champion of LPO, which removes the DSP from the module. It is the direct short leg against Marvell\'s DSP TAM — a specific architectural fork, not a valuation argument.',
    architecturalBet: { fork: 'module-dsp', side: 'lpo' },
    stance: 'long',
    note: 'GAAP-unprofitable. The whole thesis depends on LPO winning share.',
  },
  {
    ticker: 'MXL',
    exchange: 'Nasdaq',
    name: 'MaxLinear',
    sections: ['photonics'],
    factors: ['ai-capex'],
    chainLayer: 'component',
    marketCapUsd: 6.8,
    asOf: '2026-08-07',
    conviction: 2,
    stance: 'long',
    note: 'GAAP-unprofitable; section calls it sub-scale against Marvell and Broadcom.',
  },
  {
    ticker: 'MTSI',
    exchange: 'Nasdaq',
    name: 'MACOM',
    sections: ['photonics'],
    factors: ['ai-capex', 'industrial-cycle'],
    chainLayer: 'component',
    marketCapUsd: 23.71,
    asOf: '2026-08-07',
    conviction: 3,
    edge: 'Q4 guided $415–425m against $366m consensus — one of the largest guidance beats in the group, and a company statement rather than an analyst opinion.',
    stance: 'long',
    note: '99x trailing PE on 28% growth; section notes the guidance beat may already be priced.',
  },
  {
    ticker: 'FN',
    exchange: 'NYSE',
    name: 'Fabrinet',
    sections: ['photonics'],
    factors: ['ai-capex'],
    chainLayer: 'module',
    marketCapUsd: 20.15,
    asOf: '2026-08-07',
    conviction: 3,
    edge: 'Owns manufacturing capacity rather than technology, so it is long the whole Western chain regardless of which architecture wins. Manufactures for Lumentum, Ciena and Nvidia simultaneously.',
    stance: 'long',
    note: 'Nvidia was 27.6% of fiscal 2025 revenue. CPO adoption could in principle disintermediate pluggable-module assembly. The +30% consensus gap is NOT counted as edge (nine covering analysts; target lag).',
  },
  {
    ticker: 'GLW',
    exchange: 'NYSE',
    name: 'Corning',
    sections: ['photonics'],
    factors: ['ai-capex', 'industrial-cycle'],
    chainLayer: 'component',
    marketCapUsd: 142.71,
    asOf: '2026-08-07',
    conviction: 2,
    stance: 'long',
    note: 'Large non-AI ballast (display, automotive) dilutes the theme.',
  },
  {
    ticker: '300394',
    exchange: 'Shenzhen',
    name: 'Suzhou TFC Optical',
    sections: ['photonics'],
    factors: ['ai-capex'],
    chainLayer: 'component',
    marketCapUsd: 37.3,
    asOf: '2026-08-07',
    conviction: 2,
    stance: 'long',
    note: '115.9x PE; passive-component commoditisation plus FCC ban exposure.',
  },
  {
    ticker: '5803',
    exchange: 'Tokyo',
    name: 'Fujikura',
    sections: ['photonics'],
    factors: ['ai-capex', 'industrial-cycle'],
    chainLayer: 'component',
    marketCapUsd: 54.5,
    asOf: '2026-08-07',
    conviction: 2,
    stance: 'long',
    note: 'Standout Japanese performer of the cycle; section says it is priced for the cycle after a large re-rate.',
  },
  {
    ticker: '5802',
    exchange: 'Tokyo',
    name: 'Sumitomo Electric',
    sections: ['photonics'],
    factors: ['industrial-cycle', 'ai-capex'],
    chainLayer: 'component',
    marketCapUsd: 42.1,
    asOf: '2026-08-07',
    conviction: 2,
    stance: 'long',
    note: 'Cheapest name in the photonics report at 16.6x PE, but the section is explicit that the optical exposure is heavily diluted inside a very large industrial conglomerate — hence industrial-cycle first.',
  },
  {
    ticker: '5801',
    exchange: 'Tokyo',
    name: 'Furukawa Electric',
    sections: ['photonics'],
    factors: ['industrial-cycle', 'ai-capex'],
    chainLayer: 'component',
    marketCapUsd: 17.2,
    asOf: '2026-08-07',
    conviction: 2,
    stance: 'long',
    note: 'Same dilution as Sumitomo; section says the conglomerate discount is deserved.',
  },
  {
    ticker: 'CIEN',
    exchange: 'NYSE',
    name: 'Ciena',
    sections: ['photonics'],
    factors: ['ai-capex', 'industrial-cycle'],
    chainLayer: 'system',
    marketCapUsd: 58.38,
    asOf: '2026-08-07',
    conviction: 2,
    stance: 'long',
    note: '800ZR share contested where 400G was effectively an Acacia/Marvell duopoly; telco capex cyclicality.',
  },
  {
    ticker: 'ANET',
    exchange: 'NYSE',
    name: 'Arista Networks',
    sections: ['photonics'],
    factors: ['ai-capex'],
    chainLayer: 'system',
    marketCapUsd: 237.96,
    asOf: '2026-08-07',
    conviction: 3,
    edge: 'The demand-side proof point: Arista\'s order book is a direct read-through for transceiver volumes, so it prices the same cycle one step earlier than the component names.',
    stance: 'long',
    note: 'Hyperscaler concentration; white-box competition. FY2026 guidance raised to ~$12.6bn (+40%).',
  },
  {
    ticker: 'NVDA',
    exchange: 'Nasdaq',
    name: 'NVIDIA',
    sections: ['photonics', 'biology', 'robotics', 'quantum'],
    factors: ['ai-capex'],
    chainLayer: 'demand-setter',
    marketCapUsd: 5420,
    asOf: '2026-08-07',
    conviction: 2,
    stance: 'context',
    note: 'Appears in four sections and every one of them says it is not exposure to that theme. Photonics: "Not photonics exposure — it is the customer." Robotics: "robotics immaterial to P&L." Quantum: "not direct quantum exposure." Biology: "bio immaterial to P&L." It is the demand-setter for the whole book.',
  },
  {
    ticker: '000063',
    exchange: 'Shenzhen (+0763.HK)',
    name: 'ZTE',
    sections: ['photonics'],
    factors: ['industrial-cycle', 'gov-capital'],
    chainLayer: 'system',
    marketCapUsd: 23.0,
    asOf: '2026-08-07',
    conviction: 2,
    stance: 'context',
    note: 'Section says "+9.9% growth — barely a theme name". Included only because it appeared in some LYTE holdings reporting, and that reporting was itself dropped as conflicting.',
  },
  {
    ticker: 'IPGP',
    exchange: 'Nasdaq',
    name: 'IPG Photonics',
    sections: ['photonics'],
    factors: ['industrial-cycle'],
    chainLayer: 'component',
    marketCapUsd: 3.84,
    asOf: '2026-08-07',
    conviction: 2,
    stance: 'context',
    note: 'Flagged in-page as explicitly NOT AI-interconnect exposure. Industrial fibre lasers.',
  },
  {
    ticker: 'LASR',
    exchange: 'Nasdaq',
    name: 'nLIGHT',
    sections: ['photonics'],
    factors: ['industrial-cycle', 'gov-capital'],
    chainLayer: 'component',
    marketCapUsd: 3.17,
    asOf: '2026-08-07',
    conviction: 2,
    stance: 'context',
    note: 'Explicitly NOT AI-interconnect exposure. Fell 25.6% on 7 Aug 2026 on soft Q3 guidance, the same day the datacom names rallied double digits — the section\'s own evidence that "photonics" spans at least two uncorrelated demand cycles.',
  },
  {
    ticker: 'LPTH',
    exchange: 'Nasdaq',
    name: 'LightPath',
    sections: ['photonics'],
    factors: ['industrial-cycle', 'gov-capital'],
    chainLayer: 'component',
    marketCapUsd: 0.87,
    asOf: '2026-08-07',
    conviction: 2,
    stance: 'context',
    note: 'Explicitly NOT AI-interconnect exposure. Infrared optics for defence and counter-UAS; micro-cap.',
  },
  {
    ticker: '6965',
    exchange: 'Tokyo',
    name: 'Hamamatsu Photonics',
    sections: ['photonics'],
    factors: ['industrial-cycle'],
    chainLayer: 'component',
    marketCapUsd: 4.26,
    asOf: '2026-08-07',
    conviction: 2,
    stance: 'context',
    note: 'Explicitly NOT AI-interconnect exposure. Scientific and medical opto-semis; fell 7.3% on 7 Aug 2026.',
  },

  // =========================================================================
  // DIGITAL BIOLOGY — 14 tickers. Data vintage "Q1 2026 reported".
  // The source table carries revenue, cash and runway. It carries NO market
  // cap column. The two caps below are the only ones stated anywhere in the
  // section prose; everything else is left absent rather than estimated.
  // =========================================================================
  {
    ticker: 'RXRX',
    exchange: 'Nasdaq',
    name: 'Recursion Pharmaceuticals',
    sections: ['biology'],
    factors: ['biotech-idio', 'ai-adoption', 'risk-appetite'],
    asOf: '2026-07-07',
    conviction: 2,
    stance: 'long',
    note: 'Market cap not stated in the source. Revenue $6.5M, −56% YoY, against a ~$20B partnership headline; section says "scale ≠ drugs yet".',
  },
  {
    ticker: 'SDGR',
    exchange: 'Nasdaq',
    name: 'Schrödinger',
    sections: ['biology'],
    factors: ['ai-adoption', 'biotech-idio'],
    asOf: '2026-07-07',
    conviction: 2,
    stance: 'long',
    note: 'Market cap not stated in the source. Section names an unusual self-cannibalisation risk: its own agentic AI may commoditise the software edge.',
  },
  {
    ticker: 'TEM',
    exchange: 'Nasdaq',
    name: 'Tempus AI',
    sections: ['biology'],
    factors: ['ai-adoption', 'biotech-idio'],
    marketCapUsd: 9.4,
    asOf: '2026-07-07',
    conviction: 2,
    stance: 'long',
    note: 'Cap transcribed from the section\'s valuation note ("~$9.4B cap prices much of the growth"), not from a market-data field. FY26 ~$1.6B guided, NRR ~126%.',
  },
  {
    ticker: 'TXG',
    exchange: 'Nasdaq',
    name: '10x Genomics',
    sections: ['biology'],
    factors: ['industrial-cycle', 'biotech-idio'],
    asOf: '2026-07-07',
    conviction: 2,
    stance: 'long',
    note: 'Market cap not stated in the source. Instrument cyclicality and academic funding are the named drivers — hence industrial-cycle first.',
  },
  {
    ticker: 'TWST',
    exchange: 'Nasdaq',
    name: 'Twist Bioscience',
    sections: ['biology'],
    factors: ['industrial-cycle', 'biotech-idio'],
    asOf: '2026-07-07',
    conviction: 2,
    stance: 'long',
    note: 'Market cap not stated in the source. Tighter runway; breakeven target late FY26.',
  },
  {
    ticker: 'ABCL',
    exchange: 'Nasdaq',
    name: 'AbCellera',
    sections: ['biology'],
    factors: ['biotech-idio'],
    marketCapUsd: 1.6,
    asOf: '2026-07-07',
    conviction: 2,
    stance: 'long',
    edge: 'Trades near cash (~$690M) against a ~$1.6B cap, with >3 years of runway at ~$30M/qtr burn — the pipeline is close to free.',
    note: 'Cap transcribed from the section\'s valuation note, not a market-data field. ABCL635 Phase 2 is binary (Q3 2026).',
  },
  {
    ticker: 'ABSI',
    exchange: 'Nasdaq',
    name: 'Absci',
    sections: ['biology'],
    factors: ['biotech-idio', 'risk-appetite'],
    asOf: '2026-07-07',
    conviction: 2,
    stance: 'long',
    note: 'Market cap not stated in the source. $0.2M revenue; funded into H1 2028.',
  },
  {
    ticker: 'IOVA',
    exchange: 'Nasdaq',
    name: 'Iovance Biotherapeutics',
    sections: ['biology'],
    factors: ['biotech-idio'],
    asOf: '2026-07-07',
    conviction: 2,
    stance: 'long',
    note: 'Market cap not stated in the source. Section flags it as non-AI (TIL cell therapy) — it is in the section for the biology cycle, not the AI one.',
  },
  {
    ticker: 'RLAY',
    exchange: 'Nasdaq',
    name: 'Relay Therapeutics',
    sections: ['biology'],
    factors: ['biotech-idio'],
    asOf: '2026-07-07',
    conviction: 2,
    stance: 'long',
    note: 'Market cap not stated in the source. Section: "reads as conventional oncology biotech now" — the computational angle has faded.',
  },
  {
    ticker: 'ILMN',
    exchange: 'Nasdaq',
    name: 'Illumina',
    sections: ['biology'],
    factors: ['industrial-cycle', 'biotech-idio'],
    asOf: '2026-07-07',
    conviction: 2,
    stance: 'long',
    note: 'Market cap not stated in the source. Section calls the AI link tangential.',
  },
  {
    ticker: 'DNA',
    exchange: 'NYSE',
    name: 'Ginkgo Bioworks',
    sections: ['biology'],
    factors: ['biotech-idio', 'risk-appetite'],
    asOf: '2026-07-07',
    conviction: 2,
    stance: 'context',
    note: 'Market cap not stated in the source. Included by the section explicitly as a cautionary case: legacy revenue collapsing (−49%), autonomous-lab pivot unproven.',
  },
  {
    ticker: 'GENB',
    exchange: 'Nasdaq',
    name: 'Generate Biomedicines',
    sections: ['biology'],
    factors: ['biotech-idio', 'risk-appetite'],
    asOf: '2026-07-07',
    conviction: 2,
    stance: 'long',
    note: 'Market cap not stated. The "~$1.9B" in the source is the Feb 2026 IPO valuation, not a current cap, so it is deliberately not recorded as marketCapUsd.',
  },
  {
    ticker: 'EIKN',
    exchange: 'Nasdaq',
    name: 'Eikon Therapeutics',
    sections: ['biology'],
    factors: ['biotech-idio', 'risk-appetite'],
    asOf: '2026-07-07',
    conviction: 2,
    stance: 'long',
    note: 'Market cap not stated. Pre-revenue; down ~23% since the Feb 2026 IPO.',
  },

  // =========================================================================
  // ROBOTICS — 15 equities + 3 tokens. Data vintage "Q1 2026 reported".
  // THE SOURCE CARRIES NO MARKET CAPS AT ALL. Its table columns are revenue,
  // YoY, cash and runway. Every row below is therefore absent a cap, which is
  // the single largest hole in the market-cap-weighted view.
  // Six names are labelled "figures NOT refreshed this session" in the
  // research note; those are marked below.
  // =========================================================================
  {
    ticker: '6324.T',
    exchange: 'Tokyo',
    name: 'Harmonic Drive Systems',
    sections: ['robotics'],
    factors: ['industrial-cycle'],
    chainLayer: 'component',
    asOf: '2026-07-09',
    conviction: 3,
    edge: 'Dominant high-end share in precision strain-wave reducers — the component every humanoid arm needs. FY2027/3 guidance is operating income +141.5% off a −94.4% FY2026 base, so the humanoid ramp is guided, not hoped for.',
    stance: 'long',
    note: 'Market cap not stated in the source. Named risk: pricing power against Chinese reducer makers.',
  },
  {
    ticker: '6268.T',
    exchange: 'Tokyo',
    name: 'Nabtesco',
    sections: ['robotics'],
    factors: ['industrial-cycle'],
    chainLayer: 'component',
    asOf: '2026-07-09',
    conviction: 2,
    stance: 'context',
    note: 'Market cap not stated. Source flags "figures not refreshed this session" and describes it as context: RV-reducer duopolist, humanoids small.',
  },
  {
    ticker: 'MP',
    exchange: 'NYSE',
    name: 'MP Materials',
    sections: ['robotics'],
    factors: ['gov-capital', 'industrial-cycle'],
    chainLayer: 'substrate',
    asOf: '2026-07-09',
    conviction: 2,
    stance: 'long',
    note: 'Market cap not stated; "figures not refreshed this session". The chokepoint is real and documented: China ~94% of NdFeB magnet production, extraterritorial export controls, and a June 2026 entity-specific action naming MP Materials.',
  },
  {
    ticker: 'HSAI',
    exchange: 'Nasdaq',
    name: 'Hesai Group',
    sections: ['robotics'],
    factors: ['industrial-cycle'],
    chainLayer: 'component',
    asOf: '2026-07-09',
    conviction: 3,
    edge: 'Turned GAAP-positive at 39.1% gross margin while robotics lidar shipments grew +137.8% — profitability inside a segment the market still prices as pre-profit.',
    stance: 'long',
    note: 'Market cap not stated in the source. Lidar price war and China-listing overhang are the named risks.',
  },
  {
    ticker: 'OUST',
    exchange: 'Nasdaq',
    name: 'Ouster',
    sections: ['robotics'],
    factors: ['industrial-cycle', 'risk-appetite'],
    chainLayer: 'component',
    asOf: '2026-07-09',
    conviction: 2,
    stance: 'long',
    note: 'Market cap not stated. Revenue $48.6M +49%, gross margin fell to 43%, net loss $17.5M.',
  },
  {
    ticker: 'CGNX',
    exchange: 'Nasdaq',
    name: 'Cognex',
    sections: ['robotics'],
    factors: ['industrial-cycle'],
    chainLayer: 'component',
    asOf: '2026-07-09',
    conviction: 2,
    stance: 'context',
    note: 'Market cap not stated; "figures not refreshed this session". Machine-vision incumbent, cyclical end-markets.',
  },
  {
    ticker: '6861.T',
    exchange: 'Tokyo',
    name: 'Keyence',
    sections: ['robotics'],
    factors: ['industrial-cycle'],
    chainLayer: 'component',
    asOf: '2026-07-09',
    conviction: 2,
    stance: 'context',
    note: 'Market cap not stated; "figures not refreshed this session". Source says humanoids are immaterial to it.',
  },
  {
    ticker: '6954.T',
    exchange: 'Tokyo',
    name: 'Fanuc',
    sections: ['robotics'],
    factors: ['industrial-cycle'],
    chainLayer: 'system',
    asOf: '2026-07-09',
    conviction: 2,
    stance: 'context',
    note: 'Market cap not stated; "figures not refreshed this session". Cyclical; humanoids small.',
  },
  {
    ticker: '6506.T',
    exchange: 'Tokyo',
    name: 'Yaskawa',
    sections: ['robotics'],
    factors: ['industrial-cycle'],
    chainLayer: 'system',
    asOf: '2026-07-09',
    conviction: 2,
    stance: 'context',
    note: 'Market cap not stated; "figures not refreshed this session".',
  },
  {
    ticker: 'Unitree',
    exchange: 'Shanghai STAR (approved, not trading)',
    name: 'Unitree Robotics',
    sections: ['robotics'],
    factors: ['risk-appetite', 'industrial-cycle'],
    chainLayer: 'system',
    asOf: '2026-07-09',
    conviction: 2,
    stance: 'context',
    note: 'NOT TRADING as of 2026-07-09 — CSRC approved the STAR listing on 3 July 2026. The "~$6.2B" in the source is a target IPO valuation, not a market cap, so it is not recorded as marketCapUsd. 2025 revenue +335%, 62.9% gross margin, genuinely profitable.',
  },
  {
    ticker: '9880.HK',
    exchange: 'Hong Kong',
    name: 'UBTech Robotics',
    sections: ['robotics'],
    factors: ['risk-appetite', 'industrial-cycle'],
    chainLayer: 'system',
    asOf: '2026-07-09',
    conviction: 2,
    stance: 'context',
    note: 'Market cap not stated; "figures not refreshed this session". Loss-making, pilot deployments, heavy cash burn.',
  },
  {
    ticker: 'SERV',
    exchange: 'Nasdaq',
    name: 'Serve Robotics',
    sections: ['robotics'],
    factors: ['risk-appetite'],
    chainLayer: 'system',
    asOf: '2026-07-09',
    conviction: 2,
    stance: 'long',
    note: 'Market cap not stated. FY26 guide $26M revenue against $160–170M non-GAAP opex — the gap is the thesis and the risk.',
  },
  {
    ticker: 'SYM',
    exchange: 'Nasdaq',
    name: 'Symbotic',
    sections: ['robotics'],
    factors: ['industrial-cycle', 'ai-adoption'],
    chainLayer: 'system',
    asOf: '2026-07-09',
    conviction: 3,
    edge: '~$22.7B backlog against $676M quarterly revenue, with systems live rising 46 -> 70 year on year. The revenue is contracted, not forecast.',
    stance: 'long',
    note: 'Market cap not stated. Customer concentration and an EPS miss ($0.01 vs $0.12 est) are the named risks.',
  },
  {
    ticker: 'TSLA',
    exchange: 'Nasdaq',
    name: 'Tesla',
    sections: ['robotics'],
    factors: ['ai-adoption', 'risk-appetite', 'industrial-cycle'],
    chainLayer: 'demand-setter',
    asOf: '2026-07-09',
    conviction: 2,
    stance: 'context',
    note: 'Market cap not stated. Source: "Mega-cap; Optimus is optionality" and 2026 volume "impossible to predict".',
  },

  // =========================================================================
  // QUANTUM — 17 tickers. Point-in-time early/mid-July 2026.
  // Market caps transcribed from the section's "Mkt cap" column (USD bn),
  // which the section itself labels a volatile approximation.
  // Per the brief: quantum names are gov-capital first, risk-appetite second.
  // =========================================================================
  {
    ticker: 'IONQ',
    exchange: 'NYSE',
    name: 'IonQ',
    sections: ['quantum'],
    factors: ['gov-capital', 'risk-appetite'],
    marketCapUsd: 18,
    asOf: '2026-07-09',
    conviction: 3,
    edge: 'Deepest government relationships in the cohort paired with the fastest commercial ramp — FY2026 revenue guidance in the hundreds of millions, per company disclosures, against a cohort that is mostly pre-revenue.',
    stance: 'long',
    note: 'Source states the cap as a range "~$17–20B"; the midpoint 18 is the value the section itself sorts on. Fault-tolerance payoff is years out.',
  },
  {
    ticker: 'RGTI',
    exchange: 'Nasdaq',
    name: 'Rigetti Computing',
    sections: ['quantum'],
    factors: ['gov-capital', 'risk-appetite'],
    marketCapUsd: 5.6,
    asOf: '2026-07-09',
    conviction: 3,
    edge: 'The cleanest LOI-conversion catalyst in the group: an up-to-$100M Commerce/CHIPS Letter of Intent (May 2026) that has a dated, checkable conversion to a definitive award.',
    stance: 'long',
    note: 'It is a letter of intent, not an award. Dilution risk includes a contemplated government equity stake.',
  },
  {
    ticker: 'INFQ',
    exchange: 'Nasdaq',
    name: 'Infleqtion',
    sections: ['quantum'],
    factors: ['gov-capital', 'risk-appetite'],
    marketCapUsd: 2.5,
    asOf: '2026-07-09',
    conviction: 3,
    edge: 'Computing plus sensing/PNT gives it a second, nearer-term federal revenue line that the pure computing names do not have.',
    stance: 'long',
    note: 'SPAC listing Feb 2026; ~$550M+ funded. New listing, narrower sensing TAM.',
  },
  {
    ticker: 'QUBT',
    exchange: 'Nasdaq',
    name: 'Quantum Computing Inc.',
    sections: ['quantum'],
    factors: ['risk-appetite', 'gov-capital'],
    marketCapUsd: 2.0,
    asOf: '2026-07-09',
    conviction: 2,
    stance: 'long',
    note: 'Federal dollars are tiny (a NASA award of ~$26,163 obligated); the section says the signal is government accessibility for a non-cryogenic path, not the money.',
  },
  {
    ticker: 'QNT',
    exchange: 'Nasdaq',
    name: 'Quantinuum',
    sections: ['quantum'],
    factors: ['gov-capital', 'risk-appetite'],
    marketCapUsd: 20,
    asOf: '2026-07-09',
    conviction: 2,
    stance: 'long',
    note: 'June 2026 IPO (~$1.68B raised). Scale leader but pre-mass-revenue; post-IPO volatility.',
  },
  {
    ticker: 'QBTS',
    exchange: 'NYSE',
    name: 'D-Wave Quantum',
    sections: ['quantum'],
    factors: ['risk-appetite', 'gov-capital'],
    marketCapUsd: 8,
    asOf: '2026-07-09',
    conviction: 2,
    stance: 'long',
    note: 'Source states the cap as a range "~$7.6–8.8B"; 8 is the value the section sorts on. Narrow near-term TAM.',
  },
  {
    ticker: 'XNDU',
    exchange: 'Nasdaq',
    name: 'Xanadu Quantum',
    sections: ['quantum'],
    factors: ['risk-appetite', 'gov-capital'],
    asOf: '2026-07-09',
    conviction: 2,
    stance: 'long',
    note: 'Market cap not stated in the source ("small"). March 2026 listing; execution unproven.',
  },
  {
    ticker: 'ARQQ',
    exchange: 'Nasdaq',
    name: 'Arqit Quantum',
    sections: ['quantum'],
    factors: ['risk-appetite', 'gov-capital'],
    asOf: '2026-07-09',
    conviction: 2,
    stance: 'context',
    note: 'Market cap not stated. Source is explicit that "security ≠ compute" — it is in the section as a QTUM top holding, not as compute exposure.',
  },
  {
    ticker: 'HQ',
    exchange: 'Nasdaq',
    name: 'Horizon Quantum',
    sections: ['quantum'],
    factors: ['risk-appetite', 'gov-capital'],
    asOf: '2026-07-09',
    conviction: 2,
    stance: 'long',
    note: 'Market cap not stated ("small"). Compilers/middleware; adoption unproven.',
  },
  {
    ticker: 'IBM',
    exchange: 'NYSE',
    name: 'IBM',
    sections: ['quantum'],
    factors: ['ai-adoption'],
    asOf: '2026-07-09',
    conviction: 2,
    stance: 'context',
    note: 'Market cap not stated ("large-cap"). Source: "Quantum immaterial to P&L" — core business drives value. Classified on what actually moves the P&L, not on the tab it sits in.',
  },
  {
    ticker: 'GOOGL',
    exchange: 'Nasdaq',
    name: 'Alphabet',
    sections: ['quantum'],
    factors: ['ai-adoption'],
    chainLayer: 'demand-setter',
    asOf: '2026-07-09',
    conviction: 2,
    stance: 'context',
    note: 'Market cap not stated ("large-cap"). Quantum immaterial to P&L. Note the direction of travel: Alphabet is one of the hyperscalers whose $175–185bn 2026 capex guide the photonics thesis depends on — it SPENDS the ai-capex the rest of the book receives.',
  },
  {
    ticker: 'MSFT',
    exchange: 'Nasdaq',
    name: 'Microsoft',
    sections: ['quantum'],
    factors: ['ai-adoption'],
    chainLayer: 'demand-setter',
    asOf: '2026-07-09',
    conviction: 2,
    stance: 'context',
    note: 'Market cap not stated ("large-cap"). Topological approach unproven and immaterial. Also a hyperscaler capex spender ($110–120bn guided 2026).',
  },
  {
    ticker: 'AMZN',
    exchange: 'Nasdaq',
    name: 'Amazon',
    sections: ['quantum'],
    factors: ['ai-adoption'],
    chainLayer: 'demand-setter',
    asOf: '2026-07-09',
    conviction: 2,
    stance: 'context',
    note: 'Market cap not stated ("large-cap"). Immaterial to P&L. Largest single hyperscaler capex guide in the photonics note at ~$200bn for 2026.',
  },
  {
    ticker: 'AMAT',
    exchange: 'Nasdaq',
    name: 'Applied Materials',
    sections: ['quantum'],
    factors: ['ai-capex', 'industrial-cycle'],
    chainLayer: 'component',
    asOf: '2026-07-09',
    conviction: 2,
    stance: 'context',
    note: 'Market cap not stated ("large-cap"). Source: "No quantum-rev disclosure" — it is in the section as supply chain, so the driver is the semicap cycle.',
  },
  {
    ticker: 'QTUM',
    exchange: 'Nasdaq (ETF)',
    name: 'Defiance Quantum ETF',
    sections: ['quantum'],
    factors: ['risk-appetite', 'gov-capital'],
    asOf: '2026-07-09',
    conviction: 2,
    stance: 'long',
    note: 'ETF, ~$6B AUM, roughly equal-weight. Not a market cap — AUM is deliberately not recorded as marketCapUsd. Holds ALAB and AMAT, so it double-counts exposure already in this table.',
  },

  // =========================================================================
  // AGENTIC — 7 tickers. Figures are AS SUPPLIED from a note dated July 2026
  // and were not independently re-verified against primary filings.
  // =========================================================================
  {
    ticker: 'CRCL',
    exchange: 'NYSE',
    name: 'Circle Internet Group',
    sections: ['agentic'],
    factors: ['rates-macro', 'ai-adoption'],
    marketCapUsd: 17,
    asOf: '2026-07-09',
    conviction: 3,
    edge: 'The market prices Circle as a volatile crypto proxy; the section argues the right frame is a yield-on-reserves business (like a money-market fund) whose GENIUS Act compliance converts a cost centre into a moat.',
    stance: 'long',
    note: 'Down 76.5% from its high. The section corrected the source note\'s $3.5B reserve-income annualisation to ~$2.6B because it did not reconcile with the $653M quarterly print. A Fed cut to 2% roughly halves reserve income independent of volume — hence rates-macro first.',
  },
  {
    ticker: 'NU',
    exchange: 'NYSE',
    name: 'Nu Holdings',
    sections: ['agentic'],
    factors: ['rates-macro', 'ai-adoption'],
    marketCapUsd: 63,
    asOf: '2026-07-09',
    conviction: 4,
    edge: 'Already holds the five things a personal financial agent needs — verified identity, transaction history, income data, a banking licence and API-first architecture. If it ships a consumer agent API, switching costs become structural.',
    stance: 'long',
    note: 'Down 30.8% from its high. EM macro and Pix/incumbent competition are the named risks.',
  },
  {
    ticker: 'SOFI',
    exchange: 'Nasdaq',
    name: 'SoFi Technologies',
    sections: ['agentic'],
    factors: ['rates-macro', 'ai-adoption'],
    marketCapUsd: 19,
    asOf: '2026-07-09',
    conviction: 3,
    edge: 'Galileo shipped Cyberbank Konecta AI agents into production — the thesis is already in revenue rather than in a roadmap.',
    stance: 'long',
    note: 'Down 45.7% from its high. Credit cycle plus Stripe/Marqeta/Unit competition.',
  },
  {
    ticker: 'CRWV',
    exchange: 'Nasdaq',
    name: 'CoreWeave',
    sections: ['agentic'],
    factors: ['ai-capex'],
    chainLayer: 'system',
    marketCapUsd: 35,
    asOf: '2026-07-09',
    conviction: 2,
    stance: 'long',
    note: 'Down 38.1% from its high. $66B backlog against near-term revenue guidance that disappointed. Named risk: hyperscaler dedicated inference tiers plus customer concentration.',
  },
  {
    ticker: 'IREN',
    exchange: 'Nasdaq',
    name: 'IREN Limited',
    sections: ['agentic'],
    factors: ['ai-capex', 'risk-appetite'],
    chainLayer: 'system',
    marketCapUsd: 5,
    asOf: '2026-07-09',
    conviction: 2,
    stance: 'long',
    note: 'Down 40.9% from its high. Named risk pairs an AI-capex bet with a bitcoin-price bet — the two factors are why risk-appetite is carried second.',
  },
  {
    ticker: 'MQ',
    exchange: 'Nasdaq',
    name: 'Marqeta',
    sections: ['agentic'],
    factors: ['ai-adoption', 'rates-macro'],
    marketCapUsd: 5,
    asOf: '2026-07-09',
    conviction: 3,
    edge: 'Card-issuing infrastructure sits underneath agentic payments regardless of which agent wins — but the section also names the thing that breaks it, which is stablecoin rails bypassing cards entirely.',
    stance: 'long',
    note: 'Down 46.1% from its high. Block/Cash App concentration.',
  },
  {
    ticker: 'HOOD',
    exchange: 'Nasdaq',
    name: 'Robinhood Markets',
    sections: ['agentic'],
    factors: ['risk-appetite', 'rates-macro'],
    marketCapUsd: 25,
    asOf: '2026-07-09',
    conviction: 4,
    edge: 'Routes its perpetual-futures trading through Lighter (from 1 July 2026) while also being an investor in it — the same entity appears on both sides of this dashboard.',
    stance: 'long',
    note: 'Down 27.3% from its high. PFOF regulatory risk; Coinbase competition. The Lighter link is recorded in the crypto section, not the agentic one.',
  },

  // =========================================================================
  // CRYPTO — 4 held. Single CoinGecko snapshot, 9 July 2026.
  // Narrowed from 5 held + the HYPE benchmark on Matthias's instruction
  // (11 Aug 2026): this section covers ETH, ZEC, LIT and NOCK only. Pearl and
  // the Hyperliquid benchmark row came out of dashboards/crypto.html in the
  // same change, so this file still transcribes its source rather than
  // quietly disagreeing with it. Hyperliquid still appears in that page as
  // the competitor Lighter is measured against: it is no longer a tracked
  // position, which is not the same as pretending it does not exist.
  // This section has no A/B/C tiers; conviction is derived from its own
  // "evidence grade" column instead (institutional/strong -> 3, contested -> 2,
  // early -> 1), then capped by the no-edge rule.
  // =========================================================================
  {
    ticker: 'ETH',
    exchange: 'crypto',
    name: 'Ethereum',
    sections: ['crypto'],
    factors: ['risk-appetite'],
    marketCapUsd: 210.9,
    asOf: '2026-07-09',
    conviction: 3,
    edge: 'The institutional-infrastructure evidence is the strongest in the section and the price action the weakest: ~52% of global stablecoin supply, ~60% of tokenised RWA value, 31–32% of supply staked — against −65% from the Aug 2025 high. The section frames it explicitly as fundamentals vs flows.',
    stance: 'long',
    note: 'Counter-evidence carried in the source: ETF outflows, and BitMine holding 5.62M ETH with ~$9B unrealised loss — the same treasury-company overhang the ZEC thesis criticises in Bitcoin.',
  },
  {
    ticker: 'ZEC',
    exchange: 'crypto',
    name: 'Zcash',
    sections: ['crypto'],
    factors: ['risk-appetite'],
    marketCapUsd: 8.14,
    asOf: '2026-07-09',
    conviction: 3,
    edge: 'Hard on-chain usage growth: the shielded pool went from 11% to ~30% of supply in one year, with the Orchard pool absorbing nearly all of it. Usage, not narrative.',
    stance: 'long',
    note: 'The rotation/Saylor leg was deliberately DOWNGRADED by the source to "narrative tailwind, causality unproven" — no flow-level evidence ties BTC outflows to ZEC inflows. Entire ECC dev team resigned Jan 2026.',
  },
  {
    ticker: 'LIT',
    exchange: 'crypto',
    name: 'Lighter',
    sections: ['crypto'],
    factors: ['risk-appetite'],
    marketCapUsd: 0.588,
    asOf: '2026-07-09',
    conviction: 2,
    stance: 'long',
    note: 'Source graded it "contested; incumbent still winning". Cheap per volume ($588M mcap vs HYPE $14.9B on a ~5x volume gap) but not on revenue (HL ~$202M in Q2 2026 vs Lighter <$10M and declining). Team+investor cliff at the turn of 2026/27 is a major unlock overhang.',
  },
  {
    ticker: 'NOCK',
    exchange: 'crypto',
    name: 'Nockchain',
    sections: ['crypto'],
    factors: ['risk-appetite', 'ai-capex'],
    marketCapUsd: 0.0459,
    asOf: '2026-07-09',
    conviction: 1,
    stance: 'long',
    note: 'Graded "earliest; venture-grade risk". The proof market is internal-only today: no verified evidence of external paid demand for proofs. −90% from the Oct 2025 ATH; ~48% of supply still to be mined.',
  },


]

// ---------------------------------------------------------------------------
// July 2026 drawdown — calibration anchor, not a forecast
// ---------------------------------------------------------------------------
// Every figure below was supplied by Matthias (Aug 2026) as historical fact.
// None of it appears in any research note in this repo and none of it was
// independently re-verified in this session. It is recorded verbatim, with
// that provenance stated, because it is the reference event the concentration
// argument is measured against.
export const JULY_2026_DRAWDOWN = {
  asOf: '2026-07-29',
  provenance:
    'Supplied by Matthias, August 2026. Not independently verified in this session and not present in research/. Treat as a stated historical fact with a named source, not as repo-sourced data.',
  facts: [
    // `index: true` marks the rows that describe a market, not a single name.
    // Only those are meaningful as a book-level stress scenario — applying
    // Micron's own drawdown to a whole portfolio would be a category error.
    {
      label: 'SOX (semiconductor index)',
      detail: '−28.6% from its 22 June 2026 peak',
      value: -28.6,
      index: true,
    },
    {
      label: 'MS Momentum TMT index',
      detail:
        '−53.5% over the same window — the regime a book that had returned 439% was actually in',
      value: -53.5,
      index: true,
    },
    {
      label: 'Micron (MU)',
      detail: '$1,254.80 on 25 Jun 2026 -> $737.88 on 29 Jul 2026',
      value: -41.2,
    },
    {
      label: 'SanDisk (SNDK)',
      detail: '~−50% from its June 2026 peak',
      value: -50,
    },
  ],
  fundFailure:
    'The Situational Awareness fund lost ~67% in one month and was force-liquidated to Citadel. Its thesis — AI infrastructure, bought at the bottleneck — was correct and had returned 439% through June. What killed it was roughly 4x leverage against a concentrated, correlated book during an ordinary correction.',
  /** Detail that complicates the "leverage, not concentration" reading. Kept
   *  separate from fundFailure because it argues against the simple version. */
  fundFailureCaveat:
    'Two things make the single-cause reading too clean. The losses were not only on concentrated longs: a short in software (Adobe) ran against the fund at the same time. And leverage and concentration are not separable — a margin call is a function of their product, so one observation cannot attribute the failure to either alone.',
  /** Which index to stress against. The SOX understates it: this book is
   *  momentum TMT, and in the same window that index fell nearly twice as far.
   *  Using the first entry in `facts` silently picked the milder one. */
  worstIndexMovePct: -53.5,
}
