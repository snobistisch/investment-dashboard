# Audit kwantitatieve laag — 15 augustus 2026

Scope: risico-rating, scenario-EV/poker-EV en Portfolio Builder. Beoordeeld op
`main` vanaf `9abff79`; de overdracht noemde de oudere HEAD `ff3d28f`.

Bevestigde doelstelling: het cryptogedeelte moet BTC verslaan; BTC is benchmark
en geen positie; een verlies van circa 90% is aanvaardbaar; er zijn nu geen
posities in ETH, ZEC, LIT of NOCK; handmatig herbalanceren is geen regel; de
gewenste formule moet vooral zichtbaar maken welke kandidaten onder de huidige
aannames positieve EV ten opzichte van BTC hebben. Reproduceerbare code met
uitleg is voldoende.

## 1. Werkt het?

**De berekeningen draaien nu zoals ze worden beschreven, maar de strategie is
niet bewezen. Gebruik dit maandag niet als koopmachine met echt geld.** De
ongewijzigde baseline was groen: 146.899 Allocator-invarianten, lint en build.
De review vond daarna vier echte fouten in de kwantitatieve laag: crypto-vol was
met 252 in plaats van 365 dagen geannualiseerd; de Research-EV-lens sorteerde op
de thematische bronvolgorde en niet op EV; de ERC-iteratie was geen algemeen
convergerende solver; onmogelijke plafonds werden na normalisatie toch
overtreden. Deze vier zijn gerepareerd en er zijn 1.757 onafhankelijke
kwantitatieve invarianten toegevoegd.

De prijsreeksen, datumuitlijning, drawdownberekening, risicocomponenten en
correlatiematrix zijn onafhankelijk nagerekend. De strikte één-dagsuitlijning
geeft een mediane actieve correlatie van 0,1336 tegen 0,1337 voor de huidige
methode; er is dus geen materiële off-by-one. De huidige correlatiematrix is
positief definiet (kleinste eigenwaarde 0,072 voor de volledige geïmputeerde
matrix en 0,314 voor de toenmalige standaardselectie). Alle veertig CoinGecko-
ids bestaan op 15 augustus en matchen id, symbool en projectnaam.

## 2. Klopt het met wat Matthias wil?

**Na de fixes inhoudelijk beter, maar nog slechts gedeeltelijk.** De live
beslisregel is nu één getal: jaarlijkse scenario-EV van het asset minus die van
BTC. Positief betekent alleen dat de gepubliceerde scenario's outperformance
impliceren. Acht namen zijn positief; bij de standaardgrenzen voor historie,
liquiditeit en FDV blijven AAVE, AKT, ETH, SYRUP, JUP, SOL en LINK over. NOCK is
de achtste, maar valt af op $0,6 mln dagvolume en draagt R=0,75 Extreme.

Dat sluit aan bij “welke kandidaten zijn onder mijn huidige aannames +EV ten
opzichte van BTC?”. Het beantwoordt niet “welke beleggingen zijn werkelijk
+EV?”. De kansen zijn één subjectieve momentopname zonder kalibratie of
trackrecord. De Builder beantwoordt daarna alleen hoeveel actieve risico iedere
kandidaat draagt. Hij voorspelt geen rendement.

De Allocator klopt niet met de feitelijke beginsituatie. Hij noemt ETH, ZEC,
LIT en NOCK nog aangehouden posities en reserveert een vast 10%-mandaat, terwijl
er geen cryptoposities zijn. Dat bestand was expliciet uitgesloten van deze
review en is niet gewijzigd. Totdat “werkelijke holdings” en “doelportefeuille”
apart zijn gemodelleerd, mag de Allocator niet worden gebruikt om maandag een
orderbedrag te bepalen.

## 3. Wat nu?

**Maak de huidige zeven kandidaten tot één vooraf vastgelegde papieren
portefeuille en meet die twaalf weken lang tegen BTC, zonder de regels onderweg
te veranderen.** Sla op dag nul scenario's, kansen, selectie, gewichten, spread-
schatting en BTC-prijs op. Leg vooraf vast dat alleen nieuwe, dateerbare feiten
een scenario mogen wijzigen. Rapporteer wekelijks actieve return, transactiekost,
drawdown en regelwijzigingen. De vraag is eerst of het proces stabiel en
eerlijk uitvoerbaar is, niet of één week toevallig groen eindigt.

Dit is de meest waardevolle stap omdat de grootste resterende onzekerheid de
verwachte-returninput is. Meer optimizerwerk verbetert een secundaire stap
terwijl het koopcriterium ongevalideerd blijft. De belangrijkste tegenwerping is
dat twaalf weken te kort is om statistisch outperformance te bewijzen. Dat
klopt. Het is wel lang genoeg om datalekken, onuitvoerbare liquiditeit,
impulsieve herschattingen en een strategie die iedere week van kandidaten
wisselt zichtbaar te maken. Investeer maandag dus niet op basis van deze
formule; gebruik maandag als startdatum van de bevroren proef.

## 4. Is het te veel geworden?

**Ja. De hele pokerlaag kon weg en is verwijderd.** `EV_poker` vermenigvuldigde
alleen de bear-uitkomst met `(1+R)`. Dat is een ongeteste risicostraf, geen
verwachtingswaarde, en telt verwatering, illiquiditeit of falen dubbel wanneer
de bear-scenario's die al bevatten. `f*` was geen Kelly en had geen verdedigbare
sizingbetekenis. Twee concurrerende sizingregels leverden schijnzekerheid op.

Ook de momentum- en fee-lenzen in de Builder zijn verwijderd. Ze lieten de
Builder een andere selectie maken dan de gestelde +EV-vraag. De handmatige
herbalanceringsregel en driftbands zijn eveneens weg. Wat overblijft heeft een
duidelijke taakverdeling: scenario-EV versus BTC selecteert; R waarschuwt;
liquiditeit, FDV en historie sluiten uit; de Builder verdeelt uitsluitend het
actieve risico van de overgebleven kandidaten. De Builder mag blijven als
risicosandbox, niet als bewijs dat deze portefeuille BTC zal verslaan.

## Bevindingen, op ernst

### Kritiek

1. **Fout — de Builder rangschikte “Research EV” niet op EV.**
   Vastgesteld door de standaarduitvoer met de berekende EV-volgorde te
   vergelijken. De code gebruikte `-ROWS.indexOf(r)`, maar de bronarray is per
   thema geordend. Daardoor selecteerde hij ETH, SOL, NEAR, ZEC, JUP, ASTER,
   UNI en AAVE; NEAR, ZEC, ASTER en UNI liggen volgens de eigen scenario's onder
   BTC, terwijl AKT, SYRUP en LINK ontbraken. Geldbetekenis: de tool adviseerde
   namen die zijn eigen hurdle afwees. Gerepareerd met expliciete EV- en
   BTC-edgevelden en een harde `edge > 0`-poort.

2. **Fout — de Allocator veronderstelt niet-bestaande holdings.**
   `allocation.ts` zet een vast 10%-mandaat en noemt ETH, ZEC, LIT en NOCK
   “held”. Matthias bevestigde dat geen van deze posities bestaat.
   Geldbetekenis: het getoonde order- en risicobeeld start met een fictief boek.
   Niet gerepareerd wegens de expliciete scopebeperking; dit blokkeert gebruik
   van de Allocator voor de startbeslissing.

### Hoog

3. **Fout — volatiliteit gebruikte √252 in een 365-dagenmarkt.**
   Onafhankelijke herberekening uit de gecommitte closes. Alle V-componenten
   waren ongeveer 17% te laag. BTC ging van 35,5% naar 42,8% vol en R van
   0,1151 naar 0,1219; NOCK van 232,4% naar 279,7% en R van 0,7093 High naar
   0,7531 Extreme. De verdeling veranderde van 0 naar 3 Extreme. Geldbetekenis:
   de oude pagina onderschatte gemeten risico systematisch. Gerepareerd.

4. **Fout — onmogelijke plafonds werden zichtbaar overtreden.**
   Reproductie: 3 posities met 10% per naam eindigde als 33,3% per naam. Clip,
   normaliseer en herhaal kan geen onmogelijke capaciteit oplossen.
   Geldbetekenis: een gebruiker kon denken dat een concentratiegrens gold
   terwijl ieder gewicht erboven lag. De Builder controleert nu haalbaarheid en
   weigert de combinatie zichtbaar.

5. **Fout — de ERC-update is niet algemeen convergent.**
   Op een diagonale matrix met vol 20%, 40%, 80% springt de oude methode tussen
   gelijke gewichten en 76,2%/19,0%/4,8%. Op de toenmalige standaardmatrix kwam
   hij toevallig wel binnen twintig iteraties op dezelfde 12,5%-risicobijdragen
   als een coordinate-descentreferentie. Geldbetekenis: andere sliders konden
   een iteration-count-afhankelijke portefeuille produceren. Vervangen door
   cyclical coordinate descent met residucontrole.

6. **Zwakte — scenario-EV is niet gekalibreerd en dus geen aangetoonde edge.**
   Er bestaat één set subjectieve kansen, geen gearchiveerde forecastreeks en
   geen out-of-sample resultaat. DeMiguel onderbouwt voorzichtigheid met
   optimizerinputs, maar valideert deze specifieke kansen niet.
   Geldbetekenis: “+5,7pp versus BTC” voor AAVE betekent “de huidige aannames
   zeggen +5,7pp”, niet “de markt biedt +5,7pp”. Dit blijft open.

### Middel

7. **Zwakte — 0,13 en 35/39 overdreven de diversificatie.**
   Alle meetbare paren geven mediaan 0,13; paren waarin beide assets minstens
   $1 mln per dag handelen geven 0,17; op de slechtste 20% BTC-dagen geven 25
   full-history assets 0,29. CAP, ARX en PRL veroorzaakten alle 111 ontbrekende
   paren en werden elk een eigen cluster. Geldbetekenis: de portefeuille leek
   breder gespreid dan de betrouwbaardere data rechtvaardigt. De pagina meldt nu
   alle drie cijfers en clustert 32 groepen onder 36 meetbare assets; de drie
   jonge namen zijn uitgesloten.

8. **Zwakte — één jaar, geen shrinkage, geen backtest.**
   De full-history mediaan heeft in een eenvoudige 1.000× dagbootstrap een 95%-
   interval van circa 0,16–0,24; die bootstrap negeert bovendien seriële
   afhankelijkheid. De gewichten gebruiken de ruwe steekproefcovariantie.
   Geldbetekenis: kleine wijzigingen in venster of regime kunnen gewichten
   veranderen zonder dat de economische theses veranderen. Niet “opgelost” met
   een willekeurige shrinkageparameter; dit hoort in de papieren proef.

9. **Zwakte — jonge drawdowns blijven listing-window-statistieken.**
   Veertien ratings hebben minder dan een jaar historie; CAP heeft 51 closes,
   ARX en PRL 55. R toont dit nog wel met `p`, maar de maat is zwakker.
   Geldbetekenis: R is voor deze namen een waarschuwing, geen vergelijkbare
   rangscore. De Builder sluit de drie sub-90-dagennamen nu uit.

### Laag

10. **Smaak — gelijke componentgewichten en drempels in R zijn keuzes.**
    De code past ze correct en transparant toe, maar 25% per component en de
    grenzen 30–300%, 20–95%, 1–8× en $0,5–50 mln zijn niet empirisch
    gekalibreerd. Geldbetekenis: gebruik de exacte R-rang niet alsof 0,39
    aantoonbaar veiliger is dan 0,42; de componenten zijn informatiever.

## Controles die geen fout opleverden

- Alle 40 CoinGecko-ids matchten op 15 augustus 2026 de actuele id, ticker en
  projectnaam; CAP=`cap-4` en EIGEN=`eigenlayer` blijven correct.
- Datumuitlijning is materieel correct. Eén gemeenschappelijke niet-dagelijkse
  interval verandert de mediane correlatie van 0,1337 naar 0,1336 wanneer die
  strikt wordt weggelaten.
- De oude NOCK/BTC-ijkpuntarithmetiek klopte onder de oude aannames:
  NOCK `0,15×9 − 0,30×0,40 − 0,55×0,85×(1+0,7093) = 0,431`; BTC
  `0,30×1,84 + 0,45×0,50 − 0,25×0,45×(1+0,1151) = 0,652`.
  Dat bevestigt de som, niet de geldigheid van de formule; de formule is daarom
  verwijderd.
- `applyCaps` convergeerde bij haalbare standaardplafonds. Het probleem zat in
  niet-gecontroleerde onhaalbaarheid.

## Doorgevoerde fixes

- `72001fd` — annualiseer crypto met 365 dagen; herbouw afgeleide data uit de
  gecommitte historie; voeg onafhankelijke kwantitatieve invarianten toe.
- `7292ec9` — verwijder poker-EV en `f*`; toon scenario-EV versus BTC en houd R
  als afzonderlijke waarschuwing.
- `da195a5` — maak EV en BTC-edge expliciete Builder-inputs; herstel de selectie,
  clustering, stressrapportage, ERC-solver en plafondvalidatie; verwijder de
  extra lenzen, herbalanceringsregel en holdingsclaim uit de Builder.

Niet gewijzigd: `src/sections/allocator/allocation.ts`. Daardoor blijft de
onjuiste holdings-/10%-mandaat-aanname zichtbaar als open blokkade.

## Pilot-follow-up — gereedheidscriteria voor maandag

De open blokkade hierboven is daarna buiten de oorspronkelijke reviewscope
opgelost door de 10%-cryptocarve-out uit de equities-solver te verwijderen.
Crypto routeert niet meer naar de fictieve mandateweergave. De nieuwe Pilot begint expliciet met nul
holdings en maakt risicokapitaal een gebruikersinput. Zonder een positief bedrag,
een benoemde venue en EU-rechtspersoon, een handmatige autorisatie-/orderboekcheck
en markt-, risico- en historiedata van maximaal 48 uur oud blijft de orderpreview
geblokkeerd.

De scenario's zijn bovendien van schuivende rendementen naar vaste terminale
USD-doelprijzen gemigreerd op een expliciete ankerclose. Een marktrefresh
verandert daardoor het geïmpliceerde rendement, niet ongemerkt de thesis. De
selectie vereist nu tegelijk positieve scenario-EV versus BTC, voldoende
liquiditeit, FDV/market-cap binnen de grens, genoeg historie, dekking van een
zichtbare round-tripkostenbuffer en overleving van een bull-naar-bear-
probabiliteitsstress. De standaardweging is 1/N; actieve-risicopariteit staat
alleen als vergelijkingsoptie naast 1/N en market-capweging.

Wanneer alle poorten groen zijn kan de gebruiker een JSON-beslissnapshot
downloaden met aannames, datavintages, venue, gekozen namen, gewichten,
referentieprijzen, indicatieve units en kosten. Dit maakt maandag geschikt als
start van een gecontroleerde pilot. Het verandert niet de hoofdconclusie van de
audit: de subjectieve kansen hebben nog geen out-of-sample trackrecord, en een
groene poort is geen bewijs dat een investering werkelijk +EV is.
