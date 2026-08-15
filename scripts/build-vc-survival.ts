import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

type FundInput = {
  slug: string;
  name: string;
  source: string;
  portfolioCount: number;
  tokens: Array<[string, string]>;
  tier?: 'God-tier' | 'B' | 'D' | 'F' | 'niet_gerangschikt';
};

type Point = [number, number];
type MarketChart = { prices: Point[]; market_caps: Point[]; total_volumes: Point[] };

const AS_OF = '2026-08-15';
const CONSULTED = '2026-08-15';
const CG = 'https://www.coingecko.com/en/coins';

const funds: FundInput[] = [
  { slug: 'paradigm', name: 'Paradigm', source: 'https://cryptorank.io/funds/paradigm/portfolio', portfolioCount: 121, tier: 'God-tier', tokens: [['UNI','Uniswap'],['MORPHO','Morpho'],['ATOM','Cosmos Hub'],['LDO','Lido'],['MON','Monad'],['OP','Optimism'],['COMP','Compound'],['STRK','StarkNet'],['AXS','Axie Infinity'],['META','MetaDAO']] },
  { slug: 'cyber-fund', name: 'cyber•Fund', source: 'https://cryptorank.io/funds/cyber-fund/portfolio', portfolioCount: 31, tokens: [['INX','Infinex'],['AVAIL','Avail'],['RESOLV','Resolv'],['NB','Nubila Network']] },
  { slug: 'robot-ventures', name: 'Robot Ventures', source: 'https://cryptorank.io/funds/robot-ventures/portfolio', portfolioCount: 153, tier: 'niet_gerangschikt', tokens: [['MORPHO','Morpho'],['JTO','Jito Labs'],['TIA','Celestia'],['LDO','Lido'],['ZRO','LayerZero'],['EIGEN','EigenCloud'],['BP','Backpack'],['CFG','Centrifuge'],['DRV','Derive'],['SENT','Sentient']] },
  { slug: 'framework-ventures', name: 'Framework Ventures', source: 'https://cryptorank.io/funds/framework-ventures/portfolio', portfolioCount: 136, tokens: [['LINK','ChainLink'],['AAVE','Aave'],['JTO','Jito Labs'],['IMX','Immutable'],['XPL','Plasma'],['GRT','The Graph'],['DRV','Derive'],['RE','Re Protocol'],['SENT','Sentient'],['ALLO','Allora']] },
  { slug: 'electric-capital', name: 'Electric Capital', source: 'https://cryptorank.io/funds/electric-capital/portfolio', portfolioCount: 100, tokens: [['SUI','Sui'],['NEAR','Near Protocol'],['MON','Monad'],['EIGEN','EigenCloud'],['RE','Re Protocol'],['EGLD','MultiversX'],['WAL','Walrus'],['AXL','Axelar'],['MINA','Mina Protocol'],['ROSE','Oasis']] },
  { slug: 'bain-capital-crypto', name: 'Bain Capital Crypto', source: 'https://cryptorank.io/funds/bain-capital-crypto/portfolio', portfolioCount: 45, tokens: [['WLD','World'],['ATOM','Cosmos Hub'],['TIA','Celestia'],['COMP','Compound'],['SC','Siacoin'],['ACX','Across Protocol'],['BICO','Biconomy'],['FUEL','Fuel Network'],['SCR','Scroll']] },
  { slug: 'dragonfly', name: 'Dragonfly', source: 'https://cryptorank.io/funds/dragon-fly-capital/portfolio', portfolioCount: 183, tier: 'B', tokens: [['AVAX','Avalanche'],['NEAR','Near Protocol'],['BGB','Bitget Token'],['ENA','Ethena'],['ATOM','Cosmos Hub'],['VVV','Venice AI'],['LIT','Lighter'],['APT','Aptos'],['LDO','Lido'],['KAITO','Kaito']] },
  { slug: 'maven11', name: 'Maven11', source: 'https://cryptorank.io/funds/maven11/portfolio', portfolioCount: 101, tokens: [['TIA','Celestia'],['EGLD','MultiversX'],['MOVE','Movement'],['DUSK','Dusk'],['KNTQ','Kinetiq'],['RED','RedStone'],['XAN','Anoma'],['REZ','Renzo'],['FLIP','Chainflip']] },
  { slug: 'lemniscap', name: 'Lemniscap', source: 'https://cryptorank.io/funds/lemniscap/portfolio', portfolioCount: 114, tokens: [['ALGO','Algorand'],['PENDLE','Pendle'],['MON','Monad'],['GRT','The Graph'],['DBR','deBridge'],['LAB','LAB'],['FT','Flying Tulip'],['AXL','Axelar'],['KAVA','Kava'],['RED','RedStone']] },
  { slug: 'haun-ventures', name: 'Haun Ventures', source: 'https://cryptorank.io/funds/haun-ventures/portfolio', portfolioCount: 38, tier: 'niet_gerangschikt', tokens: [['LIT','Lighter'],['PLUME','Plume Network'],['ZORA','Zora'],['EUL','Euler']] },
  { slug: 'multicoin-capital', name: 'Multicoin Capital', source: 'https://cryptorank.io/funds/multicoin-capital/portfolio', portfolioCount: 156, tokens: [['SOL','Solana'],['NEAR','Near Protocol'],['WLD','World'],['ICP','Internet Computer'],['RENDER','Render'],['ALGO','Algorand'],['APT','Aptos'],['PYTH','Pyth Network'],['LDO','Lido'],['JTO','Jito Labs']] },
  { slug: 'figment-capital', name: 'Figment Capital', source: 'https://cryptorank.io/funds/figment-capital/portfolio', portfolioCount: 63, tokens: [['TIA','Celestia'],['EIGEN','EigenCloud'],['MEGA','MegaETH'],['MOVE','Movement'],['OSMO','Osmosis'],['RECALL','Recall'],['REZ','Renzo'],['HYPER','Hyperlane'],['SCRT','Secret Network'],['INIT','Initia']] },
  { slug: 'a16z-crypto', name: 'a16z crypto', source: 'https://cryptorank.io/funds/andreessen-horowitz/portfolio', portfolioCount: 204, tier: 'F', tokens: [['XRP','XRP'],['SOL','Solana'],['CC','Canton Network'],['SUI','Sui'],['AVAX','Avalanche'],['NEAR','Near Protocol'],['WLD','World'],['UNI','Uniswap'],['ICP','Internet Computer'],['MORPHO','Morpho']] },
  { slug: 'founders-fund', name: 'Founders Fund', source: 'https://cryptorank.io/funds/founders-fund/portfolio', portfolioCount: 55, tier: 'F', tokens: [['ONDO','Ondo Finance'],['LIT','Lighter'],['PENGU','Pudgy Penguins'],['XPL','Plasma'],['STRK','StarkNet'],['SENT','Sentient'],['USDP','Pax Dollar'],['AVNT','Avantis'],['ERA','Caldera'],['LA','Lagrange Labs']] },
  { slug: 'polychain', name: 'Polychain', source: 'https://cryptorank.io/funds/polychain-capital/portfolio', portfolioCount: 222, tier: 'D', tokens: [['SOL','Solana'],['CC','Canton Network'],['AVAX','Avalanche'],['TAO','Bittensor'],['UNI','Uniswap'],['ICP','Internet Computer'],['ATOM','Cosmos Hub'],['ENA','Ethena'],['ARB','Arbitrum'],['LUNC','Terra Classic']] },
  { slug: 'pantera', name: 'Pantera', source: 'https://cryptorank.io/funds/pantera-capital/portfolio', portfolioCount: 247, tokens: [['XRP','XRP'],['ZEC','Zcash'],['NEAR','Near Protocol'],['ONDO','Ondo Finance'],['DOT','Polkadot'],['MORPHO','Morpho'],['WLD','World'],['ENA','Ethena'],['ATOM','Cosmos Hub']] },
  { slug: 'semantic-ventures', name: 'Semantic Ventures', source: 'https://cryptorank.io/funds/semantic-ventures/portfolio', portfolioCount: 28, tokens: [['MORPHO','Morpho'],['STRK','StarkNet'],['CFG','Centrifuge'],['SUP','Superfluid'],['NTRN','Neutron'],['U','Union']] },
  { slug: 'gnosisvc', name: 'GnosisVC', source: 'https://cryptorank.io/funds/gnosis/portfolio', portfolioCount: 29, tokens: [['CFG','Centrifuge'],['FLOCK','FLock'],['HOPR','HOPR Token'],['IDOS','idOS'],['IDEX','IDEX'],['EUROP','EURØP'],['SHU','Shutter']] },
  { slug: 'coinbase-ventures', name: 'Coinbase Ventures', source: 'https://cryptorank.io/funds/coinbase-ventures/portfolio', portfolioCount: 511, tokens: [['CC','Canton Network'],['SUI','Sui'],['NEAR','Near Protocol'],['UNI','Uniswap'],['ONDO','Ondo Finance'],['MORPHO','Morpho'],['WLD','World'],['ENA','Ethena'],['ARB','Arbitrum'],['VVV','Venice AI']] },
  { slug: 'delphi-ventures', name: 'Delphi Ventures', source: 'https://cryptorank.io/funds/delphi-ventures/portfolio', portfolioCount: 175, tokens: [['SOL','Solana'],['ENA','Ethena'],['TIA','Celestia'],['PYTH','Pyth Network'],['ZRO','LayerZero'],['SEI','Sei'],['JTO','Jito Labs'],['LDO','Lido'],['IMX','Immutable'],['2Z','DoubleZero'],['NOCK','Nockchain']] },
];

const idOverrides: Record<string, string> = {
  '2Z':'doublezero','AAVE':'aave','ACX':'across-protocol','ALGO':'algorand','APT':'aptos','ARB':'arbitrum','ATOM':'cosmos','AVAX':'avalanche-2','AXL':'axelar','AXS':'axie-infinity','BGB':'bitget-token','BICO':'biconomy','CC':'canton-network','CFG':'centrifuge','COMP':'compound-governance-token','DBR':'debridge','DOT':'polkadot','DRV':'derive','DUSK':'dusk-network','EGLD':'elrond-erd-2','EIGEN':'eigenlayer','ENA':'ethena','EUL':'euler','FLIP':'chainflip','FUEL':'fuel-network','GRT':'the-graph','HOPR':'hopr','ICP':'internet-computer','IDEX':'idex','IMX':'immutable-x','INIT':'initia','JTO':'jito-staked-sol','KAITO':'kaito','KAVA':'kava','LDO':'lido-dao','LINK':'chainlink','LIT':'lighter','LUNC':'terra-luna','MINA':'mina-protocol','MON':'monad','MORPHO':'morpho','MOVE':'movement','NEAR':'near','NOCK':'nockchain','NTRN':'neutron-3','ONDO':'ondo-finance','OP':'optimism','OSMO':'osmosis','PENDLE':'pendle','PENGU':'pudgy-penguins','PLUME':'plume','PYTH':'pyth-network','RED':'redstone-oracles','RENDER':'render-token','REZ':'renzo','ROSE':'oasis-network','SC':'siacoin','SCR':'scroll','SCRT':'secret','SEI':'sei-network','SOL':'solana','STRK':'starknet','SUI':'sui','TAO':'bittensor','TIA':'celestia','UNI':'uniswap','USDP':'paxos-standard','VVV':'venice-token','WAL':'walrus-2','WLD':'worldcoin-wld','XAN':'anoma','XPL':'plasma','XRP':'ripple','ZEC':'zcash','ZORA':'zora','ZRO':'layerzero',
};

function day(timestamp: number) { return new Date(timestamp).toISOString().slice(0, 10); }
function quarter(date: string) { const d = new Date(`${date}T00:00:00Z`); return `${d.getUTCFullYear()}Q${Math.floor(d.getUTCMonth() / 3) + 1}`; }
function median(values: number[]) { const xs = [...values].sort((a,b) => a-b); const m = Math.floor(xs.length/2); return xs.length % 2 ? xs[m] : (xs[m-1] + xs[m]) / 2; }
function pct(value: number) { return Math.round(value * 10) / 10; }
function closeOnOrAfter(points: Point[], date: string) { return points.find(([ts]) => day(ts) >= date); }

async function main() {
  const history = JSON.parse(await readFile(resolve('public/data/crypto-history.json'), 'utf8')) as {
    series: Record<string, { closes: Array<{ d: string; c: number }> }>;
  };
  const market = JSON.parse(await readFile(resolve('public/data/crypto-market.json'), 'utf8')) as {
    rows: Array<{ ticker: string; coingeckoId: string; priceUsd: number; vol24hUsd: number; athChangePct: number; athDate: string }>;
  };
  const marketByTicker = new Map(market.rows.map(row => [row.ticker, row]));
  const unique = new Map<string, string>();
  for (const fund of funds) for (const [ticker, name] of fund.tokens) unique.set(ticker, name);

  const resolved = new Map<string, string>();
  const unresolved: string[] = [];
  for (const [ticker] of unique) {
    const row = marketByTicker.get(ticker);
    const id = row?.coingeckoId ?? idOverrides[ticker];
    if (row && history.series[ticker] && id) resolved.set(ticker, id); else unresolved.push(ticker);
  }

  const charts = new Map<string, MarketChart>();
  const failed: string[] = [];
  const tickers = ['BTC', ...resolved.keys()];
  const ids = new Map(resolved); ids.set('BTC', 'bitcoin');
  for (const ticker of tickers) {
    const series = history.series[ticker];
    if (!series) { failed.push(ticker); continue; }
    charts.set(ticker, {
      prices: series.closes.map(point => [new Date(`${point.d}T00:00:00Z`).getTime(), point.c]),
      market_caps: [], total_volumes: [],
    });
  }

  const btc = charts.get('BTC');
  if (!btc) throw new Error('BTC-historie ontbreekt');
  const fundByTicker = new Map<string, FundInput[]>();
  for (const fund of funds) for (const [ticker] of fund.tokens) fundByTicker.set(ticker, [...(fundByTicker.get(ticker) ?? []), fund]);

  const tokens: any[] = [];
  for (const [ticker, name] of unique) {
    const chart = charts.get(ticker);
    if (!chart?.prices.length) continue;
    const firstDate = day(chart.prices[0][0]);
    // A 365-day keyless window can establish a first-trade date only when the
    // first observation is later than the window boundary.
    if (firstDate <= '2025-08-17') continue;
    const d30Target = new Date(`${firstDate}T00:00:00Z`); d30Target.setUTCDate(d30Target.getUTCDate() + 30);
    const d30Date = d30Target.toISOString().slice(0,10);
    const d30 = closeOnOrAfter(chart.prices, d30Date);
    const btcD30 = closeOnOrAfter(btc.prices, d30Date);
    if (!d30 || !btcD30) continue;
    const marketRow = marketByTicker.get(ticker);
    const lastHistory = chart.prices.at(-1)!;
    const now: Point = [lastHistory[0], marketRow?.priceUsd ?? lastHistory[1]];
    const btcNow = btc.prices.at(-1)!;
    const historyAth = chart.prices.reduce((best, point) => point[1] > best[1] ? point : best, chart.prices[0]);
    const ath: Point = marketRow?.athDate && marketRow.athChangePct < 0
      ? [new Date(marketRow.athDate).getTime(), now[1] / (1 + marketRow.athChangePct / 100)]
      : historyAth;
    const returnPct = (now[1] / d30[1] - 1) * 100;
    const btcReturnPct = (btcNow[1] / btcD30[1] - 1) * 100;
    const drawdown = (now[1] / ath[1] - 1) * 100;
    // One 24h observation cannot establish the prompt's 30-day-volume rule.
    // Retain demonstrably liquid distressed names and omit ambiguous cases.
    if (drawdown <= -90 && (marketRow?.vol24hUsd ?? 0) < 100_000) continue;
    const linkedFunds = fundByTicker.get(ticker) ?? [];
    const sources = linkedFunds.map(f => f.source);
    sources.push(`${CG}/${ids.get(ticker)}`);
    sources.push(`${CG}/bitcoin`);
    const token: any = {
      ticker, project: name, coingecko_id: ids.get(ticker), tge_datum: firstDate,
      d30_koers_usd: d30[1], ath_koers_usd: ath[1], ath_datum: day(ath[0]),
      koers_nu_usd: now[1], peildatum: AS_OF, drawdown_ath_pct: pct(drawdown),
      rendement_sinds_d30_pct: pct(returnPct), excess_vs_btc_pct: pct(returnPct - btcReturnPct),
      status: drawdown <= -90 && (marketRow?.vol24hUsd ?? 0) >= 100_000 ? 'zieltogend' : 'levend',
      bronnen: [...new Set(sources)],
    };
    if (ticker === 'LIT') {
      token.lead = 'founders-fund';
      token.investeerders = ['ribbit-capital','haun-ventures','robinhood-ventures'];
      token.laatste_prive_fdv_usd = 1_500_000_000;
      token.eerste_cliff = '2026-12-27';
      token.bronnen.push('https://crypto-fundraising.info/projects/lighter/','https://www.tokenomist.ai/research/lighter-lit-tokenomics-robinhood-hype-a-real-burn-and-the-december-2026-cliff-2');
    }
    if (ticker === 'NOCK') {
      token.lead = 'delphi-ventures';
      token.investeerders = ['north-island-ventures','cmcc-global'];
      token.bronnen.push('https://www.nockchain.org/roadmap');
    }
    tokens.push(token);
  }

  const cohorts = new Map<string, any[]>();
  for (const token of tokens) {
    const q = quarter(token.tge_datum);
    cohorts.set(q, [...(cohorts.get(q) ?? []), token]);
  }
  const cohortRows = [...cohorts.entries()].sort().map(([kwartaal, rows]) => ({
    kwartaal, n: rows.length, mediaan_rendement_pct: pct(median(rows.map(r => r.rendement_sinds_d30_pct))),
  }));
  for (const token of tokens) {
    const cohort = cohortRows.find(row => row.kwartaal === quarter(token.tge_datum))!;
    token.cohortoverschot_pct = pct(token.rendement_sinds_d30_pct - cohort.mediaan_rendement_pct);
  }

  const fundRows = funds.map(fund => {
    const measured = tokens.filter(token => fund.tokens.some(([ticker]) => ticker === token.ticker));
    const row: any = {
      slug: fund.slug, naam: fund.name,
      portfolio_gevonden: fund.portfolioCount,
      tokens_totaal: fund.tokens.length,
      betrouwbaarheid: 'laag',
      onbekend: [`Volledige tokenportefeuille en verdwenen tokens; openbare slice: ${fund.source}`, 'Leadstatus per token, behalve LIT en NOCK', 'Instapwaardering en positieomvang per ronde'],
    };
    if (fund.tier) row.tier_bron = fund.tier;
    const measured180d = measured.filter(token => (new Date(AS_OF).getTime() - new Date(token.tge_datum).getTime()) / 86_400_000 >= 180).length;
    if (measured180d > 0) row.tokens_met_180d = measured180d;
    if (fund.tier && fund.tier !== 'niet_gerangschikt') {
      row.tier_oordeel = 'niet_toetsbaar';
      row.tier_reden = 'De openbare CryptoRank-pagina toont maximaal tien portefeuilleregels; een fondsbreed oordeel zou daardoor de overlevers selecteren.';
    }
    return row;
  });

  const output = {
    meta: {
      gegenereerd: AS_OF,
      dekking_notitie: `Ondergrens. CryptoRank toont zonder account alleen tien portefeuilleregels per fonds. Daardoor is de tokenstartpopulatie overlevingsvertekend en is geen fonds-rangorde geldig. Onopgeloste CoinGecko-tickers: ${unresolved.join(', ') || 'geen'}. Mislukte historie-requests: ${failed.join(', ') || 'geen'}.`,
      cohorten: cohortRows,
    },
    fondsen: fundRows,
    tokens,
  };

  const jsonPath = resolve('research/vc-overleving.json');
  await writeFile(jsonPath, `${JSON.stringify(output, null, 2)}\n`);

  const tokenLines = tokens.sort((a,b) => a.tge_datum.localeCompare(b.tge_datum)).map(token =>
    `| ${token.ticker} | ${token.tge_datum} | ${token.d30_koers_usd.toPrecision(5)} | ${token.koers_nu_usd.toPrecision(5)} | ${token.rendement_sinds_d30_pct.toFixed(1)}% | ${token.excess_vs_btc_pct.toFixed(1)} pp | ${token.cohortoverschot_pct.toFixed(1)} pp | ${token.drawdown_ath_pct.toFixed(1)}% | ${token.status} | [koers](${token.bronnen.find((url: string) => url.includes('coingecko.com'))}) |`
  ).join('\n');
  const fundLines = fundRows.map((fund: any) => `| ${fund.naam} | ${fund.tier_bron ?? 'grade ontbreekt'} | ${fund.tokens_totaal} | ${fund.tokens_met_180d ?? '—'} | niet toetsbaar | [slice](${fund.onbekend[0].split('slice: ')[1]}) |`).join('\n');
  const tierLines = fundRows.filter((f:any) => f.tier_bron && f.tier_bron !== 'niet_gerangschikt').map((fund:any) => `| ${fund.naam} | ${fund.tier_bron} | niet toetsbaar | Volledige tokenstartpopulatie ontbreekt; de openbare top-10 selecteert overlevers. |`).join('\n');
  const missingTierLines = fundRows.filter((f:any) => !f.tier_bron || f.tier_bron === 'niet_gerangschikt').map((fund:any) => fund.tier_bron === 'niet_gerangschikt' ? `| ${fund.naam} | door bron niet gerangschikt | niet toetsbaar | De bron noemt dit fonds niet; er bestaat geen grade om te toetsen. |` : `| ${fund.naam} | grade ontbreekt | niet toetsbaar | De opdracht bevat geen geverifieerde grade. |`).join('\n');

  const markdown = `# VC-tokenoverleving\n\n**Peildatum:** ${AS_OF}\n**Status:** reproduceerbare openbare slice; geen geldige fonds-rangorde.\n\n## §0 Wat dit wel en niet kan vaststellen\n\nDit bestand meet D30-rendementen voor tokens die in de openbare fonds-slices staan en waarvan CoinGecko binnen het keyless venster een volledige historie vanaf de eerste handelsdag levert. Het bewijst geen fondsrendement. Het openbare CryptoRank-scherm toont maximaal tien portefeuilleregels per fonds. Dat selecteert liquide overlevers. Dode en gedeliste tokens ontbreken waarschijnlijk. Daarom is de fonds-rangorde niet geldig.\n\nDe cohortbias blijft bestaan: de cohortmediaan bevat alleen tokens die in deze openbare slice terechtkwamen. De attributiebias blijft bestaan: aanwezigheid in dezelfde cap table bewijst geen invloed op het koersverloop. Leadstatus is alleen voor LIT en NOCK afzonderlijk geverifieerd. Alle tellingen zijn ondergrenzen.\n\n## §1 Methode en definities\n\nTGE is hier alleen ingevuld wanneer de eerste CoinGecko-waarneming later ligt dan de grens van het 365-daagse venster. D30 is de eerste slotwaarneming op of na dertig kalenderdagen. Cohort is het TGE-kwartaal binnen deze dataset. Cohortoverschot is tokenrendement sinds D30 minus de cohortmediaan over hetzelfde eindpunt. Excess versus BTC gebruikt dezelfde D30-datum en peildatum.\n\nDood betekent minstens 95% onder ATH plus gemiddeld minder dan $100.000 dagvolume in de laatste dertig dagen. De lokale cache bevat geen dertigdaags volumegemiddelde. Daarom krijgt geen token op basis van één 24-uursmeting het label dood. Zieltogend is alleen toegekend wanneer de token minstens 90% onder ATH staat en het huidige 24-uursvolume boven $100.000 ligt. Ambigue laag-volumegevallen zijn weggelaten. Levend is al het overige. Een CoinGecko-URL staat bij iedere gemeten regel.\n\n## §2 Rangorde op cohortoverschot\n\nEr is geen geldige rangorde. De bron toont maximaal tien regels per fonds en filtert zo de verdwenen tokens weg. Een rangnummer zou precisie veinzen. Ook een lead-only-variant is niet berekenbaar: leadstatus ontbreekt voor vrijwel alle tokenrondes.\n\n## §3 Fondsdossiers\n\n| Fonds | grade | tokenregels in open slice | met 180d | oordeel | bron |\n| --- | --- | ---: | ---: | --- | --- |\n${fundLines}\n\n### Lighter: Founders Fund tegenover Haun\n\nDe rondepagina onderscheidt twee rondes. Founders Fund en Ribbit leidden de ronde van november 2025 tegen een waardering van $1,5 miljard. Haun en Robinhood liepen mee. In oktober 2025 stonden Haun, Founders Fund, Dragonfly en Robot Ventures als leads bij een ronde zonder openbaar bedrag of waardering. De eerdere notitie dat Founders de ene ronde met al deze partijen als gewone co-investeerders leidde, voegde dus twee rondes samen. [Rondepagina](https://crypto-fundraising.info/projects/lighter/)\n\nDe tokenuitkomst is voor alle namen in de cap table dezelfde. De publieke bronnen tonen niet hun individuele instapprijs, positieomvang of verkoopgedrag. Daarmee kan LIT het verschil tussen Founders Fund op F en Haun als niet-gerangschikt niet verklaren. Het verschil is op deze deal niet toetsbaar. De eerste insidercliff staat op 27 december 2026. [Unlockbron](https://www.tokenomist.ai/research/lighter-lit-tokenomics-robinhood-hype-a-real-burn-and-the-december-2026-cliff-2)\n\n### Nockchain: Delphi als lead\n\nNockchain vermeldt dat Delphi Ventures de seedronde van $5 miljoen leidde, met North Island Ventures en CMCC Global. [Primaire bron](https://www.nockchain.org/roadmap) De openbare prijsreeks begint op 22 augustus 2025. NOCK wordt daarom alleen vanaf die eerste geobserveerde handelsdag gemeten. Delphi's instapwaardering, tokenpositie en eventuele verkoop zijn niet openbaar. De tokenuitkomst toetst de deal, niet Delphi als geheel.\n\n### Gemeten tokenregels\n\n| token | eerste handel | D30 USD | nu USD | sinds D30 | vs BTC | cohortoverschot | drawdown ATH | status | bron |\n| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |\n${tokenLines || '| — | — | — | — | — | — | — | — | — | — |'}\n\n## §4 Tier-lijst getoetst\n\n| fonds | grade van de bron | oordeel | reden |\n| --- | --- | --- | --- |\n${tierLines}\n${missingTierLines}\n\n## §5 Wat dit onderzoek niet kan zeggen\n\nDe openbare bronnen tonen geen volledige tokenportefeuille per fonds. Ze tonen geen positieomvang en meestal geen instapwaardering. Ze tonen niet of een fonds na een cliff verkocht. De huidige slice kan dus geen fondsbreed kwaliteitsoordeel dragen. Exits zonder token horen in een aparte exitdataset; ze zijn niet als nul meegenomen.\n\n## §6 Bronnen\n\n- [CryptoRank fondsportfolio's](https://cryptorank.io/funds), geraadpleegd ${CONSULTED}. Openbare weergave: maximaal tien regels per fonds.\n- [CoinGecko keyless API](https://docs.coingecko.com/docs/keyless-public-api), geraadpleegd ${CONSULTED}. 365 dagen prijshistorie en een actuele markt-snapshot.\n- [Crypto Fundraising: Lighter](https://crypto-fundraising.info/projects/lighter/), geraadpleegd ${CONSULTED}.\n- [Nockchain roadmap](https://www.nockchain.org/roadmap), geraadpleegd ${CONSULTED}.\n- [Tokenomist: Lighter unlocks](https://www.tokenomist.ai/research/lighter-lit-tokenomics-robinhood-hype-a-real-burn-and-the-december-2026-cliff-2), geraadpleegd ${CONSULTED}.\n\nGeen beleggingsadvies.\n`;
  await writeFile(resolve('research/vc-overleving.md'), markdown);
  console.log(`Geschreven: ${jsonPath}`);
  console.log(`Fondsen: ${fundRows.length}; gemeten tokens: ${tokens.length}; onopgelost: ${unresolved.length}; historie mislukt: ${failed.length}`);
}

await main();
