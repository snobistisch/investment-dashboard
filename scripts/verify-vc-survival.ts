import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

type Fund = {
  slug: string;
  tier_bron?: string;
  tier_oordeel?: string;
  tokens_totaal?: number;
  tokens_met_180d?: number;
};

type Token = {
  ticker: string;
  tge_datum: string;
  d30_koers_usd: number;
  koers_nu_usd: number;
  rendement_sinds_d30_pct: number;
  excess_vs_btc_pct: number;
  cohortoverschot_pct: number;
  bronnen: string[];
};

const data = JSON.parse(await readFile(resolve('research/vc-overleving.json'), 'utf8')) as {
  meta: { cohorten: Array<{ kwartaal: string; n: number; mediaan_rendement_pct: number }> };
  fondsen: Fund[];
  tokens: Token[];
};
const markdown = await readFile(resolve('research/vc-overleving.md'), 'utf8');

function invariant(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(`VC survival invariant failed: ${message}`);
}

invariant(data.fondsen.length === 20, 'expected all 20 requested funds');
invariant(new Set(data.fondsen.map(fund => fund.slug)).size === data.fondsen.length, 'fund slugs must be unique');
invariant(new Set(data.tokens.map(token => token.ticker)).size === data.tokens.length, 'token tickers must be unique');

const allowedGrades = new Set(['God-tier', 'B', 'D', 'F', 'niet_gerangschikt']);
for (const fund of data.fondsen) {
  invariant(!fund.tier_bron || allowedGrades.has(fund.tier_bron), `invented grade on ${fund.slug}`);
  invariant(fund.tokens_totaal === undefined || fund.tokens_totaal > 0, `zero token filler on ${fund.slug}`);
  invariant(fund.tokens_met_180d === undefined || fund.tokens_met_180d > 0, `zero 180d filler on ${fund.slug}`);
  if (!fund.tier_bron || fund.tier_bron === 'niet_gerangschikt') {
    invariant(fund.tier_oordeel === undefined, `tier judgement without a source grade on ${fund.slug}`);
  }
}

for (const token of data.tokens) {
  invariant(/^202[5-6]-\d{2}-\d{2}$/.test(token.tge_datum), `invalid TGE date on ${token.ticker}`);
  invariant(token.d30_koers_usd > 0 && token.koers_nu_usd > 0, `non-positive price on ${token.ticker}`);
  invariant(Number.isFinite(token.rendement_sinds_d30_pct), `missing D30 return on ${token.ticker}`);
  invariant(Number.isFinite(token.excess_vs_btc_pct), `missing BTC excess on ${token.ticker}`);
  invariant(Number.isFinite(token.cohortoverschot_pct), `missing cohort excess on ${token.ticker}`);
  invariant(token.bronnen.length >= 2 && token.bronnen.every(url => url.startsWith('https://')), `missing source URLs on ${token.ticker}`);
}

for (const cohort of data.meta.cohorten) {
  const rows = data.tokens.filter(token => {
    const date = new Date(`${token.tge_datum}T00:00:00Z`);
    return `${date.getUTCFullYear()}Q${Math.floor(date.getUTCMonth() / 3) + 1}` === cohort.kwartaal;
  });
  invariant(rows.length === cohort.n, `cohort count mismatch for ${cohort.kwartaal}`);
}

invariant(data.tokens.some(token => token.ticker === 'LIT'), 'LIT thread must be closed');
invariant(data.tokens.some(token => token.ticker === 'NOCK'), 'NOCK thread must be closed');
invariant(markdown.trimEnd().endsWith('Geen beleggingsadvies.'), 'required closing sentence missing');

console.log(`VC survival: ${data.fondsen.length} funds, ${data.tokens.length} strictly measured tokens, ${data.meta.cohorten.length} cohorts`);
