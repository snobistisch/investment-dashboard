# Crypto — brede kaart van 107 tokens + 22 pre-token projecten

**Datum:** 12 augustus 2026 · **Data:** CoinGecko + DefiLlama, dezelfde dag opgehaald
**Status:** onderzoek. Niets hiervan is aan het dashboard toegevoegd. Geen aanbeveling, geen beleggingsadvies.

Dit is stap 1 van twee: de kaart. Filteren doen we samen in stap 2.

---

## 0. Wat er veranderd is aan de criteria

De vorige screen zette float als *poort*. Dat was een overcorrectie: het sloot
precies de categorie uit die je zoekt — nieuwe architectuur met echte activiteit —
en filterde Meteora weg, terwijl mijn eigen notitie er al bij zei dat het de eerste
naam was die ik zou bekijken als die poort losser stond.

**Jouw regel, zoals ik hem heb overgenomen:** lage float is een risico, geen
diskwalificatie, en het risico wordt gedempt door een goede market maker en genoeg
retail-volume. Daarom staat in elke tabel **Vol/mcap** naast **Float**. Dat is de
kolom die zegt of een lage float daadwerkelijk een probleem is:

- Lage float **plus** hoog Vol/mcap → er is een koper, de unlock wordt geabsorbeerd.
- Lage float **plus** laag Vol/mcap → de unlock valt in een leeg boek. Dat is het echte gevaar.

De volgorde van bewijs is nu: **architectuur → activiteit → tokenomics.** De kolom
"Wat het architectonisch doet" staat daarom vooraan en niet als voetnoot.

**Twee metrieken die je in stap 2 het meest gaat gebruiken.** *Fees 1j* is bruto
economische activiteit; *Naar houders* is wat de tokenhouder daadwerkelijk kreeg
(DefiLlama `dailyHoldersRevenue`). Het verschil is groot en beslissend: Compound
draait $33M aan fees en keert **nul** uit. Een streepje in die kolom betekent
niet-getrackt, niet nul.

**Defaults die ik zelf heb ingevuld** op de vragen die je openliet: geen
liquiditeitsvloer (anders valt de vroege categorie weg), geen horizonfilter, geen
uitsluiting per chain, en ik heb sterke namen buiten je drie richtingen wél
meegenomen — die staan apart in §4.

---

## 1. Base — 40 tokens

Coinbase Ventures heeft direct geïnvesteerd in of operationeel gesteund: Morpho,
Farcaster, Zora, Aerodrome, Limitless. De Base App (voorheen Coinbase Wallet)
integreerde Zora en Farcaster in juli 2025 — dat is distributie die je niet kunt
kopen. Aerodrome draait ruim $560M dagvolume; Clanker heeft sinds november 2024
meer dan 500.000 tokens gelanceerd en ~$49,8M aan fees opgehaald; Seamless bedient
250.000+ gebruikers.

| Ticker | Project | Wat het architectonisch doet | Mcap | FDV/cap | Float | Vol/24h | Vol/mcap | Fees 1j | Naar houders | TVL (Base) | 1j |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **AERO** | Aerodrome | ve(3,3) DEX, Slipstream concentrated liquidity; de liquiditeitsmotor van Base | $404M | 2.01× | 50% | $10M | 3% | $155M | $116M | $252M | -69% |
| **MORPHO** | Morpho | Isolated lending markets + curator-vaults; grootste TVL op Base | $1.3B | 1.52× | 66% | $12M | 1% | $222M | $0 | $3.3B | -13% |
| **VIRTUAL** | Virtuals | Launchpad en co-ownership voor AI-agents | $386M | 1.52× | 66% | $83M | 21% | $20M | $0 | $0 | -57% |
| **WELL** | Moonwell | Lending met vaults, gebouwd voor Base-retail via de Coinbase-app | $13M | 1.1× | 91% | $467K | 4% | $9M | $0 | $59M | -91% |
| **SEAM** | Seamless | Van Aave-fork naar Morpho-gemigreerd; 250k+ gebruikers | $643K | 2.46× | 41% | $163 | 0% | $2M | $0 | $2M | -96% |
| **LMTS** | Limitless | Prediction market; twee rondes geleid door Coinbase Ventures | $8M | 7.6× | 13% | $1M | 16% | $14M | $0 | $511K | n/a |
| **ZORA** | Zora | Creator-tokens: elke post is een verhandelbare markt | $22M | 2.24× | 45% | $10M | 45% | $6M | $1M | $4M | -96% |
| **CLANKER** | Clanker → tokenbot | AI-agent die tokens deployt via tekstprompt; >500k tokens gelanceerd, ~$49,8M fees sinds nov 2024 | $12M | 1.00× | 100% | $689K | 6% | n/t | n/t | — | n/a |
| **BNKR** | Bankr | Trading-interface als agent; hoge fees, geen TVL | $26M | 1× | 100% | $7M | 28% | $32M | $0 | $0 | -70% |
| **EXTRA** | Extra Finance | Leveraged farming + lending op Base | $2M | 1.88× | 45% | $10K | 1% | $1M | $20K | $23M | -84% |
| **DRV** | Derive | On-chain options AMM | $95M | 1.5× | 67% | $696K | 1% | $5M | $0 | $24M | 19% |
| **AVNT** | Avantis | Perps met leverage op RWA en forex, niet alleen crypto | $39M | 2.95× | 34% | $38M | 97% | $18M | — | $20M | n/a |
| **SPK** | Spark | Liquidity layer die Sky-kapitaal alloceert | $43M | 3.27× | 31% | $7M | 15% | $197M | $2M | $56M | -85% |
| **PENDLE** | Pendle | Yield-tokenisatie: splitst principal en rendement | $233M | 1.64× | 61% | $15M | 6% | $23M | $18M | $3M | -76% |
| **EUL** | Euler | Modulair lending; EulerSwap-hook rehypothekeert liquiditeit | $28M | 1.13× | 88% | $8M | 28% | $60M | $2M | $18M | -90% |
| **FLUID** | Fluid | Lending en DEX delen dezelfde liquiditeit | $95M | 1.19× | 84% | $1M | 1% | $70M | $5M | $23M | -85% |
| **COMP** | Compound | Klassiek lending, nog steeds groot op Base | $162M | 1× | 100% | $8M | 5% | $33M | $0 | $20M | -70% |
| **BAL** | Balancer | Weighted pools; v3 als hook-host | $7M | 1.04× | 73% | $385K | 5% | $11M | $3M | $1M | -93% |
| **BIFI** | Beefy | Multichain yield-autocompounder | $3M | 1× | 100% | $2K | 0% | $2M | $541K | $17M | -81% |
| **DHT** | dHEDGE/Toros | Beheerde on-chain fondsen en hefboomvaults | $1M | 1.84× | 54% | $588 | 0% | $1M | $0 | $14M | -86% |
| **RSR** | Reserve | Index-protocol voor tokenmandjes | $74M | 1.6× | 63% | $6M | 8% | $6M | $918K | $2M | -88% |
| **OGN** | Origin | Yield-bearing ETH en OGN-vaults | $11M | 2.04× | 49% | $858K | 8% | $6M | $6M | $3M | -75% |
| **FARM** | Harvest | Yield-aggregator, lange staat van dienst | $3M | 1.05× | 97% | $104K | 3% | — | — | $11M | -84% |
| **SPECTRA** | Spectra | Rente-derivaten en yield-splitsing | $1M | 1.54× | 54% | $3K | 0% | $262K | $222K | $8M | -89% |
| **PEAS** | Peapods | Volatility farming via pod-tokens | $18M | 1× | 100% | $44K | 0% | $2M | $896K | $752K | -65% |
| **F** | SynFutures | Permissionless perp-listing | $13M | 2.14× | 47% | $1M | 10% | $6M | $0 | $3M | -66% |
| **GNS** | Gains | gTrade synthetische perps | $13M | 1× | 100% | $329K | 3% | $9M | $4M | $966K | -75% |
| **SYMM** | SYMM | Intent-based perps met bilaterale OTC-structuur | $6M | 1.05× | 93% | $5K | 0% | $231K | — | $1M | -71% |
| **ION** | Ionic | Lending op Base/Mode met LST-collateral | $7K | 3.32× | 30% | $12 | 0% | — | — | $734K | -95% |
| **B** | Baseline | Protocol-owned liquidity met prijsvloer | $30M | 1.67× | 60% | $5K | 0% | — | — | $390K | n/a |
| **FUN** | Sport.fun | Sport-prediction op Base | $4M | 5.62× | 18% | $326K | 9% | $6M | — | $3M | n/a |
| **OVER** | Overtime | Sportmarkten, AMM-gebaseerd | $10M | 1.26× | 79% | $49K | 0% | $2M | $2M | $317K | -3% |
| **ALB** | AlienBase | Base-native DEX | $752K | 1.94× | 48% | $3K | 0% | $202K | — | $2M | -97% |
| **BSWAP** | BaseSwap | Base-native DEX van het eerste uur | $43K | 1× | 100% | $54 | 0% | $78K | — | $515K | -94% |
| **DEGEN** | Degen | Farcaster-tipping token, cultuurlaag van Base | $39M | 1× | 100% | $3M | 9% | — | — | — | -74% |
| **TOSHI** | Toshi | Base-memecoin met de langste levensduur | $42M | 1× | 100% | $2M | 5% | — | — | — | -87% |
| **BRETT** | Brett | Base-memecoin, referentie voor retail-flow | $125K | 1× | 100% | $52 | 0% | — | — | — | -78% |
| **AIXBT** | aixbt | AI-agent met marktcommentaar; Virtuals-ecosysteem | $18M | 1× | 100% | $11M | 63% | — | — | — | -87% |
| **RE** | Re | Herverzekering on-chain als RWA | $73M | 6.27× | 16% | $24M | 32% | $9M | — | $4M | n/a |
| **ANZ** | Anzen | Private credit als RWA op Base | $85K | 3.29× | 30% | $96 | 0% | — | — | $7M | -98% |
---

## 2. Uniswap v4 hooks en programmeerbare AMM's — 15 tokens

Uniswap v4 staat op circa **$615M TVL**, gedaald onder meer doordat **Bunni** — ooit
de grootste LP-hook — is opgeheven. Dat is meteen de waarschuwing bij deze
categorie: hooks zijn jong en sterven ook.

Waar de waarde landt is de open vraag. Bij de hook (EulerSwap laat één euro
tegelijk uitlenen, swaps ondersteunen én als onderpand dienen), bij de router, of
bij Uniswap zelf. TVL onderschat activiteit hier structureel, omdat hooks
liquiditeit elders herbenutten.

| Ticker | Project | Wat het architectonisch doet | Mcap | FDV/cap | Float | Vol/24h | Vol/mcap | Fees 1j | Naar houders | TVL | 1j |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **UNI** | Uniswap | v4 hooks maken van de AMM een programmeerbaar platform; singleton + flash accounting | $2.2B | 1.43× | 62% | $158M | 7% | $838M | $31M | $3.0B | -71% |
| **EUL** | Euler / EulerSwap | Hook die swap-liquiditeit tegelijk uitleent — één euro doet drie dingen | $28M | 1.13× | 88% | $8M | 28% | $60M | $2M | $360M | -90% |
| **BAL** | Balancer | v3 als hook-host; custom pool logic zonder eigen contract | $7M | 1.04× | 73% | $385K | 5% | $11M | $3M | $59M | -93% |
| **MAV** | Maverick | Directional AMM: liquiditeit verschuift automatisch met de prijs | $11M | 1.71× | 59% | $2M | 16% | $397K | — | $2M | -86% |
| **EKUBO** | Ekubo | Singleton-AMM met extensies, ontworpen door een ex-Uniswap-engineer | $4M | 1× | 100% | $15K | 0% | $3M | $296K | $24M | -94% |
| **VELO** | Velodrome | ve(3,3) op Optimism; zusterprotocol van Aerodrome | $22M | 2.01× | 50% | $1M | 6% | $7M | $7M | $35M | -73% |
| **RAM** | Ramses | ve(3,3) met concentrated liquidity op Arbitrum | $12K | 12.91× | 8% | $34 | 0% | — | — | — | -99% |
| **SHADOW** | Shadow | ve(3,3) op Sonic, x(3,3)-variant | $448K | 4.11× | 10% | $5K | 1% | $6M | $5M | $3M | -96% |
| **MET** | Meteora | DLMM: dynamische bins met variabele fee — de referentie die je noemde | $89M | 1.83× | 54% | $5M | 5% | $524M | $14M | $270M | n/a |
| **ORCA** | Orca | Whirlpools, Solana-standaard voor concentrated liquidity | $63M | 1.23× | 61% | $6M | 10% | $74M | $2M | $240M | -61% |
| **RAY** | Raydium | CLMM + launchpad-integratie op Solana | $171M | 2.06× | 49% | $6M | 4% | $145M | $18M | $847M | -83% |
| **CRV** | Curve | StableSwap-invariant; nog steeds de wiskunde die iedereen kopieert | $391M | 1.56× | 51% | $57M | 15% | $63M | $34M | $1.4B | -76% |
| **SUSHI** | Sushi | Multichain DEX, v3 en Blade-orderflow | $46M | 1.02× | 98% | $6M | 13% | $17M | $822K | $81M | -83% |
| **DODO** | DODO | Proactive market maker, oracle-gestuurde curve | $23M | 1× | 100% | $15M | 66% | $26M | $139K | $12M | -54% |
---

## 3. MEV, order flow en oracle-extractie — 12 tokens

De laag waar winst van de handelaar naar de gebruiker verschuift. Drie modellen:
**batch auctions** met één clearingprijs per blok (CoW, Angstrom), **intent/RFQ**
waarbij solvers concurreren om jouw order (1inch Fusion, Hashflow, Native), en
**terugvloeiing** waarbij de geëxtraheerde waarde naar het protocol of de LP's gaat
(Jito-tips naar stakers, Chainlink SVR, Pyth Express Relay).

| Ticker | Project | Wat het architectonisch doet | Mcap | FDV/cap | Float | Vol/24h | Vol/mcap | Fees 1j | Naar houders | TVL | 1j |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **COW** | CoW Protocol | Batch auctions met uniform clearing price; solvers concurreren, MEV gaat naar de gebruiker | $59M | 1.74× | 58% | $1M | 2% | $41M | $0 | $0 | -76% |
| **1INCH** | 1inch | Fusion: intent-orders via resolvers in plaats van directe swaps | $117M | 1.07× | 94% | $8M | 7% | $33K | $0 | $3M | -70% |
| **ODOS** | Odos | Multi-path routing-solver | $1M | 6.25× | 16% | $213K | 18% | $2M | $0 | $0 | -84% |
| **HFT** | Hashflow | RFQ met market makers off-chain, settlement on-chain — geen sandwiches | $7M | 1.09× | 92% | $4M | 55% | — | — | $239K | -92% |
| **NATIVE** | Native | Liquiditeit-as-a-service met RFQ-pricing | $48K | 1.01× | 99% | $1 | 0% | — | — | — | -99% |
| **PSP** | ParaSwap | Aggregatie met Delta intent-laag | $920K | 1× | 49% | $11 | 0% | — | — | — | -96% |
| **JTO** | Jito | Solana MEV: block-engine plus liquid staking, tips terug naar stakers | $281M | 1.96× | 51% | $27M | 10% | $205M | $0 | $774M | -72% |
| **SSV** | SSV | Distributed validators — infrastructuur onder blockbuilding | $30M | 1× | 100% | $3M | 10% | $2M | $1M | $9.5B | -81% |
| **EIGEN** | EigenCloud | AVS-laag waar veel MEV- en sequencing-diensten op draaien | $126M | 2.47× | 40% | $14M | 11% | $42M | $0 | $5.0B | -89% |
| **LINK** | Chainlink | SVR: oracle-extraheerbare waarde terug naar protocollen | $6.6B | 1.34× | 75% | $187M | 3% | $63M | $58M | $1.8B | -63% |
| **PYTH** | Pyth | Pull-oracle met Express Relay voor liquidatie-auctions | $321M | 1.27× | 79% | $14M | 4% | $3M | $335K | $0 | -70% |
| **RED** | RedStone | Modulaire oracle, concurrent op dezelfde laag | $41M | 2.09× | 48% | $2M | 5% | — | — | $0 | -80% |
---

## 4. Architectuur en activiteit buiten je drie richtingen — 44 tokens

Meegenomen omdat je zei dat je sterke namen buiten scope niet wil missen. Dit is
de referentieklasse van Meteora: technisch onderscheidend én aantoonbaar gebruikt.

| Ticker | Project | Wat het architectonisch doet | Mcap | FDV/cap | Float | Vol/24h | Vol/mcap | Fees 1j | Naar houders | TVL | 1j |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **HYPE** | Hyperliquid | Eigen L1 met on-chain orderbook en HyperCore/HyperEVM-splitsing | $12.9B | 4.49× | 22% | $286M | 2% | $999M | $751M | $6.2B | 25% |
| **LIT** | Lighter | ZK-geverifieerde matching engine en liquidaties | $593M | 4× | 25% | $32M | 5% | $72M | $24M | $537M | n/a |
| **ASTER** | Aster | Perp-DEX met hidden orders en multi-chain collateral | $1.6B | 2.9× | 34% | $40M | 2% | $439M | $19M | $762M | n/a |
| **EDGE** | edgeX | Orderbook-perps, hoge fee-productie voor zijn omvang | $117M | 2.86× | 35% | $3M | 2% | $317M | $46M | $50M | n/a |
| **DIME** | Paradex | Perps op eigen Starknet-appchain met cross-margin | $7M | 1.5× | 67% | $1K | 0% | $10M | $272K | $17M | n/a |
| **DRIFT** | Drift | Solana perps met just-in-time liquiditeit | $8M | 1.4× | 72% | $2M | 24% | $31M | $0 | $214M | -98% |
| **JUP** | Jupiter | Solana-routing plus perps en lend | $565M | 2.07× | 33% | $18M | 3% | $354M | $52M | $2.1B | -69% |
| **KMNO** | Kamino | Geautomatiseerde liquiditeit en lending op Solana | $97M | 1.89× | 53% | $2M | 2% | $77M | $0 | $1.1B | -71% |
| **CLOUD** | Sanctum | Infinity-pool maakt elke LST onderling inwisselbaar | $13M | 1.67× | 60% | $249K | 2% | $106M | $0 | $1.3B | -74% |
| **MNDE** | Marinade | Native staking met validator-selectie | $10M | 1.28× | 55% | $5K | 0% | $75M | $1M | $537M | -85% |
| **ETHFI** | ether.fi | Restaking plus cash-card; grootste TVL in de screen | $392M | 1.03× | 97% | $27M | 7% | $220M | $13M | $3.9B | -68% |
| **REZ** | Renzo | Liquid restaking met ezETH | $24M | 1.13× | 87% | $3M | 14% | $18M | $2M | $90M | -82% |
| **PUFFER** | Puffer | Anti-slashing restaking met eigen L2 | $6M | 1.97× | 51% | $690K | 11% | $3M | $0 | $47M | -95% |
| **SWELL** | Swell | Restaking plus eigen rollup | $3M | 1.93× | 52% | $1M | 40% | $4M | $28K | $109M | -94% |
| **ENA** | Ethena | Delta-neutrale synthetische dollar | $849M | 1.53× | 66% | $76M | 9% | $330M | — | $4.3B | -89% |
| **RESOLV** | Resolv | Delta-neutrale dollar met gesplitst risico in twee tokens | $8M | 2.15× | 46% | $3M | 33% | $17M | $0 | $13M | -91% |
| **USUAL** | Usual | RWA-gedekte dollar met herverdeeld eigendom | $16M | 1× | 63% | $1M | 8% | $18M | $880K | $95M | -89% |
| **SYRUP** | Maple | Institutioneel on-chain krediet | $179M | 1.07× | 94% | $4M | 2% | $109M | $3M | $2.4B | -67% |
| **SKY** | Sky | Gedecentraliseerde stablecoin op schaal | $1.2B | 1× | 100% | $4M | 0% | $407M | $74M | $5.8B | -36% |
| **ONDO** | Ondo | Getokeniseerde treasuries | $1.6B | 2.05× | 49% | $62M | 4% | $58M | $7M | $3.5B | -68% |
| **CFG** | Centrifuge | RWA-financiering, hoogste fee/mcap van de vorige screen | $58M | 1.79× | 56% | $4M | 6% | $59M | $0 | $1.6B | -52% |
| **CPOOL** | Clearpool | Ongedekt institutioneel krediet | $17M | 1× | 100% | $505K | 3% | $1M | $0 | $21M | -92% |
| **GFI** | Goldfinch | Private credit in opkomende markten | $3M | 1.22× | 82% | $75K | 3% | $2M | — | $2M | -95% |
| **CAKE** | PancakeSwap | Buyback-and-burn, 34 maanden op rij | $464M | 1.04× | 80% | $13M | 3% | $270M | $59M | $2.1B | -51% |
| **CVX** | Convex | Meta-laag op Curve; vrijwel alle fees naar houders | $159M | 1.07× | 93% | $8M | 5% | $20M | $19M | $492M | -64% |
| **GMX** | GMX | Perps met gedeelde liquiditeitspool | $69M | 1× | 79% | $2M | 3% | $32M | $9M | $184M | -62% |
| **YB** | Yield Basis | Leveraged farming met impermanent-loss-neutralisatie | $20M | 2.92× | 26% | $7M | 37% | $28M | $4M | $131M | n/a |
| **DOLO** | Dolomite | Lending waarbij collateral zijn rechten behoudt | $11M | 1.96× | 51% | $4M | 36% | $11M | — | $226M | -90% |
| **SOLV** | Solv | Bitcoin-yield en staking-abstractie | $12M | 1.81× | 55% | $4M | 29% | $35M | $0 | $696M | -95% |
| **RUNE** | THORChain | Native cross-chain swaps zonder wrapped assets | $143M | 1.05× | 96% | $30M | 21% | $22M | $689K | $54M | -72% |
| **ACX** | Across | Intent-based bridging met relayers | $29M | 1.42× | 70% | $2M | 7% | $172K | $0 | $17M | -79% |
| **ZRO** | LayerZero | Omnichain messaging | $290M | 2.83× | 35% | $17M | 6% | $2M | $3M | $6.7B | -64% |
| **W** | Wormhole | Cross-chain messaging en NTT | $51M | 1.58× | 63% | $4M | 8% | $548K | — | $1.4B | -91% |
| **AXL** | Axelar | Interchain-routing met eigen validatorset | $45M | 1.03× | 98% | $2M | 5% | $75K | $0 | $138M | -90% |
| **OSMO** | Osmosis | Cosmos-DEX met superfluid staking | $24M | 1.24× | 78% | $2M | 8% | $5M | — | $12M | -84% |
| **SD** | Stader | Multichain liquid staking | $7M | 1.67× | 48% | $229K | 3% | $10M | $242K | $199M | -87% |
| **RPL** | Rocket Pool | Permissionless node-operators | $32M | 1× | 100% | $2M | 5% | $40M | — | $995M | -84% |
| **LDO** | Lido | Grootste liquid staking; fees gaan naar stakers | $249M | 1.2× | 84% | $17M | 7% | $695M | $4M | $17.9B | -80% |
| **FRAX** | Frax | Stablecoin plus eigen L2 en staking | $28M | 1.06× | 94% | $703K | 3% | $11M | $0 | $283M | -91% |
| **YFI** | Yearn | Vault-standaard v3 | $70M | 1.02× | 98% | $5M | 7% | $11M | $201K | $222M | -67% |
| **GNS** | Gains | Synthetische perps op forex en aandelen | $13M | 1× | 100% | $329K | 3% | $9M | $4M | $10M | -75% |
| **POOL** | PoolTogether | No-loss prijzenpot als spaarproduct | $325K | 1.04× | 96% | $6 | 0% | $312K | $30K | $11M | -89% |
| **SUP** | Superfluid | Streaming payments per seconde | $2M | 2.91× | 34% | $30K | 1% | — | — | $6M | n/a |
| **SDT** | Stake DAO | Meta-governance over meerdere protocollen | $6M | 1.03× | 68% | $5K | 0% | $1M | $599K | $120M | -84% |
---

## 5. Pre-token — 22 projecten zonder verhandelbaar token

Apart gemarkeerd, zoals afgesproken. Dit is waar je drie richtingen elkaar het
sterkst raken, en waar de tabellen hierboven per definitie blind zijn.

### MEV — de twee die je noemde

| Project | Wat het is | Waarom het telt | Trigger om te gaan kijken |
| --- | --- | --- | --- |
| **Flashbots** | Onderzoeksorganisatie plus infrastructuur: MEV-Boost, BuilderNet, SUAVE | Heeft de hele markstructuur van blockbuilding op Ethereum gedefinieerd. Geen verhandelbaar token gevonden | Een TGE, of BuilderNet-marktaandeel dat naar een token-gedekt model kantelt |
| **Sorella Labs / Angstrom** | Uniswap v4-hook die orders per blok batcht tegen één clearingprijs, sandwiches neutraliseert en arbitragewaarde teruggeeft aan LP's | De zuiverste implementatie van "MEV terug naar de LP" die als hook draait, niet als aparte chain | Volume in de Angstrom-pools versus dezelfde paren op standaard v4 |

*Beide zijn hier volwaardig genoemd omdat het antwoord op "wie vangt de waarde als
MEV wordt teruggegeven" niet te geven is zonder ze. Als er geen token komt, is het
antwoord: de LP's en de gebruikers — en dan is de investeerbare uitdrukking Uniswap
zelf of de DEX die de hook aanzet.*

### Base — infrastructuur en curatoren zonder token

Alle onderstaande draaien op Base met echte TVL of fees, en hebben geen token.
Samen goed voor miljarden aan gecureerd kapitaal: **Steakhouse Financial**
($1,81 mrd Base-TVL), **Gauntlet** ($536M), **Grove Finance** ($293M), **Aera**
($71M), **Clearstar** ($69M), **Spiko** ($38M, RWA), **Veda** ($32M fees),
**Block Analitica**, **Anthias Labs**, **RockawayX**, **Arrakis Modular**,
**vfat.io**, **Royco**, **TermMax**, **Native Credit Pool**, **40 Acres**.

De curator-laag is opvallend: Morpho's model heeft een beroep gecreëerd — risk
curators die vaults samenstellen — en de grootste spelers daarin hebben geen token.
Als je gelooft dat lending naar isolated markets plus curatie gaat, is dat de vraag
waar je een antwoord op wil.

### Overige pre-token, relevant voor je richtingen

**Flaunch** (Base launchpad met v4-hook, ~$2M fees), **Farcaster** (sociale laag,
in de Base App), **Noice**, **Symbiotic** (restaking), **Obol** (distributed
validators), **Ostium** (RWA-perps), **Hibachi**, **Variational**, **Extended**
(perp-DEX'en), **Bunni** (opgeheven — als waarschuwing, niet als kandidaat).

---

## 6. Wat deze kaart nog niet is

1. **Geen ranking.** Er zit geen EV-model onder en dat is bewust: dat is stap 2,
   nadat jij hebt aangegeven welke richtingen je wil doorzetten.
2. **Fees zijn achteruitkijkend** in een categorie die 66% is gedaald. Een protocol
   dat $60M verdiende in een bull-jaar verdient misschien $6M in een bear-jaar.
3. **Houders-omzet is onvolledig gedekt** — DefiLlama trackt het voor 996 van de
   2.559 protocollen met een fee-regel.
4. **Geen governance-, concentratie- of securityhistorie.** Euler's −90% heeft een
   specifieke oorzaak (exploit 2023 en herstel); die context ontbreekt hier per naam.
5. **Cross-listing.** Een paar namen staan in twee secties omdat ze twee rollen
   vervullen (Euler als Base-lending én als hook; Meteora als AMM-architectuur).
   110 rijen, **107 unieke tickers**.
6. **Eén tickerbotsing gevonden en gecorrigeerd.** Clanker is hernoemd naar
   *tokenbot*; de CoinGecko-id `clanker` is een lege huls van $3K met $17 dagvolume,
   de echte is `tokenbot-2` op $12M met 100% float. Elke andere identifier in dit
   document is per protocol geresolved via DefiLlama, niet op symbool.
7. **Memecoins zijn meegenomen voor Base** (DEGEN, TOSHI, BRETT) omdat ze daar de
   retail-flow en dus de liquiditeit dragen die jouw float-argument nodig heeft —
   niet omdat ik ze als investering voorstel.

## 8. Voorstel voor stap 2

Zeg welke van deze je wil doorzetten, dan bouw ik daar de diepe analyse op:

- **Snelste filter:** noem per sectie de 5 die je aanspreken, dan werk ik die 20 uit.
- **Of laat mij voorfilteren** op de combinatie die uit jouw regel volgt —
  architectonisch onderscheidend, fees boven een drempel, en Vol/mcap hoog genoeg
  om een lage float te dragen — en lever ik een top 15 met onderbouwing.
- **Of per richting:** eerst alleen hooks + MEV uitdiepen, Base apart in een tweede
  ronde. Die twee gaan over verschillende dingen en verdienen misschien niet
  hetzelfde document.

---

*Geen beleggingsadvies. Fee-, houders-omzet- en TVL-cijfers zijn DefiLlama's
trailing-jaar reeksen per 12 augustus 2026 en zijn niet geauditeerd. Marktdata is
CoinGecko dezelfde dag. Identifiers zijn per protocol geresolved via DefiLlama's
registry, niet op tickersymbool. Pre-token projecten zijn niet verhandelbaar en
staan hier als categorie-analyse.*
