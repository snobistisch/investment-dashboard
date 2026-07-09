# Crypto Tab — Five-Asset Research Notes (ZEC · NOCK · PRL · ETH · LIT)

Research base for the Digital Assets tab. Supersedes the quantum-resistance screen
in [crypto_deep_dive.md](crypto_deep_dive.md) as tab content (ZEC and ETH carry
over; ALGO/STRK/QRL rotate out of the tab but the screen doc is retained).
All web claims re-verified July 9, 2026. Working theses supplied by Matthias were
treated as hypotheses to stress-test, not conclusions to confirm.

## Market snapshot — CoinGecko API, single pull, July 9, 2026

| Asset | Price | Mkt cap | FDV | Circ / max supply | ATH (date) | From ATH |
|---|---|---|---|---|---|---|
| ZEC | $484.65 | $8.14B | $8.14B | 16.79M / 21M | $750 cycle high (Nov 2025)¹ | −35% vs cycle high |
| NOCK | $0.0206 | $45.9M | $88.6M | 2.22B / 4.29B (2³²) | $0.210 (Oct 17, 2025) | −90.2% |
| PRL | $0.4497 | $108.4M | $944M | 241M / 2.1B | $0.869 (Jun 1, 2026) | −48.2% |
| ETH | $1,747.40 | $210.9B | — | 120.68M / uncapped | $4,946 (Aug 24, 2025) | −64.7% |
| LIT | $2.34 | $588M | $2.35B | 250M / 1B | $7.86 (Dec 30, 2025, TGE-day) | −69.9% |
| HYPE (comp) | $66.96 | $14.9B | $64.0B | 222M / 1B | $76.70 (Jun 16, 2026) | −12.7% |

¹ CoinGecko's listed ZEC ATH ($3,191.93, Oct 2016) is the launch-week
low-liquidity artifact; the relevant modern reference is the ~$750 November
2025 cycle high (bitcoinfoundation.org, search-corroborated).

Macro tape: BTC started 2026 near $87.5K and broke below $70K (CNBC Jun 3,
2026; bravenewcoin); treasury-company mNAV compression (Strategy ~1.16x by
spring 2026 per Coinstack), Strategy's first BTC sale since Dec 2022 (32 BTC,
8-K, June 1, 2026 per crypto press), smaller DATs exiting (CryptoTimes Jul 2).

## ZEC — Zcash

**Thesis test result.** Pillar 1 (privacy) has hard on-chain support. Pillar 2
(quantum) is real but two-sided (see crypto_deep_dive.md §4 — unchanged).
Pillar 3 (Saylor/rotation) is *directionally* supported — the feud is public and
the BTC treasury model is visibly cracking — but no flow-level evidence ties BTC
outflows to ZEC inflows; downgraded to "narrative tailwind, causality unproven."

- Shielded pool 11% → ~30% of supply in one year; Orchard pool 4.2M ZEC
  (25.4% of supply) absorbed nearly all growth. Sources: crypto.news
  ("Why 30% of Zcash supply is now in the shielded pool"), Delphi Digital on X,
  The Block (earlier 23% checkpoint), Blockworks/zcashtracker dashboards.
  A claimed 59.3% shielded-tx-adoption ATH (Feb 2026) collides numerically with
  Binance Research's +59.3% sector stat — treated as suspect, excluded.
- SEC closed its Zcash Foundation probe ("In the Matter of Certain Crypto Asset
  Offerings," SF-04569; subpoena Aug 31, 2023) with no enforcement action,
  disclosed Jan 14, 2026; ZEC +10–14%. Source: crypto.news (fetched directly).
  Some May-2026 headlines re-attribute the six-month high (~$646.80) to this;
  the May move is better attributed to the PQ-roadmap/Binance-narrative rally.
- Cypherpunk Technologies (Winklevoss-backed, CYPH): 314,185.70 ZEC ≈ 1.88% of
  circulating supply (Q1 2026 results, PRNewswire), target 5% of supply; seeded
  by $58.88M placement led by Winklevoss Capital (Oct 2025); Q1'26 net loss
  $77.2M on ZEC's $508→$240 quarter; CYPH stock −40% on the June 2026
  counterfeit-bug disclosure (Decrypt).
- Saylor/rotation: Saylor publicly opposes Zcash-style privacy for Bitcoin
  (shutdown-risk argument; debate with Zcash founding scientist Eli Ben-Sasson —
  CryptoBriefing, CoinCentral); Arthur Hayes floated ZEC at 1/5 of BTC's cap
  (CoinDesk Nov 2025 privacy-revival piece); Reliance Global (Nasdaq) converted
  its treasury to ZEC Nov 25, 2025.
- Catalysts: Ironwood/NU7 mainnet expected late July 2026 (~Jul 21): ZIP 2005
  quantum-recoverable note format, seals legacy Orchard pool, formal
  verification (CryptoTimes Jul 9; crypto_deep_dive.md sources). Tachyon
  scalability program follows (throughput/block-time numbers circulating are
  single-source — not carried into the tab). Grayscale ETF filing (Nov 2025)
  pending.
- Risks: entire ECC dev team resigned Jan 7, 2026 over Bootstrap governance
  clash (CoinDesk Jan 8; The Block — team forming a new company); June 2026
  counterfeit-vulnerability patch; HNDL exposure is permanent for already-
  recorded data; Q1 2026 drawdown −53%; $1.35B futures volume = leverage froth.

## NOCK — Nockchain

**Thesis test result.** The "unit of account for a verifiable-compute market"
is the whitepaper's stated design (Logan Allen & Justin Murphy, "Nockchain: A
Distributed Market for Verifiable Computation," nockchain.org/nockchain.pdf) —
but today the proof market is *internal*: miners' STARK proofs secure the chain;
no verified evidence of external paid demand for proofs yet. Venture-style bet.

- Mechanics: ZK-PoW — miners compete in "proofpower" by generating STARK proofs
  over the NockVM; NockApps run off-chain and settle via succinct proofs
  (docs.nockchain.org; XT/Webopedia writeups).
- Fair launch May 21, 2025, genesis attests Bitcoin block 897,767; no premine,
  no founder allocation; supply cap 2³² (≈4.295B); ~52% mined as of today
  (CoinGecko circ 2.22B).
- Zorp Corp: $5M seed led by Delphi (roadmap dates it Jan 19, 2024; DroomDroom/
  crypto-fundraising list Delphi Digital, North Island Ventures, CMCC Global,
  Portal, Champion Hill, Octu, Labyrinth DAO — round dated Dec 2023 there;
  minor date conflict noted).
- Shipped (docs.nockchain.org/architecture/technical-roadmap, fetched):
  Transaction Engine v1 at block 39,000 (Oct 17, 2025), first onchain NockApp
  (Nov 21, 2025), NockApp SDK v1 (Nov 28, 2025), Base bridge (Dec 19, 2025),
  Q1 2026 Bythos upgrade (fees/storage, block 54,000) + Aletheia consensus
  upgrade (ASERT difficulty, 150s blocks, unified emissions, block 65,500).
  In progress Q2 2026: programmability via optimistic execution (demand paging
  PMA). H2 2026: privacy + native assets.
- Kraken listing Jun 26, 2026 (Kraken blog). Deepest venue Aerodrome on Base
  (~$3.9M/day); total 24h volume only ~$0.8M per CMC — thin.
- Risks: −90% from Oct 2025 ATH; $46M mcap microcap; proof market unproven
  externally (same demand-side critique as PRL); small team, $5M funding;
  ~48% of supply still to be mined = structural miner sell pressure.

## PRL — Pearl (Pearl Research Labs)

**Thesis built from scratch (was open item).** Pearl is a Proof-of-Useful-Work
L1 where mining = noisy matrix multiplication on Nvidia GPUs ("NoisyGEMM"),
hashed into commitments and wrapped in ZK proofs. Grounded in a 2025
peer-reviewed paper: Komargodski, Schen & Weinstein, "Proofs of Useful Work
from Arbitrary Matrix Multiplication" (~1+o(1) overhead claim). Distinct
CoinGecko id `pearl-2` — do NOT confuse with "Perle" (also PRL), a Scale-AI-
alumni data-labeling project (TGE Mar 25, 2026, $17.5M raised).

- Mainnet Apr 27, 2026. Fair launch: no premine, no founder allocation, no VC
  (hashrateindex; launch narrative — no contradicting funding disclosure found).
- CEO Omri Weinstein — complexity theorist, Princeton PhD, Hebrew University
  faculty; lists ex-Nvidia, ex-Vast Data (self-reported bio).
- Tokenomics: 2.1B max supply (100× Bitcoin), ~2-min blocks, declining rewards;
  circ 241M (11.5% of max) → FDV $944M vs $108M mcap = heavy future-emission
  overhang. Official pool charges 20% on H100/H200-class hardware.
- Together AI partnership May 15, 2026 (together.ai blog): Pearl-powered
  discounted inference endpoint (>25% below list, Gemma-4 31B), discount offset
  by PRL emissions — first real-world validation of the model.
- **NOCK-thesis connection: adjacent, not identical.** Nockchain's commodity is
  *verified computation* (ZK proofs); Pearl's is *raw AI compute* (matmul).
  Pearl is the more literal AI-compute-scarcity expression; honest read is that
  these are two parallel bets on "useful work," not one thesis.
- Demand-side problem (hashrateindex, fetched in full): most current mining
  output is inference nobody requested or paid for — "AI-shaped proof-of-work"
  until paid demand scales. Mining economics compressing fast: RTX 5090 daily
  revenue ~$33.80 → ~$17.19 (≈−49%) in weeks (Tom's Hardware/Yahoo).
- Liquidity: minor exchanges only, thin books (hashrateindex, early June);
  −48% from Jun 1 ATH; −9.9% today.

## ETH — Ethereum

**Thesis test result.** The institutional-infrastructure evidence is the
strongest of the five; the price action is the weakest. The refined bet is
explicitly "fundamentals vs flows."

- BUIDL (BlackRock/Securitize): ~$2.5B+ AUM, largest tokenized treasury fund
  (CCN "$2B+"; PistachioFi/intellectia $2.5B May 2026; one $25B outlier claim
  excluded as inconsistent with rwa.xyz-anchored sources). Note honestly:
  BUIDL now deployed across 8 chains — Ethereum-first, not Ethereum-only.
- Tokenized treasuries >$15B (May 2026); total tokenized RWA ~$32–34B
  ex-stablecoins (rwa.xyz via crypto.news); Ethereum hosts ~60% of RWA value
  (spotedcrypto/BlackRock analysis says 65%).
- Stablecoins: Ethereum supply $164.9B (DefiLlama, May 17, 2026; Token
  Terminal reported a $180B ATH) = ~52% of the ~$312–321B global supply.
- Staking: 38.9M ETH staked ≈ 31–32% of supply; ~897K validators; ~3.1–3.3%
  gross yield (KuCoin/investing.com). Staking ETFs live post-SEC clarity
  (Jul 2025); iShares "ETHB" staked-ETH product launched Mar 2026, stakes
  70–95% via Coinbase Prime (earnpark/investsnips — secondary sources).
- Protocol: Fusaka shipped Dec 2025 — PeerDAS (EIP-7594) ~90% validator
  data-burden cut, EIP-7918 blob-fee bounds (ethereum.org, Fidelity Digital
  Assets, Everstake); Glamsterdam next (2026).
- Counter-evidence: $1,747 = −65% from Aug 2025 ATH; ETF outflows ~$401.6M in
  May, largest-since-January outflow in June (FXStreet); ETH-treasury companies
  BitMine (BMNR, Tom Lee) + SharpLink absorbed only ~half the ETF bleed;
  BitMine holds 5.62M ETH ≈ 4.66% of supply with ~$9B unrealized loss
  (CoinDesk Jun 3) — the same DAT-overhang structure the ZEC thesis criticizes
  in Bitcoin sits inside the ETH register. Value-accrual question: RWAs/
  stablecoins can grow while L2s + cheap blobs keep fee burn low.

## LIT — Lighter

**Thesis test result, leg by leg (vs Hyperliquid).**

1. *Cheaper* — supported on valuation-per-volume, not on revenue multiples.
   LIT $588M mcap / $2.35B FDV vs HYPE $14.9B / $64.0B (≈25x mcap gap) on a
   ~5x volume gap (Lighter ~$1.3B/24h #3 perp DEX Jul 7 vs HL ~$6.5B/day,
   ~61.5% share per Motley Fool Jul 8 — share methodology varies by tracker).
   BUT revenue: HL ~$202M in Q2 2026 vs Lighter <$10M (declining from ~$40M
   Q4'25 → ~$20M Q1'26; ~$53M cumulative). Zero-fee retail = deliberate
   monetization deferral. A "~$95M annualized" Fool figure conflicts with the
   quarterly series — not carried into the tab.
2. *Better VC backing* — literally true, with a caveat: $68M Nov 11, 2025 led
   by Founders Fund + Ribbit, with Robinhood and Haun (Fortune, CoinDesk;
   $1.5B valuation; ~$90M total incl. previously-unreported $21M 2024 round
   led by Haun/Craft). Hyperliquid famously has **zero** VC (11-person team,
   self-funded, ~$900M/yr profit; rejected a $1B-valuation check — Fortune
   Jan 12, 2026). HL's no-VC is itself a moat/narrative asset.
3. *Stronger technical architecture* — supported as "more trust-minimized":
   zkLighter = zk-rollup settling to Ethereum; order matching AND liquidations
   proven in zk circuits (verifiable matching engine — whitepaper at
   assets.lighter.xyz/whitepaper.pdf; datawallet/Gate/bitcoin.com writeups).
   Hyperliquid = own L1, validator-run CLOB, trust-the-consensus. "Stronger"
   = verifiability; HL wins on shipped performance + ecosystem so far.
- Token: TGE Dec 30, 2025-announced; LIT live ~Jan 2026 at ~$2.34 (CCN),
  −30% from pre-market on day one; 25% supply airdropped (no vesting);
  team 26% + investors 24% on 1-yr cliff then 3-yr linear — **cliff ≈ turn of
  2026/27, major unlock overhang**. Now $2.34 = flat since debut, −70% from
  the $7.86 TGE-day print; HYPE made a fresh ATH Jun 16, 2026.
- Recent (Lighter announcements via CryptoTimes/Defiant/BeInCrypto — the
  lighter.xyz blog itself serves a placeholder CMS page): Jun 30–Jul 1, 2026
  tokenomics overhaul — 100% of trading-fee revenue to open-market buybacks,
  ~15.5M LIT (~6.3% of circulating) bought since TGE, buybacks now burned on
  Ethereum mainnet (first burn weeks after Q2 close), staking rewards from
  ecosystem reserve targeting ~6% yield; LIT +20% to a seven-month high on the
  news; investor call Jul 2 (Novakovski).
- Robinhood Chain routes its perpetual-futures trading through Lighter as of
  Jul 1, 2026 (Fool/Dealroom) — distribution catalyst; Robinhood is an investor.
- Counter-evidence: HL near ATH with Coinbase/Circle USDC deal worth
  $137–160M/yr in treasury interest; Lighter perps geo-blocked in US, UK,
  Canada, Switzerland, UAE, Singapore; HL independent markets = half its
  volume.

## Method

Multi-round, hypothesis-driven; every thesis leg tested for counter-evidence.
Web search + direct fetches (crypto.news SEC piece, Motley Fool comparison,
hashrateindex PRL deep dive, docs.nockchain.org roadmap); market data from a
single CoinGecko API snapshot (Jul 9, 2026). Conflicts found and resolved or
excluded: BUIDL $25B outlier; ZEC 59.3% shielded-adoption stat (numeric
collision with Binance sector stat); Tachyon throughput numbers (single
source); Lighter "$95M annualized" (conflicts with quarterly series); HL
market share 61.5% vs 37% across trackers (dated Fool figure used, flagged);
Zorp seed Dec 2023 vs Jan 2024 (roadmap date used, flagged). Lighter's own
blog could not be fetched (placeholder CMS); its announcements are sourced
via multiple independent outlets instead — noted per the primary-source
requirement. No figure invented; anything single-sourced is labeled.

**Disclaimer:** personal research, not investment advice. Data as of July 9, 2026.
