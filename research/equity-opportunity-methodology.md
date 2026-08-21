# Equity Opportunities — method and authored assumptions

Research and model review date: **21 August 2026**.

## Purpose

Opportunities answers one narrow question: which already researched equities
clear a declared return hurdle at the current price under a stored scenario
model?

It does not turn research coverage into a recommendation. A company appears in
the ranked opportunity set only when it has a complete canonical model, current
market data and a directly tradable listing. Every other equity remains visible
as missing coverage and fails closed.

The canonical assumptions live in
[`src/data/equity-opportunities.ts`](../src/data/equity-opportunities.ts). The
calculation lives in
[`src/sections/opportunities/opportunity.ts`](../src/sections/opportunities/opportunity.ts).
Current prices never live in the research models. They come from the committed
market snapshot and reprice the same terminal assumptions at read time.

## Two-stage selection

The interface separates mechanical universe eligibility from valuation:

1. Stage one rescans every researched equity long. The local screen can select
   a theme and set minimum current USD market cap, maximum one-year realised
   volatility, maximum one-year drawdown magnitude, minimum three-month USD
   return and maximum quote age. Direct tradability through the declared Dutch
   retail route remains mandatory. Missing market fields fail closed.
2. Stage two applies the return hurdle only to screen survivors with a complete,
   versioned opportunity model. A stage-one survivor without a model is labelled
   `PASSED SCREEN · MODEL REQUIRED`; it cannot enter `Qualified now`.

The default stage-one numeric bounds are deliberately non-selective: $0 minimum
market cap, 200% maximum volatility, 100% maximum drawdown and -100% minimum
three-month return. At the 21 August snapshot, direct tradability and complete
market fields do the default exclusion. Tightening a local bound changes the
survivor list and can remove a model from `Qualified now`. These settings are
browser-local what-if policy and do not rewrite research or history.

Stage one does not estimate expected value. Market cap, realised volatility,
drawdown and recent return are kept as separate observed fields; they are never
blended into a composite score.

## Default policy

| Input | Default | Meaning |
| --- | ---: | --- |
| Broad-market return assumption | 7.00% a year | Opportunity-cost benchmark. This is a policy assumption, not a forecast. |
| Required active premium | 3.00 percentage points | Extra return required before a stock clears the hurdle. |
| Required annual return | 10.00% | Benchmark plus active premium. |
| Buy cost | 0.25% | Applied to capital paid at entry. |
| Sell cost | 0.25% | Applied to terminal proceeds. |
| Near-hurdle band | 10% pullback | Maximum price decline for `WATCH — CLOSE TO HURDLE`. |
| Quote age | One completed business session | Older or missing market data blocks a decision. |
| Fundamental age | 120 days | Older fundamentals block a decision. |

The benchmark, premium and costs are configurable policy assumptions. They are
not measured facts and they are not broker quotes. Taxes, spreads, custody,
currency conversion and user-specific fees are absent.

## Valuation methods

Each model has bear, base and bull scenarios. Probabilities sum to one. Terminal
values are ordered from bear to base to bull and remain fixed until a new
versioned research revision changes them.

For an EPS model, scenario `i` produces:

```text
TerminalValue_i = DilutedEPS_i × TerminalPE_i
```

For a revenue model, all inputs are in USD millions:

```text
TerminalEnterpriseValue_i = Revenue_i × TerminalEVSales_i
TerminalEquityValue_i     = TerminalEnterpriseValue_i − TerminalNetDebt
TerminalValuePerShare_i   = TerminalEquityValue_i / DilutedShares
```

The probability-weighted terminal value is:

```text
ExpectedTerminalValue = Σ Probability_i × TerminalValue_i
```

At current entry price `P`, horizon `H`, buy cost `c_buy` and sell cost
`c_sell`, expected terminal wealth and the displayed annualised return are:

```text
NetTerminalMultiple = (1 − c_sell) × ExpectedTerminalValue
                      / ((1 + c_buy) × P)

AnnualisedExpectedTerminalWealthReturn
  = NetTerminalMultiple^(1/H) − 1
```

This is the annualised return on probability-weighted terminal wealth. It is
not the probability-weighted average of each scenario CAGR. The interface names
it accordingly.

```text
BenchmarkEdge = AnnualisedExpectedTerminalWealthReturn − BenchmarkReturn
HurdleEdge    = AnnualisedExpectedTerminalWealthReturn − RequiredAnnualReturn
```

The maximum entry price solves `HurdleEdge = 0`:

```text
MaxEntryPrice = (1 − c_sell) × ExpectedTerminalValue
                / ((1 + c_buy) × (1 + RequiredAnnualReturn)^H)
```

A model is `ATTRACTIVE NOW` only when it has no blocker and hurdle edge is
strictly positive. A complete model at or below the hurdle is either close to
the hurdle or `WATCH BELOW`. Stale research, stale market data, missing evidence
and an inaccessible listing override the numeric result.

## Robustness checks

The engine shows separate stresses. It does not blend them into a score.

- Bull-to-bear probability stress moves probability mass from bull to bear
  until expected terminal value reaches the hurdle. It cannot move more mass
  than the authored bull probability.
- Terminal-value stress reduces base and bull terminal contributions together
  until the hurdle disappears.
- Cost stress solves for the additional sell-side friction the expected value
  can absorb.
- Horizon stress recalculates the hurdle edge with one extra year and unchanged
  terminal values.
- Price sensitivity recalculates hurdle edge at 80%, 90%, 100% and 110% of the
  current price and at the exact maximum entry price.

These are local sensitivity tests. They do not assign confidence to the
probabilities or establish that the scenarios cover every possible outcome.

## Initial model traces

All five models use a three-year horizon, are denominated in USD and were
reviewed on 21 August 2026. Probabilities, 2029 operating values, terminal
multiples, diluted shares and terminal net debt are authored assumptions. They
are not company guidance or consensus targets.

| Ticker | Method | Bear | Base | Bull | Probability-weighted terminal value | Fundamentals | Next review |
| --- | --- | --- | --- | --- | ---: | --- | --- |
| ALAB | FY2029 diluted EPS × P/E | 30% × ($4.00 × 25 = $100.00) | 45% × ($10.00 × 35 = $350.00) | 25% × ($15.00 × 45 = $675.00) | $356.25 | 4 Aug 2026 | 2 Nov 2026 |
| SYM | FY2029 diluted EPS × P/E | 30% × ($0.80 × 18 = $14.40) | 45% × ($2.80 × 25 = $70.00) | 25% × ($5.00 × 30 = $150.00) | $73.32 | 5 Aug 2026 | 3 Nov 2026 |
| TEM | FY2029 revenue × EV/sales; 190m shares; zero terminal net debt | 30% × ($2.1bn × 2 / 190m = $22.11) | 50% × ($3.1bn × 4.5 / 190m = $73.42) | 20% × ($4.3bn × 7 / 190m = $158.42) | $75.03 | 30 Jul 2026 | 28 Oct 2026 |
| NU | FY2029 diluted EPS × P/E | 25% × ($0.85 × 14 = $11.90) | 50% × ($1.50 × 18 = $27.00) | 25% × ($2.00 × 22 = $44.00) | $27.48 | 13 Aug 2026 | 11 Nov 2026 |
| IONQ | FY2029 revenue × EV/sales; 450m shares; zero terminal net debt | 35% × ($0.4bn × 3 / 450m = $2.67) | 45% × ($1.2bn × 8 / 450m = $21.33) | 20% × ($2.5bn × 15 / 450m = $83.33) | $27.20 | 5 Aug 2026 | 3 Nov 2026 |

The version identifiers are `ALAB-2026-08-21-v1`, `SYM-2026-08-21-v1`,
`TEM-2026-08-21-v1`, `NU-2026-08-21-v1` and `IONQ-2026-08-21-v1`. A change to
a terminal assumption, probability, horizon or valuation structure requires a
new visible version. A market-price refresh does not.

## Repricing history

`scripts/build-opportunity-history.ts` runs after the equity market refresh. It
records the market date, ticker, model version, quote, expected terminal value,
annualised return, hurdle edge, maximum entry price and state in
`public/data/equity-opportunity-history.json`.

The key is market date plus ticker plus model version. Rebuilding the same date
and version replaces that row instead of duplicating it. A later price creates a
new repricing row. A changed research model creates a new model version, so a
reader can distinguish market repricing from thesis revision. The stored policy
travels with the history file because a changed hurdle can also change state.

History is descriptive. It does not prove why a price moved, and it does not
make an old model current after its mandatory review date.

## Primary sources

The sources establish the latest reported operating context used when the
models were authored:

- [Astera Labs — Q2 2026 results](https://ir.asteralabs.com/news-releases/news-release-details/astera-labs-reports-second-quarter-2026-financial-results), published 4 August 2026.
- [Symbotic — fiscal Q3 2026 results](https://ir.symbotic.com/news-releases/news-release-details/symbotic-reports-third-quarter-fiscal-year-2026-results), published 5 August 2026.
- [Tempus AI — Q2 2026 results](https://investors.tempus.com/news-releases/news-release-details/tempus-reports-second-quarter-2026-results), published 30 July 2026.
- [Nu Holdings — Q2 2026 results](https://international.nubank.com.br/company/nu-holdings-ltd-reports-second-quarter-2026-financial-results/), published 13 August 2026.
- [IonQ — Q2 2026 results](https://investors.ionq.com/news/news-details/2026/IonQ-Announces-Record-Second-Quarter-2026-Revenues-Growing-287-YoY/default.aspx), published 5 August 2026.

Those releases do not supply the 2029 scenario values or probabilities. The
models state those as authored assumptions. One source per company is enough to
anchor the first implementation, but it is not a complete evidence record for
every balance-sheet, dilution or competitive claim.

## Why unmodelled names fail closed

`src/data/positions.ts` contains 86 transcribed research rows. An `edge`, risk
tier, market cap or appearance in a thematic page is not an opportunity model.
The engine never converts those fields into a terminal value and never fills a
missing scenario with a consensus target.

Only the five canonical records above can enter the economic ranking. Every
other equity is `INSUFFICIENT EVIDENCE` until it has:

- a dated thesis, falsifier, catalyst and mandatory review date;
- a current primary source;
- a transparent valuation method with bear, base and bull assumptions;
- probabilities totalling 100%;
- fixed terminal values in the listing currency;
- a current mapped quote in the same currency; and
- a directly tradable listing under the repository's declared route.

Defence remains a separate research-only universe. Its old scenario returns are
not imported because they were attached to an old entry price rather than fixed
terminal values. Crypto remains in its separate Pilot. Neither can enter the
equity ranking by accident.

## Limits

- Scenario probabilities are subjective and have no calibration record.
- Terminal multiples, terminal revenue, terminal EPS, share counts and net debt
  can be wrong together. Sensitivity tests do not make them independent.
- The EPS models omit an explicit per-share bridge from current diluted shares,
  buybacks, options and future issuance.
- Revenue models simplify capital structure to one terminal share count and net
  debt assumption. Acquisitions can invalidate both.
- Dividends, taxes and interim cash flows are absent. The model values terminal
  wealth only.
- The 7% benchmark and 3-point active premium are policy choices, not expected
  market returns supported by a forecasting model.
- A price decline can improve the arithmetic while new information invalidates
  the thesis. The app does not parse filings or detect material events.
- A positive hurdle edge is not a buy instruction. Portfolio concentration,
  personal suitability, order execution and broker availability remain separate
  decisions.
- The calculated maximum entry price is research output. It does not populate
  Plan's user-entered execution limit or create an order.
