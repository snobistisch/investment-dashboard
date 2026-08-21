# Equity decision readiness — 21 August 2026

## Verdict

The dashboard was not ready for a first equity purchase. It opened with a
concentrated sizing result before it knew the investor, carried no broad
baseline, had no benchmark-relative equity return test, and stopped before an
EUR order could be inspected.

It is now ready for a **controlled concept plan** when every visible gate
passes. It is not an autonomous stock picker and it cannot submit a trade.

For a first investment, the defensible default is the broad baseline with the
active-stock sleeve at 0%. The app does not preselect that fund. The exact fund,
ISIN, venue, KID/EID, cost, broker availability and current EUR price must be
verified by the user. An individual stock remains at zero until a new evidence
record clears the baseline after costs.

## What changed

1. Personal gates now come first: goal, five-year minimum horizon, risk capital,
   separate emergency buffer, liquidity need, maximum EUR and percentage loss,
   contribution pattern, broker and share granularity.
2. The next step is an exact broad fund or ETF. The baseline starts at 100%.
   Active stocks are off and carry a declared 20% ceiling, not a target.
3. A stock requires a thesis, falsifier, dated fundamentals, dated valuation,
   two direct source links, three probabilities totalling 100%, a horizon and
   round-trip cost. Expected annual return after cost must beat the declared
   broad-baseline assumption.
4. Active sizing divides positive edge by one-year realised volatility. It is
   capped at 5% of total capital per name and 10% per primary factor. Pairwise
   correlations use 90 or more aligned daily USD-return observations. Unused
   active room returns to the baseline.
5. Embedded equity pages are research-only. Defence is outside Exposure and
   Plan. Photonics is stale because the first post-snapshot earnings trigger has
   passed. A research row never becomes an order by appearing in a page.
6. The final output is an EUR concept order with a user-entered limit, fixed
   fee, FX cost, slippage allowance, minimum order, whole or fractional shares,
   one to four tranches and an execution window. The calculation stays inside
   available cash after estimated costs.
7. A local JSON snapshot records all inputs, sources, dates, limits, quantities
   and estimated costs. It is labelled concept-only.

## Monday route

1. Leave individual stocks off unless a complete new evidence record exists.
2. Enter only money that is outside the emergency buffer and not needed during
   the stated horizon. If existing holdings are above zero, the order stage
   blocks because total-portfolio exposure is not yet modelled.
3. Identify the broad fund from its issuer page and current KID/EID. Confirm the
   exact ISIN and venue in the broker. Do not substitute a similar ticker.
4. Use a Friday close before Monday's session or a Monday observation after it
   becomes available. The planner accepts at most one completed business
   session of price age.
5. Enter the broker's actual fee, FX spread, minimum order and a limit price.
   Recheck news, quoted spread, currency, venue and instrument identity in the
   broker immediately before submission.
6. Export the decision JSON before acting. A changed price, source, event or
   limit means a new snapshot.

## Limits that remain

- The app does not establish legal suitability, tax treatment, account
  permissions, best execution or whether a product is appropriate for this
  person. Those remain outside the repository.
- Scenario probabilities and the benchmark-return assumption are subjective.
  The arithmetic is reproducible; calibration is not proven.
- Direct links and the absence of a post-review material event are confirmed by
  the user. The app does not parse filings or maintain a corporate calendar.
- Yahoo, CoinGecko and ECB snapshots have no service guarantee. Missing or old
  data blocks the affected calculation; it does not become a guessed value.
- Historical volatility and correlation describe the measured window. They do
  not bound a future loss or a regime change.
- A limit order controls price, not execution. It can remain unfilled.

The result is a tool for refusing incomplete decisions and documenting a
complete one. It is not proof that the remaining decision is good.
