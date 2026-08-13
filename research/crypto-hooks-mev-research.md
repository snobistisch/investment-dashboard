# Hooks & MEV — diepteonderzoek

**Datum:** 12 augustus 2026 · **Data:** CoinGecko + DefiLlama, dezelfde dag
**Scope:** alleen programmeerbare AMM's/hooks en MEV/orderflow. **Base volgt apart** —
je had gelijk dat het over iets anders gaat en een eigen document verdient.
**Status:** onderzoek, geen aanbeveling, geen beleggingsadvies.

Vorige ronde had ik 27 namen in deze twee categorieën. Dit zijn er **51**, plus
negen pre-token projecten. De namen die ik miste waren niet de kleine — het waren
Shutter, API3, UMA, Enso, Espresso, Anoma, Everclear, Brevis en Axiom, en die
dekken samen de helft van wat MEV als categorie inhoudt.

---

## 1. De vraag die beide categorieën stelt

Hooks en MEV zijn twee antwoorden op hetzelfde probleem: **de AMM van 2020 laat
waarde op tafel liggen, en iemand raapt hem op.** De LP verliest aan arbitrage,
de gebruiker verliest aan sandwiches, en de winst gaat naar searchers en builders.

- **Hooks** lossen het op *binnen* de pool: pas de curve, de fee of de
  liquiditeitsverdeling aan zodat er minder te extraheren valt.
- **MEV-infrastructuur** lost het op *rond* de pool: batch de orders, versleutel de
  mempool, of veil het extractierecht en geef de opbrengst terug.

Voor beide is de investeringsvraag identiek en ongemakkelijk: **wie vangt de
waarde die wordt teruggegeven?** Als het antwoord "de gebruiker" is — en dat is bij
goed ontworpen systemen precies de bedoeling — dan is er geen token die ervan
profiteert. Dat is geen cynisme; het is de reden dat de MEV-tabel hieronder zo veel
lege fee-kolommen heeft.

---

## 2. Programmeerbare AMM's en hooks — 22 tokens

**De context.** Uniswap v4 stond eind Q1 2026 op meer dan **$4 mrd TVL** en
verwerkte circa **20% van alle DEX-volume op Ethereum mainnet**; cumulatief circa
**$355 mrd** aan volume tegen juni 2026, waarvan ~$190 mrd op mainnet en ~$70 mrd
op Unichain. Bij lancering waren er ruim **150 hooks** gebouwd, en in april 2026
opende de Uniswap Foundation een hooks-marktplaats met **$500M aan
liquiditeitsincentives**.

*Cijferwaarschuwing:* voor v4-TVL circuleren onderling strijdige getallen —
$4 mrd (eind Q1), $3,4 mrd (mei, DefiLlama) en ~$615M in een recentere bron. Ik
heb de discrepantie niet kunnen oplossen en presenteer hem daarom als
discrepantie. Hooks herbenutten liquiditeit elders, waardoor TVL de activiteit
hier structureel onderschat.

| Ticker | Project | Architectuur | Mcap | FDV/cap | Float | Vol/24h | Vol/mcap | Fees 1j | Naar houders | TVL | 1j |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **UNI** | Uniswap | Singleton + flash accounting; hooks maken van de AMM een platform. ~150 hooks bij lancering, $500M incentive-marktplaats sinds apr 2026 | $2.2B | 1.43× | 62% | $158M | 7% | $838M | $31M | $3.0B | -71% |
| **EUL** | Euler / EulerSwap | Hook die swap-liquiditeit tegelijk uitleent en als onderpand laat dienen — één euro doet drie dingen | $28M | 1.13× | 88% | $8M | 28% | $60M | $2M | $360M | -90% |
| **BAL** | Balancer | v3 als hook-host: custom pool-logica zonder eigen contract | $7M | 1.04× | 73% | $377K | 5% | $11M | $3M | $59M | -93% |
| **MET** | Meteora | DLMM met dynamische bins en variabele fee; jouw referentie | $89M | 1.83× | 54% | $5M | 5% | $524M | $14M | $270M | n/a |
| **MAV** | Maverick | Directional AMM — liquiditeit verschuift automatisch mee met de prijs | $11M | 1.71× | 59% | $2M | 18% | $397K | — | $2M | -86% |
| **EKUBO** | Ekubo | Singleton met extensies; hetzelfde idee als v4, eerder gebouwd | $4M | 1× | 100% | $13K | 0% | $3M | $296K | $24M | -94% |
| **ORCA** | Orca | Whirlpools; de facto standaard voor CL op Solana | $63M | 1.23× | 61% | $6M | 10% | $74M | $2M | $240M | -61% |
| **RAY** | Raydium | CLMM plus launchpad-integratie | $171M | 2.06× | 49% | $6M | 4% | $145M | $18M | $847M | -83% |
| **CRV** | Curve | StableSwap-invariant; de wiskunde die iedereen kopieert | $393M | 1.56× | 51% | $57M | 15% | $63M | $34M | $1.4B | -76% |
| **VELO** | Velodrome | ve(3,3) met CL op Optimism | $22M | 2.01× | 50% | $1M | 7% | $7M | $7M | $35M | -73% |
| **AERO** | Aerodrome | ve(3,3) op Base — Slipstream is de CL-variant | $405M | 2.01× | 50% | $10M | 3% | $155M | $116M | $252M | -69% |
| **RAM** | Ramses | ve(3,3) plus CL op Arbitrum | $12K | 12.91× | 8% | $34 | 0% | — | — | — | -99% |
| **SHADOW** | Shadow | x(3,3) op Sonic | $448K | 4.11× | 10% | $5K | 1% | $6M | $5M | $3M | -96% |
| **QUICK** | QuickSwap | v4-hooks live op meerdere chains | $5M | 1.35× | 66% | $508K | 10% | $33M | $4M | $214M | -68% |
| **CAKE** | PancakeSwap | Infinity: eigen hook-architectuur naast v3 | $464M | 1.04× | 80% | $14M | 3% | $270M | $59M | $2.1B | -51% |
| **SUSHI** | Sushi | v3 plus Blade voor orderflow | $46M | 1.02× | 98% | $6M | 13% | $17M | $822K | $81M | -83% |
| **DODO** | DODO | Proactive market maker, oracle-gestuurde curve | $23M | 1× | 100% | $15M | 66% | $26M | $139K | $12M | -54% |
| **FLUID** | Fluid | Lending en DEX delen één liquiditeitspool — smart collateral | $95M | 1.19× | 84% | $1M | 1% | $70M | $5M | $1.1B | -85% |
| **PENDLE** | Pendle | Yield-splitsing; v4-hooks als distributiekanaal | $233M | 1.64× | 61% | $15M | 6% | $23M | $18M | $1.2B | -76% |
| **GAMMA** | Gamma | Actief LP-beheer bovenop CL-AMMs | $16K | 1.41× | 71% | $1 | 0% | $2M | — | $3M | -98% |
| **ICHI** | ICHI | Eenzijdige LP-vaults | $825K | 1.07× | 94% | $6 | 0% | — | — | — | -81% |
| **SOMM** | Sommelier | Off-chain berekende, on-chain uitgevoerde vaultstrategieën | $140K | 1.33× | 75% | $2 | 0% | $67K | $0 | $907K | -67% |
### Wat deze tabel laat zien

**De capture-ratio is het hele verhaal.** Fees zeggen hoe groot de economie is;
*naar houders* zegt of jij er iets van krijgt. Die twee lopen hier extreem uiteen:

| | Fees 1j | Naar houders | Capture | Mcap |
| --- | ---: | ---: | ---: | ---: |
| **Aerodrome** | $155M | **$116M** | **75%** | $405M |
| **Curve** | $63M | $34M | 54% | $393M |
| **PancakeSwap** | $270M | $59M | 22% | $464M |
| **Raydium** | $145M | $18M | 12% | $171M |
| **Meteora** | **$524M** | $14M | **2,7%** | $89M |
| **Uniswap** | $838M | $31M | 3,7% | $2,2B |

**Over Meteora, jouw pick.** De activiteit is echt en de architectuur is
onderscheidend — DLMM met dynamische bins en variabele fee is een genuine
verbetering op concentrated liquidity. Maar $524M aan fees levert **$14M** aan de
houder op. Dat is een capture-ratio van 2,7%, de laagste van de grote AMM's hier.
Dat is geen argument tegen MET; het is het argument dat de these bij MET *volume-
en aandachtsgedreven* is, niet cashflowgedreven. Als je hem koopt, koop je Solana-
DEX-marktaandeel en de kans dat de fee-switch ooit strakker wordt afgesteld — niet
een rendement van 16% op de marktwaarde.

**Aerodrome is de tegenpool** en verdient in ronde twee aandacht: 75% van de fees
gaat naar houders, $116M op een $405M kap. Dat het op Base draait maakt het een
brug tussen dit document en het volgende.

**Balancer is een anomalie die ik niet kan verklaren.** BAL staat op **$7,3M**
marktwaarde — 93% lager op een jaar — terwijl het $11M aan fees draait en $3M aan
houders uitkeert. Dat is een houdersrendement van 41% op de marktwaarde van een
protocol dat ooit tot de grootste van DeFi behoorde. Ofwel de markt prijst
terminale neergang, ofwel dit is een van de scherpste dislocaties in de dataset.
**Ik heb de oorzaak niet geverifieerd** en zet er daarom geen conclusie op; het is
wel het eerste dat ik zou uitzoeken.

**Wat effectief dood is.** RAM ($12K kap, 12,9× FDV), GAMMA ($16K), SOMM ($140K),
ICHI ($825K), Shadow ($448K) en Native ($48K) zijn te klein om te verhandelen en
staan er alleen om te laten zien hoe smal de overlevende laag is. Van de 22 namen
hebben er vijf een marktwaarde onder $1M: RAM, Gamma, Sommelier, Shadow en ICHI.

---

## 3. MEV, orderflow en oracle-extractie — 29 tokens

| Ticker | Project | Architectuur | Mcap | FDV/cap | Float | Vol/24h | Vol/mcap | Fees 1j | Naar houders | TVL | 1j |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **COW** | CoW Protocol | Batch auctions, één clearingprijs per blok; solvers concurreren om jouw order | $59M | 1.74× | 58% | $1M | 2% | $41M | $0 | $0 | -76% |
| **1INCH** | 1inch | Fusion: intents via resolvers in plaats van directe swaps | $117M | 1.07× | 94% | $8M | 7% | $33K | $0 | $3M | -70% |
| **HFT** | Hashflow | RFQ met off-chain pricing, on-chain settlement — geen sandwich mogelijk | $7M | 1.09× | 92% | $4M | 55% | — | — | $239K | -92% |
| **NATIVE** | Native | Liquidity-as-a-service met RFQ-pricing voor apps | $48K | 1.01× | 99% | $1 | 0% | — | — | — | -99% |
| **ODOS** | Odos | Multi-path routing-solver | $1M | 6.25× | 16% | $211K | 17% | $2M | $0 | $0 | -84% |
| **PSP** | ParaSwap | Delta: intent-laag bovenop aggregatie | $920K | 1× | 49% | $11 | 0% | — | — | — | -96% |
| **ENSO** | Enso | Solver-netwerk voor samengestelde DeFi-acties | $18M | 4.86× | 16% | $10M | 58% | — | — | $0 | n/a |
| **JTO** | Jito | Solana block-engine; MEV-tips vloeien terug naar stakers | $283M | 1.96× | 51% | $27M | 10% | $205M | $0 | $774M | -72% |
| **SHU** | Shutter | Threshold-encryptie van de mempool — MEV verdwijnt door orders te verbergen tot inclusie | $499K | 2.64× | 38% | $136 | 0% | — | — | — | -69% |
| **ESP** | Espresso | Gedecentraliseerde shared sequencer met snelle finaliteit | $50M | 5.42× | 18% | $11M | 22% | — | — | — | n/a |
| **XAN** | Anoma | Intent-centrische architectuur; counterparty discovery als protocol | $27M | 4× | 25% | $2M | 8% | — | — | — | n/a |
| **CLEAR** | Everclear | Clearing layer die cross-chain intents netto verrekent | $58K | 1.13× | 89% | $4 | 0% | $105K | — | $0 | -100% |
| **SKATE** | Skate | Universele app-laag over chains heen met gedeelde state | $128K | 7.35× | 14% | $276 | 0% | — | — | — | -98% |
| **API3** | API3 | OEV Network: veilt oracle-extraheerbare waarde en geeft die terug aan het protocol | $27M | 1.24× | 81% | $4M | 14% | $977K | $0 | $19M | -76% |
| **UMA** | UMA | Oval: vangt OEV bij liquidaties en geeft het aan lending-protocollen | $30M | 1.43× | 70% | $2M | 6% | — | — | — | -76% |
| **LINK** | Chainlink | SVR — smart value recapture op oracle-updates | $6.6B | 1.34× | 75% | $187M | 3% | $63M | $58M | $1.8B | -63% |
| **PYTH** | Pyth | Express Relay: veilt liquidatierechten | $322M | 1.27× | 79% | $14M | 4% | $3M | $335K | $0 | -70% |
| **RED** | RedStone | Modulaire pull-oracle, concurrent op dezelfde laag | $41M | 2.09× | 48% | $2M | 5% | — | — | $0 | -80% |
| **SSV** | SSV | Distributed validator tech — infrastructuur onder blockbuilding | $30M | 1× | 100% | $3M | 10% | $2M | $1M | $9.5B | -81% |
| **EIGEN** | EigenCloud | AVS-laag waar sequencing- en MEV-diensten op draaien | $126M | 2.47× | 40% | $13M | 11% | $42M | $0 | $5.0B | -89% |
| **FOLD** | Manifold | MEV-bewuste orderflow-infrastructuur | $51K | 1× | 100% | $77 | 0% | — | — | — | -99% |
| **42** | Semantic Layer | Intent-routing infrastructuur | $338K | 6.75× | 15% | $2K | 0% | — | — | — | n/a |
| **BREV** | Brevis | ZK-coprocessor; maakt off-chain berekening verifieerbaar voor o.a. fee-hooks | $17M | 4× | 25% | $3M | 17% | — | — | — | n/a |
| **AXIOM** | Axiom | ZK-coprocessor voor historische on-chain data | $55K | 1× | 100% | $6 | 0% | — | — | — | n/a |
| **LA** | Lagrange | ZK-coprocessor en proving-netwerk | $9M | 5.18× | 19% | $5M | 55% | — | — | — | -88% |
| **ACX** | Across | Intent-based bridging; relayers concurreren op prijs | $29M | 1.42× | 70% | $2M | 7% | $172K | $0 | $17M | -79% |
| **ZRO** | LayerZero | Omnichain messaging — de rails waar cross-chain intents op landen | $289M | 2.83× | 35% | $17M | 6% | $2M | $3M | $6.7B | -64% |
| **W** | Wormhole | Messaging plus NTT | $51M | 1.58× | 63% | $4M | 8% | $548K | — | $1.4B | -91% |
| **HYPER** | Hyperlane | Permissionless interchain messaging | $22M | 2.39× | 34% | $6M | 28% | $1M | $0 | $94M | -83% |
### Wat deze tabel laat zien

**Bijna niets in deze categorie monetiseert via zijn token.** Van de 29 namen
hebben er **vijftien geen enkele fee-regel** bij DefiLlama, en van degene die wel
omzet draaien keren de meeste **nul** uit aan houders:

| | Fees 1j | Naar houders | Wat er gebeurt |
| --- | ---: | ---: | --- |
| **Jito** | $205M | **$0** | MEV-tips gaan naar SOL-stakers, niet naar JTO-houders |
| **EigenCloud** | $42M | **$0** | Restaking-rendement gaat naar restakers |
| **CoW Protocol** | $41M | **$0** | De bespaarde MEV gaat naar de handelaar. Zoals bedoeld |
| **Chainlink** | $63M | **$58M** | 92% capture — veruit de hoogste hier |
| **SSV** | $2M | $1M | $9,5 mrd aan gestakete ETH onder DVT, minimale monetisatie |

Dat is de kernbevinding: **CoW is niet slecht ontworpen omdat het niets uitkeert —
het is góéd ontworpen, en daarom keert het niets uit.** De waarde landt bij de
gebruiker. Wie op MEV-mitigatie wil verdienen, moet in de laag zitten die de
diensten *verkoopt* (oracles, sequencing, DVT), niet in de laag die de extractie
*wegneemt*.

**Chainlink is daarmee de best gepositioneerde MEV-naam in de tabel**, en dat is
contra-intuïtief genoeg om te vermelden: SVR vangt oracle-extraheerbare waarde en
92% van de fees bereikt de houder. API3 (OEV Network) en UMA (Oval) doen hetzelfde
op kleinere schaal — API3 op $27M kap met 81% float, UMA op $30M met 70%.

### Jouw float-regel toegepast

Dit is precies de categorie waar lage float normaal is, omdat bijna alles hier
recent gelanceerd is. Volgens jouw regel is dat pas een probleem zonder
liquiditeit. De splitsing:

**Lage float, wél gedragen door volume** — de unlock heeft een koper:

| | Float | Vol/mcap | Mcap |
| --- | ---: | ---: | ---: |
| Enso | 16% | **58%** | $18M |
| Lagrange | 19% | **55%** | $9M |
| Hyperlane | 34% | 28% | $22M |
| Espresso | 18% | 22% | $50M |
| Brevis | 25% | 17% | $17M |

**Lage float, géén volume** — de unlock valt in een leeg boek:

| | Float | Vol/mcap | Mcap |
| --- | ---: | ---: | ---: |
| Skate | 14% | **0%** | $128K |
| Semantic Layer | 15% | **0%** | $338K |
| Shutter | 38% | 0% | $499K |
| Odos | 16% | 17% | $1M |

Shutter is de pijnlijkste van die lijst: threshold-encryptie van de mempool is
conceptueel de schoonste MEV-oplossing die er is, en het token is een half miljoen
waard met nul volume.

---

## 4. Pre-token — negen projecten zonder verhandelbaar token

| Project | Wat het is | Waarom het telt | Trigger |
| --- | --- | --- | --- |
| **Flashbots** | MEV-Boost, BuilderNet, SUAVE | Heeft de marktstructuur van Ethereum-blockbuilding gedefinieerd | Een TGE, of BuilderNet-aandeel dat naar een token-gedekt model kantelt |
| **Sorella / Angstrom** | v4-hook die per blok batcht tegen één clearingprijs en arbitragewaarde teruggeeft aan LP's | De zuiverste "MEV terug naar de LP" die als hook draait | Volume in Angstrom-pools versus dezelfde paren op standaard v4 |
| **Panoptic** | Perpetual options bovenop CL-liquiditeit | Maakt van LP-posities een optiemarkt zonder oracle | Open interest; of de LP-zijde het aanbod aankan |
| **Doppler / Whetstone** | Token-launch via hooks met dynamische prijsvorming | Launchpad-logica in de AMM zelf in plaats van ernaast | Aantal launches dat na 30 dagen nog liquiditeit heeft |
| **Cork Protocol** | Depeg-swaps als hook | Prijst pegrisico als los product | Volume na het herstel van het exploit-incident |
| **Arrakis** | Hook-vaults en LP-management as a service | Institutionele LP-infrastructuur | Of grote LP's het daadwerkelijk gebruiken |
| **Valantis** | Modulaire DEX waar elk onderdeel vervangbaar is | Hetzelfde idee als hooks, andere architectuur | Adoptie buiten het eigen ecosysteem |
| **Primev / mev-commit** | Preconfirmaties en commitments tussen searchers en proposers | De laag onder BuilderNet | Preconf-adoptie op mainnet |
| **Bunni** | *Opgeheven.* | **De waarschuwing van deze hele categorie** — zie hieronder | — |

### Bunni is de belangrijkste les in dit document

Bunni was de grootste LP-optimalisatiehook op v4. Op **2 september 2025** werd het
voor ongeveer **$8,4M geëxploiteerd** via een afrondingsfout in de logica die
liquiditeit verdeelt — **ondanks audits van Trail of Bits én Cyfrin.** Daarna is
het gestopt, en de terugval in v4's TVL is er deels toe te herleiden.

Dat is de structurele risicofactor van hooks als categorie, en hij is anders dan
gewoon smart-contract-risico: **een hook zit tussen de pool en élke swap.** De code
draait bij iedere transactie, met de volledige liquiditeit binnen bereik. Twee
top-tier audits waren niet genoeg. Elk hook-project in §2 draagt dit risico, en de
markt prijst het zichtbaar niet — anders zou Meteora niet op $524M aan fees staan
met een kap van $89M.

---

## 5. Wat ik zou doen

Drie observaties die ik met redelijk vertrouwen aanhoud:

1. **De MEV-categorie is grotendeels niet investeerbaar via tokens, en dat is
   structureel.** Goed ontworpen MEV-mitigatie geeft waarde aan de gebruiker terug.
   De uitzonderingen zijn de partijen die MEV-diensten *verkopen*: Chainlink (92%
   capture), API3 en UMA. Daar zou ik beginnen, niet bij CoW of Jito — hoe goed die
   protocollen ook zijn.
2. **Bij hooks is de capture-ratio de scheidslijn**, niet de architectuur.
   Aerodrome (75%) en Curve (54%) betalen; Meteora (2,7%) en Uniswap (3,7%) niet.
   Dat is een keuze in de tokenomics, geen eigenschap van de technologie, en hij
   kan veranderen — de fee-switch bij Uniswap staat inmiddels aan.
3. **Balancer en Meteora zijn de twee waar ik als eerste dieper in zou gaan**, om
   tegengestelde redenen: Balancer omdat een houdersrendement van 41% op een $7,3M
   kap ofwel een fout in mijn data ofwel een dislocatie is, en Meteora omdat de
   activiteit onbetwistbaar is en de vraag alleen is of de houder ooit betaald
   wordt.

**Wat ik nog niet heb gedaan:** per naam de governance en de concentratie, de
oorzaak van Balancer's val, de exploit-historie van Cork, en een EV-model. Zeg maar
of je dat wil, en op welke namen.

**Ronde twee is Base.** Dat is een ander document met een andere logica: daar gaat
het om distributie en Coinbase-begeleiding, niet om marktstructuur.

---

*Geen beleggingsadvies. Fee-, houders-omzet- en TVL-cijfers zijn DefiLlama's
trailing-jaar reeksen per 12 aug 2026, niet geauditeerd; "—" betekent niet-getrackt,
niet nul. Marktdata is CoinGecko dezelfde dag. Identifiers zijn per protocol
geresolved. De v4-TVL-discrepantie in §2 is onopgelost en als zodanig gemarkeerd.*
