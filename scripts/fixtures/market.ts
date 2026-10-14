// A frozen market snapshot for the decision-logic suites.
//
// Assertions such as "changing the hurdle changes Qualified now" or "the 200MA
// gate removes names" describe the engine, but they can only be observed on
// some set of prices. Run against the live snapshot they became assertions
// about the market: when the market moved to three qualified names with none
// in the entry zone, every deploy from 2026-09-17 failed although no code had
// changed. AGENTS.md treats a changed conclusion as a finding, not a defect,
// so the logic suites read these fixed prices and the live snapshot is checked
// only for shape, provenance and freshness.
//
// Built from the last snapshot on which the full suite passed:
//   git show 1c62532:public/data/market-data.json \
//     | jq --indent 1 'del(.equityCharts)' > scripts/fixtures/market-data-2026-09-16.json
// equityCharts is dropped because no logic suite reads it; the live chart and
// 200MA invariants run on public/data/market-data.json.
//
// Replace the fixture only when a versioned research revision makes it
// unusable (for example a model reviewed after FIXTURE_DATE), and record the
// replacement in PROGRESS.md.

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { MarketSnapshot } from '../../src/data/market-data'

const here = dirname(fileURLToPath(import.meta.url))

export const FIXTURE_MARKET = JSON.parse(
  readFileSync(resolve(here, 'market-data-2026-09-16.json'), 'utf8'),
) as MarketSnapshot

/** The fixture's own market date, so freshness gates evaluate it as current. */
export const FIXTURE_DATE = FIXTURE_MARKET.fetchedAt.slice(0, 10)
