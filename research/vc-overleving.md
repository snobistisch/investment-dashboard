# VC-tokenoverleving

**Peildatum:** 2026-08-15
**Status:** reproduceerbare openbare slice; geen geldige fonds-rangorde.

## §0 Wat dit wel en niet kan vaststellen

Dit bestand meet D30-rendementen voor tokens die in de openbare fonds-slices staan en waarvan CoinGecko binnen het keyless venster een volledige historie vanaf de eerste handelsdag levert. Het bewijst geen fondsrendement. Het openbare CryptoRank-scherm toont maximaal tien portefeuilleregels per fonds. Dat selecteert liquide overlevers. Dode en gedeliste tokens ontbreken waarschijnlijk. Daarom is de fonds-rangorde niet geldig.

De cohortbias blijft bestaan: de cohortmediaan bevat alleen tokens die in deze openbare slice terechtkwamen. De attributiebias blijft bestaan: aanwezigheid in dezelfde cap table bewijst geen invloed op het koersverloop. Leadstatus is alleen voor LIT en NOCK afzonderlijk geverifieerd. Alle tellingen zijn ondergrenzen.

## §1 Methode en definities

TGE is hier alleen ingevuld wanneer de eerste CoinGecko-waarneming later ligt dan de grens van het 365-daagse venster. D30 is de eerste slotwaarneming op of na dertig kalenderdagen. Cohort is het TGE-kwartaal binnen deze dataset. Cohortoverschot is tokenrendement sinds D30 minus de cohortmediaan over hetzelfde eindpunt. Excess versus BTC gebruikt dezelfde D30-datum en peildatum.

Dood betekent minstens 95% onder ATH plus gemiddeld minder dan $100.000 dagvolume in de laatste dertig dagen. De lokale cache bevat geen dertigdaags volumegemiddelde. Daarom krijgt geen token op basis van één 24-uursmeting het label dood. Zieltogend is alleen toegekend wanneer de token minstens 90% onder ATH staat en het huidige 24-uursvolume boven $100.000 ligt. Ambigue laag-volumegevallen zijn weggelaten. Levend is al het overige. Een CoinGecko-URL staat bij iedere gemeten regel.

## §2 Rangorde op cohortoverschot

Er is geen geldige rangorde. De bron toont maximaal tien regels per fonds en filtert zo de verdwenen tokens weg. Een rangnummer zou precisie veinzen. Ook een lead-only-variant is niet berekenbaar: leadstatus ontbreekt voor vrijwel alle tokenrondes.

## §3 Fondsdossiers

| Fonds | grade | tokenregels in open slice | met 180d | oordeel | bron |
| --- | --- | ---: | ---: | --- | --- |
| Paradigm | God-tier | 10 | 1 | niet toetsbaar | [slice](https://cryptorank.io/funds/paradigm/portfolio) |
| cyber•Fund | grade ontbreekt | 4 | — | niet toetsbaar | [slice](https://cryptorank.io/funds/cyber-fund/portfolio) |
| Robot Ventures | niet_gerangschikt | 10 | — | niet toetsbaar | [slice](https://cryptorank.io/funds/robot-ventures/portfolio) |
| Framework Ventures | grade ontbreekt | 10 | 1 | niet toetsbaar | [slice](https://cryptorank.io/funds/framework-ventures/portfolio) |
| Electric Capital | grade ontbreekt | 10 | 1 | niet toetsbaar | [slice](https://cryptorank.io/funds/electric-capital/portfolio) |
| Bain Capital Crypto | grade ontbreekt | 9 | — | niet toetsbaar | [slice](https://cryptorank.io/funds/bain-capital-crypto/portfolio) |
| Dragonfly | B | 10 | 1 | niet toetsbaar | [slice](https://cryptorank.io/funds/dragon-fly-capital/portfolio) |
| Maven11 | grade ontbreekt | 9 | — | niet toetsbaar | [slice](https://cryptorank.io/funds/maven11/portfolio) |
| Lemniscap | grade ontbreekt | 10 | 1 | niet toetsbaar | [slice](https://cryptorank.io/funds/lemniscap/portfolio) |
| Haun Ventures | niet_gerangschikt | 4 | 1 | niet toetsbaar | [slice](https://cryptorank.io/funds/haun-ventures/portfolio) |
| Multicoin Capital | grade ontbreekt | 10 | — | niet toetsbaar | [slice](https://cryptorank.io/funds/multicoin-capital/portfolio) |
| Figment Capital | grade ontbreekt | 10 | — | niet toetsbaar | [slice](https://cryptorank.io/funds/figment-capital/portfolio) |
| a16z crypto | F | 10 | — | niet toetsbaar | [slice](https://cryptorank.io/funds/andreessen-horowitz/portfolio) |
| Founders Fund | F | 10 | 2 | niet toetsbaar | [slice](https://cryptorank.io/funds/founders-fund/portfolio) |
| Polychain | D | 10 | — | niet toetsbaar | [slice](https://cryptorank.io/funds/polychain-capital/portfolio) |
| Pantera | grade ontbreekt | 9 | — | niet toetsbaar | [slice](https://cryptorank.io/funds/pantera-capital/portfolio) |
| Semantic Ventures | grade ontbreekt | 6 | — | niet toetsbaar | [slice](https://cryptorank.io/funds/semantic-ventures/portfolio) |
| GnosisVC | grade ontbreekt | 7 | — | niet toetsbaar | [slice](https://cryptorank.io/funds/gnosis/portfolio) |
| Coinbase Ventures | grade ontbreekt | 10 | — | niet toetsbaar | [slice](https://cryptorank.io/funds/coinbase-ventures/portfolio) |
| Delphi Ventures | grade ontbreekt | 11 | 1 | niet toetsbaar | [slice](https://cryptorank.io/funds/delphi-ventures/portfolio) |

### Lighter: Founders Fund tegenover Haun

De rondepagina onderscheidt twee rondes. Founders Fund en Ribbit leidden de ronde van november 2025 tegen een waardering van $1,5 miljard. Haun en Robinhood liepen mee. In oktober 2025 stonden Haun, Founders Fund, Dragonfly en Robot Ventures als leads bij een ronde zonder openbaar bedrag of waardering. De eerdere notitie dat Founders de ene ronde met al deze partijen als gewone co-investeerders leidde, voegde dus twee rondes samen. [Rondepagina](https://crypto-fundraising.info/projects/lighter/)

De tokenuitkomst is voor alle namen in de cap table dezelfde. De publieke bronnen tonen niet hun individuele instapprijs, positieomvang of verkoopgedrag. Daarmee kan LIT het verschil tussen Founders Fund op F en Haun als niet-gerangschikt niet verklaren. Het verschil is op deze deal niet toetsbaar. De eerste insidercliff staat op 27 december 2026. [Unlockbron](https://www.tokenomist.ai/research/lighter-lit-tokenomics-robinhood-hype-a-real-burn-and-the-december-2026-cliff-2)

### Nockchain: Delphi als lead

Nockchain vermeldt dat Delphi Ventures de seedronde van $5 miljoen leidde, met North Island Ventures en CMCC Global. [Primaire bron](https://www.nockchain.org/roadmap) De openbare prijsreeks begint op 22 augustus 2025. NOCK wordt daarom alleen vanaf die eerste geobserveerde handelsdag gemeten. Delphi's instapwaardering, tokenpositie en eventuele verkoop zijn niet openbaar. De tokenuitkomst toetst de deal, niet Delphi als geheel.

### Gemeten tokenregels

| token | eerste handel | D30 USD | nu USD | sinds D30 | vs BTC | cohortoverschot | drawdown ATH | status | bron |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| NOCK | 2025-08-22 | 0.018406 | 0.0094678 | -48.6% | -3.0 pp | 15.7 pp | -95.5% | zieltogend | [koers](https://www.coingecko.com/en/coins/nockchain) |
| XPL | 2025-09-25 | 0.38596 | 0.076876 | -80.1% | -36.8 pp | -15.8 pp | -95.4% | zieltogend | [koers](https://www.coingecko.com/en/coins/plasma) |
| MON | 2025-11-24 | 0.019767 | 0.020974 | 6.1% | 34.2 pp | -3.2 pp | -57.0% | levend | [koers](https://www.coingecko.com/en/coins/monad) |
| LIT | 2025-12-30 | 1.9745 | 2.2200 | 12.4% | 41.9 pp | 3.1 pp | -71.8% | levend | [koers](https://www.coingecko.com/en/coins/lighter) |
| MEGA | 2026-04-30 | 0.061570 | 0.031428 | -49.0% | -34.6 pp | 0.0 pp | -85.6% | levend | [koers](https://www.coingecko.com/en/coins/megaeth) |

## §4 Tier-lijst getoetst

| fonds | grade van de bron | oordeel | reden |
| --- | --- | --- | --- |
| Paradigm | God-tier | niet toetsbaar | Volledige tokenstartpopulatie ontbreekt; de openbare top-10 selecteert overlevers. |
| Dragonfly | B | niet toetsbaar | Volledige tokenstartpopulatie ontbreekt; de openbare top-10 selecteert overlevers. |
| a16z crypto | F | niet toetsbaar | Volledige tokenstartpopulatie ontbreekt; de openbare top-10 selecteert overlevers. |
| Founders Fund | F | niet toetsbaar | Volledige tokenstartpopulatie ontbreekt; de openbare top-10 selecteert overlevers. |
| Polychain | D | niet toetsbaar | Volledige tokenstartpopulatie ontbreekt; de openbare top-10 selecteert overlevers. |
| cyber•Fund | grade ontbreekt | niet toetsbaar | De opdracht bevat geen geverifieerde grade. |
| Robot Ventures | door bron niet gerangschikt | niet toetsbaar | De bron noemt dit fonds niet; er bestaat geen grade om te toetsen. |
| Framework Ventures | grade ontbreekt | niet toetsbaar | De opdracht bevat geen geverifieerde grade. |
| Electric Capital | grade ontbreekt | niet toetsbaar | De opdracht bevat geen geverifieerde grade. |
| Bain Capital Crypto | grade ontbreekt | niet toetsbaar | De opdracht bevat geen geverifieerde grade. |
| Maven11 | grade ontbreekt | niet toetsbaar | De opdracht bevat geen geverifieerde grade. |
| Lemniscap | grade ontbreekt | niet toetsbaar | De opdracht bevat geen geverifieerde grade. |
| Haun Ventures | door bron niet gerangschikt | niet toetsbaar | De bron noemt dit fonds niet; er bestaat geen grade om te toetsen. |
| Multicoin Capital | grade ontbreekt | niet toetsbaar | De opdracht bevat geen geverifieerde grade. |
| Figment Capital | grade ontbreekt | niet toetsbaar | De opdracht bevat geen geverifieerde grade. |
| Pantera | grade ontbreekt | niet toetsbaar | De opdracht bevat geen geverifieerde grade. |
| Semantic Ventures | grade ontbreekt | niet toetsbaar | De opdracht bevat geen geverifieerde grade. |
| GnosisVC | grade ontbreekt | niet toetsbaar | De opdracht bevat geen geverifieerde grade. |
| Coinbase Ventures | grade ontbreekt | niet toetsbaar | De opdracht bevat geen geverifieerde grade. |
| Delphi Ventures | grade ontbreekt | niet toetsbaar | De opdracht bevat geen geverifieerde grade. |

## §5 Wat dit onderzoek niet kan zeggen

De openbare bronnen tonen geen volledige tokenportefeuille per fonds. Ze tonen geen positieomvang en meestal geen instapwaardering. Ze tonen niet of een fonds na een cliff verkocht. De huidige slice kan dus geen fondsbreed kwaliteitsoordeel dragen. Exits zonder token horen in een aparte exitdataset; ze zijn niet als nul meegenomen.

## §6 Bronnen

- [CryptoRank fondsportfolio's](https://cryptorank.io/funds), geraadpleegd 2026-08-15. Openbare weergave: maximaal tien regels per fonds.
- [CoinGecko keyless API](https://docs.coingecko.com/docs/keyless-public-api), geraadpleegd 2026-08-15. 365 dagen prijshistorie en een actuele markt-snapshot.
- [Crypto Fundraising: Lighter](https://crypto-fundraising.info/projects/lighter/), geraadpleegd 2026-08-15.
- [Nockchain roadmap](https://www.nockchain.org/roadmap), geraadpleegd 2026-08-15.
- [Tokenomist: Lighter unlocks](https://www.tokenomist.ai/research/lighter-lit-tokenomics-robinhood-hype-a-real-burn-and-the-december-2026-cliff-2), geraadpleegd 2026-08-15.

Geen beleggingsadvies.
