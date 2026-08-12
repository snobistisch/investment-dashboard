# Crypto & innovation — research notes

Research date: **11 August 2026**. Market data as of **11 August 2026** from the
CoinGecko public API, retrieved directly rather than transcribed. Informational
research only — not investment advice.

**Vintage warning.** Crypto re-prices in hours, not quarters. Every price,
market capitalisation and drawdown below has a shelf life measured in days, and
the one-year returns that carry most of the argument in this note will look
different within a month. The float and supply figures are the durable part;
the prices are not.

**Identifier warning, and it is not cosmetic.** Three of the thirty assets here
share a ticker with an unrelated liquid token. `LIT` matches Lighter, Litentry
and Timeless; `PRL` matches the AI-compute network plus two others; `NOCK`
matches both Nock and Nockchain. A symbol lookup returns the wrong asset for
three of thirty rows. Every identifier in this note and in the dashboard is
pinned per protocol by hand, following the same rule the repository's own
market-data script uses.

---

## 0. What this note is, and what it replaced

This replaces a research package dated 11 August 2026 that proposed a 32-token
universe with a weighted 0–100 score per asset. Its structure survives; a large
part of its data did not. Two changes carry everything else:

1. **Live market data replaces remembered market data.** Market cap, fully
   diluted valuation, circulating and maximum supply, and one-year returns are
   pulled from an API rather than recalled. This changed the conclusion, not
   just the decimals.
2. **An explicit expected-value model replaces the composite score, and
   bitcoin is in the ranking as the benchmark.** In an asset class where
   everything is one factor, "positive expected value in dollars" is close to
   meaningless. The question is whether an asset beats simply holding BTC.

The second change produces the finding the note is built around: **on these
scenario probabilities, nine of twenty-nine tokens beat bitcoin on raw expected
value and one beats it after dividing by dispersion.** That one is Ethereum,
and it wins by 0.03.

---

## 1. The finding that reorganised the note

The source package reads as a bull thesis for crypto's next five to ten years,
with a portfolio construction section, position weights and an 8% dry-powder
allocation. Nothing in it tells the reader what the market has just done.

| Asset | One-year USD return to 11 Aug 2026 |
| --- | ---: |
| Zcash | **+1,186%** |
| Hyperliquid | **+29%** |
| Sky (ex-Maker) | −35% |
| Bitcoin | −47% |
| Ethereum · Solana | −57% |
| Chainlink | −62% |
| Ondo · Pyth | −67% |
| Uniswap | −69% |
| Aave | −71% |
| Arweave | −77% |
| Lido | −81% |
| StarkNet · Arbitrum · Celestia · dYdX | −82% to −83% |
| The Graph | −85% |
| EigenLayer | −87% |
| Optimism | −88% |
| Ethena | −89% |
| Helium | −94% |

Twenty-five of the twenty-seven assets with a full year of history are down.
The median is **−69%**. Nineteen of the twenty-five fell by 60% or more. Only
Zcash and Hyperliquid are worth more than they were a year ago.

That is the context every claim in the source package needed and did not get.
Its structural arguments are mostly right — stablecoins do settle real volume,
tokenised treasuries are operational, perpetual DEXs are genuinely taking share
from centralised venues — and the assets attached to those arguments fell by a
median of 69% while the arguments got stronger. **That gap is the whole
subject.** Either it is a liquidity de-rating against intact usage, in which
case the top of the ranking is a discount, or it is the market correctly
concluding that these protocols will not pay their token holders. That is H1 on
the dashboard, my confidence in it is moderate rather than high, and if it is
wrong the ranking is systematically upside-down.

---

## 2. The expected-value method

Three scenarios per asset over a **three-year horizon to August 2029**,
probabilities summing to 1, total dollar return in each:

```
EV    = Σ pᵢ · rᵢ
σ     = √( Σ pᵢ (rᵢ − EV)² )
EVann = (1 + EV)^(1/3) − 1
```

- **Bull** — the thesis compounds and a liquidity upcycle arrives.
- **Base** — the protocol persists, adoption grinds, no re-rating.
- **Bear** — the category does not matter, or the unlock schedule wins.

Most of these have no earnings multiple to lean on, so scenarios are set
against a price path directly. For Tier C the bear case explicitly carries the
dilution arithmetic from §3.

**Bitcoin is a row, not a footnote.** It carries an expected +18.5% per year
with the tightest outcome distribution in the report (σ 86%). Every other asset
is measured against that.

**What the method cannot do.**

- It is not a forecast and has no track record. The probabilities are
  calibrated against nothing but my own reading of each situation.
- **Correlation is unmodelled, and here that matters more than on any other tab
  in this repo.** These are not thirty independent bets; they are one factor
  with thirty tickers, and in the bear case they fall together.
- **It is mechanically kind to drawdowns, and in crypto that is dangerous.** A
  90% fall raises expected return arithmetically if the asset survives — and
  "down 90%" is more often terminal here than cheap. The Graph is down 85% and
  ranks 26th; Aave is down 71% and ranks first. That distinction rests on float
  quality and business durability, which is judgement, not data.

---

## 3. The ranking

Full detail — probabilities, drivers and risks per asset — is on the dashboard
in §5, sortable and filterable. Summary against the source package's own rank:

| EV rank | Asset | EV %/yr | EV/σ | FDV/cap | Float | 1-year | Source rank |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | AAVE | +24.2% | 0.66 | 1.04x | 96% | −71% | 7 |
| 2 | AKT | +23.6% | 0.48 | 1.00x | 76% | −58% | 14 |
| 3 | **ETH** | +21.6% | **0.80** | 1.00x | 100% | −57% | 1 |
| 4 | TIA | +20.9% | 0.42 | 1.23x | 81% | −83% | 12 |
| 5 | NOCK | +20.8% | 0.22 | 1.89x | 53% | n/a | 15 |
| 6 | JUP | +19.9% | 0.48 | 2.07x | 33% | −66% | 4 |
| 7 | SOL | +19.6% | 0.63 | 1.08x | 92% | −57% | 5 |
| 8 | HNT | +19.3% | 0.36 | 1.00x | 82% | −94% | 17 |
| 9 | LINK | +18.7% | 0.58 | 1.34x | 75% | −62% | 6 |
| **10** | **BTC — benchmark** | **+18.5%** | **0.77** | 1.00x | 96% | −47% | not covered |
| 12 | LIT | +16.8% | 0.35 | 4.00x | 25% | n/a | 8 |
| 19 | SKY (ex-MKR) | +11.4% | 0.53 | 1.00x | 100% | −35% | 9 |
| 24 | ZEC | +8.9% | 0.27 | 1.00x | 80% | **+1,186%** | 2 |
| 25 | HYPE | +8.9% | 0.32 | **4.49x** | 22% | +29% | 3 |
| 29 | ONDO | +5.5% | 0.17 | 2.05x | 49% | −67% | 21 |
| 30 | PRL | **−9.7%** | −0.25 | **8.23x** | 12% | n/a | 25 |

Median expected return: **+12.8% per year** — below bitcoin's +18.5%. One asset
carries negative expected value.

**Where the ranking disagrees most with the source package:**

- **ZEC 2 → 24.** The adoption evidence is genuinely good and the shielded-pool
  growth from 11% to 30% of supply is the best usage datapoint in the report.
  But it is up 1,186% in twelve months and the package calls it undervalued.
  Those two statements need reconciling and the package does not attempt it.
- **HYPE 3 → 25.** The best business here by a distance, and the only asset
  that fails the package's own float rule other than the one it correctly
  rejects. See §4.
- **AAVE 7 → 1 and AKT 14 → 2.** Both are float-settled survivors trading at a
  fraction of their prior valuations. Neither has a story; that is the point.
- **ONDO 21 → 29.** The one avoid verdict that survives contact with live data
  completely intact. Governance token, no fee capture, real product.

---

## 4. The float rule, and the contradiction inside it

The strongest idea in the source package is a rule: do not buy a token where
most of the eventual supply has not been issued, because the unlock schedule is
a guaranteed seller unrelated to whether the protocol succeeds. It is correct
and unusually falsifiable.

It is also applied to stale supply data, and float moves. Checked live:

| Token | Float assumed | Float, 11 Aug 2026 | Consequence |
| --- | ---: | ---: | --- |
| ENA | ~12% | **66%** | The "88% still to unlock" objection is gone. The real objection — ENA has no claim on USDe revenue — stands, and is different. |
| STRK | ~10% | **68%** | FDV is $231m, not $5bn. Not an expensive low-float launch; a small cap with dilution behind it. |
| TIA | ~25% | **81%** | Moves to Tier A. The open question is whether data availability is a business at all. |
| EIGEN | ~20% | **40%** | Overhang halved while the market cap fell 15-fold. |
| AKT | ~62% | **76%** | Effectively float-settled. |
| HNT | ~63% | **82%** | Effectively float-settled. |
| RENDER | ~50% | **81%** | Effectively float-settled. |
| **HYPE** | 22% | **22%** | Unchanged — and it is a core pick with a 12% portfolio weight. |
| **LIT** | 25% | **25%** | Unchanged, with the team and investor cliff beginning Q1 2027, inside any three-year horizon. |

**The contradiction, stated plainly.** The package sets the rule — avoid tokens
under roughly 30% float with FDV above 3× circulating capitalisation — and then
makes Hyperliquid its #3 conviction pick (22%, 4.49×) and Lighter its #8 (25%,
4.00×). Those two are the only assets in the universe failing the rule apart
from Pearl, which the package does correctly reject. Either the rule has
exceptions worth naming, or the picks do not survive it.

The dashboard keeps the rule and prices the dilution into the Tier C bear
cases. **A reader who thinks no-VC issuance is genuinely different from
investor unlocks has a serious argument** — there is no fund with a return
deadline behind Hyperliquid's supply — and should lift its base case and
re-rank. That is exactly the kind of disagreement the published probabilities
exist to support.

---

## 5. Corrections log

### 5.1 Two universes, two data qualities

The twelve "mandatory" tokens were clearly fetched live and are accurate to
within a few percent — ZEC $8.1bn against $8.20bn actual, HYPE $12.1bn against
$12.53bn, LIT $588m against $573m, ONDO and ENA both within 2%. The twenty
tokens added afterwards, all marked "(est.)", were filled from memory:

| Token | Package figure | Actual, 11 Aug 2026 | Overstatement |
| --- | ---: | ---: | ---: |
| EIGEN | $2B+ | **$129M** | 15x |
| HNT | $500M+ | **$33M** | 15x |
| SCRT | $100M+ | **$11M** | 9x |
| DYDX | $600M+ | **$93M** | 6x |
| GRT | $800M+ | **$149M** | 5x |
| TIA | $1.5B+ | **$294M** | 5x |
| OP | $1B+ | **$204M** | 5x |
| LDO | $1B+ | **$244M** | 4x |
| ARB | $1.5B+ | **$519M** | 3x |
| STRK | $500M+ | **$157M** | 3x |
| AR | $300M+ | **$117M** | 2.6x |
| RENDER | $1B+ | **$649M** | 1.5x |
| AAVE | $2B+ | **$1.38B** | 1.4x |
| UNI | $3B+ | **$2.19B** | 1.4x |
| AKT | $80M | **$154M** | understated 1.9x |
| NOCK | $46M | **$28M** | 1.6x |
| PRL | $108M | **$67M** | 1.6x |

The pattern is one-directional and it has a cause: these are pre-drawdown
numbers. A universe sized from memory in a market that has fallen 69% at the
median will be systematically too large, and the scores built on top of it
inherit the error.

### 5.2 MKR no longer exists as the instrument described

The package lists Maker (MKR) at "$1.5B+ circ, ~100% unlocked" as an emerging
winner. MKR has migrated to SKY; its own circulating market capitalisation is
now negligible and a data provider returns a market cap of zero against a
$108m fully diluted valuation. **SKY at $1.25bn with 100% float is the live
instrument** and is what the dashboard ranks. The thesis is unaffected; the
ticker is wrong, and buying the wrong one is a live hazard.

### 5.3 Zcash's all-time high is a data artefact

The package writes "−35% from the Nov 2025 cycle high (~$750)", which is
consistent with the current price and correct. A data provider will instead
return "−85% from all-time high", referring to the **October 2016 listing print
of roughly $3,192** set on near-zero float in the first hours of trading. That
figure is not a meaningful reference price and must not enter a valuation
argument.

This generalises. For nine of the thirty assets — LINK, UNI, AAVE, GRT, AR,
HNT, SCRT, LDO, AKT — the all-time high is from the 2021 cycle, five years ago.
"Down 97%" for those says more about which cycle a token launched in than about
what it is worth now. **The dashboard therefore uses the one-year return as the
headline drawdown metric and shows the all-time-high month alongside the
percentage** so the reader can see which cycle is being referenced.

### 5.4 The unverifiable and the unverified

- **"$900M/yr revenue" for Hyperliquid and "$10T+ annual on-chain stablecoin
  volume"** are carried from the package and are not independently verified
  here. They are used as context, never as an input to an expected-value
  number. The Hyperliquid figure is load-bearing for its bull case and is worth
  checking against protocol data before acting on it.
- **Market-size projections** — "verifiable compute $10B+ by 2031", "stablecoins
  $1T+", "RWA $34B → $500B+" — are vendor and analyst estimates. Kept as
  ordering information for the segments, dropped as evidence.
- **The Reddit and Crypto Twitter sentiment layer** was not carried over.
  Sentiment from investment forums is not evidence at the resolution this note
  needs, and including it as a section would give it a standing it has not
  earned.

### 5.5 Where the package was right and this note simply agrees

Worth recording, because a corrections log that only lists errors misrepresents
the source:

- **ONDO and ENA: product ≠ token.** The distinction between a protocol working
  and a token holder being paid is the single best idea in the package, and it
  is correct on both names.
- **PRL is the right thing to avoid.** 12% float against an 8.23× fully diluted
  ratio; it is the only negative-expected-value asset in this report.
- **AI × crypto is a 2029 market, not a 2026 one.** ZK proving is one to two
  orders of magnitude too slow and expensive for real-time inference, and the
  package says so plainly. It then sizes the category as though the timing were
  nearer, which is the only inconsistency.
- **The best verifiable-compute companies are private.** RISC Zero, Succinct,
  =nil; Foundation and Zama have no liquid token. Stated rather than papered
  over, and it mirrors the same structural problem on the defence tab.

---

## 6. Universe changes

**Added:** BTC as the benchmark row — the single most consequential addition,
since it is the hurdle every other asset has to clear and the package places it
only in a risk-mitigation footnote. SKY replaces MKR. Total: 30 assets.

**Dropped:** CFG was kept, but Zama and Octra are excluded entirely — Zama is
pre-token and Octra has too little market data to price. The package lists both
as moonshots with "TBD" in every quantitative field, which is not a position.

**Kept and reclassified:** all four tokens the book actually holds — ETH, ZEC,
LIT and NOCK — are ranked here on the same basis as everything else, at 3, 24,
12 and 5 respectively. Two of those rankings are uncomfortable and both are
argued in full in dashboard §6 rather than softened.

---

## 7. Relationship to positions.ts

[src/data/positions.ts](../src/data/positions.ts) transcribes the crypto
section from the **previous** version of `crypto.html`, dated `2026-07-09`, and
it has deliberately not been rewritten to match this one. That file is a dated
transcription with per-section sourcing, and quietly re-transcribing it from a
new source would destroy the property that makes it trustworthy.

Two consequences a reader should know:

1. Its four crypto rows carry July market caps (ETH 210.9, ZEC 8.14, LIT 0.588,
   NOCK 0.0459). Live values are merged at read time by the market-data layer;
   the transcribed figures are labelled with their own `asOf` date.
2. Its `edge` and `note` text quotes the previous page. Those quotes remain
   accurate about that page. **Whether the book's conviction levels should
   change in light of this research is a decision for Matthias, not a
   side-effect of rebuilding a research tab.**

---

## 8. Open questions

1. **Protocol revenue is missing.** For a category whose central question is
   whether value reaches the token, per-protocol fee revenue and its split
   between treasury and holder is the series that matters most, and none of it
   is available from a free price API. Collecting it — even for the ten largest
   — is the single largest upgrade available to this tab.
2. **The probabilities have no calibration.** Internally consistent, externally
   untested. Re-running this note in twelve months against realised outcomes is
   the only thing that changes that.
3. **The unlock calendar is not modelled per date.** Tier C carries dilution in
   its bear case as a level, not as a schedule. Lighter's Q1 2027 cliff is the
   one date specific enough to act on and it is called out individually.
4. **H1 is unresolved and everything rests on it.** Whether the 69% median
   decline is a de-rating against intact usage or a correct verdict decides
   whether this ranking is a shopping list or a trap. Usage series against
   price, quarterly, is the test.

---

## 9. Sources

- **Market data:** CoinGecko public API, 11 Aug 2026 — price, circulating,
  total and maximum supply, market capitalisation, fully diluted valuation,
  all-time high and date, trailing one-year return. Identifiers pinned per
  protocol by hand.
- **Protocol context:** the source research package; project documentation and
  whitepapers for Zcash, Nockchain, Lighter, Hyperliquid, Ethena and Pearl;
  third-party dashboards for TVL, stablecoin supply and unlock schedules. Not
  independently verified here and used as context only.
- **Not used:** sentiment from investment forums and social platforms.

**Not investment advice.** Informational research prepared to prioritise further
due diligence. The expected-value figures are constructed from subjective
probabilities and are not forecasts. Digital assets can and regularly do lose
their entire value. Verify all figures independently.
