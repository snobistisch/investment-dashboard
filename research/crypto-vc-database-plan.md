# VC-investeringsdatabase — bronnenonderzoek en opzet

**Datum:** 13 augustus 2026
**Opdracht:** een volledige database van alle investeringen van de geselecteerde
crypto-VC's. Eerst uitzoeken waar die data vandaan komt, dan een prompt, dan het
onderzoek.

Dit document is stap 1 en 2. Het bevat wat ik **getest** heb, niet wat ik vermoed.

---

## 1. Bronnenonderzoek — wat ik heb geprobeerd

### 1.1 Gestructureerde API's — allemaal dicht

| Bron | Endpoint | Resultaat |
| --- | --- | --- |
| DefiLlama Raises | `api.llama.fi/raises` | **402** — sinds kort betaald |
| Crunchbase | `api.crunchbase.com/v4` | **401** — sleutel vereist |
| RootData | `api.rootdata.com/open/ser_inv` | **500** zonder sleutel |
| CryptoRank | `api.cryptorank.io/v1/funds` | **404** — sleutel/ander pad |
| CB Insights, PitchBook | — | Enterprise, geen selfservice |

DefiLlama's raises-dataset was de voor de hand liggende route en is dat niet meer.

### 1.2 Portfoliopagina's van de fondsen zelf — namen, geen rondes

Getest op `paradigm.xyz/portfolio`: **~130 namen**, leesbaar, compleet ogend.
Maar **geen datum, geen ronde, geen bedrag, geen co-investeerders**.

Bruikbaar als *controlelijst* — om te meten of een andere bron dekking mist — niet
als primaire bron.

*Terzijde, want het bevestigt eerder werk:* Paradigm's portfolio bevat Sorella
Labs, Succinct, Flashbots, Symbiotic, Axiom, Aztec, Euler, Monad, Morpho, Uniswap
en Zora. Vrijwel elke pre-token naam uit het hooks/MEV-onderzoek zit erin.

### 1.3 crypto-fundraising.info — dit is de bron

Volledig getest. Het draait op WordPress, en dat is in ons voordeel.

**Wat er in zit:**

| | |
| --- | --- |
| Rondes (`projects`) | **6.407** |
| Fondsen (`funds`) | **8.478** |
| Per ronde | projectnaam, datum, rondetype, bedrag, **lead-investeerder én overige investeerders** |

**Geverifieerde voorbeelden van de fondstotalen:** Paradigm 144, Robot Ventures
157, Maven 11 104, cyber•Fund 31.

**Waarom het scriptbaar is — de doorslaggevende test.** De REST API
(`/wp-json/wp/v2/projects`) is open en enumereerbaar, maar de ACF-relatievelden
zijn níét publiek — `acf` komt leeg terug. De relatie staat wél in de gerenderde
HTML van elke projectpagina, als gewone links:

```
href="/funds/nfx"   href="/funds/tribe-capital"   href="/funds/ledgerprime"
Pre-seed · Oct 2022 · $2,500,000
```

Dat betekent: **geen AI-call per pagina nodig.** Slug-lijst via de REST API
(~65 requests), dan 6.407 pagina's via curl met een reguliere expressie eroverheen.
Dat is een script van een half uur, geen weken werk.

**Architectuurkeuze die hieruit volgt.** Niet per fonds scrapen — de fondspagina's
tonen tien rijen tegelijk en de paginering zit achter een redirect. In plaats
daarvan **één pass over alle 6.407 rondes**, en daarna de index omkeren naar
investeerder → investeringen. Dat levert in één keer:

- de volledige portefeuille van élk fonds, niet alleen de twintig op je lijst;
- alle **co-investeringsrelaties** (wie zit met wie in dezelfde rondes);
- de mogelijkheid om elk fonds te toetsen tegen zijn eigen portfoliopagina.

---

## 2. Wat "volledig" kan betekenen — en wat niet

Dit moet vast voordat ik begin, anders lever ik iets op dat "volledig" heet en het
niet is.

**Haalbaar:** volledig binnen crypto-fundraising.info. Elke ronde die daar staat,
met alle investeerders die daar vermeld zijn. Meetbaar en reproduceerbaar.

**Niet haalbaar, en de reden is structureel:**

1. **Niet-aangekondigde rondes.** Een groot deel van pre-seed wordt nooit
   gepubliceerd. Die staan in geen enkele database.
2. **Onvolledige investeerderslijsten.** Persberichten noemen de lead en "others",
   waarbij "others" wegvalt.
3. **Secundaire aankopen.** Een fonds dat tokens op de markt koopt of een
   SAFT overneemt, verschijnt nergens als investeerder.
4. **Liquide posities.** Paradigm die ETH aanhoudt is geen "investering" in deze zin.
5. **Overlappende entiteiten.** `a16z` en `a16z crypto` kunnen twee slugs zijn;
   dat moet met de hand samengevoegd.

**Hoe ik de dekking ga meten in plaats van claimen:** per fonds de gescrapete
telling naast het aantal op de eigen portfoliopagina en naast het totaal dat
crypto-fundraising zelf noemt. Drie getallen die uiteenlopen zijn informatiever
dan één getal dat "volledig" heet.

---

## 3. De prompt die ik mezelf geef

> **Bouw een reproduceerbare database van crypto-VC-investeringen, met de
> rondepagina als atomaire eenheid en het fonds als afgeleide index.**
>
> **Bron.** crypto-fundraising.info. Slugs via de open WP REST API, gegevens uit
> de gerenderde HTML van elke projectpagina. Geen enkel veld overtypen; alles
> geparsed en de parser is de documentatie.
>
> **Per ronde vastleggen:** project, projectslug, datum, rondetype, bedrag in USD,
> lead-investeerders, overige investeerders (als fondsslugs, niet als vrije
> tekst), categorie, en de bron-URL. De slug is de sleutel — namen botsen,
> slugs niet. Dat is dezelfde les als bij de tickers.
>
> **Daarna omkeren:** per fonds de volledige lijst investeringen, met afgeleide
> statistieken die ergens over gaan:
> - aantal investeringen, en de verdeling over tijd (wanneer waren ze actief?);
> - **verdeling over rondetype** — dit is de kwantificering van Matthias' eigen
>   kritiek dat Founders Fund en a16z te laat instappen. Het aandeel pre-seed en
>   seed tegenover Series B en later is een getal, geen mening;
> - gemiddelde en mediane rondegrootte waarin ze deelnemen;
> - hoe vaak lead versus meeloper;
> - **co-investeerdersnetwerk**: met welke fondsen delen ze het vaakst een ronde.
>
> **Toetsen, niet aannemen.** Per fonds de telling vergelijken met de eigen
> portfoliopagina en met het totaal dat de bron noemt. Verschillen rapporteren.
>
> **De vraag waar dit uiteindelijk voor is.** Welke fondsen stappen vroeg in
> tegen lage waarderingen, en welke kopen validatie tegen een hoge? En, als
> vervolg: welke fondsen zitten in de rondes van tokens die na hun cliff
> instortten? Dat tweede is de brug naar het float-werk dat al in de repo staat,
> en het is de enige manier om "reputatie" om te zetten in iets meetbaars.
>
> **Wat ik niet doe.** Niet claimen dat het volledig is. Niet ontbrekende data
> invullen met aannames. Niet de fondsen rangschikken op basis van aantallen —
> portfoliogrootte is de makkelijkste metriek om goed op te scoren en zegt niets.

---

## 4. Scope-voorstel

De vraag die ik aan jou terugleg voordat ik 6.400 pagina's ophaal.

**Optie A — alles (aanbevolen).** Alle 6.407 rondes, dus alle 8.478 fondsen
krijgen een profiel. Kost hetzelfde als een deelverzameling, want de dure stap is
de pass over de rondes. Levert het co-investeerdersnetwerk op, en je kunt later
elk fonds bevragen zonder opnieuw te scrapen.

**Optie B — alleen jouw lijst.** De ~20 fondsen uit je tier-lijst plus Robot,
Maven 11, Bain, Haun, cyber•Fund, Semantic, GnosisVC. Zelfde scrape, kleinere
uitvoer. Bespaart niets aan tijd, alleen aan omvang van het eindbestand.

**Praktisch.** Ik haal de pagina's op met beperkte gelijktijdigheid en pauzes —
het is een kleine site en ik ga hem niet platleggen. Reken op twintig tot veertig
minuten. Ik lever een `.csv` plus een `.md` met de analyse, en het scrapescript
zodat het herhaalbaar is en jij kunt zien hoe elk veld tot stand kwam.

**Wat ik nog van jou wil weten:**

1. **A of B?** Ik zou A doen, om de reden hierboven.
2. **Moet dit de repo in?** Een dataset van deze omvang hoort in `research/` met
   het script erbij, of juist niet omdat het gescrapete data van derden is. Jouw
   keuze.
3. **Wil je de unlock-analyse er direct achteraan?** Dat is de tweede pass:
   rondes koppelen aan tokens die inmiddels genoteerd zijn, en het koersverloop
   na de cliff meten per lead-investeerder. Dat is waar dit onderzoek echt
   betaalt, maar het is een aparte klus bovenop deze.

---

*Bronnen getest op 13 augustus 2026. Statuscodes en tellingen in §1 zijn
uitkomsten van feitelijke requests, geen schattingen. Geen beleggingsadvies.*
