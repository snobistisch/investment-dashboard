# Crypto & innovation — research notes

Research date: **12 August 2026** (peer-reviewed revision of the 11 August
build). Market data from the CoinGecko public API, retrieved directly rather
than transcribed. Informational research only — not investment advice.

**Vintage warning.** Crypto re-prices in hours, not quarters. Every price,
market capitalisation and drawdown below has a shelf life measured in days. The
float and supply figures are the durable part; the prices are not.

**Identifier warning, and it is not cosmetic.** Six of the forty-five assets
here share a ticker with an unrelated liquid token. `LIT` matches Lighter,
Litentry and Timeless; `PRL` matches the AI-compute network plus two others;
`NOCK` matches both Nock and Nockchain; `JUP` matches a dead "Jupiter Project";
`CFG` matches a deprecated Centrifuge contract; `HYPE` matches Hyperbolic
Protocol. A symbol lookup returns the wrong asset for six of forty-five rows.
Every identifier is pinned per protocol and was verified against the project
name and homepage returned by the API.

---

## 0. Revision history, and why this document was rewritten

**11 Aug 2026 — v1.** Replaced a 32-token research package with a 30-asset
ranking on an explicit expected-value method, with bitcoin added as the
benchmark.

**12 Aug 2026 — v3, this document.** Matthias culled thirteen assets on the
thesis that they are dead, unused, or fully extracted by their venture backers,
and named eight additions. The cull was checked against trailing-year protocol
fees rather than accepted; twelve of the thirteen are supported by that data and
**one is not** (§1a). The eight additions were researched from scratch. Universe
45 → 40.

**12 Aug 2026 — v2.** Matthias flagged that the data was wrong
and that some tokens described as unavailable were in fact live. He was right.
A full line-by-line review followed. Fifteen assets were added, one factual
claim in the ranking data was corrected, five substantive prose claims were
found wrong, and every protocol fact carried over from the source package was
either verified against public reporting or removed.

**The v1 failure has a single cause and it is worth naming**, because it is the
same failure v1 accused the source package of: I carried the source's
conclusions about *availability* and *protocol facts* without checking them,
while carefully checking its market data. Verifying one column and trusting the
rest produces a document that looks rigorous and is not.

---

## 1. What v1 got wrong

### 1.1 The largest error: "the good companies are private"

v1's §4 argued that the reference implementations of verifiable compute were
private and that listed proxies were second-best substitutes, echoing the source
package's *"RISC Zero — no token yet"*, *"=nil; Foundation — no liquid token"*,
*"Zama — pre-TGE"*.

**All false at the time of writing.** The category is listed and liquid:

| Asset | Ticker | Market cap | FDV / cap | Float | 24h volume | vs ATH |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Zama (FHE) | ZAMA | $101m | 5.00x | 20% | $11.7m | −31% (Jul 2026) |
| Aztec | AZTEC | $37m | 3.51x | 29% | $1.6m | −69% (Feb 2026) |
| Irys | IRYS | $33m | 5.00x | 20% | $4.9m | −81% (May 2026) |
| Succinct | PROVE | $29m | 5.13x | 20% | $4.2m | −91% (Aug 2025) |
| Gensyn | AI | $28m | 7.66x | 13% | $4.6m | −80% (Apr 2026) |
| Arcium | ARX | $24m | 4.79x | 21% | $3.3m | −75% (Jun 2026) |
| Nillion | NIL | $22m | 2.02x | 49% | $28.0m | −95% (Mar 2025) |
| Aleo | ALEO | $21m | 1.53x | 27% | $0.6m | −100% (Sep 2024) |
| Octra | OCT | $15m | 1.00x | 63% | $0.1m | −83% (Jun 2026) |
| Boundless (RISC Zero) | ZKC | $11m | 3.66x | 27% | $1.8m | −98% (Sep 2025) |
| Lagrange | LA | $9m | 5.18x | 19% | $6.9m | −97% (Jun 2025) |

Together with Nockchain and Pearl that is **thirteen listed verifiable-compute
assets**. Only `=nil;`, `ezkl`, Ingonyama and Cysic remain genuinely private,
and they are now named individually rather than used to characterise a category.

**The corrected finding is stronger than the wrong one.** Median float across
the cohort is **21%**; ten of thirteen are under 30%; nine carry FDV above three
times market capitalisation; the median is **83% below its all-time high**. This
is the float rule from §3 landing precisely on the category that was supposed to
be exempt from it. These are not companies that stayed private to protect
shareholders — they sold a fifth of their supply into a bull market and let the
rest vest into a bear one.

### 1.2 Aave's value accrual is live, and v1 said the opposite

v1's deep dive stated the fee switch had been *"discussed for years and
delivered never"*, and used that to call AAVE a governance token wearing a
revenue story.

**Aavenomics 3.0 went live on 27 June 2026.** A rules-based engine routes a
fixed share of protocol revenue into open-market AAVE purchases without a
per-tranche governance vote, currently removing roughly **292 AAVE a day**
against approximately **$400m of annualised protocol revenue**. Aave is one of
the few assets here where usage already converts mechanically into token demand.

The correction strengthens the #1 ranking and supplies a better bear case: in
March 2026 governance *cut* the annual buyback budget from roughly $50m to $30m,
citing a 25% decline in borrow-fee revenue from its peak. The mechanism is real;
the fuel is shrinking.

### 1.3 Hyperliquid's headline numbers were too flattering

v1 repeated the source package's *"~$900M/yr revenue"* and *"~61% perp DEX
share"*. Neither survives checking:

- **Holder revenue** is nearer **$765m** on a trailing-year basis. The
  annualised run-rate swings between roughly $694m and $1.25bn depending on
  which thirty-day window is annualised — August 2026 set a record at about
  $106m of monthly fees on nearly $400bn of volume. Quoting one figure without
  the window is itself misleading.
- **Share** depends entirely on the denominator. Hyperliquid is about **44% of
  all on-chain perpetual volume** (up from 36.4% in January 2026) and about
  **73% of the top three venues** — $198bn of thirty-day volume against Aster's
  $40bn and Lighter's $33.8bn. "61%" corresponds to neither.

### 1.4 Lighter's cliff is four months away, not five quarters

v1 and the source package both placed the insider cliff in "Q1 2027". It is
**27 December 2026**, after which the half of supply held by team and investors
vests linearly at roughly **3.2m LIT a week until 2029**. For a position the
book holds, a four-month-out dated event is a different thing from a vague
next-year risk.

Also verified and corrected: buybacks are now **burned** rather than held in
treasury; roughly 15.5m LIT (~6.3% of circulating supply) has been repurchased
since the token generation event; Robinhood integrated the engine into Robinhood
Wallet in July 2026 and is both distribution partner and early investor, having
committed $11m in LIT to its community programme. Lighter's trailing holder
revenue is **$24m** against Hyperliquid's $765m.

### 1.5 Jupiter's float was computed from a stale maximum supply

v1 reported JUP float at **33%**, derived mechanically from the provider's
10bn maximum supply. **3bn JUP were burned in January 2025** (a 95%-approved
governance vote in which the team relinquished 30% of its allocation), with a
further ~135m burned later, so the eventual supply is the ~6.86bn total and the
correct float is **48%**.

This is the only asset in the set where the provider's maximum is stale, and it
is now a documented exception in the data layer rather than a silent one. Note
that the FDV column was always right: the provider computes FDV from total
supply, so the 2.07× ratio already reflected the post-burn reality.

### 1.6 Aster was missing entirely

The **second-largest perpetual DEX by volume** was absent from a report with a
perpetual-DEX section. ASTER carries a **$1.62bn** capitalisation — larger than
Aave — on 34% float, having held roughly 70% of perp DEX volume as recently as
September 2025 and fallen to about 15% of the top three. It returned **$12m** to
holders over the trailing year. It ranks 44th of 45 and is one of two
negative-expected-value assets here.

### 1.7 Smaller corrections

- **Octra is FHE, not TEE.** v1 described it as a TEE network; the project
  describes itself as an FHE blockchain with isolated execution environments.
- **EigenLayer has rebranded to EigenCloud.**
- **Starknet**, not "StarkNet".
- **Bittensor (TAO, $1.92bn)** was absent — the largest AI-native token by
  capitalisation, missing from a report with an AI × crypto thesis. Added.
- **Aethir, Nosana** added to the GPU-compute set alongside Akash and Render.
- All market data refreshed from 11 to 12 August: ZEC's one-year return moved
  from +1,186% to +1,165%, HYPE from +29% to +30%, and the median one-year
  return from −69% (n=27) to **−74%** (n=34), the added assets being down harder
  than the original set.

---

## 1a. The cull, checked against fee data

The instruction was that most of these are dead, have no users, or were milked
by venture investors. Checked against DefiLlama trailing-year protocol fees at
12 August 2026, twelve of thirteen support that reading:

| Removed | Fees, trailing year | Market cap | Note |
| --- | ---: | ---: | --- |
| TIA · Celestia | **$42K** | $293m | Blobspace demand collapsed when incentivised L2s stopped paying for users |
| AR · Arweave | $392K | $117m | Permanent storage, almost nobody paying to store |
| GRT · The Graph | $503K | $150m | Indexing every dApp supposedly needs |
| OP · Optimism | $1.5m | $204m | Sequencer fees accrue to the Collective, not the holder |
| STRK · Starknet | $1.9m | $158m | Bridge deposits declining with Linea, World Chain, Mantle; insider unlocks continued |
| RENDER | $2.2m | $649m | An AI-compute story earning rendering-sized fees |
| HNT · Helium | $2.3m | $33m | Zero fees in the last thirty days |
| PYTH | $2.9m | $321m | Feeds the perp DEXs, captures almost none of it |
| DYDX | $7.7m | $93m | Fourth by volume and falling |
| ARB · Arbitrum | $12.4m | $520m | $1.2bn chain TVL; ~92m ARB unlocking monthly, ~1.5% of supply |
| SCRT · Secret | not tracked | $11m | $1m of chain TVL |
| ZKC · Boundless | not tracked | $11m | Reference ZK proving marketplace with no measurable fee line |

**The exception: Centrifuge (CFG).** $1.63bn of tokenised real-world assets and
**$59.1m of trailing-year fees against a $59m market capitalisation** — the
highest fee-to-cap ratio of anything that was in this universe. It is not dead
and it is not unused. The defensible objection is the one this dashboard already
makes to Ondo: most of that yield belongs to depositors, not to the token
holder. Removed on instruction; the evidence is recorded here because "no users"
is not what the data says.

*Caveat on the metric.* DefiLlama fees are not revenue to token holders. For
Lido, Ethena and Maple most of the line accrues to depositors; for Aave and
Uniswap a fraction is redirected to the token; for Hyperliquid and Lighter
nearly all of it is. The column establishes whether an economy exists, which is
the question the cull turns on.

## 1b. The eight additions

Researched from scratch. The organising fact is that they split cleanly in two.

| Added | What it is | Float | FDV/cap | Fees 1y | EV rank |
| --- | --- | ---: | ---: | ---: | ---: |
| SYRUP · Maple | Institutional on-chain credit, $2.39bn TVL | 94% | 1.07x | **$108m** | **5** |
| NEAR | L1 whose Intents product earns $41m; base chain earns $1.6m | 100% | 1.00x | $42m | 20 |
| VIRTUAL | AI-agent launchpad, $102m daily volume | 66% | 1.52x | $20m | 21 |
| XPL · Plasma | Stablecoin L1, $631m TVL, zero-fee USDT by design | 27% | 3.72x | $8m | 18 |
| CAP | Stablecoin credit engine on MegaETH, $274m TVL | 16% | 6.41x | $7m | 29 |
| MON · Monad | Parallel-EVM L1, $876m TVL — tenth-largest chain | 12% | 8.51x | $1.4m | 34 |
| UP · Superform | Cross-chain yield router, $17.6m TVL | 22% | 4.52x | $0.5m | 22 |
| MEGA · MegaETH | Real-time L2, $470m raised; TVL fell $580m → $43m | 11% | 8.85x | $0.5m | 32 |

**Three are strong on both frameworks** — Maple, NEAR and Virtuals are
float-settled or near it, and all three earn real fees. Maple is the best
addition by a distance: $108m of fees against a $176m capitalisation at 94%
float.

**Five are the worst assets in the report on the float rule.** MegaETH is 11%
circulating at 8.85× fully diluted; Monad 12% at 8.51×; CAP 16% at 6.41×;
Superform 22%; Plasma 27%. Three of the five are worse on that measure than
Hyperliquid, which §5 already flags as the contradiction inside the source
research.

**The rotation argument, stated fairly.** The case for the new layer ones is not
that they earn today. It is that an old token with a five-year vesting schedule
and an exhausted holder base has a structural seller and no marginal buyer,
while a new one has attention and a motivated team. Secondary accounts of GCR's
writing put it as the majority trending to zero and being *"replaced with new
narratives and new rotations"*. **I could not verify the primary post — only
paraphrases in secondary sources — so it is carried as an argument, not a
citation.** The mechanism has independent support: over a hundred crypto
projects shut down or went dark in the first eight months of 2026, and the
general-purpose chains that survived the airdrop era mostly did not keep users.

**Where the two rules collide, this dashboard applies the float rule**, which is
why the new layer ones rank 18th, 32nd and 34th of forty. The probabilities are
published so a reader who backs rotation can raise those base cases and re-rank.
Monad is the cleanest live test: $876m of TVL against $1.4m of annual fees —
roughly $7,000 a day — with the first major unlock beginning November 2026.
Watch chain fees rather than TVL to find out which rule was right.

---

## 2. Claims verified rather than carried

Everything below was checked against public reporting during the review. This
list exists so a future reader knows which figures have been through a source
and which have not.

| Claim | Status |
| --- | --- |
| Aavenomics 3.0 live 27 Jun 2026; ~292 AAVE/day; ~$400m annualised revenue; budget cut $50m→$30m Mar 2026 | **Verified** |
| Hyperliquid ~$765m trailing holder revenue; ~44% of on-chain perp volume; $106m fees in Aug 2026 | **Verified** |
| Lighter cliff 27 Dec 2026; ~3.2m LIT/week to 2029; 15.5m LIT repurchased; Robinhood Wallet Jul 2026; $24m holder revenue | **Verified** |
| Uniswap fee switch live 28 Dec 2025, extended to L2s Mar/Jun 2026 and to v4 pools 27 Jul 2026 across seven chains; ~$23m 2026 protocol revenue | **Verified** |
| Ethereum staking record 41.7m ETH on 10 Aug 2026, ~34.5% of supply (v1 said ~32%) | **Verified** |
| Ethereum settles about half of ~$320bn stablecoin supply | **Verified** |
| Zcash shielded pool 11% → ~29.9% of supply in one year | **Verified** |
| Jupiter ~95% of Solana aggregator volume (v1 said ~80%); 3bn JUP burned Jan 2025 | **Verified** |
| Nockchain listed on Kraken 26 Jun 2026; ~2.27bn circulating; no external paying customer found | **Verified (absence)** |
| Verifiable-compute tokens live: Zama, Succinct, Boundless, Octra, Aztec, Arcium, Lagrange, Nillion, Irys, Gensyn, Aleo | **Verified** |
| Market-size projections ("verifiable compute $10B+ by 2031", "stablecoins $1T+", "RWA → $500B+") | **Not verified — vendor estimates, used as ordering information only, never as an EV input** |

---

## 3. The expected-value method

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

For Tier C the bear case explicitly carries the dilution arithmetic: if
FDV/cap = k, holding to full dilution needs network value to grow k× just to
keep the price flat.

**Bitcoin is a row, not a footnote.** It carries an expected +18.5% per year
with the tightest outcome distribution in the report (σ 86%). Everything else is
measured against that.

**What the method cannot do.** It is not a forecast and has no track record.
Correlation is unmodelled — these are one factor with forty-five tickers. And it
is mechanically kind to drawdowns, which in crypto is dangerous: a 90% fall
raises expected return arithmetically if the asset survives, and "down 90%" is
more often terminal here than cheap.

---

## 4. The ranking

**Skip to §4b if you want the live numbers, or §4c for the risk-adjusted
ones.** This section has two tables
and they describe two different universes, which is the thing that was wrong
with it: §4a below is the **pre-cull 45-asset ranking**, kept because it is the
working that produced the cull, and §4b is the **final 40 assets** that the tab
actually ranks. Until 14 August 2026 only the first table was here, which meant
TIA and ZKC appeared at #4 and #18 in the ranking on this page while §1a
explained why both had been removed. A reader got two rankings and no way to
tell which one the dashboard was running.

### 4a. Pre-cull ranking (45 assets, superseded)

**Historical.** This is the ranking as it stood before the cull in §1a. It
still contains TIA · Celestia and ZKC · Boundless, both of which were removed
on fee data, and it still carries the *Source rank* column comparing each asset
to the position the source research gave it — which is why it is kept rather
than deleted. **Do not quote a rank from this table.** Rank numbers are
non-contiguous because it is an excerpt of the 45, not the whole list.

| EV rank | Asset | EV %/yr | EV/σ | FDV/cap | Float | 1-year | Source rank |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | AAVE | +24.2% | 0.66 | 1.04x | 96% | −71% | 7 |
| 2 | AKT | +23.6% | 0.48 | 1.00x | 76% | −59% | 14 |
| 3 | **ETH** | +21.6% | **0.80** | 1.00x | 100% | −57% | 1 |
| 4 | TIA | +20.9% | 0.42 | 1.23x | 81% | −83% | 12 |
| 5 | NOCK | +20.8% | 0.22 | 1.89x | 53% | n/a | 15 |
| 6 | JUP | +19.9% | 0.48 | 2.07x | 48% | −66% | 4 |
| 7 | SOL | +19.6% | 0.63 | 1.08x | 92% | −58% | 5 |
| 9 | LINK | +18.7% | 0.58 | 1.34x | 75% | −62% | 6 |
| **10** | **BTC — benchmark** | **+18.5%** | **0.77** | 1.00x | 96% | −47% | not covered |
| 11 | UNI | +17.7% | 0.53 | 1.43x | 62% | −69% | 10 |
| 12 | LIT | +16.8% | 0.35 | 4.00x | 25% | n/a | 8 |
| 18 | ZKC (Boundless) | +12.2% | 0.23 | 3.66x | 27% | n/a | not covered |
| 21 | SKY (ex-MKR) | +11.4% | 0.53 | 1.00x | 100% | −36% | 9 |
| 26 | PROVE (Succinct) | +10.3% | 0.22 | 5.13x | 20% | −90% | not covered |
| 30 | ZEC | +8.9% | 0.27 | 1.00x | 80% | **+1,165%** | 2 |
| 31 | HYPE | +8.9% | 0.32 | **4.49x** | 22% | +30% | 3 |
| 37 | ZAMA | +6.3% | 0.15 | 5.00x | 20% | n/a | unscored |
| 40 | ONDO | +5.5% | 0.17 | 2.05x | 49% | −67% | 21 |
| 42 | AI (Gensyn) | +4.0% | 0.08 | **7.66x** | 13% | n/a | not covered |
| 44 | ASTER | **−2.2%** | −0.08 | 2.90x | 34% | n/a | not covered |
| 45 | PRL | **−9.7%** | −0.25 | **8.23x** | 12% | n/a | 25 |

On that 45-asset universe: median expected return **+11.3% per year** against
bitcoin's +18.5%; nine of forty-four beat bitcoin on raw expected value, one
after dividing by dispersion (Ethereum, 0.80 against 0.77); two assets carry
negative expected value; tier counts **A 21, B 13, C 11**, nine of the eleven
Tier C assets verifiable-compute projects. **All of those figures describe the
superseded universe.** The equivalents for the live one are under §4b.

### 4b. Final ranking (40 assets, live)

Generated 14 August 2026 from the `TOKENS` array in
`public/dashboards/crypto.html` — the same array the tab ranks in the browser,
so these numbers cannot drift from what a reader sees. Expected values are
annualised from the published three-scenario probabilities; EV/σ divides that
by the dispersion of the same three scenarios. Bitcoin is in the table as the
benchmark, not as a holding.

Neither TIA nor ZKC appears here. That is the point of the table.

| EV rank | Asset | EV %/yr | EV/σ | FDV/cap | Float | 1-year | Tier |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | :-: |
| 1 | AAVE | +24.2% | 0.66 | 1.04x | 96% | −71% | A |
| 2 | AKT | +23.6% | 0.48 | 1.00x | 76% | −59% | A |
| 3 | **ETH** | +21.6% | **0.80** | 1.00x | 100% | −57% | A |
| 4 | NOCK | +20.8% | 0.22 | 1.89x | 53% | n/a | B |
| 5 | SYRUP | +20.0% | 0.60 | 1.07x | 94% | −69% | A |
| 6 | JUP | +19.9% | 0.48 | 2.07x | 48% | −66% | B |
| 7 | SOL | +19.6% | 0.63 | 1.08x | 92% | −58% | A |
| 8 | LINK | +18.7% | 0.58 | 1.34x | 75% | −62% | A |
| **9** | **BTC — benchmark** | **+18.5%** | **0.77** | 1.00x | 96% | −47% | A |
| 10 | UNI | +17.7% | 0.53 | 1.43x | 62% | −69% | A |
| 11 | LIT | +16.8% | 0.35 | 4.00x | 25% | n/a | C |
| 12 | ENA | +12.5% | 0.35 | 1.53x | 66% | −89% | B |
| 13 | ATH | +11.6% | 0.27 | 2.09x | 48% | −88% | B |
| 14 | SKY | +11.4% | 0.53 | 1.00x | 100% | −36% | A |
| 15 | EIGEN | +11.3% | 0.23 | 2.47x | 40% | −87% | B |
| 16 | TAO | +11.3% | 0.36 | 2.19x | 46% | −47% | B |
| 17 | NIL | +11.0% | 0.24 | 2.02x | 49% | −86% | B |
| 18 | XPL | +10.8% | 0.24 | 3.72x | 27% | n/a | C |
| 19 | PROVE | +10.3% | 0.22 | 5.13x | 20% | −90% | C |
| 20 | NEAR | +10.2% | 0.33 | 1.00x | 100% | −39% | A |
| 21 | VIRTUAL | +10.0% | 0.25 | 1.52x | 66% | −55% | B |
| 22 | UP | +9.9% | 0.18 | 4.52x | 22% | n/a | C |
| 23 | NOS | +9.5% | 0.22 | 1.00x | 100% | −49% | A |
| 24 | LDO | +9.2% | 0.24 | 1.20x | 84% | −81% | A |
| 25 | ZEC | +8.9% | 0.27 | 1.00x | 80% | **+1,165%** | A |
| 26 | HYPE | +8.9% | 0.32 | 4.49x | 22% | +30% | C |
| 27 | LA | +8.8% | 0.17 | 5.18x | 19% | −88% | C |
| 28 | AZTEC | +8.6% | 0.18 | 3.51x | 29% | n/a | C |
| 29 | CAP | +6.7% | 0.15 | 6.41x | 16% | n/a | C |
| 30 | ARX | +6.5% | 0.14 | 4.79x | 21% | n/a | C |
| 31 | ZAMA | +6.3% | 0.15 | 5.00x | 20% | n/a | C |
| 32 | MEGA | +6.1% | 0.12 | 8.85x | 11% | n/a | C |
| 33 | ALEO | +6.0% | 0.13 | 1.53x | 27% | −94% | B |
| 34 | MON | +5.9% | 0.13 | 8.51x | 12% | n/a | C |
| 35 | ONDO | +5.5% | 0.17 | 2.05x | 49% | −67% | B |
| 36 | IRYS | +5.4% | 0.12 | 5.00x | 20% | n/a | C |
| 37 | AI (Gensyn) | +4.0% | 0.08 | **7.66x** | 13% | n/a | C |
| 38 | OCT | +1.8% | 0.04 | 1.00x | 63% | n/a | A |
| 39 | ASTER | **−2.2%** | −0.08 | 2.90x | 34% | n/a | B |
| 40 | PRL | **−9.7%** | −0.25 | **8.23x** | 12% | n/a | C |

Median expected return: **+10.1% per year** — below bitcoin's +18.5%. **Eight
of forty beat bitcoin on raw expected value; one beats it after dividing by
dispersion**, Ethereum, at 0.80 against 0.77. Two assets carry negative
expected value, ASTER and PRL.

Tier counts: **A 14, B 11, C 15.** Eight of the fifteen Tier C assets are
privacy or verifiable-compute projects. Note what the swap did to the shape:
A fell from 21 to 14, B from 13 to 11, and C rose from 11 to 15, so Tier C went
from the smallest tier to the largest. Thirteen removals and eight additions
produced that between them; this table does not attribute it to one or the
other.

---

## 4c. Risk rating and poker EV

Added 14 August 2026. §4b ranks forty assets on expected value. This section
adds the two things that ranking cannot see, and it exists because of one row.

**The problem, named.** Expected value is mechanically kind to a zero-or-hero
asset. A bull case worth ten times the price lifts EV whatever the odds of
reaching it, and Nockchain came **fourth of forty** on exactly that arithmetic
— a $28m network with no external customer, ranked above Solana and Chainlink.
Nothing in the three-scenario model was wrong. The model simply had no term for
how violently the thing moves, how far it has already fallen, how much supply is
still to arrive, or whether you could sell it.

### Formula 1 — the risk rating R, 0 to 1

Four components, equally weighted, each a linear ramp between two named bounds.
Every threshold is a constant in `scripts/fetch-risk-rating.ts`, so the rating
retunes without touching the logic.

```
R = 0.25·V + 0.25·D + 0.25·F + 0.25·L

V = clamp((realisedVolPct  − 30) / (300 − 30), 0, 1)     30% → 0,  ≥300% → 1
D = clamp((|drawdownPct|   − 20) / ( 95 − 20), 0, 1)     20% → 0,  ≥95%  → 1
F = clamp((fdvx            −  1) / (  8 −  1), 0, 1)      1× → 0,  ≥8×   → 1
L = clamp(1 − (log₁₀vol₂₄ − log₁₀0.5e6) / (log₁₀50e6 − log₁₀0.5e6), 0, 1)
                                                        $0.5m → 1, $50m → 0
```

Buckets: **Low** below 0.25 · **Medium** to 0.50 · **High** to 0.75 ·
**Extreme** above. The bucket is applied to the unrounded rating.

**V and D are measured, not assumed.** `scripts/fetch-risk-rating.ts` pulls a
year of daily closes per asset from CoinGecko and computes annualised
volatility of daily log returns and worst peak-to-trough inside the window,
using the same method `fetch-market-data.ts` already applies to the four held
rows. Output goes to `public/data/risk-rating.json` and, as a generated block,
into `crypto.html` — the page stays static and fetches nothing at runtime.
F and L come off the ranking table.

**Drawdown runs from the one-year peak, not the all-time high.** This report
already documents why: ZEC's "−85% from ATH" refers to its October 2016 listing
print on near-zero float, which says something about which cycle an asset
launched in and nothing about what it is worth. Fourteen of the forty have less
than a year of history and are flagged `p` on the tab — for those the peak
inside the window may be the listing print, and for a recent listing that print
*is* the cycle high, so it is flagged rather than corrected.

**All forty resolved.** No asset is unrated, and CoinGecko identifiers were
pinned by symbol *and* project name, with two checked against their homepage:
three live coins are called "Cap" (the one ranked here is `cap-4`, cap.app,
against two others worth $3.3k and $7.7k), and EigenCloud lists under
`eigenlayer` as "EigenCloud (prev. EigenLayer)".

### Formula 2 — the poker EV

```
EV_poker(i) = p_bull·r_bull + p_base·r_base − p_bear·|r_bear|·(1 + R)
```

In poker the loss is capped at what you put in, so `p·W − q·L` is the whole
calculation. In crypto it is not. A high-R asset loses **more** than its bear
scenario says, for the three reasons R is built from: volatility means the
trough sits below the median bear case, dilution means the unlock schedule is
selling into you on the way down, and illiquidity means you cannot leave at the
printed price — the exit *is* the loss. At R = 0.75 the downside weighs 1.75×
what the scenario claims. The `p_base·r_base` term is the grind: the middle
outcome poker does not have and a three-scenario model does, and it is allowed
to be negative.

**The fold rule:**

```
play only if  EV_poker(i) > EV_poker(BTC)
```

Bitcoin is already a row in this ranking rather than a footnote, so this is
literally the poker fold — if the pot odds are worse than putting the hand
down, put it down.

**Sizing, as a shown suggestion:**

```
f*(i) = min( 10% , ( EV_poker(i) − EV_poker(BTC) ) / G_loss(i) )
G_loss(i) = |r_bear(i)| · (1 + R(i))
```

Bet in proportion to the risk-weighted edge over the hurdle, divided by how
heavy the loss is. A large `G_loss` keeps the stake small even with a large
edge. **`f*` is not an allocator override.** `allocation.ts` sizes crypto as a
fixed 10% mandate on stated weights; wiring `f*` into it is a separate decision
that has not been taken. The 10% cap mirrors the allocator's own per-name
ceiling at balanced risk (10.2% of capital) so the two read on one scale.

### The calibration check, run before publishing

| | V | D | F | L | R | EV_poker | annualised |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| NOCK | 0.750 | 1.000 | 0.127 | 0.960 | **0.7093** | 0.431 | +12.7% |
| BTC | 0.020 | 0.440 | 0.000 | 0.000 | **0.1151** | 0.652 | +18.2% |

Measured inputs: NOCK 232.4% annualised volatility and a 96.8% peak-to-trough
over 359 daily closes; BTC 35.5% and 53.0% over 366. **EV_poker(NOCK) 0.43 <
EV_poker(BTC) 0.65 → fold.** NOCK's drawdown component is clamped — the
measured 96.8% is past the 95% bound, where a further fall stops carrying
information.

No threshold was tuned to produce this. The bounds were set from the reference
points the brief named (NVDA at ~37% volatility landing near zero, MegaETH at
8.85× FDV landing at 1.0) and the calibration was checked afterwards.

### What it does to the ranking

**Six of thirty-nine play. Thirty-three fold.** The default sort on the tab is
unchanged — still raw expected value, so the two columns can be read against
each other.

Two rows are worth naming. **Nockchain**, 4th on raw EV at +20.8% a year, folds
at +12.7%: the thesis did not change, the arithmetic stopped flattering it.
**Chainlink** beats bitcoin on raw expected value by 0.2 points and still folds,
because R = 0.22 charges nearly twice as much to its downside as bitcoin's 0.12
— which is the clearest single demonstration that the two hurdles are different
tests.

Bucket distribution: **Low 7 · Medium 17 · High 16 · Extreme 0.** Nothing
reaches Extreme, which is information rather than an empty band: no asset here
is maximally bad on all four axes at once. Pearl comes closest at 0.746, on a
perfect dilution and liquidity score with only moderate volatility.

| # | Asset | R | Bucket | Vol 1y | Drawdown 1y | EV %/yr | Poker EV %/yr | f* | Verdict |
| ---: | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | AAVE | 0.25 | Low | 71% | -83% | +24.2% | +23.3% | 10.0% (cap) | play |
| 2 | AKT | 0.38 | Medium | 90.5% | -78.8% | +23.6% | +21.5% | 10.0% (cap) | play |
| 3 | ETH | 0.18 | Low | 53.3% | -67.5% | +21.6% | +21.1% | 10.0% (cap) | play |
| 4 | SOL | 0.21 | Low | 57.3% | -74.9% | +19.6% | +18.8% | 3.3% | play |
| 5 | SYRUP | 0.37 | Medium | 71.1% | -75.9% | +20.0% | +18.6% | 1.9% | play |
| 6 | JUP | 0.31 | Medium | 79.7% | -74.6% | +19.9% | +18.4% | 1.1% | play |
| 7 | BTC | 0.12 | Low | 35.5% | -53% | +18.5% | +18.2% | — | **hurdle** |
| 8 | LINK | 0.22 | Low | 64.1% | -73.1% | +18.7% | +17.8% | 0% | **fold** |
| 9 | UNI | 0.26 | Medium | 79% | -79.1% | +17.7% | +16.6% | 0% | **fold** |
| 10 | LIT | 0.37 | Medium | 106.8% | -74.1% | +16.8% | +14.3% | 0% | **fold** |
| 11 | NOCK | 0.71 | High | 232.4% | -96.8% | +20.8% | +12.7% | 0% | **fold** |
| 12 | SKY | 0.24 | Low | 58.2% | -46.2% | +11.4% | +10.6% | 0% | **fold** |
| 13 | ENA | 0.31 | Medium | 85.2% | -91.2% | +12.5% | +10.6% | 0% | **fold** |
| 14 | TAO | 0.26 | Medium | 84.7% | -69.4% | +11.3% | +9.7% | 0% | **fold** |
| 15 | NEAR | 0.21 | Low | 80.5% | -69.8% | +10.2% | +8.9% | 0% | **fold** |
| 16 | VIRTUAL | 0.26 | Medium | 101.5% | -71.5% | +10.0% | +8.1% | 0% | **fold** |
| 17 | ATH | 0.46 | Medium | 97.1% | -94.3% | +11.6% | +7.9% | 0% | **fold** |
| 18 | ZEC | 0.26 | Medium | 125.8% | -71.7% | +8.9% | +7.1% | 0% | **fold** |
| 19 | HYPE | 0.32 | Medium | 77.8% | -64% | +8.9% | +7.0% | 0% | **fold** |
| 20 | XPL | 0.48 | Medium | 122.1% | -96.2% | +10.8% | +6.9% | 0% | **fold** |
| 21 | NIL | 0.52 | High | 254% | -92.3% | +11.0% | +6.5% | 0% | **fold** |
| 22 | LDO | 0.41 | Medium | 180.1% | -84.4% | +9.2% | +6.2% | 0% | **fold** |
| 23 | EIGEN | 0.57 | High | 244.1% | -92.3% | +11.3% | +6.1% | 0% | **fold** |
| 24 | PROVE | 0.57 | High | 90.1% | -89.1% | +10.3% | +5.1% | 0% | **fold** |
| 25 | NOS | 0.56 | High | 138.4% | -82.5% | +9.5% | +4.8% | 0% | **fold** |
| 26 | AZTEC | 0.51 | High | 114% | -66.8% | +8.6% | +3.6% | 0% | **fold** |
| 27 | ZAMA | 0.38 | Medium | 94.3% | -48.9% | +6.3% | +2.6% | 0% | **fold** |
| 28 | ONDO | 0.36 | Medium | 175.3% | -77.9% | +5.5% | +2.6% | 0% | **fold** |
| 29 | LA | 0.55 | High | 93.7% | -91.3% | +8.8% | +2.5% | 0% | **fold** |
| 30 | CAP | 0.43 | Medium | 191.7% | -45.9% | +6.7% | +2.3% | 0% | **fold** |
| 31 | UP | 0.68 | High | 164.6% | -73.2% | +9.9% | +2.1% | 0% | **fold** |
| 32 | ARX | 0.53 | High | 132.6% | -66.2% | +6.5% | +0.5% | 0% | **fold** |
| 33 | MON | 0.52 | High | 98% | -64% | +5.9% | +0.3% | 0% | **fold** |
| 34 | IRYS | 0.56 | High | 131.4% | -79.4% | +5.4% | −0.9% | 0% | **fold** |
| 35 | MEGA | 0.64 | High | 93.5% | -85.9% | +6.1% | −2.0% | 0% | **fold** |
| 36 | ALEO | 0.74 | High | 275.3% | -95.8% | +6.0% | −2.7% | 0% | **fold** |
| 37 | AI | 0.70 | High | 167.7% | -81.3% | +4.0% | −5.2% | 0% | **fold** |
| 38 | ASTER | 0.35 | Medium | 110% | -79.7% | −2.2% | −6.1% | 0% | **fold** |
| 39 | OCT | 0.64 | High | 208.8% | -88.5% | +1.8% | −7.9% | 0% | **fold** |
| 40 | PRL | 0.75 | High | 127.7% | -66.6% | −9.7% | −26.6% | 0% | **fold** |

### Two hurdles, kept on purpose

The brief allowed either replacing the "beats bitcoin on EV/σ" rule with the
fold rule or keeping both. **Both are kept, with the hierarchy stated: the fold
rule is the decision, EV/σ is a description.** They use different inputs and
answer different questions. EV/σ divides expected value by the dispersion of
the published scenarios and is computable entirely from numbers on the page, so
a reader who disagrees with a probability can recompute it without leaving the
tab. EV_poker charges *measured market risk* — volatility, drawdown, dilution,
liquidity — that no scenario probability contains. When they disagree, the
disagreement is the finding.

### What this still does not model

**Correlation, and here it is the largest omission.** R is measured per asset
as if the forty were independent. They are not: they are one liquidity bet with
forty tickers, and in the bear case they fall together, which is exactly when a
portfolio needs them not to. A per-asset risk rating cannot see that, and the
fold rule inherits the blindness.

**The probabilities remain a judgement.** R disciplines the loss leg; it does
not audit the odds. Every `p` in the model is still mine and still visible in
the table, which is the only defence on offer.

**One year of history is one regime.** The window covers the July 2026
drawdown, which flatters nothing, but a single year of daily closes is a small
sample for a volatility estimate and a very small one for a drawdown.

---

## 5. The float rule, and the contradiction inside it

The strongest idea in the source package is a rule: do not buy a token where
most of the eventual supply has not been issued. It is correct and unusually
falsifiable. It was applied to stale supply data, and float moves:

| Token | Float assumed | Actual, 12 Aug 2026 | Consequence |
| --- | ---: | ---: | --- |
| ENA | ~12% | **66%** | The "88% still to unlock" objection is gone. The real objection — no claim on USDe revenue — stands, and is different. |
| STRK | ~10% | **68%** | FDV is $231m, not $5bn. |
| TIA | ~25% | **81%** | Moves to Tier A. |
| EIGEN | ~20% | **40%** | Overhang halved while the cap fell 15-fold. |
| AKT · HNT · RENDER | ~62% · ~63% · ~50% | **76% · 82% · 81%** | Effectively float-settled. |
| JUP | ~47% | **48%** | Correct — but only against the post-burn 6.86bn supply. |
| HYPE | 22% | **22%** | Unchanged, and it is a core pick. |
| LIT | 25% | **25%** | Unchanged, and the cliff is four months out. |

**The contradiction.** The package sets the rule — avoid under ~30% float with
FDV above 3× — then makes Hyperliquid its #3 pick (22%, 4.49×) and Lighter its
#8 (25%, 4.00×). The dashboard keeps the rule and prices dilution into the Tier
C bear cases. A reader who thinks no-VC issuance differs from investor unlocks
has a serious argument and should lift HYPE's base case and re-rank.

---

## 6. What the source package got right

A corrections log that only lists errors misrepresents the source.

- **The float rule itself** is the best idea in the package and survives as the
  organising principle of this dashboard.
- **ONDO and ENA: product ≠ token.** Correct on both, and the distinction
  between a protocol working and a holder being paid is the report's spine.
- **PRL is the right thing to avoid.** 12% float, 8.23× FDV; the worst
  expected value of forty-five.
- **AI × crypto is a later market than its prices imply.** Correct on timing,
  wrong only on availability — which is what §1.1 corrects.
- **Zcash's adoption evidence** is real, verified, and the best usage datapoint
  in the report.

---

## 7. positions.ts, re-transcribed

[src/data/positions.ts](../src/data/positions.ts) previously transcribed the
July 2026 version of `crypto.html` and was deliberately left alone through two
rebuilds, on the grounds that re-transcribing a dated record from a new source
destroys the provenance that makes it worth having. On 12 August 2026 Matthias
instructed that it be brought up to date, so it now transcribes the current page
with `asOf: '2026-08-12'`.

What changed, and why each one mattered:

- **NOCK.** The July note described a proof market with no listed competitors.
  That stopped being true when Succinct, Lagrange and Boundless began trading.
  The note now names the listed cohort and states that Nockchain is the smallest
  and least liquid of the listed proving assets at ~$0.6m of daily volume — not
  an early option on an unavailable category. Conviction stays at 1; the
  evidence grade was already the lowest available and the new information
  reinforces it rather than changing it. **A market cap going stale is
  cosmetic; a note that misdescribes the competitive set is not.**
- **LIT.** The cliff had no date on it — "the turn of 2026/27". It is
  **27 December 2026**, and the note now carries the date, the ~3.2m LIT/week
  vesting rate to 2029, and the offsetting buyback-and-burn. The revenue gap was
  also restated: $943m to holders at Hyperliquid against $72m at Lighter over
  the trailing year, not the "$202M vs <$10M" quarterly figures.
- **ETH.** Staking corrected from "31–32%" to the 41.7m ETH / ~34.5% record of
  10 August 2026, drawdown from −65% to −62%.
- **ZEC.** The note now records that conviction is an evidence grade and that
  the evidence and the price point opposite ways: ZEC is up ~1,165% over twelve
  months and ranks 25th of 40 on expected value. The provider's "−85% from
  all-time high" is flagged as the October 2016 listing print.

Conviction levels are unchanged on all four. The evidence grades still hold;
what was wrong was the surrounding description.

## 8. Open questions

1. **Protocol revenue is still not systematically collected.** Aave, Uniswap,
   Hyperliquid and Lighter figures were verified by hand for the deep dives; the
   other forty-one rows have none. For a category whose central question is
   whether value reaches the token, that is the series that matters most.
2. **The probabilities have no calibration.** Internally consistent, externally
   untested.
3. **Liquidity is now shown but not modelled.** Five assets trade under $1m a
   day — Octra, Pearl, Nosana, Nockchain and Aleo. A ranking position is not an
   execution plan.
4. **H1 is unresolved and everything rests on it.** Whether the 74% median
   decline is a de-rating against intact usage or a correct verdict decides
   whether this ranking is a shopping list or a trap.
5. **This document has now been wrong once.** The v1 failure was trusting a
   source's characterisation of what exists. The generalised lesson is that
   "what is investable" is itself a data field and needs the same treatment as a
   price.

---

## 9. Sources

- **Market data:** CoinGecko public API, 12 Aug 2026 — price, circulating,
  total and maximum supply, market capitalisation, fully diluted valuation,
  24-hour volume, all-time high and date, trailing one-year return. Identifiers
  pinned per protocol and verified against project name and homepage.
- **Protocol facts:** The Defiant and CryptoDaily on Aavenomics 3.0;
  CoinMarketCap and DefiLlama on Hyperliquid fees and volume; 21Shares and
  Buildix on perpetual DEX share; Unlocks and CoinMarketCap on Lighter
  tokenomics; CryptoBriefing on the Uniswap fee switch; CoinOtag on Ethereum
  staking; The Block, crypto.news and Delphi Digital on the Zcash shielded pool;
  Jupiter documentation and SolanaFloor on the JUP burn; Kraken on the Nockchain
  listing.
- **Not used:** sentiment from investment forums and social platforms.

**Not investment advice.** The expected-value figures are constructed from
subjective probabilities and are not forecasts. Digital assets can and regularly
do lose their entire value. Verify all figures independently.
