# Defence & autonomy — research notes

Research date: **11 August 2026**. Market data as of **11 August 2026** — US
figures are that day's close, European, Korean and Australian figures are the
last print of their local session (retrieved directly from Yahoo Finance quote
and chart endpoints, not transcribed). Informational research only — not
investment advice.

**Vintage warning.** Two different clocks run through this note. The policy
layer — NATO's 3.5% core commitment, Germany's debt-brake amendment — moves in
years and is stable. The price layer moves weekly, and this theme has been in a
drawdown for months: the median name here trades 24% below its 52-week high and
several are 50–68% below. Every price, multiple and drawdown below has a shelf
life measured in days.

**FX assumption** (needed for the cross-listing comparison, flagged as an
assumption): EUR/USD 1.1543, GBP/USD 1.3505, NOK/USD 0.10534, SEK/USD 0.10503,
KRW/USD 0.00070834, AUD/USD 0.70631, all 11 Aug 2026 spot. USD equivalents are
approximate.

**Provider caveat.** Forward P/E figures come from provider consensus and are
unreliable for companies in an earnings transition. Four names are flagged in
the dashboard for this reason — Saab (66.2x forward against 50.0x trailing,
which implies falling earnings and contradicts guidance), Mercury Systems
(70.6x off a depressed base), Karman (66.1x) and Avio (123.6x off a very small
base). Do not use the P/E column on those four without going to the filings.

---

## 0. What this note is, and what it replaced

This started from an internal build brief dated 11 August 2026 that proposed a
40-name defence dashboard with a subjective 0–100 score per company. The
structure of that brief survives; most of its numbers did not. The corrections
are listed in §6 rather than buried, because the pattern in them is the useful
part: **almost every error ran in the same direction — stale prices from a
period before the 2025–26 drawdown, and unverifiable budget figures used as
load-bearing evidence.**

Three substantive changes:

1. **Live market data replaces transcribed market data.** All 53 market caps,
   multiples and 52-week ranges are pulled from a provider rather than
   remembered. This alone changed the picture: the brief described a theme with
   open procurement doors; the data describes a theme in a 24%-median drawdown.
2. **An explicit expected-value model replaces the composite score.** See §2.
3. **The thesis was split in two.** The brief argued autonomy disruption and
   then recommended European industrials. Those are different bets with
   different failure modes; the dashboard now says which names express which.

---

## 1. The finding that reorganised the note

The brief's framing — budgets rising, procurement opening, technology-first
companies winning — is a 2023–24 framing. The 2026 price data says something
else, and it says it consistently.

| Group | Position vs 52-week high (11 Aug 2026) |
| --- | --- |
| US primes and quality compounders | RTX −1%, GD −2%, Teledyne −2%, CACI −2%, Chemring −2%, Rolls-Royce −3%, Thales −4%, BAE −6% |
| European rearmament complex | Leonardo −11%, Dassault −12%, Hensoldt −23%, Kongsberg −25%, Babcock −22%, **Rheinmetall −43%**, **RENK −44%**, **Fincantieri −53%** |
| Autonomy and small-cap defence tech | **AeroVironment −53%**, **Kratos −52%**, Red Cat −43%, **DroneShield −68%** |
| Korean exporters | LIG Nex1 −32%, Hanwha Aerospace −34%, KAI −37%, Hyundai Rotem −50%, **Hanwha Systems −60%** |
| Space and ISR | Rocket Lab −47%, Planet −54%, BlackSky −43%, AST SpaceMobile −46% |

Capital rotated out of the growth end of the theme and into the cash-return
end. Both cannot be right about the same budget. Either the drawdown names are
discounting a settlement and slower budget conversion that the primes have not
yet priced, or the market is paying a premium for safety at exactly the wrong
point in the cycle. That question is H4 on the dashboard and it is the single
most checkable claim in the whole note: **order intake and book-to-bill,
reported quarterly, resolve it.** Backlog growing while shares fall supports the
de-rating reading. Backlog flattening supports the other one.

*Judgement, flagged as judgement:* the note is written on the first reading —
that this is multiple compression against intact order books. Confidence
moderate, not high. If it is wrong, the entire EV ranking is upside-down,
because the ranking is mechanically biased toward names that have already
fallen.

---

## 2. The expected-value method

The brief scored each company 0–100. A composite score hides the two things
that decide an investment — how large the outcomes are, and how likely each one
is — and it cannot be argued with, because there is nothing to disagree about
except the number itself.

Replaced with three scenarios per name over a **three-year horizon to August
2029**, probabilities summing to 1, total return (price plus dividends) in each:

```
r    = (E2029 / E2026) × (Mexit / Mnow) − 1
EV   = Σ pᵢ · rᵢ
σ    = √( Σ pᵢ (rᵢ − EV)² )
EVann = (1 + EV)^(1/3) − 1
```

- **Bull** — the thesis compounds and the multiple holds.
- **Base** — growth decelerates to program pace and the multiple normalises.
- **Bear** — Ukraine settlement, budget slip or execution failure, with a
  de-rating on top.

For loss-making names a multiple is meaningless, so the scenario returns are
set directly against a revenue-and-margin path to 2029 and the forward-P/E
column reads `n/m`.

**What the method does.** It makes a judgement auditable, comparable across 53
names, and falsifiable line by line. Every probability is published on the
dashboard, so anyone who disagrees with a number can recompute the ranking.

**What it does not do.**

- It is not a forecast, and it has no track record. The probabilities are
  calibrated against nothing but the author's reading of each situation.
- **It does not handle correlation.** These are not 53 independent bets. The
  top ten share one driver — European and allied budget conversion — so a book
  built by taking the top of the list would be one concentrated factor position
  wearing ten tickers. EV ranks names; it does not size them.
- It is mechanically kind to drawdowns. A 45% fall raises expected return
  arithmetically if the thesis survives. That is a feature only if H4 is right.

**Two lenses.** Sorting by EV puts the deep-drawdown names on top. Sorting by
`EV/σ` puts the cheap, unglamorous names on top: Leidos (1.10), QinetiQ (1.03),
L3Harris (1.02) and Rheinmetall (1.00) are the only four above 1.0. Which
column matters depends on whether the reader is judged on outcome or on path.

---

## 3. The ranking

Full detail — scenario probabilities, drivers and risks per name — is on the
dashboard in §5 and is sortable and filterable there. Summary of the top and
bottom, with the brief's original rank for comparison:

| EV rank | Ticker | EV %/yr | EV/σ | Fwd P/E | vs 52w high | Brief's rank |
| ---: | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | RHM.DE | +22.0% | 1.00 | 21.3x | −43% | 1 |
| 2 | KTOS | +15.9% | 0.63 | 57.1x | −52% | 5 |
| 3 | R3NK.DE | +15.9% | 0.81 | 23.0x | −44% | 16 |
| 4 | AVAV | +15.5% | 0.69 | 44.5x | −53% | 2 |
| 5 | THEON.AS | +14.8% | 0.79 | 21.5x | −1% | not covered |
| 6 | KOG.OL | +14.8% | 0.93 | 28.5x | −25% | 3 |
| 7 | QQ.L | +14.2% | 1.03 | 15.1x | −1% | 23 |
| 8 | IDR.MC | +14.0% | 0.85 | 19.7x | −3% | not covered |
| 9 | EXENS.PA | +13.4% | 0.80 | 27.9x | −14% | not covered |
| 10 | 079550.KS | +13.4% | 0.72 | n/m | −32% | 24 |
| … | | | | | | |
| 14 | LHX | +12.7% | **1.02** | 21.3x | −25% | 12 |
| 25 | PLTR | +9.7% | 0.43 | 75.6x | −16% | 3 |
| 31 | BA.L | +8.8% | 0.75 | 23.3x | −6% | 6 |
| 36 | HAG.DE | +7.9% | 0.45 | 37.1x | −23% | 7 |
| 46 | LMT | +5.1% | 0.53 | 18.3x | −14% | 20 |
| 51 | RTX | +2.0% | 0.19 | 28.5x | −1% | 33 |
| 52 | ASTS | −2.9% | −0.11 | n/m | −46% | 25 |
| 53 | UMAC | −3.9% | −0.10 | n/m | −24% | 30 |

Median expected return across the 53 names: **+9.2% per year**. Two names carry
negative expected value, both story-anchored.

**Where the EV ranking disagrees most with the brief:**

- **BAE Systems 6 → 31, Hensoldt 5 → 36.** Neither company got worse. Both
  trade at full multiples close to their highs (23.3x and 37.1x), so the price
  already contains the thesis. Right companies, wrong entry.
- **Palantir 3 → 25.** At $420bn and 75.6x forward it is worth more than
  Lockheed, Northrop, General Dynamics, L3Harris and BAE combined. The base
  case — earnings double, multiple compresses to 40x — returns +11% over three
  years. A good business and a mediocre three-year investment are compatible.
- **RENK 16 → 3, QinetiQ 23 → 7.** Both are cheap relative to contracted
  growth; RENK because it fell 44%, QinetiQ because at 15.1x nobody has
  re-rated it at all.
- **L3Harris 12 → 14 on EV, but 3rd on EV/σ.** The brief named solid rocket
  motors as the sector's key bottleneck and then ranked the only listed
  merchant SRM supplier twelfth. The insight and the ranking were disconnected.

---

## 4. The thesis split

The brief's opening paragraph argues that cheap attritable systems displace
exquisite platforms and that procurement is opening to technology-first
companies. Its top five picks are Rheinmetall, AeroVironment, Kongsberg, BAE
and Hensoldt — four incumbents and one mid-cap. **The thesis and the portfolio
are two different bets.**

**Thesis A — autonomy and attritable mass.** Cost-per-effect inverts; militaries
reorganise around volume manufacturing and consumable munitions. This is a
manufacturing thesis dressed as a technology thesis: the winners have to build
at battlefield cost, not prime cost.

**Thesis B — European and allied rearmament.** Two decades of underinvestment
left empty magazines and a hollow industrial base; rebuilding it is a 10–15 year
capital cycle in largely existing product designs. This is a backlog thesis, and
backlog is observable — which makes it the more falsifiable of the two.

They diverge on the scenario that matters most. **A Ukraine settlement is close
to fatal for B and merely a headwind for A.** Conversely an autonomy-led
restructuring is bad for the tonnage names even in a war scenario, because a
euro spent on 100,000 interceptor drones is a euro not spent on a Leopard. The
brief cited Ukraine as evidence for both, which should have been a warning.

### 4.1 The structural problem with Thesis A

The reference implementations of autonomy-first defence — **Anduril, Helsing,
Shield AI, Saronic, Castelion** — are all private. None is investable on a
public exchange, and several have no need to list.

What remains listed is either (a) incumbents with an autonomy option bolted on
(Rheinmetall's Skyranger, Kongsberg, Leonardo DRS) or (b) sub-scale pure-plays
whose principal financing instrument is equity issuance. This is not a gap in
the research; it is a property of the market, and it is the most important thing
the original brief left out. Any claim to clean listed exposure to Thesis A is a
description of second-best substitutes.

---

## 5. Bottlenecks

The useful question in a supply-constrained cycle is who owns the step that
cannot be scaled quickly. In this cycle those steps are chemical, optical and
human — not digital.

1. **Energetics and solid rocket motors.** Propellant, nitrocellulose and TNT
   capacity, with permitting and safety-case timelines in years. Listed
   exposure: LHX (Aerojet), KRMN, AVIO, CHG.L. Much of the capacity is private
   or state-owned (Nammo, Eurenco, Nitro-Chem).
2. **Night vision and image intensification.** A very small number of qualified
   tube producers supply every NATO soldier-modernisation program. Listed:
   EXENS, THEON, TDY (FLIR), ESLT. Geared to troop numbers rather than platform
   counts, and therefore less settlement-sensitive than artillery.
3. **Counter-UAS sensing.** The genuinely new problem, and an economics problem
   before it is a technology one: a $2m interceptor against a $500 drone is a
   losing exchange even when it works. Listed: HAG.DE, RHM, KOG, DRO.AX, DRS.
4. **Naval and nuclear labour.** Shipyards and cleared welders cannot be bought
   at any price on a three-year horizon. Listed: BWXT, GD, BAB.L, TKMS, FCT.MI.

**Explicitly not a bottleneck:** small-UAS airframes (commodity manufacturing
with Chinese cost leadership setting the price ceiling) and autonomy software
(many credible suppliers). Value in the drone stack accrues to secure
components, datalinks, munitions, and whoever holds the program of record.

*Assumption, flagged:* this mapping is a judgement built from public reporting
on NATO munitions lead times and company capacity disclosure, not from a
proprietary supply-chain dataset. The relative severity of the four is arguable.
The direction is not: the listed universe is far better supplied with platform
integrators than with the inputs those integrators cannot get.

---

## 6. Corrections log

Every item below was in the source brief and is wrong or unsupportable. Listed
in descending order of how much it mattered.

### 6.1 Market capitalisations — the whole column was stale

The brief carried a `mcap` field per company. Checked against live data, the
errors were large and one-directional (all understated except Rheinmetall's,
which was accidentally right because the stock had halved):

| Company | Brief | Live 11 Aug 2026 | Error |
| --- | ---: | ---: | --- |
| Palantir | $80B | **$420B** | 5.3x understated |
| Rocket Lab | $6B | **$50B** | 8.3x |
| AST SpaceMobile | $11B | **$27.8B** | 2.5x |
| Elbit Systems | $14B | **$36.4B** | 2.6x |
| Curtiss-Wright | $13B | **$26.1B** | 2.0x |
| Kratos | $5B | **$12.0B** | 2.4x |
| AeroVironment | $5B | **$9.9B** | 2.0x |
| Unusual Machines | $0.1B | **$1.3B** | 13x |
| BlackSky | $0.2B | **$1.2B** | 6x |
| Planet Labs | $2B | **$8.4B** | 4.2x |
| Red Cat | $0.5B | **$1.6B** | 3.2x |
| KBR | $8B | **$4.7B** | 1.7x overstated |

This matters more than a data-hygiene complaint. The brief's scores implicitly
treated AeroVironment and Kratos as $5bn small caps that could be repriced by a
single contract. At $10bn and $12bn they cannot. And a Palantir "valuation risk"
footnote reads very differently at $80bn than at $420bn.

### 6.2 The FY27 US drone budget — not verifiable, and load-bearing

The brief's headline "what the market misunderstands" claim was a **~$74bn FY27
US drone/UAS budget, +200% year on year and ~7x FY25**. The internal arithmetic
is consistent (3x × 2.33x ≈ 7x), but the absolute figure is not supportable:
$74bn would be roughly 7% of the entire US defence budget spent on one category,
against historical unmanned-systems-and-autonomy lines an order of magnitude
smaller. The most likely explanation is a multi-year total, or a much broader
category (autonomy plus munitions plus counter-UAS) reported as annual drone
spend.

**Removed as evidence.** No figure that cannot be traced to a source is used to
carry a thesis in this note. The "what the market misunderstands" argument was
rebuilt on the valuation dispersion and drawdown data instead, which is
observable.

### 6.3 NATO framing was one summit out of date

The brief used "**NATO 2% floor, 23 of 32 members**". That standard was
superseded at the June 2025 Hague summit by **3.5% of GDP on core defence plus
1.5% on defence-related infrastructure by 2035**. This cuts *for* the brief's
thesis, which makes it a strange thing to get wrong — it was arguing a bull case
from a stale and weaker number while relying on §6.2 for the strong one.

*Assumption, flagged:* a 2035 commitment made by governments that will not be in
office in 2035 is a statement of direction, not a contracted cash flow. Treat
the trajectory as high-confidence and the level as low-confidence. The
higher-grade evidence is Germany's March 2025 constitutional amendment
exempting defence spending above 1% of GDP from the debt brake — legislation,
not a communiqué.

### 6.4 Factually dead references

- **Wolfspeed** was listed as a second-order beneficiary in the defence
  semiconductor chain. It filed for Chapter 11 in 2025. Removed.
- **Markforged** was listed under advanced manufacturing. It was acquired in
  2025 and no longer exists as a listed vehicle. The whole
  defence-adjacent-3D-printing segment was removed rather than repaired: the
  listed names no longer represent it.
- **Booz Allen** was listed as an AI/C2 beneficiary with no mention that its
  civil-agency business had been cut hard by federal spending reductions — the
  reason it trades at 11.7x. It is now in the note as a contrarian value case
  with the reason stated.
- **Patriot interceptor stocks "fell from 2,330 to ~759 units"** — oddly precise
  and not traceable to a public source. Removed. The underlying point (Western
  interceptor inventories are well below requirement) is well supported and is
  made without the false precision.

### 6.5 Internal inconsistencies

- Hero meta said "82 companies researched" against a 40-name array.
- Rheinmetall's market cap appeared as both ~€50B and 55 in the same document;
  Hensoldt as both ~€5.5B and 6.
- DroneShield's ticker was given as `DRO.ASX`; the provider symbol is `DRO.AX`.
- Hanwha Aerospace was assigned 40% defence revenue, which materially
  understates it.
- Leonardo and Leonardo DRS both appear as independent picks with no note that
  DRS is majority-owned by Leonardo — holding both is one exposure twice. Now
  flagged on both rows.
- Enterprise cybersecurity (CrowdStrike, Palo Alto) was included as a defence
  segment. Neither has meaningful defence-procurement gearing. Removed.

### 6.6 Risk weighting

The brief rated "peace risk" as **HIGH severity / LOW-MEDIUM probability** for a
book weighted toward European rearmament. For that portfolio a Ukraine
settlement is the single largest drawdown risk and it is the first risk on the
dashboard now. Valuation risk was listed as "MED-HIGH / Varies" with no
multiples anywhere in the document — in a theme where the entire complex has
re-rated since 2022, "varies" is not an assessment.

---

## 7. Universe changes

**Added (11 names), all with a stated reason:**

| Name | Why |
| --- | --- |
| Theon International (THEON.AS) | Purest listed soldier-modernisation exposure; ranks 5th on EV |
| Exosens (EXENS.PA) | Image intensifier tubes — bottleneck 2, near-monopoly economics |
| Karman Holdings (KRMN) | Pure-play rocket motor cases and fairings — the bottleneck the brief named but did not own |
| Avio (AVIO.MI) | European solid rocket motors; scarce EU asset, but priced at 123.6x |
| TKMS (TKMS.DE) | Submarines; the naval-labour bottleneck, newly independent |
| Indra Sistemas (IDR.MC) | Spain runs the largest percentage budget increase in NATO |
| Fincantieri (FCT.MI) | Naval yard capacity at 15.8x after a 53% drawdown |
| Leidos (LDOS) | Highest EV/σ in the report; the 10.9x counterpoint to Palantir at 75.6x |
| CACI, Booz Allen, Parsons | The incumbent C2 software layer the brief listed in its value chain but never put in its table |

**Kept but reclassified:** Rolls-Royce, CAE, KBR and Textron are now in an
explicitly flagged "adjacent — mostly civil" group. Rolls-Royce is an aero-engine
aftermarket business with a submarine-reactor division attached, trading within
3% of its high; selling it as defence exposure is the kind of thing this section
exists to prevent.

**Dropped:** enterprise cybersecurity names, defence-adjacent 3D printing, and
Ondas (added and then cut — a $5.6bn capitalisation on a loss-making business
adds a third data point to a speculative tail that already has two).

---

## 8. Open questions

1. **Backlog is missing.** For defence companies, order intake and book-to-bill
   are more informative than any multiple, and neither is in this note because
   neither is available from a free quote endpoint. Collecting book-to-bill per
   name from filings is the single largest upgrade available to this tab, and
   it is also what resolves H4 — the claim the whole ranking rests on.
2. **The probabilities have no calibration.** They are internally consistent and
   externally untested. Re-running this note in twelve months against realised
   outcomes is the only way that changes.
3. **Correlation is unmodelled.** See §2. The ranking is a ranking, not a
   portfolio, and the top of it is one factor.
4. **Korean governance discount.** Five Korean names show drawdowns of 32–60%
   against record export order books. Whether that is a dislocation or a
   permanent governance discount is not resolved here and needs shareholder- and
   group-structure work.

---

## 9. Sources

- **Market data:** Yahoo Finance quote and chart endpoints, 11 Aug 2026 —
  price, market capitalisation, trailing and forward P/E, 52-week range.
  Same-day FX spot.
- **Policy:** NATO Hague summit declaration (June 2025); German Basic Law
  amendment on defence spending and the infrastructure fund (March 2025);
  SIPRI Military Expenditure Database (2024 data, published April 2025).
- **Company context:** annual reports, capital-markets-day disclosure and order
  intake statements for the names profiled in §6 of the dashboard.
- **Not used:** the original brief's Reddit sentiment supplement. Sentiment from
  investment subreddits is not evidence at the resolution this note needs, and
  including it as a section would give it a standing it has not earned. The one
  substantive observation in it — that counter-UAS is a mass problem requiring
  cheap distributed detection — is incorporated into bottleneck 3 on its merits.

**Not investment advice.** Informational research prepared to prioritise further
due diligence. The expected-value figures are constructed from subjective
probabilities and are not forecasts. Verify all figures against primary filings.
