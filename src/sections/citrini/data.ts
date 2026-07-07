import type { TrackerEntry } from '../../types'

// Sources are all free/public: the free tier of the Citrini Research Substack,
// public podcast episode pages, and one search-indexed @Citrini7 X post.
// Full research notes: research/citrini-tracker-research.md (repo root).
export const citriniEntries: TrackerEntry[] = [
  {
    theme: 'AI: Global Equity Beneficiaries',
    thesis:
      'Data centers are the most certain winner of AI proliferation; own "picks and shovels" (NVDA, TSMC, AVGO, ANET, SMCI, semicap equipment) and Phase 2 software adopters at better risk/reward than megacaps, per a three-phase framework.',
    sourceUrl: 'https://www.citriniresearch.com/p/artificial-intelligence-global-equity',
    date: '2023-05-31',
    status: 'active',
    note: 'Publicly trimmed along the way: the free Jan 2024 update calls Phase 1 "largely played out"; the free Aug 2024 retrospective reports AI holdings halved.',
  },
  {
    theme: 'AI losers (short side)',
    thesis:
      'Short businesses AI disrupts: BPO/call centers (CNXC, TASK), stock media (SSTK, GETY), freelance marketplaces (FVRR, UPWK), edtech (CHGG), plus pairs such as long BILL vs short PAYX and long BKNG/EXPE vs short TRIP.',
    sourceUrl: 'https://www.citriniresearch.com/p/less-deus-more-machina',
    date: '2023-06-15',
    status: 'no free update',
  },
  {
    theme: 'GLP-1 winners and losers',
    thesis:
      'GLP-1 drugs are a paradigm shift in obesity with second-order effects far beyond pharma: long LLY/NVO plus insurers, dating apps (MTCH, BMBL) and body-contouring (INMD, ESTA); short sleep apnea (RMD, INSP), bariatric surgery, fast food, fitness and diabetes-device names.',
    sourceUrl: 'https://www.citriniresearch.com/p/upgrading-from-overweight-the-effects',
    date: '2023-07-11',
    status: 'active',
    note: 'Validated and broadened per the free Jan 2024 update; maintained in the free Aug 2024 retrospective; discussed as a major win on Odd Lots (Jul 2024).',
  },
  {
    theme: 'Celestica (CLS) long',
    thesis:
      'EMS "picks and shovels" at the intersection of AI hyperscaler networking (800G upgrade cycle) and government-funded renewables spend, at roughly 10x forward earnings; $31 price target at publication.',
    sourceUrl: 'https://www.citriniresearch.com/p/long-thesis',
    date: '2023-07-31',
    status: 'no free update',
  },
  {
    theme: 'Superconductors (LK-99)',
    thesis:
      'If room-temperature superconductivity (LK-99) were verified, a high-temperature-superconductor basket would benefit enormously; author explicitly skeptical ("seems unlikely right now") and frames it as monitoring, not conviction.',
    sourceUrl: 'https://www.citriniresearch.com/p/superconductors',
    date: '2023-08-01',
    status: 'no free update',
    note: 'Framed as speculative monitoring at publication.',
  },
  {
    theme: 'US Fiscal Primacy',
    thesis:
      'Post-pandemic activist fiscal policy (IIJA, IRA, CHIPS) gives government spending an outsized role in corporate profits, displacing monetary policy as the dominant market driver. Thesis from the post\'s public preview; the equity baskets themselves are paywalled.',
    sourceUrl: 'https://www.citriniresearch.com/p/us-fiscal-primacy',
    date: '2023-09-18',
    status: 'active',
    note: 'Named a core theme in the free Jan 2024 update; holdings repositioned in the free Aug 2024 retrospective (exited ALB, JCI, NRG, SMR; added Mitsubishi Heavy, Fluor, AECOM).',
  },
  {
    theme: 'Rates-maggedon macro trades',
    thesis:
      'Tactical long bonds into the Nov 2023 BoJ/BoE/FOMC week (market overly fixated on the QRA), ECB-cut trades via Euribor, short JPY, re-adding AI semi longs after the pullback; included a long gold / short oil pair.',
    sourceUrl: 'https://www.citriniresearch.com/p/market-overview-rates-maggedon-edition',
    date: '2023-10-30',
    status: 'closed',
    note: 'Free Dec 2023 follow-up: gold/oil pair +22.85%, half profits booked, remaining oil short half-swapped to copper; "6 of 7" other trades reported as having worked.',
  },
  {
    theme: '24 Trades for 2024 (annual watchlist)',
    thesis:
      '24 scenario-based ideas explicitly framed as a preparation watchlist, not high conviction: water resources basket plus Rotoplas, vocational-education longs (LAUR, LOPE, UTI), GLP-1 pair (long ZEAL), MRVL, carbon credits (EUA/CCA), long Pakistan vs short Turkey, FX/commodity/credit trades.',
    sourceUrl: 'https://www.citriniresearch.com/p/24-trades-for-2024',
    date: '2023-12-21',
    status: 'watchlist',
    note: 'No consolidated free scorecard found.',
  },
  {
    theme: 'Water infrastructure',
    thesis:
      'Long global water scarcity/infrastructure plays (utilities, filtration, treatment; Rotoplas as the LatAm pick) as a recurring long-term theme.',
    sourceUrl: 'https://www.citriniresearch.com/p/24-trades-for-2024',
    date: '2023-12-21',
    status: 'active',
    note: 'Reiterated publicly on Odd Lots (Jul 2024); the dedicated deep-dive ("High Quality H2O", May 2024) is paywalled.',
  },
  {
    theme: 'Election 2024 baskets',
    thesis:
      'Long/short baskets built to track Trump-vs-Biden odds rather than predict the outcome: tariff plays (long domestic-sourcing retailers, short importers), long GEO/CXW/AXON/PLTR, long LNG/coal vs short clean energy (NEE, ENPH, RUN), a TCJA tax-beneficiary basket, and APOG as a social-instability hedge.',
    sourceUrl: 'https://www.citriniresearch.com/p/election-2024-investment-implications',
    date: '2024-03-05',
    status: 'closed',
    note: 'Event concluded; no free post-election recap found (follow-ups paywalled).',
  },
  {
    theme: 'Edge AI / iPhone upgrade cycle',
    thesis:
      'On-device AI inference triggers the first major iPhone replacement cycle in a decade; long AAPL and its supply chain (TSMC, AVGO, QCOM, MU, SK Hynix, Murata, TDK, ASE).',
    sourceUrl: 'https://www.citriniresearch.com/p/thematic-memo-inference-on-device',
    date: '2024-07-08',
    status: 'closed',
    note: 'The free Aug 2024 retrospective says the Edge AI and Global AI baskets were closed as part of halving AI exposure ("semiconductors are still cyclical").',
  },
  {
    theme: 'Soft landing / Fed cuts (macro)',
    thesis:
      'The mid-2024 growth scare is normalization, not recession: expect a 50bp September cut and 100-125bp total by H1 2025, positioned via rates flatteners; skeptical of the recession narrative ("Schrödinger\'s soft landing").',
    sourceUrl: 'https://www.citriniresearch.com/p/macro-memo-august-2024',
    date: '2024-09-05',
    status: 'no free update',
    note: 'Dated macro view; subsequent monthly macro updates are paywalled.',
  },
  {
    theme: 'Chinese equities (evolving arc)',
    thesis:
      'Sold/hedged the reopening rally as overextended (Jan 2023); turned cautiously bullish with a "stimulus barbell" (long ADRs PDD/BABA/JD, short CNH) on a modest-stimulus view (Aug 2023); tactically bullish after the Sep 2024 stimulus pivot, seeing ~25% MSCI China upside if policymakers deliver.',
    sourceUrl: 'https://www.citriniresearch.com/p/another-brick-in-the-wall-of-worry',
    date: '2024-10-08',
    status: 'active',
    note: 'Tactically bullish as of the Oct 2024 free post ("bad news is good news"); later China commentary is paywalled.',
  },
  {
    theme: '25 Trades for 2025 (annual watchlist)',
    thesis:
      'Annual watchlist of 25 scenario-based ideas with the same "be prepared, not right" framing as the 2024 list; the individual trades live in a linked PDF and are not enumerated on the free page.',
    sourceUrl: 'https://www.citriniresearch.com/p/25-trades-for-2025',
    date: '2024-12-19',
    status: 'unverified/ambiguous',
    note: 'The post is free and real, but the trade list itself could not be verified from the public page.',
  },
  {
    theme: 'Tariffs 2025: winners and losers',
    thesis:
      'Treat the Feb 2025 tariffs as credible policy, not negotiating bluster: long insulated domestics (NUE, STLD, X, WY, SAM), short import-dependent autos/retail/homebuilders (GM, F, WMT, DHI, STZ, CAT); bonds rally on tariffs, add 2s10s flattener.',
    sourceUrl: 'https://www.citriniresearch.com/p/market-memo-tariff-ied',
    date: '2025-02-03',
    status: 'no free update',
    note: 'Extended by free posts "Seeing the Stag" (2025-04-03, stagflation-risk shorts) and "A Tale of Two Tariffs" (2025-04-18, explicitly non-actionable); nothing free since Apr 2025.',
  },
  {
    theme: 'White-collar recession / Haves vs Have Nots',
    thesis:
      'AI-driven white-collar labor weakness accelerates AI adoption and reshapes the workforce; rotation out of US equities as the US turns to fiscal austerity while Europe and Asia run large fiscal stimulus. Public description only; the underlying Substack pieces are paywalled.',
    sourceUrl:
      'https://hiddenforces.io/podcasts/about-to-enter-the-first-white-collar-recession-james-van-geelen/',
    date: '2025-04-03',
    status: 'active',
    note: 'Description-level source (podcast episode page); theme later expanded in the free "2028 Global Intelligence Crisis" essay.',
  },
  {
    theme: 'AI buildout, next phase (data centers/power)',
    thesis:
      'The AI trade shifts from GPUs to the physical buildout: data-center construction (Stargate/Abilene field visit), increasingly complex financing structures, and power constraints; publicly flagged SanDisk (SNDK) as an upside pick tied to the buildout.',
    sourceUrl:
      'https://podcasts.apple.com/us/podcast/james-van-geelen-on-the-next-phase-of-the-ai-buildout/id1056200096?i=1000730377246',
    date: '2025-10-06',
    status: 'active',
    note: "Reiterated via @Citrini7 post (2025-11-11) noting SNDK's rally from ~$40 to $268; the written deep-dives are paywalled.",
  },
  {
    theme: '2028 Global Intelligence Crisis',
    thesis:
      'Free scenario essay, explicitly "a scenario, not a prediction": AI-driven white-collar job losses cascade into consumption, consumer credit (MA, V, AXP, SYF, COF) and mortgage stress by 2028, written as a retrospective from June 2028.',
    sourceUrl: 'https://www.citriniresearch.com/p/2028gic',
    date: '2026-02-22',
    status: 'scenario',
    note: 'Discussed on Odd Lots (Feb 2026).',
  },
]
