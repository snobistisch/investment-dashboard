# Crypto research index — the themes, and what is wired versus written

**Date:** 13 August 2026. This document exists because the crypto research grew
into eight separate files before it had an organising structure. It does not
add new findings — it maps what already exists onto the themes the research
actually settled on, states which theme has a live ranking on the Assets tab
and which is a research note without one yet, and says where each of the
eight files sits.

**How the themes were derived.** Not chosen in advance. The Assets tab
(`public/dashboards/crypto.html`) already tags each of its 40 ranked assets
with a category, assigned while building the expected-value ranking over
several sessions. Counting those tags is the most objective theme boundary
available, because it was set by what the assets actually are, not by what a
taxonomy should look like:

| Theme (live filter label) | Assets on the tab | Category tag |
| --- | ---: | --- |
| Settlement | 5 | `settle` |
| Exchanges | 5 | `perp` |
| DeFi & stablecoins | 7 | `defi` |
| Middleware & oracles | 3 | `infra` |
| New layer ones | 3 | `newl1` |
| Privacy & Verifiable Compute | 12 | `zk` |
| GPU & DePIN | 5 | `compute` |

Two of those seven are now renamed from their original labels — `perp` was
"Trading venues", `zk` was "Verifiable compute" — to match the vocabulary this
research actually uses elsewhere and what was asked for directly: **privacy
(ZK)** and **decentralised exchanges**. The renaming is cosmetic; the
underlying 40-asset ranking and its expected-value model are unchanged.

An eighth axis — **venture capital research** — is not an asset theme at all.
It answers a different question (who funds these themes, not which asset
within a theme to hold) and now has its own tab rather than a filter inside
Assets.

---

## 1. Settlement & Money

**What it is.** The base layer: general-purpose settlement (BTC, ETH, SOL,
NEAR) and settlement with privacy as the product (ZEC). Five of forty ranked
assets, and the only theme where the source research and this dashboard's
own numbers mostly agree — Ethereum is the one asset that clears the bitcoin
hurdle risk-adjusted.

**A flagged sub-theme inside it: New Layer Ones** (Monad, Plasma, MegaETH).
These are new settlement candidates rather than proven ones, and the research
found a genuine unresolved tension here — see §2 of
[crypto-universe-map.md](crypto-universe-map.md) and §4 of the Assets tab
itself — between the float rule (they carry the worst FDV-to-cap ratios in
the report) and the rotation argument (capital moves to what has not yet been
extracted). Kept as a separate filter rather than merged into Settlement
because that tension is the point.

**Status:** live, ranked, on the Assets tab. **Primary source:**
[crypto-tracker-research.md](crypto-tracker-research.md).

---

## 2. Privacy & Verifiable Compute (ZK / FHE)

**What it is.** The largest single theme on the Assets tab — 12 of 40 ranked
assets, more than double any other category. Zero-knowledge proving (Succinct,
Lagrange), FHE (Zama), private execution (Aztec, Nillion, Arcium), and the
proof-of-useful-work fringe (Nockchain, Pearl). This is where "privacy (ZK)"
as a category concentrates almost entirely; Zcash, the other obvious privacy
name, sits in Settlement instead because it is privacy-as-money rather than
privacy-as-compute-infrastructure — a distinction worth keeping rather than
flattening into one "privacy" bucket.

**Where it connects to VC research.** cyber•Fund's entire thesis — the
"cybernetic economy" of ZK, FHE and verifiable compute — runs through this
theme, and its portfolio includes **=nil; Foundation**, one of the four names
this research flags as genuinely private rather than merely under-covered.
See [crypto-vc-research.md](crypto-vc-research.md) §5.

**Status:** live, ranked, on the Assets tab. **Primary source:**
[crypto-tracker-research.md](crypto-tracker-research.md). **Deeper
architecture context:** [crypto-hooks-mev-research.md](crypto-hooks-mev-research.md)
covers the ZK-proving layer (Boundless, Succinct) as infrastructure for
exchanges, not only as standalone assets.

---

## 3. DeFi

**What it is.** Lending, stablecoins and yield — 7 of 40 ranked assets (Aave,
Maple/Syrup, Sky, Ethena, Ondo, Cap, Superform). This is also the theme with
the most work done *beyond* the ranked 40: the fee-and-holders-revenue screen
in [crypto-screen-candidates.md](crypto-screen-candidates.md) tested 177
protocols against three mechanical gates and surfaced five names worth actual
diligence that are not on the Assets tab — **CAKE, CVX, EUL, FLUID, ETHFI**.
That screen is also where the project's most-reused method came from:
DefiLlama's `dailyHoldersRevenue`, the field that separates what a protocol
earns from what a token holder actually receives. Compound is the clearest
example the screen produced — $1.22bn of TVL, 100% float, and zero dollars to
the token — and every theme below inherits that same holders-revenue check.

**Status:** live, ranked, on the Assets tab (7 assets); a wider unranked
screen exists alongside it. **Primary sources:**
[crypto-tracker-research.md](crypto-tracker-research.md) and
[crypto-screen-candidates.md](crypto-screen-candidates.md).

---

## 4. Exchanges & Market Structure

**What it is.** The theme with the largest gap between what is ranked and
what has been researched. The Assets tab carries 5 names under "Exchanges"
(Hyperliquid, Lighter, Jupiter, Aster, Uniswap) — but
[crypto-hooks-mev-research.md](crypto-hooks-mev-research.md) goes fifty-one
tokens deep into the market-structure layer underneath them: 22 programmable
AMM/hooks tokens and 29 MEV/orderflow tokens, more than double the count of
any other single research file in this project.

**The finding worth carrying forward.** MEV mostly cannot be monetised
through a token, and that is structural rather than a tokenomics failure —
Jito earns $205m and pays holders $0, CoW $41m and $0, because well-designed
MEV mitigation returns the value to the *user*. Chainlink, at 92% fee capture,
is the counter-example: it sells MEV-adjacent services (SVR) rather than
removing MEV, and that is why it captures value where CoW and Jito do not.
Bunni's exploit — audited twice, drained anyway, because a hook sits between
the pool and every swap — is the risk this theme carries that none of the
others do.

**Status:** 5 ranked on the Assets tab; 51 researched and unranked in the
dedicated file. This is the strongest candidate for the next ranking pass,
given it is already the deepest research file in the project.
**Primary source:** [crypto-hooks-mev-research.md](crypto-hooks-mev-research.md).

---

## 5. Compute & DePIN

**What it is.** Decentralised physical infrastructure with a working product
today rather than a roadmap — GPU marketplaces (Akash, Aethir, Nosana),
AI-agent infrastructure (Virtuals) and the subnet economy (Bittensor). 5 of 40
ranked assets. The distinguishing test applied throughout: does the protocol
have paying customers now, as opposed to a narrative about future demand —
which is also the test that separates this theme from Privacy &
Verifiable Compute, where most of the twelve assets are pre-revenue options.

**Status:** live, ranked, on the Assets tab. **Primary source:**
[crypto-tracker-research.md](crypto-tracker-research.md).

---

## 6. Middleware & Oracles

**What it is.** Chainlink, EigenCloud, Lido — infrastructure that other
themes depend on rather than a theme end-users transact in directly. Small by
count (3 of 40) but load-bearing: Chainlink is the single best-performing
name in the entire MEV analysis (§4) on a fee-capture basis, and Lido's fee
line is larger than every DeFi name except Aave.

**Status:** live, ranked, on the Assets tab. **Primary source:**
[crypto-tracker-research.md](crypto-tracker-research.md).

---

## 7. Base — cross-cutting, not yet ranked

**What it is.** Not an asset theme but a distribution lens across all seven
above: 40 tokens identified as Base-native or Base-heavy in
[crypto-universe-map.md](crypto-universe-map.md) §1, spanning DeFi (Morpho,
Aerodrome), exchanges (Aerodrome again, in its AMM role), compute-adjacent AI
agents (Virtuals, Clanker) and social (Zora, Farcaster). The reason it
matters as its own line of research rather than folding into the other six:
Coinbase Ventures is the single most frequent co-investor for **both** Haun
Ventures and Paradigm — 46% and 35% of their respective rounds (§4 of the VC
research) — which means a meaningful share of what those funds hold sits
inside this same distribution channel.

**Status:** research note only, no ranking. This is the explicitly
outstanding second half of the Hooks & MEV research and the next logical
ranking pass. **Primary source:** [crypto-universe-map.md](crypto-universe-map.md) §1.

---

## 8. Venture Capital Research — a different axis

**What it is.** Not which asset to hold — who funds the people building it,
and whether that fund's own behaviour (lead rate, cycle timing, realised
exits) is a better signal than its reputation. Built because market-data
sources for this (DefiLlama's raises endpoint, Crunchbase, RootData) are
paywalled or key-gated; the working route was scraping
crypto-fundraising.info directly — 5,868 of 6,407 rounds recovered, 7,655
distinct investors indexed.

**Two funds profiled in full: Haun Ventures and Paradigm.** The finding that
matters most: they invested in the same round seven times (Conduit, Euler
Finance, Exponential, Farcaster, Fireblocks, Liquid, TaxBit), despite sitting
at opposite ends of a third-party tier list — one unranked, one top-tier.
Whatever separates them is not deal access.

**Status:** now a live tab (`crypto-vc.html`), not a filter inside Assets —
correctly, since VC firms are not investable assets to rank by expected
value. **Primary sources:** [crypto-vc-research.md](crypto-vc-research.md)
(qualitative fund landscape), [crypto-vc-haun-ventures.md](crypto-vc-haun-ventures.md)
and [crypto-vc-paradigm.md](crypto-vc-paradigm.md) (the two full fund
profiles), [crypto-vc-database-plan.md](crypto-vc-database-plan.md) (source
audit and method).

---

## What this index does not do

It does not re-rank anything, and it does not resolve the two biggest open
questions in the whole body of crypto research: whether the float rule or the
rotation argument is right about New Layer Ones (§1), and whether Exchanges &
Market Structure deserves its own ranked tab given it is already the deepest
research file in the project (§4). Both are next-step candidates, not
decisions made here.

**Not investment advice.** This index summarises prior research; it does not
add new data and carries the same caveats as each source file it points to.
