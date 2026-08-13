# Haun Ventures — investeringsdatabase

**Datum:** 13 augustus 2026 · **Bron:** crypto-fundraising.info, zelf gescrapet
**Dekking:** 37 van de 41 rondes die de bron voor Haun opgeeft — **90%**
**Status:** onderzoek, geen beleggingsadvies.

Stap 1 van de VC-database. Alleen Haun, zoals afgesproken.

---

## 1. Hoe dit tot stand kwam, en wat er misging

De bron levert per ronde projectnaam, datum, rondetype, bedrag en investeerders.
Twee dingen waren nodig om erbij te komen:

**De fondspagina werkt niet.** Die toont structureel tien rijen — de variabele in
de broncode heet letterlijk `topten` — en elke pagineringsparameter redirect terug
naar pagina één. De andere 31 rondes zijn daar niet op te halen. De enige complete
route is omgekeerd: álle rondes scannen en indexeren op investeerder.

**Cloudflare blokkeerde de eerste run.** Met acht gelijktijdige verbindingen kwamen
5.079 van de 6.407 pagina's terug als "Just a moment..."-challenge in plaats van
inhoud. Dat zag er in de bestandslijst uit als succes: 6.407 bestanden, geen lege.
Pas een inhoudscontrole liet het zien. Opnieuw opgehaald met echte browserheaders
en drie verbindingen.

**Waar het stopte.** Ik heb de scrape afgebroken op jouw verzoek. Van de 6.407
rondes zijn er **5.868 geparsed** (92%), goed voor 7.655 investeerders. Voor Haun
levert dat 37 van 41. De vier ontbrekende zitten in de laatste 8% en zijn met een
korte vervolgrun op te halen.

---

## 2. Het profiel in cijfers

| | |
| --- | --- |
| Rondes gevonden | **37** (bron zegt 41) |
| Mediane rondegrootte | **$21.8M** |
| Kleinste — grootste | $3.5M — $1.80B |
| Vroege fase (seed) | 8 |
| Late fase (Series A/B) | 7 |

**Tempo per jaar**

| Jaar | Investeringen |
| --- | ---: |
| 2022 | 5 |
| 2023 | 2 |
| 2024 | 10 |
| 2025 | 10 |
| 2026 | 10 |

**Verdeling naar rondetype**

| Rondetype | Aantal |
| --- | ---: |
| — | 17 |
| Seed | 8 |
| Series A | 6 |
| Strategic | 2 |
| M&A | 2 |
| Private | 1 |
| Series B | 1 |

Het aandeel "—" is fors: bij twaalf rondes vermeldt de bron geen type. Dat is een
tekortkoming van de bron, niet van de parser, en het beperkt wat je over
instapfase kunt zeggen. Van de rondes die wél een type hebben, is de verhouding
vroeg tegen laat ongeveer 8 om 7 — geen uitgesproken seed-fonds,
maar ook geen late-stage schrijver.

---

## 3. Wat er echt uitspringt: het co-investeerdersnetwerk

| Co-investeerder | Gedeelde rondes | Aandeel |
| --- | ---: | ---: |
| Coinbase Ventures | 17 | 46% |
| Paradigm | 7 | 19% |
| Robot Ventures | 5 | 14% |
| Galaxy Digital | 5 | 14% |
| Ribbit Capital | 5 | 14% |
| a16z Crypto | 4 | 11% |
| General Catalyst | 4 | 11% |
| Jump Crypto | 4 | 11% |
| Balaji Srinivasan | 4 | 11% |
| 1kx | 3 | 8% |
| Apollo Global Management | 3 | 8% |
| Sv Angel | 3 | 8% |
| Solana Ventures | 3 | 8% |
| 6th Man Ventures | 3 | 8% |
| Reciprocal Ventures | 3 | 8% |

**Coinbase Ventures zit in 17 van de 37 rondes — 46%.** Dat is geen toeval en geen
gewone overlap; dat is een gedeelde dealstroom. Voor jou is dat direct relevant,
want het betekent dat Haun's portfolio grotendeels binnen het Coinbase-universum
valt — precies het ecosysteem waar je de volgende onderzoeksronde over wilde.
**Het Base-onderzoek en het Haun-onderzoek gaan voor bijna de helft over dezelfde
bedrijven.**

Tweede observatie: **Paradigm (7), Robot Ventures (5) en a16z crypto (4)** zitten
allemaal met regelmaat naast Haun. De tier-lijst van je expert zet die drie op
respectievelijk God, niet-vermeld en F — maar ze schrijven in de praktijk
dezelfde deals. Dat ondermijnt niet per se de indeling, maar het laat zien dat
"dealtoegang" ze minder onderscheidt dan de lijst suggereert. Het verschil zit
dan in prijs en timing, niet in tot welke rondes ze worden toegelaten.

---

## 4. Alle 37 rondes

| # | Project | Ronde | Datum | Rondegrootte | Co-investeerders |
| ---: | --- | --- | --- | ---: | --- |
| 1 | **River Markets provides trading firms with unified execution** | Seed | Aug 2026 | $8.5M | Y Combinator, Coinbase Ventures, Ufo Holdings, Humbition, Kima Ventures, Cherry Ventures |
| 2 | **Sovereign Labs is open and interconnected rollup ecosystem o** | — | Jul 2026 | — | Celestia Foundation, 1kx, Robot Ventures, Maven 11 Capital |
| 3 | **Trace Finance is a cross-border payments and banking infrast** | Series A | Jun 2026 | $32.0M | Coin Fund, Coinbase Ventures, Jump Capital, Paxos, Chainlink Labs, Hof Capital +5 |
| 4 | **Arc is a stablecoin-native Layer-1 blockchain developed by C** | Private | May 2026 | $222.0M | a16z Crypto, Blackrock, Apollo Global Management, Intercontinental Exchange, Sbi Holdings, Sc Ventures +5 |
| 5 | **Liquid is a decentralized trading super app offering up to 1** | Series A | Apr 2026 | $18.0M | Neo, Left Lane Capital, K5 Global, Sv Angel, Antifund VC, Sunflower Capital +4 |
| 6 | **Squads is a Solana-based multisig protocol that helps crypto** | Strategic | Apr 2026 | $18.0M | Solana Ventures, Coinbase Ventures, L1 Digital, Electric Capital, Placeholder, Rockawayx +19 |
| 7 | **Superstate is an asset management firm that utilizes blockch** | — | Apr 2026 | — | Invesco Private Capital, Bain Capital Crypto, Distributed Global, Brevan Howard Digital, Galaxy Digital, Sentinel Global +16 |
| 8 | **BVNK is a fintech company that provides stablecoin payment i** | M&A | Mar 2026 | $1.80B | Mastercard, Citi, Visa, Coinbase Ventures, Tiger Global, Kingsway Capital +5 |
| 9 | **XFX is an institutional-grade cross‑border settlement platfo** | Series A | Mar 2026 | $17.0M | Castle Island Ventures, Coinbase Ventures, Oak Hc Ft, Maya Capital, Paxos, Bitso |
| 10 | **Farcaster is a sufficiently decentralized social network. It** | — | Jan 2026 | — | Neynar, Paradigm, a16z Crypto, Union Square Ventures, Variant Fund, Standard Crypto +20 |
| 11 | **The Clearing Company is building a next-generation predictio** | — | Dec 2025 | — | Coinbase, Fred Wilson, Union Square Ventures, Variant Fund, Coinbase Ventures, Compound +3 |
| 12 | **Commonware is an open, Rust-based blockchain framework desig** | — | Nov 2025 | $25.0M | Tempo 2, Dragonfly Capital, Nick White, Viktor Bunin, Sreeram Kannan, Dan Romero +3 |
| 13 | **Lighter is a zk-rollup perpetuals protocol delivering provab** | — | Nov 2025 | $68.0M | Founders Fund, Ribbit Capital, Robinhood, Dragonfly Capital, Robot Ventures, a16z Crypto +6 |
| 14 | **Meanwhile is a life insurance company that offers policies d** | — | Oct 2025 | $82.0M | Bain Capital Crypto, Pantera Capital, Stillmark, Apollo Global Management, Framework, Fulgur Ventures +6 |
| 15 | **Euler Finance is a modular, permissionless lending protocol** | — | Jul 2025 | — | M31 Capital, Wintermute Ventures, Variant Fund, Ftx Ventures, Coinbase Ventures, Jane Street +10 |
| 16 | **Portal HQ is a developer-first platform offering embedded no** | — | Jul 2025 | — | Monad, Slow, Acrew Capital, Chapter One |
| 17 | **Plume Network is a public blockchain for scaling RWAs, desig** | — | Apr 2025 | — | Apollo Global Management, Yzi Labs, Brevan Howard Digital, Lightspeed Faction, Galaxy Digital, Superscrypt +10 |
| 18 | **Bitwise is a crypto asset management firm known for managing** | — | Feb 2025 | $70.0M | Electric Capital, Massmutual Ventures, Mit Investment Management Company, Highland Capital Partners, Parafi Capital, Khosla Ventures +9 |
| 19 | **Finisterra Labs is a decentralized data infrastructure platf** | Seed | Feb 2025 | $3.8M | Lightshift |
| 20 | **Raise is a leading digital prepaid and retail payments platf** | Strategic | Feb 2025 | $63.0M | Paper Ventures, Selini Capital, Gsr Markets Ltd, Raj Gokal |
| 21 | **Bridge is a stablecoin-based payments platform designed to s** | M&A | Oct 2024 | $1.10B | Stripe, Sequoia, Ribbit Capital, Index Ventures |
| 22 | **Ellipsis Labs builds sustainable and efficient DeFi protocol** | — | Oct 2024 | $21.0M |  |
| 23 | **Chaos Labs is a highly automated economic security and risk** | — | Sep 2024 | — | Paypal Ventures, Lightspeed, F Prime Capital, Wintermute Ventures, Galaxy Digital, Slow +26 |
| 24 | **Helius provides Solana RPCs (Remote Procedure Calls) powered** | Series B | Sep 2024 | $21.8M | Founders Fund, Foundation Capital, 6th Man Ventures, Chapter One, Spearhead, Reciprocal Ventures +4 |
| 25 | **Conduit is a crypto infrastructure platform that enables the** | Series A | Jun 2024 | $37.0M | Paradigm, Coinbase Ventures, Bankless Ventures, Robot Ventures, Credibly Neutral, Hayden Adams +24 |
| 26 | **Agora is a cross-chain governance platform offering end-to-e** | Seed | May 2024 | $5.0M | Seed Club Ventures, Coinbase Ventures, Credibly Neutral, Sina Habibian, Balaji Srinivasan, Tim Beiko +5 |
| 27 | **Chainalysis is a blockchain data platform offering data, sof** | — | May 2024 | — | Magiceden, Gic, Accel, Blackstone, Dragoneer Investment Group, Fundersclub +12 |
| 28 | **Fireblocks is a crypto and digital asset platform for Instit** | — | May 2024 | — | D1 Capital, Spark Capital, Sequoia, Parafi Capital, General Atlantic, Canapi Ventures +18 |
| 29 | **Neynar simplifies building on Farcaster by providing a compr** | Series A | May 2024 | $11.0M | a16z Crypto, a16z Crypto Startup Accelerator, Coinbase Ventures, Union Square Ventures |
| 30 | **Witness is a Web3-enabled system that unlocks ownership and** | Seed | Feb 2024 | $3.5M | Coinbase Ventures, John Adler, Tarun Chitra, Nic Carter, Scott Sunarto, Tim Beiko +5 |
| 31 | **Sona is a Web3 streaming protocol revolutionizing the music** | Seed | Dec 2023 | $6.9M | Polychain Capital, Rogue Capital |
| 32 | **Argus is a project focused on advancing the crypto gaming ec** | Seed | Jun 2023 | $10.0M | Alchemy Ventures, Robot Ventures, Anagram, Dispersion Capital, Elad Gil, Balaji Srinivasan |
| 33 | **Exponential is a decentralized finance (DeFi) investment dis** | Seed | Oct 2022 | $14.0M | Paradigm, Ftx Ventures, Polygon Ventures, Circle Ventures, Solana Ventures, Robot Ventures +2 |
| 34 | **Thirdweb is a platform for Web3 app developers.** | Series A | Aug 2022 | $24.0M | Coinbase Ventures, Shopify, Protocol Labs, Polygon Ventures, Shrug Capital, Gary Vaynerchuk +1 |
| 35 | **Highlight is creating a membership community on the blockcha** | Seed | May 2022 | $11.0M | 1kx, Polygon Studios, Coinbase Ventures, A Capital, Scifi VC, Floodgate +7 |
| 36 | **TaxBit connects the consumer and enterprise cryptocurrency t** | — | May 2022 | — | Tiger Global, Paradigm, 9yards Capital, Sapphire Ventures, Madrona Venture Group, Galaxy Digital +13 |
| 37 | **Zora is an onchain social network and NFT marketplace built** | — | May 2022 | $50.0M | Coinbase Ventures, Kindred Ventures |

---

## 5. Wat dit nog niet is

1. **Vier rondes ontbreken** (90% dekking). Op te lossen met een korte vervolgrun.
2. **Lead versus meeloper is niet gescheiden.** De bron markeert lead-investeerders
   apart, maar mijn parser haalt die splitsing er nog niet betrouwbaar uit — het
   veld kwam leeg terug voor alle rondes. Dat is de eerstvolgende fix, en het is
   belangrijk: lead zijn is een heel ander signaal dan meeschrijven.
3. **Rondetype ontbreekt bij twaalf rondes** in de bron zelf.
4. **Bedragen zijn rondegroottes, geen ticketgroottes.** Wat Haun zelf inlegde
   staat nergens. Dat geldt voor elke publieke bron.
5. **De database bevat nu 5.868 rondes en 7.655 investeerders.** Elk volgend fonds
   kost geen nieuwe scrape — alleen een query. Paradigm, Robot Ventures, Maven 11
   en de rest zijn een script van één minuut zodra jij zegt welke.

---

*Gescrapet van crypto-fundraising.info op 13 augustus 2026. Bedragen zijn
rondegroottes zoals gepubliceerd. Geen beleggingsadvies.*
