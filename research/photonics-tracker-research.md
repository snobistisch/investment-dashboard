# Photonics & optical interconnect — research notes

Research date: **8 August 2026**. Market data as of the **7 August 2026** close
(source: stockanalysis.com company pages, cross-checked against company IR and
specialist press where possible). Informational research only — not investment
advice.

**Vintage warning.** This theme re-prices weekly. Three items in here are days
old and will move: (1) the reported FCC draft ban on Chinese optical
transceivers (Reuters/Bloomberg, 4–5 Aug 2026) is a *draft*, unpublished, and
the FCC may revise or drop it; (2) LYTE listed on 6 Aug 2026 and has two days
of holdings history; (3) Lumentum (11 Aug), Coherent (12 Aug), POET (12 Aug)
and Fabrinet (17 Aug) all report within nine days of this note. Treat every
"current" number as a snapshot with a short shelf life.

**FX assumption** (needed for cross-listing comparison, flagged as an
assumption): USD/CNY 6.7372, USD/JPY 157.65 as of 7 Aug 2026; USD/TWD ≈ 32.25
derived from the JPY/TWD cross (0.2046). USD equivalents below are approximate.

---

## 1. The investable universe

### 1.1 Where the seed list came from, and why it is only a seed

**LYTE** (Roundhill Photonics & Optics ETF, Cboe BZX, launched 6 Aug 2026,
0.65% expense ratio, actively managed with quarterly rebalancing) is a useful
starting point and a bad boundary. Roundhill's own materials describe a
*concentrated* basket — reported at **12 holdings, top ten ≈ 97.3% of assets**
— screening for companies with at least ~50% of revenue from photonic/optical
technology. That screen is exactly what makes it too narrow for research
purposes: it excludes the diversified giants (Broadcom, Marvell, Nvidia,
Corning, Sumitomo) that own the most economically important positions in the
same value chain, and it excludes the connectivity-silicon names (Astera Labs,
Credo) that sit one layer over from the glass.

Reported LYTE composition as of the 6 Aug 2026 launch (weights from secondary
aggregators; **treat as approximate and already stale**):

| Holding | Reported weight |
| --- | --- |
| Lumentum (LITE) | ~15.4% |
| Coherent (COHR) | ~15.2% |
| Eoptolink (300502.SZ) | ~14.6% |
| Zhongji Innolight (300308.SZ) | ~14.2% |
| Ciena (CIEN) | ~13.7% |
| Suzhou TFC Optical (300394.SZ) | ~8.1% |
| Yuanjie Semiconductor (688498.SH) | ~5.4% |
| Accelink (002281.SZ) | ~4.8% |
| Fabrinet (FN) | ~4.1% |

*Conflict log:* one early aggregator listed ZTE at ~14.2% in the #4 slot where
Roundhill's own page and a later Robinhood snapshot show Zhongji Innolight and
Ciena. Roundhill's page is treated as authoritative for the top five; the ZTE
line is not used. A separate widely-shared "full holdings" list circulating on
X was discarded outright — it mixed in a private company and a lidar ticker and
is not credible.

**ALAB (Astera Labs, Nasdaq)** is not a disclosed LYTE holding — it is a
connectivity *semiconductor* company, not an optics company, and would fail the
50%-of-revenue-from-photonics screen. It is researched independently in §3.

### 1.2 The value chain, segment by segment

**A · Optical transceivers and modules.** The volume layer. Zhongji Innolight
(300308.SZ / 3308.HK) is the global leader at roughly **27% of the data-centre
transceiver market**; Eoptolink (300502.SZ) is the fastest-growing challenger
at +151% revenue; Accelink (002281.SZ) is the third Chinese scale player;
Applied Optoelectronics (AAOI) is the main US-listed module manufacturer;
Coherent (COHR) and Lumentum (LITE) build modules as well as the chips inside
them.

**B · Lasers, EMLs and VCSELs.** The genuine bottleneck. Lumentum is the volume
supplier of **200G-per-lane EMLs**, the component that gates 1.6T module
production. Coherent is the other Western source. Yuanjie Semiconductor
(688498.SH) is China's listed laser-chip pure play; LandMark Optoelectronics
(3081.TWO) and LuxNet (4979.TWO) supply the Taiwanese epiwafer and chip layer.
Furukawa Electric (5801.T) and Sumitomo Electric (5802.T) hold long-standing
positions in pump lasers and optical devices.

**C · Compound-semiconductor substrates.** One level deeper, and currently the
hardest constraint. **Indium phosphide (InP)** is in structural shortage. AXT
(AXTI) is the US-listed InP substrate supplier and plans to double capacity by
end-2027; Coherent is quadrupling six-inch InP capacity by end-2027 with Nvidia
money behind it; Chinese entrants (Yunnan Germanium, Vital Materials, Tianjin
Kuanjing) are scaling mid-range capacity. Zhongji Innolight earmarked roughly a
quarter of its HK$54.5bn IPO proceeds for **strategic inventory of InP and
laser chips** — an unusually direct signal about where the scarcity is.

**D · Photonic integrated circuits / silicon photonics.** Tower Semiconductor
(TSEM) is the merchant silicon-photonics foundry; TSMC's COUPE platform is the
leading-edge alternative and is used by both Nvidia and Broadcom (TSMC is not
covered as a photonics name here — the exposure is immaterial to its P&L).
POET Technologies (POET) is the listed pure-play optical-interposer story and
the highest-variance name in the set.

**E · Optical switching and co-packaged optics.** Broadcom (AVGO) ships the
Bailly CPO switch (Tomahawk-5 ASIC, eight 6.4Tbps optical engines, 51.2Tb/s
off-package); Nvidia (NVDA) ships Quantum-X Photonics InfiniBand and
Spectrum-X Photonics Ethernet switches. Arista (ANET) and Ciena (CIEN) are the
system-level buyers of everything above.

**F · DSPs, retimers and signal-integrity silicon.** Marvell (MRVL) holds
roughly **70% of the optical DSP market** and shipped the first 1.6T DSP (Ara,
3nm). Broadcom is attacking with the Sian3/Sian2M 200G-per-lane PHY family.
Credo (CRDO) owns the active electrical cable (AEC) niche and is expanding into
optical DSP. Astera Labs (ALAB) sits adjacent: PCIe/Ethernet retimers and
now AI fabric switches. Semtech (SMTC) and MaxLinear (MXL) supply TIAs, drivers
and LPO-oriented analog front ends.

**G · Passive optics, fibre and packaging.** Suzhou TFC Optical (300394.SZ) in
optical sub-assemblies and packaging; Fabrinet (FN) as the contract optical
packaging house for the Western supply chain; Corning (GLW) in fibre, cable and
optical connectivity; Fujikura (5803.T) in fibre and connectors — the single
best-performing Japanese name in the theme.

**H · Adjacent photonics, not AI-datacom.** IPG Photonics (IPGP), nLIGHT
(LASR), LightPath (LPTH) and Hamamatsu (6965.T) are real photonics companies
whose revenue comes from industrial, defence and scientific markets. They are
included for completeness and explicitly flagged: **they are not AI-interconnect
exposure.** nLIGHT fell 25.6% on 7 Aug 2026 on soft Q3 guidance — a useful
reminder that "photonics" is not one demand curve.

---

## 2. Company-level detail

### Established and profitable

**Lumentum (LITE, Nasdaq).** $890.17, market cap $69.3bn, PE 169 / forward PE
55.7, revenue TTM $2.49bn **+69.0%**. Consensus target $1,104.89 across 25
analysts. The laser-chip franchise: laser-chip volumes doubled year over year
in fiscal Q3, EML shipments hit another record, **200G EML revenue more than
doubled sequentially**, and management guides EML units up >50% by the December
2026 quarter. InP output planned +50% from Q4 2025 to Q4 2026, and its
ultra-high-power CPO laser ramp is on plan — Nvidia has demonstrated a module
with a Lumentum laser inside. **Catalyst: fiscal Q4 results 11 Aug 2026.**
Risk: it is priced as the sole-source bottleneck owner, which is a position
competitors are spending billions to erode.

**Coherent (COHR, NYSE).** $379.13 (+13.4% on 7 Aug alone), market cap
$74.2bn, PE 158 / forward 50.7, revenue TTM $6.60bn +18.0%. Consensus target
$394.62 — the stock has essentially closed its gap to consensus. Fiscal Q3 2026
revenue $1.81bn +21%, with Datacenter & Communications at $1.4bn, **75% of
revenue and +41% year on year**; Q4 guided $1.91–2.05bn. The structural item:
**Nvidia took a $2bn equity stake on 2 March 2026** alongside a multi-year
supply agreement and multi-billion purchase commitment, funding a doubling of
six-inch InP capacity (a quarter ahead of plan) and more than a quadrupling by
end-2027. **Catalyst: fiscal Q4 results 12 Aug 2026.** Risk: three-segment
conglomerate structure means Networking strength is diluted by Materials and
Lasers.

**Fabrinet (FN, NYSE).** $562.38, market cap $20.2bn, PE 48.3 / forward 34.2,
revenue TTM $4.24bn +29.8%. Consensus target $732.44 — the widest positive gap
to price in the whole set (+30%), on only nine covering analysts. Fiscal Q3
revenue $1.214bn +39%, non-GAAP EPS $3.72, fourth consecutive beat. **Nvidia
was 27.6% of fiscal 2025 revenue.** The purest "picks and shovels" position:
Fabrinet does not own the technology, it owns the manufacturing capacity
everyone else needs. Risk: customer concentration cuts both ways, and CPO
adoption could in principle disintermediate pluggable-module assembly.

**Ciena (CIEN, NYSE).** $412.39, market cap $58.4bn, PE 137 / forward 52.9,
revenue TTM $5.57bn +30.6%. Consensus target $565.71 (+37%). The systems and
coherent-optics vendor; with Nokia/Infinera it is one of two Western
full-stack alternatives. Coherent-pluggables share at 800ZR is contested where
400G was effectively an Acacia/Marvell duopoly. Catalyst: Q3 on 3 Sep 2026.

**Broadcom (AVGO, Nasdaq).** $427.76, market cap $2.04tn, PE 71 / forward 27.1,
revenue TTM $75.47bn +32.3%. Target $527.88. Owns the switching ASIC, the CPO
platform (Bailly) and now a credible 200G/lane DSP line (Sian3/Sian2M). The
lowest-purity, highest-quality way to own the theme. Risk: photonics is a
minority of a business dominated by custom AI accelerators and software.

**Marvell (MRVL, Nasdaq).** $218.72, market cap $191.6bn, PE 75.6 / forward
48.2, revenue TTM $8.72bn +34.1%. Target $256.91. **~70% share of optical
DSPs** and first to 1.6T with the 3nm Ara. Two live risks: Broadcom's DSP push,
and reputational damage from the April 2026 cancellation of POET purchase
orders. Catalyst: results 27 Aug 2026.

**Corning (GLW, NYSE).** $165.68, $142.7bn, PE 76.4 / forward 44.8, revenue TTM
$16.96bn +19.4%. Target $191.40. Fibre, cable and optical connectivity into the
same buildout, with a large non-AI ballast (display, automotive).

**Arista (ANET, NYSE).** $188.67, $238.0bn, PE 59.7 / forward 40.7, revenue TTM
$10.54bn +32.6%. Target $238.63. FY2026 guidance raised to ~$12.6bn (+40%).
The demand-side proof point: Arista's order book is a read-through for
transceiver volumes.

**Nvidia (NVDA, Nasdaq).** $223.96, $5.42tn, PE 34.3 / forward 22.4, revenue
TTM $253.5bn +70.7%. Included as the *demand-setter*, not as photonics
exposure: its CPO roadmap, its $2bn into Coherent and its broader ~$4bn optics
programme determine which suppliers get funded.

### Mid-cap operators, real revenue, higher beta

**Credo (CRDO, Nasdaq).** $249.89, $46.6bn, PE 99.6 / forward 40.8, revenue TTM
$1.34bn **+205.7%**, net income $472m. Strong Buy, target $279.29; individual
targets up to $340 (BofA) and $325 (Evercore). FY2027 guidance implies >80%
growth. Owns AECs — the copper answer to short-reach optics — which makes it a
partial *hedge* against the optical thesis rather than a pure expression of it.

**MACOM (MTSI, Nasdaq).** $310.82, $23.7bn, PE 99 / forward 37.7, revenue TTM
$1.16bn +28.4%. Target $401.54 (+29%). Fiscal Q3 EPS $1.40 vs $1.35 consensus;
**Q4 guided $415–425m against $366m consensus** — one of the largest guidance
beats in the group. Analog/RF and optical drivers and TIAs.

**Tower Semiconductor (TSEM, Nasdaq).** $252.49, $28.5bn, PE 99.8 / forward
49.7, revenue TTM $1.71bn +14.9%. Target $321.32. The merchant silicon-photonics
foundry; record Q2 (+24%), Q3 guided $520m, $3bn Japan expansion with $1bn of
government grants. Slowest revenue growth in the high-multiple cohort — the
multiple is on the silicon-photonics option, not the current P&L.

**Applied Optoelectronics (AAOI, Nasdaq).** $135.63, $11.5bn, forward PE 54.0,
revenue TTM $596m +61.8%. Target $158 (+7% — the *narrowest* upside in the
group). Q2 2026 revenue $191.9m **+86%**, fifth consecutive record quarter, and
a return to non-GAAP profitability at $0.06 (vs $0.01 consensus). Q3 guided
$255–290m, ~+130% year on year; FY2026 ~$1.1bn. Order book: >$124m of 800G
from one hyperscaler and a >$200m 1.6T order from another. Concentration:
Microsoft was ~29% of 2025 revenue. **Short interest 21.8% of float (14.4m
shares, up from 12.9m) and beta 3.79** — by a distance the most contested name
in the set. Bear case is straightforward: a ~30% gross-margin manufacturer
priced like a technology franchise.

**Semtech (SMTC, Nasdaq).** $139.42, $13.0bn, unprofitable on a GAAP basis,
forward PE 46.8, revenue TTM $1.09bn +14.2%. Target $205.25 (+47%). The listed
champion of **LPO** — the analog approach that removes the DSP from the module.
If LPO wins share, Semtech gains and Marvell's DSP TAM shrinks.

**MaxLinear (MXL, Nasdaq).** $74.98, $6.8bn, unprofitable, forward PE 32.2,
revenue TTM $569m +50.5%. Target $94.55. Q2 revenue $168.9m +55%. Optical
transceiver SoCs and PAM4 DSPs, from a much smaller base.

**AXT (AXTI, Nasdaq).** $88.58, $5.65bn, revenue TTM $125.5m +45.8%. Target
$91.60 — **essentially at price**, the tightest consensus gap in the set after
a 17.8% single-day move on 7 Aug. InP substrates, doubling capacity by
end-2027. The purest listed expression of the substrate bottleneck, and also
the smallest revenue base carrying a $5.6bn valuation.

### Asia-listed

**Zhongji Innolight (300308.SZ, Shenzhen; 3308.HK, Hong Kong).** ¥919.87,
market cap ¥1.08tn (≈$160bn), PE 68.6, revenue TTM ¥51.06bn **+98.7%**.
Consensus target ¥1,284. Listed H-shares in Hong Kong on 30 July 2026 at
HK$980, raising **HK$53.4bn (~$6.81bn)** — the largest HK IPO since 2019 —
with roughly a quarter earmarked for InP and laser-chip inventory. The global
transceiver leader at ~27% share, and therefore the single most exposed name to
the reported US import restriction.

**Eoptolink (300502.SZ, Shenzhen).** ¥420.95, ¥586.9bn (≈$87bn), PE 54.7,
revenue TTM ¥29.13bn **+151.4%**, up 216% over one year. Consensus target
¥645.32. The fastest grower in the entire universe covered here.

**Suzhou TFC Optical (300394.SZ, Shenzhen).** ¥230.68, ¥251.6bn (≈$37bn), PE
115.9, revenue TTM ¥5.55bn +60.2%. Optical sub-assemblies and optoelectronic
packaging — the passive-component layer.

**Accelink (002281.SZ, Shenzhen).** ¥193.04, ¥159.8bn (≈$24bn), PE 147.4,
revenue TTM ¥12.48bn +35.6%. Chips, devices and modules; state-linked.

**Yuanjie Semiconductor (688498.SH, Shanghai STAR).** ¥1,355.50, ¥168.2bn
(≈$25bn), **PE 472**, revenue TTM ¥872m. DFB/EML laser chips from 2.5G to 200G
plus silicon-photonics light sources and 1550nm lidar. The valuation is the
point: China is paying almost any multiple for domestic laser-chip supply.

**ZTE (000063.SZ, Shenzhen; also 0763.HK).** ¥34.70, ¥154.8bn (≈$23bn), PE
37.7, revenue TTM ¥135.9bn +9.9%. Systems vendor, included because it appears
in some LYTE holdings reporting; low growth relative to the theme.

**Fujikura (5803.T, Tokyo).** ¥5,185, ¥8.59tn (≈$54.5bn), PE 41.6, revenue TTM
¥1.32tn **+27.9%**. Fibre, cable and connector supplier and the standout
Japanese performer of the cycle.

**Sumitomo Electric (5802.T, Tokyo).** ¥2,129.50, ¥6.64tn (≈$42bn), **PE 16.6**
— the cheapest name in this report — revenue TTM ¥5.29tn +12.3%. Optical
devices inside a very large industrial conglomerate: the exposure is real but
heavily diluted.

**Furukawa Electric (5801.T, Tokyo).** ¥3,856, ¥2.71tn (≈$17bn), PE 23.5,
revenue TTM ¥1.38tn +12.9%. Optical solutions and digital-infrastructure
components; same dilution issue, lower multiple than the pure plays.

**Hamamatsu Photonics (6965.T, Tokyo).** ¥2,322.50, ¥671bn (≈$4.3bn), PE 39.7,
revenue TTM ¥229.6bn +9.9%, and fell 7.3% on 7 Aug. Photodetectors and
opto-semiconductors for scientific and medical markets — **not AI datacom.**

**LandMark Optoelectronics (3081.TWO, Taipei Exchange).** TWD 2,305, TWD
234.6bn (≈$7.3bn), **PE 333**, revenue TTM TWD 2.65bn **+98.1%**, stock +555%
over one year. Consensus target TWD 2,425 (+5%). EML, DFB and APD epiwafers —
upstream of the EML shortage.

**LuxNet (4979.TWO, Taipei Exchange).** TWD 488, TWD 68.8bn (≈$2.1bn), PE 90.1,
revenue TTM TWD 4.51bn +16.8%. Laser and photodiode components. The growth rate
does not match the multiple — the weakest fundamental case among the Asian
laser names.

### Adjacent photonics (explicitly not AI-interconnect)

**IPG Photonics (IPGP)** $90.23, $3.84bn, revenue $1.07bn +13.0%, target
$128.07 — industrial fibre lasers; acquiring Lumibird Medical for €300m.
**nLIGHT (LASR)** $56.16 after a **−25.6%** day, $3.17bn, revenue $310.7m
+43.2%, target $88.86 — directed-energy and defence lasers; $627m Joint Laser
Weapon System award, but Q3 guided below consensus on China supply delays.
**LightPath (LPTH)** $13.06, $867m, revenue $62.8m +86.7% — infrared optics for
defence and counter-UAS; divesting China operations for $4.5m.

### The speculative end

**POET Technologies (POET, Nasdaq/TSXV).** $8.91, $1.54bn, revenue TTM **$1.41m**
against an $81.7m net loss, 52-week range $3.87–$20.81. Optical interposer
platform; management targets >30,000 optical engines in 2026 with 800G
high-volume production from Q3 2026. In late April 2026 the stock fell ~50%
when **Marvell cancelled major purchase orders** citing confidentiality
concerns; shareholder suits followed. It has since recovered and secured a
$400m investment. A $1.5bn valuation on ~$1.4m of revenue is option value, not
a business — size accordingly. **Catalyst: results 12 Aug 2026.**

---

## 3. Astera Labs (ALAB) in depth

**Price and valuation.** $334.17, market cap $57.97bn, PE 164.6, forward PE
59.6, revenue TTM $1.20bn **+98.5%**, net income $369.5m +268.9%. 52-week range
$97.89–$499.48 — the stock is roughly **33% below its high**. Consensus target
$383.24 across 26 analysts (+15%), with recent targets spanning $375–$500.

**Q2 2026 (reported 4 Aug 2026).** Record revenue **$392.4m, +104% year on
year and +27% sequentially**. GAAP diluted EPS $0.83; non-GAAP $0.80 against
$0.69 consensus (+15.6%). Cash and marketable securities ~$1.25–1.3bn.

**Q3 2026 guidance.** Revenue **$540–560m** — roughly **+40% sequentially** and
far above the ~$417m consensus going in. Non-GAAP gross margin ~72%, operating
margin ~43%, non-GAAP EPS $1.16–1.21. Gross margin at 72% while growing 100%+
is the number that separates ALAB from every optical-module name in this
report.

**Product lines.**
- **Aries** — PCIe/CXL smart retimers and smart cable modules. The original
  franchise; preserves signal integrity inside AI servers and is the incumbent
  standard in most GPU trays.
- **Taurus** — Ethernet smart cable modules for 200G/400G/800G links, the
  copper-cable analogue to short-reach optics.
- **Scorpio** — AI fabric switches. **X-Series** (up to 320-lane smart fabric
  switch) is purpose-built for scale-up GPU-to-GPU fabrics; **P-Series** spans
  32 to 320 lanes for scale-out/head-node connectivity. Scorpio X entered
  **volume production in Q2 and is guided to become the largest product family
  by revenue in Q3 — ahead of schedule.** Management sizes the fabric-switch
  opportunity at >$10bn.

**Customer concentration.** The central risk. Reported disclosures indicate one
customer exceeded **70% of revenue in 2025**, and the Q1 2026 10-Q described
five customers each at ≥12% of revenue, concentrated in Taiwan, Singapore and
China (ship-to geography, i.e. ODMs, not end customers). *I was unable to
retrieve the exact Q2 2026 10-Q concentration table — SEC EDGAR blocked
automated retrieval. Treat the specific percentages as approximate and verify
against the filed 10-Q before relying on them.*

**Valuation versus the photonics peer set.** At 59.6x forward earnings ALAB is
priced above Coherent (50.7x), Lumentum (55.7x) and Ciena (52.9x), and above
Credo (40.8x) and MACOM (37.7x) — while growing faster than any of them and at
roughly double their gross margin. The comparison that actually matters is not
against optics companies at all: it is against Marvell (48.2x forward) and
Broadcom (27.1x), which compete for the same silicon budget with far more
diversified revenue.

**Bull case (as reported by sell side).** Scorpio X pulling forward means the
scale-up fabric TAM starts converting to revenue in 2026 rather than 2027.
ALAB is the primary silicon enabler of **UALink**, the industry's only credible
alternative to Nvidia's NVLink, so it wins if the anti-Nvidia coalition gains
ground — and it also supplies semi-custom connectivity into Nvidia platforms,
so it participates if Nvidia keeps winning. Bulls model the full >$10bn
scale-up TAM against AWS Trainium and AMD MI-series ramps.

**Bear case.** Valuation is the first argument: multiple firms have downgraded
on it, including Northland to Market Perform, and one widely-read note argued
the stock "re-entered the bubble phase". The structural arguments: extreme
customer concentration; a Scorpio X ramp that must execute on schedule or the
guidance breaks; UALink adoption risk if the ecosystem consolidates around
NVLink Fusion; and the fact that Astera's Aries/Taurus base is a *copper*
franchise, which the same optical thesis that lifts Lumentum quietly erodes.
Insider selling under Rule 10b5-1 plans has been a recurring pressure point and
contributed to a 16.3% drawdown earlier in the year.

---

## 4. Competitive and supply-chain map

**Direct competition.**
- *Module makers:* Zhongji Innolight vs Eoptolink vs Accelink vs Applied
  Optoelectronics vs Coherent vs Lumentum. This is the crowded layer, and the
  one where the price war eventually happens.
- *Optical DSPs:* Marvell (~70% share) vs Broadcom (Sian3/Sian2M) vs Credo vs
  MaxLinear. Semtech attacks the whole category sideways with LPO, which
  removes the DSP.
- *Silicon-photonics manufacturing:* Tower Semiconductor vs TSMC (COUPE) vs
  in-house capability at Coherent and Lumentum. POET is trying to enter with a
  different architecture.
- *InP substrates:* AXT vs Coherent's internal capacity vs Chinese entrants.
- *Switching:* Broadcom vs Nvidia vs Arista (system) vs Cisco.

**Complementarity — who needs whom.**
- Lumentum and Coherent sell **EML lasers into** the modules that Innolight,
  Eoptolink and AAOI assemble. Chinese module makers are therefore *customers*
  of the Western laser names, not only competitors. An import ban does not sever
  that relationship symmetrically — which is why "US names win, China names
  lose" is too simple.
- AXT and Coherent sell **InP substrates into** Lumentum, Yuanjie, LandMark and
  LuxNet, which sell **laser chips into** module makers, which sell modules to
  Arista, Ciena and the hyperscalers.
- Marvell/Broadcom/Credo DSPs are **paired with** optical modules — one DSP per
  module. DSP unit volume and module unit volume are the same number.
- Astera Labs' retimers and AECs are **substitutes** for short-reach optics
  inside the rack and **complements** to optics between racks.
- Fabrinet **manufactures for** Lumentum, Ciena, Nvidia and others: it is long
  the whole Western chain regardless of who wins.

**Which capex cycle drives which names.** Combined 2026 capex guidance across
Amazon (~$200bn), Alphabet ($175–185bn), Meta ($125–145bn) and Microsoft
($110–120bn) is being tallied at roughly **$690–725bn, up ~77% year on year**,
with roughly 75% AI-related. The mapping is not uniform:
- *Scale-out Ethernet fabrics* (Meta, Microsoft, Amazon) → transceivers, DSPs,
  switch ASICs → Innolight, Eoptolink, AAOI, Coherent, Lumentum, Marvell,
  Broadcom, Arista.
- *Scale-up GPU fabrics* (Nvidia rack architectures, AWS Trainium, AMD MI) →
  retimers, AECs, fabric switches → Astera Labs, Credo, Broadcom.
- *Data-centre interconnect between campuses* → coherent pluggables (800ZR,
  1600ZR from 2027) → Ciena, Nokia/Infinera, Marvell, Cisco/Acacia, Fabrinet.
- *Nvidia's own supply security* → direct investment into components: $2bn into
  Coherent, laser capacity lockups reported to push rivals' availability past
  2027.

---

## 5. The macro thesis, and what breaks it

**Why optics is called the bottleneck.** Electrical signalling over copper
degrades sharply with distance at 200G per lane; practical reach falls below
roughly one metre. As clusters grow from 72-GPU single racks to 576+ GPU
multi-rack domains, an increasing share of links exceeds copper's reach. Nvidia's
public roadmap makes the transition explicit: Vera Rubin Ultra (H2 2027) keeps
copper in-rack with CPO out-of-rack; **Feynman (2028)** introduces NVLink
switches with co-packaged optics and native optical scale-up to NVL1152. Jensen
Huang has said Nvidia will offer both copper and optical for Rubin and Feynman —
which is a roadmap statement *and* a hedge.

**Market size being cited.** LightCounting puts the optical-transceiver market
at **$16.5bn in 2025 → ~$26bn in 2026 (~+60%)** and has floated **~$100bn of
annual AI-cluster optical interconnect sales by 2030**. Unit data: >24m
800G+ transceivers shipped in 2025, ~63m projected for 2026 (2.6x); 800G+ rises
from 19.5% of shipments in 2024 to >60% in 2026; >5m 1.6T units expected to
ship in 2026. TrendForce separately sizes the 2026 AI optical transceiver market
at ~$26bn and names component shortages — not demand — as the binding
constraint. *These are vendor and analyst-house forecasts on a fast-moving
theme; the 2030 numbers in particular span $9bn to $100bn depending on
definition. Treat the range, not the point estimate.*

**What breaks the thesis.**

1. **Copper does not roll over.** Copper remains dominant for ultra-short reach
   inside racks through at least 2028 on cost and power. Every quarter that
   in-rack copper holds is a quarter of deferred optical TAM — and directly
   benefits Credo's AECs and Astera's Aries/Taurus at the expense of the module
   makers.
2. **Capex slowdown.** The whole thesis is a derivative of ~$700bn of
   hyperscaler spending. Alphabet's July 2026 results already triggered a
   sector sell-off on capex scrutiny. At these multiples the names in §2 do not
   need a spending decline to de-rate — a decline in the *growth rate* suffices.
3. **Overcapacity and price compression.** 800G output is currently estimated
   40–60% below demand through 2027, which is exactly the condition that
   produces overbuilding. 100G module ASPs fell ~60% over five years. The
   financial turn comes earlier than the physical one: margins compress as soon
   as price declines outrun cost declines, and double-ordering unwinds. **This
   is the most underpriced risk in the set.**
4. **China-listed geopolitical risk.** The FCC is reported to be drafting a ban
   on imports of new-model Chinese optical transceivers, targeted to take effect
   before end-2026, on data-security grounds. Estimates suggest such a ban would
   remove around **60% of US AI data-centre module supply**, with Zhongji
   Innolight (~27% global share) hit hardest. **The proposal is unpublished; the
   FCC may revise or abandon it; Innolight, Eoptolink and TFC have all said they
   cannot verify it.** Two second-order effects are worth holding: Western
   replacement capacity still depends on Chinese indium, and China has said it
   will respond if necessary.
5. **Technology-path risk within the winners.** LPO (Semtech's bet) removes the
   DSP; CPO (Broadcom/Nvidia) removes the pluggable module; both are additive to
   the theme but redistribute the profit pool violently between the names
   listed here. Owning "optics" does not protect you from picking the wrong
   architecture.
6. **Single-customer dependency.** Nvidia is 27.6% of Fabrinet; Microsoft was
   ~29% of AAOI; one customer exceeded 70% of Astera Labs' 2025 revenue. These
   are not diversified businesses.

---

## 6. Valuation context and where sentiment diverges

Full figures are in the table below. The divergences worth flagging:

- **Consensus has run out of room on Coherent (+4% to target) and AXT (+3%)**
  after outsized single-day moves on 7 August (COHR +13.4%, AXTI +17.8%). Both
  moved on the reported FCC ban story rather than on company news. Where price
  has already met the target on a *headline*, the risk skew is unfavourable.
- **The widest positive gaps are Fabrinet (+30%), Ciena (+37%), Semtech (+47%)
  and IPG (+42%).** Fabrinet's is covered by only nine analysts; Semtech and IPG
  are both unprofitable or low-growth, so the gap partly reflects targets that
  have not been marked down.
- **AAOI carries 21.8% short interest and a 3.79 beta against a target only 7%
  above price.** That is the clearest sentiment split in the report: the sell
  side is neutral, the shorts are positioned, and the stock is up ~790% on
  market cap. Short interest *rose* into the record quarter (12.9m → 14.4m
  shares).
- **Astera Labs trades ~33% below its 52-week high** while guiding to +40%
  sequential growth. Insider selling under 10b5-1 plans has been a repeated
  narrative pressure point, and at least one firm has downgraded purely on
  valuation. Consensus ($383) sits between the recent downgrade cluster and
  the $500 bull targets — genuinely unsettled.
- **Multiple dispersion inside the Asian set is extreme:** Sumitomo Electric at
  16.6x, ZTE at 37.7x, Zhongji Innolight at 68.6x, Suzhou TFC at 115.9x,
  Accelink at 147.4x, LandMark at 333x, Yuanjie at 472x. The dispersion is a
  purity premium, not a growth premium — Yuanjie's revenue is ¥872m against a
  ¥168bn market cap.
- **nLIGHT −25.6% in a day and Hamamatsu −7.3%** on the same day the datacom
  names rallied double digits. Confirmation that "photonics" as a label spans at
  least two uncorrelated demand cycles.

### Risk grouping

- **Established / profitable:** AVGO, NVDA, MRVL, ANET, GLW, CIEN, COHR, LITE,
  FN, MTSI, TSEM, CRDO, ALAB, Sumitomo, Furukawa, Fujikura, ZTE, Hamamatsu,
  Zhongji Innolight, Eoptolink, Accelink.
- **Higher variance, real revenue:** AAOI, SMTC, MXL, AXTI, Suzhou TFC, LuxNet,
  LandMark, IPGP, LASR, LPTH.
- **Early-stage / speculative:** POET, Yuanjie (on multiple, not on stage).

---

## 7. Comparison table

Market data 7 Aug 2026 close. USD equivalents at assumed FX (USD/CNY 6.7372,
USD/JPY 157.65, USD/TWD ≈32.25) — approximate.

| Ticker | Exchange / ccy | Role in the value chain | Market cap | Biggest risk |
| --- | --- | --- | --- | --- |
| LITE | Nasdaq / USD | EML & CPO lasers; modules | $69.3bn | Priced as sole-source; rivals funding capacity hard |
| COHR | NYSE / USD | Lasers, InP substrates, modules; Nvidia-backed | $74.2bn | Consensus target already met; conglomerate dilution |
| FN | NYSE / USD | Contract optical packaging for the Western chain | $20.2bn | Nvidia 27.6% of revenue; CPO could bypass pluggables |
| CIEN | NYSE / USD | Coherent optical systems & DCI | $58.4bn | 800ZR share contested; telco capex cyclicality |
| AAOI | Nasdaq / USD | Transceiver manufacturer (US-listed) | $11.5bn | 21.8% short interest; ~30% GM priced as a franchise |
| CRDO | Nasdaq / USD | AECs, SerDes, optical DSP | $46.6bn | AEC franchise is the *copper* side of the thesis |
| ALAB | Nasdaq / USD | PCIe retimers, AECs, AI fabric switches | $58.0bn | One customer >70% of 2025 revenue; Scorpio X execution |
| MRVL | Nasdaq / USD | ~70% of optical DSPs; custom AI silicon | $191.6bn | Broadcom DSP attack; LPO removes the DSP entirely |
| AVGO | Nasdaq / USD | Switch ASICs, CPO (Bailly), 200G/lane DSP | $2.04tn | Photonics is a minority of the story; AI-capex beta |
| NVDA | Nasdaq / USD | CPO switches; sets the whole demand curve | $5.42tn | Not photonics exposure — it is the customer |
| ANET | NYSE / USD | Switching systems; transceiver demand proxy | $238.0bn | Hyperscaler concentration; white-box competition |
| GLW | NYSE / USD | Fibre, cable, optical connectivity | $142.7bn | Large non-AI ballast dilutes the theme |
| MTSI | Nasdaq / USD | Analog/RF, optical drivers & TIAs | $23.7bn | 99x trailing PE on 28% growth |
| TSEM | Nasdaq / USD | Merchant silicon-photonics foundry | $28.5bn | Slowest growth (+14.9%) in the high-multiple cohort |
| SMTC | Nasdaq / USD | LPO analog front ends, TIAs, drivers | $13.0bn | Unprofitable; thesis depends on LPO winning |
| MXL | Nasdaq / USD | Transceiver SoCs, PAM4 DSPs | $6.8bn | Unprofitable; sub-scale against MRVL/AVGO |
| AXTI | Nasdaq / USD | Indium phosphide substrates | $5.65bn | Target at price; $125m revenue vs $5.6bn cap |
| POET | Nasdaq / TSXV / USD | Optical interposer / PIC platform | $1.54bn | $1.4m revenue; Marvell PO cancellation; litigation |
| IPGP | Nasdaq / USD | Industrial fibre lasers (adjacent) | $3.84bn | Not AI-datacom; industrial cycle |
| LASR | Nasdaq / USD | Defence & directed-energy lasers (adjacent) | $3.17bn | −25.6% on guidance; China supply delays |
| LPTH | Nasdaq / USD | Infrared optics for defence (adjacent) | $867m | Not AI-datacom; micro-cap; China divestment |
| 300308 | Shenzhen (+3308.HK) / CNY | Global #1 transceiver maker (~27% share) | ¥1.08tn (≈$160bn) | Most exposed name to the reported US import ban |
| 300502 | Shenzhen / CNY | Transceivers; fastest grower (+151%) | ¥587bn (≈$87bn) | Same ban exposure; +216% in 12 months |
| 300394 | Shenzhen / CNY | Optical sub-assemblies & packaging | ¥252bn (≈$37bn) | 116x PE; passive-component commoditisation |
| 002281 | Shenzhen / CNY | Chips, devices and modules | ¥160bn (≈$24bn) | 147x PE on 36% growth; state-linked |
| 688498 | Shanghai STAR / CNY | DFB/EML laser chips, SiPh light sources | ¥168bn (≈$25bn) | 472x PE on ¥872m of revenue |
| 000063 | Shenzhen (+0763.HK) / CNY | Systems vendor | ¥155bn (≈$23bn) | +9.9% growth — barely a theme name |
| 5803 | Tokyo / JPY | Fibre, cable, connectors | ¥8.59tn (≈$54.5bn) | Priced for the cycle after a large re-rate |
| 5802 | Tokyo / JPY | Optical devices inside a conglomerate | ¥6.64tn (≈$42bn) | Exposure heavily diluted; 12% growth |
| 5801 | Tokyo / JPY | Optical solutions, digital infrastructure | ¥2.71tn (≈$17bn) | Same dilution; conglomerate discount is deserved |
| 6965 | Tokyo / JPY | Photodetectors, opto-semis (adjacent) | ¥671bn (≈$4.3bn) | Scientific/medical, not datacom; −7.3% on 7 Aug |
| 3081 | Taipei Exch. / TWD | EML/DFB/APD epiwafers | TWD 235bn (≈$7.3bn) | 333x PE; +555% in 12 months; target only +5% |
| 4979 | Taipei Exch. / TWD | Laser & photodiode components | TWD 68.8bn (≈$2.1bn) | 90x PE on 16.8% growth — worst multiple/growth fit |

Not covered with market data, mentioned for completeness: **Nokia** (owns
Infinera since Feb 2025, ~$2.3bn — the second Western full-stack optical
vendor), **Cisco** (owns Acacia — coherent DSP incumbent at 400G), **TSMC**
(COUPE silicon-photonics platform for Nvidia and Broadcom). Not investable
directly: Ayar Labs, Lightmatter, Celestial AI (all private).

---

## Sources

ETF & fund materials: Roundhill Investments LYTE fund page (holdings as of
06/08/2026); Cboe BZX listing page; Robinhood and KuCoin holdings snapshots
(secondary, approximate).

Company disclosures & IR: Astera Labs Q2 2026 release and earnings call
(4 Aug 2026); Applied Optoelectronics Q2 2026 release and call (6 Aug 2026);
Coherent fiscal Q3 2026 release and 8-K on the Nvidia investment (2 Mar 2026);
Fabrinet fiscal Q3 2026 release and FY2025 10-K; Lumentum fiscal Q3 2026
commentary; MACOM fiscal Q3 2026; Tower Semiconductor Q2 2026.

News & specialist press: Reuters/Bloomberg on the FCC draft ban (4–5 Aug 2026);
TechNode on Chinese module makers' responses (5 Aug 2026); Network World;
TrendForce / LEDinside on the InP substrate bottleneck and the Innolight HK
IPO; LightCounting market forecasts (Jan/Mar/Apr 2026); Cignal AI on the
coherent DSP supply chain (Apr 2026); IDTechEx and DigiTimes on CPO; IEEE
Spectrum and The Register on NVLink optics; HPCwire/AIwire on the Nvidia
GTC 2026 roadmap; SemiEngineering; China Daily HK on the Innolight listing.

Market data: stockanalysis.com company and quote pages (7 Aug 2026 close) for
price, market cap, PE, forward PE, TTM revenue and growth, and consensus
targets; TradingEconomics for USD/JPY and USD/CNY.

**Not investment advice.** Informational research only. Verify every figure
against primary filings before acting.
