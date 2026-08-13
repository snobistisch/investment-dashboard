# Crypto screen — what else clears the bar

**Date:** 12 August 2026 · **Data:** CoinGecko + DefiLlama, retrieved same day
**Status:** research only. Nothing here has been added to the dashboard, and
nothing here is a recommendation. Not investment advice.

---

## 0. What this is

You asked what else is worth researching on the criteria this project has
converged on. This is a screen, not a thesis. It answers a narrow question —
*which assets pass the same three gates the dashboard applies* — and then says
what each candidate still needs checked before it could earn a row.

**It is deliberately not a shortlist of picks.** A screen finds candidates; the
work that follows finds reasons to reject them. Roughly half the names below
will not survive that, and §6 exists to show what rejection looks like.

---

## 1. The screen, stated explicitly

Three gates, all mechanical, all from criteria this project already applies:

| Gate | Threshold | Why |
| --- | --- | --- |
| **Float-settled** | FDV / market cap ≤ 1.5× | The float rule. Dilution behind rather than ahead; a drawdown is then information, not a vesting artefact |
| **Alive** | Trailing-year protocol fees ≥ 5% of market cap | The cull test. Celestia scored 0.014% — an economy has to exist before a price can be cheap |
| **Tradeable** | 24-hour volume ≥ $1m | Five assets on the tab already sit under this; a ranking position is not an execution plan |

Then excluded: the forty assets already on the tab, the thirteen culled from it,
stablecoins, wrapped and liquid-staking receipt tokens, and anything under a
$5m capitalisation.

**One gate was added during the work, and it changed the results more than the
other three.** DefiLlama's "fees" is gross economic activity, not what a holder
receives — the distinction this project keeps running into with Ondo, Lido and
Maple. Pulling `dailyHoldersRevenue` separately splits the survivors cleanly in
two, and that split is the most useful thing in this document.

---

## 2. Method

1. DefiLlama `/protocols` + `/config` → resolve every fee-reporting module to a
   parent protocol and then to a CoinGecko id. Child modules (Aave V3, Uniswap
   V3, Hyperliquid Perps) carry no `gecko_id` of their own and resolve only via
   `parentProtocol`; skipping that step silently drops most large protocols and
   was the first thing that went wrong here.
2. Aggregate trailing-year **fees**, **revenue** and **holders revenue** per
   token, summing a protocol's modules.
3. Join to CoinGecko markets for capitalisation, FDV, supply, volume, one-year
   return and all-time-high date.
4. Apply the gates. 177 protocols reported ≥$3m of trailing fees with a
   resolvable token; 108 survived the exclusions; **25 passed all three gates.**

---

## 3. Result — the survivors, ranked by what reaches the holder

| # | Ticker | Protocol | Cap | Fees 1y | Revenue 1y | **To holders 1y** | **Holder yield** | TVL | Float | FDV/cap | Vol 24h | 1y |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | **CAKE** | PancakeSwap | $464m | $270m | $91m | **$59m** | **12.7%** | $2.08bn | 80% | 1.04× | $14m | −51% |
| 2 | **GMX** | GMX | $69m | $32m | $12m | **$9m** | **12.7%** | $184m | 79% | 1.00× | $1m | −62% |
| 3 | **CVX** | Convex | $159m | $20m | $19m | **$19m** | **11.9%** | $492m | 93% | 1.07× | $8m | −64% |
| 4 | JOE | LFJ | $13m | $12m | $1m | $1m | 10.9% | $16m | 91% | 1.09× | $4m | −84% |
| 5 | **EUL** | Euler | $28m | $60m | $3m | $2m | 8.2% | $360m | 88% | 1.13× | $8m | −90% |
| 6 | REZ | Renzo | $24m | $18m | $2m | $2m | 7.0% | $90m | 87% | 1.13× | $3m | −82% |
| 7 | USUAL | Usual | $17m | $18m | $12m | $0.9m | 5.3% | $95m | 63% | 1.00× | $1m | −89% |
| 8 | **FLUID** | Fluid (Instadapp) | $95m | $70m | $12m | $5m | 5.0% | $1.10bn | 84% | 1.19× | $1m | −85% |
| 9 | **ETHFI** | ether.fi | $383m | $220m | $51m | $13m | 3.3% | $3.90bn | 97% | 1.03× | $22m | −69% |
| 10 | ORCA | Orca | $63m | $74m | $9m | $2m | 2.8% | $240m | 61% | 1.23× | $6m | −61% |

Bolded tickers are the ones I would actually spend time on. The rest are listed
because the screen produced them, not because they survived a second look — JOE
at a $13m capitalisation and Renzo and Usual at 7% and 5.3% on sub-$25m caps are
too small to matter to a book of this size, and Orca pays out too little of what
it earns.

### Excluded from the survivors on quality, not on numbers

Five names passed all three gates and are still not research candidates:
**Pons** (launchpad, no TVL), **BONK.fun** ($206m cap on memecoin launch fees,
−91% on the year), **Bankr** and **LAB Terminal** (trading interfaces with no
protocol TVL), and one called **"Fake World Asset"**. Launchpad and meme-cycle
revenue is real cash and the worst possible base rate to extrapolate: it is a
function of a speculative cycle that has already turned once. Listed here rather
than filtered silently, because the filter that removes them is judgement, not a
threshold.

---

## 4. The five worth actual work

### CAKE — PancakeSwap · $464m · 12.7% holder yield

The strongest result in the screen and the one that most resembles what the tab
already rewards. $270m of fees, $91m of protocol revenue, **$59m reaching
holders against a $464m capitalisation**, on $2.08bn of TVL at 80% float and a
1.04× fully diluted ratio. Down 51% over a year — the shallowest drawdown of any
survivor, which cuts both ways.

The value-accrual mechanism is not a proposal: buy-back-and-burn funded by spot,
perpetual, IFO, prediction-market and lottery fees, with **34 consecutive months
of supply reduction** and roughly 52.8m CAKE burned since September 2023,
targeting about 4% annual deflation and a ~20% supply reduction by 2030.

*What to check:* how much of the fee line is BNB Chain retail volume that
travels with a single ecosystem's speculative cycle; whether the burn survives a
volume trough; and the competitive position now that Aster and edgeX are taking
BNB Chain perp share.

### CVX — Convex · $159m · 11.9% holder yield

The cleanest fee-to-holder conversion in the screen: **$20m of fees, $19m of
revenue, $19m to holders** — essentially all of it. 93% float, 1.07× FDV, $492m
of TVL, down 64%.

*What to check:* Convex is a meta-layer on Curve, so it inherits Curve's
decline. That $19m is a function of a bribe-and-vote economy whose total size is
shrinking. The question is not whether the mechanism pays — it demonstrably does
— but whether the pool it draws from still exists in three years.

### ETHFI — ether.fi · $383m · 3.3% holder yield

The largest business in the screen by TVL: **$3.90bn**, $220m of fees, $51m of
revenue, at **97% float and 1.03× fully diluted** — as float-settled as anything
on the tab. Down 69%.

The holder yield is the lowest of the five, which is the honest objection: $13m
reaches holders out of $51m of protocol revenue. Against that sits a
governance-approved **$50m buyback funded by protocol revenue, triggered when
ETHFI trades below $3** — a floor mechanism with a stated size, which is rarer
than it should be.

*What to check:* whether the buyback has actually executed at scale or merely
been authorised; restaking demand durability; and how much of the TVL is
mercenary yield that leaves when incentives normalise.

### FLUID — Fluid, formerly Instadapp · $95m · 5.0% holder yield

$1.10bn of TVL and $70m of fees against a **$95m** capitalisation, 84% float,
down 85%. The largest TVL-to-capitalisation ratio in the screen.

*What to check:* the gap between $70m of fees and $12m of revenue is lender
interest, so the headline overstates the business — Token Terminal shows roughly
$452k of protocol revenue on $3.39m of fees in a recent 30-day window, which is
a ~13% take rate. The onchain FLUID reserve and buyback strategy started
recently and has no track record. And **$1m of daily volume is the binding
constraint**: this is the least tradeable of the five.

### EUL — Euler · $28m · 8.2% holder yield

$60m of fees and $360m of TVL against a **$28m** capitalisation at 88% float,
down 90% on the year — the deepest drawdown among the survivors.

*What to check:* the 2023 exploit and recovery is the reason the multiple looks
like this, and whether the market is right to keep discounting it is the entire
question. Only $3m of that $60m is protocol revenue. This is the highest-risk,
highest-optionality name in the screen and the one where the qualitative work
matters most.

---

## 5. Near-misses — strong economics, fail only the float gate

These would rank well on activity and fail §3 of the dashboard. Listed because
the collision between the float rule and the rotation argument is live, and
anyone backing rotation should look here first:

| Ticker | Protocol | Cap | FDV/cap | Float | Fees 1y | 1y |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| MET | Meteora | $89m | 1.83× | 54% | $524m | n/a |
| EDGE | edgeX | $117m | 2.86× | 35% | $317m | n/a |
| SPK | Spark | $43m | 3.27× | 31% | $197m | −84% |
| CARDS | Collector Crypt | $64m | 4.82× | 21% | $79m | n/a |
| KERNEL | KernelDAO | $10m | 3.47× | 29% | $44m | −83% |
| SOLV | Solv Protocol | $12m | 1.81× | 55% | $35m | −95% |
| KNTQ | Kinetiq | $32m | 3.57× | 28% | $33m | n/a |
| YB | Yield Basis | $20m | 2.93× | 26% | $28m | n/a |

**Meteora is the one I would look at first** if the float gate were relaxed:
$524m of trailing fees against an $89m capitalisation at 1.83×, which is only
just outside the rule. edgeX at $317m of fees is the same shape.

---

## 6. The instructive negatives — protocols that earn and pay holders nothing

This is the most transferable output of the exercise. Each of these passed the
fees gate and would have looked like a bargain on a fees-to-capitalisation
screen alone:

| Ticker | Fees 1y | Revenue 1y | **To holders** | TVL | Read |
| --- | ---: | ---: | ---: | ---: | --- |
| COMP | $33m | $2m | **$0** | $1.22bn | A billion of TVL, nothing to the token. The Ondo pattern at scale |
| RPL | $40m | **$0** | n/t | $995m | Entire fee line is staking reward passed to node operators |
| DRIFT | $31m | $13m | **$0** | $214m | Protocol keeps it; holders do not see it |
| KNC | $10m | $10m | **$0** | $1m | Full revenue capture at protocol level, zero distribution |
| DODO | $26m | $5m | $139k | $12m | 0.5% of fees reach holders |
| RUNE | $22m | $2m | $689k | $54m | 3% of fees reach holders |
| SUSHI | $17m | $11m | $822k | $81m | 5% of fees reach holders |
| YFI | $11m | $771k | $201k | $222m | Fees are user yield, not protocol margin |

**Compound is the headline.** $1.22bn of TVL, 100% float, a 1.00× fully diluted
ratio, down 70% — it passes every gate the dashboard applies and would have
screened as a top candidate. It returns nothing to the token. On the framework
this project uses it belongs beside Ondo, not beside Aave.

That is the case for keeping the holders-revenue column: without it, this screen
would have produced Compound, Rocket Pool and Drift as top-ten candidates.

---

## 7. What the screen cannot see

Stated plainly, because a screen that does not list its blind spots is a
ranking pretending to be an analysis.

1. **It is backward-looking on fees.** Trailing-year revenue in a category that
   just fell 66% at the median is a description of a cycle that has ended. A
   protocol earning $60m through a bull year may earn $6m through a bear one.
2. **It structurally cannot find new things.** Every gate rewards history:
   float takes years to settle, fee data needs a trailing year. Monad, MegaETH
   and the rotation thesis are invisible to this screen by construction. It is
   the *opposite* instrument to the one that found those, and both are needed.
3. **DefiLlama's holders-revenue coverage is incomplete** — 996 protocols carry
   the metric against 2,559 with a fee line. An `n/t` in that column means not
   tracked, not zero, and two survivors (Rocket Pool, Osmosis) sit in that gap.
4. **No governance or concentration work has been done.** Who holds the float,
   whether the buyback is discretionary or mechanical, and whether a single
   entity can switch it off are unexamined for all ten.
5. **No security history.** Euler's drawdown has a specific cause. So do others
   here, and the screen cannot tell a recovering protocol from a broken one.
6. **Aster is a caution about the metric.** It reports $439m of trailing fees
   and returned roughly $12m to holders — the same 30× gap this section exists
   to catch, on a name already ranked 39th of 40 on the tab.

---

## 8. What I would do next

In order, and none of it is a purchase decision:

1. **Take CAKE, CVX and ETHFI through the deep-dive format** the tab already
   uses — position, the number that matters, and the bear case stated properly.
   They are the three where the fee line, the float and the distribution
   mechanism all point the same way.
2. **Answer one question for each**: for CAKE, whether the burn survives a
   volume trough; for CVX, whether the Curve economy it taxes still exists in
   three years; for ETHFI, whether the $50m buyback has executed or merely been
   authorised.
3. **Look at Meteora separately**, as the strongest name that fails only the
   float gate — the honest test of whether that gate is doing work or
   excluding winners.
4. **Re-run this screen quarterly.** It takes about twenty minutes now that the
   parent-protocol join is written, and the holders-revenue column is the part
   worth keeping.

---

*Not investment advice. Fee, revenue and holders-revenue figures are DefiLlama's
trailing-year series at 12 August 2026 and are not audited. Market data is
CoinGecko the same day. Every identifier was resolved through DefiLlama's
protocol registry rather than by ticker symbol. Nothing in this document has
been added to the dashboard.*
