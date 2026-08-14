# Stablecoins and payments — what the GENIUS Act actually did

**Date:** 14 August 2026. **Status:** new note, written because the crypto
research had no coverage of this at all. The whole repo's treatment of the
subject was one clause inside an equity row — `positions.ts` CRCL, "whose
GENIUS Act compliance converts a cost centre into a moat" — which is a
conclusion with no analysis behind it.

**Sourcing rule for this note.** Everything in §1 is quoted or paraphrased from
the statute itself (Public Law 119–27, retrieved from congress.gov on 14 August
2026 and read directly). Everything in §3 is labelled as hypothesis. Everything
in §4 is labelled as the narrative jump it is. Market figures are carried from
`public/dashboards/crypto.html`, which states its own vintage of 12 August 2026.
Where I could not verify something this session, it says so in that sentence
rather than in a footnote.

---

## 1. What the law says (verified against the text)

**Guiding and Establishing National Innovation for U.S. Stablecoins Act of
2025**, Public Law 119–27. Passed the Senate 17 June 2025 (68–30), the House 17
July 2025 (308–122), approved 18 July 2025. The vote tallies are from the
Wikipedia record and not independently checked against the roll calls; the
public law number and the approval date are on the face of the statute.

**Reserves, §4(a)(1)(A).** A permitted issuer must

> maintain identifiable reserves backing the outstanding payment stablecoins of
> the permitted payment stablecoin issuer on an at least 1 to 1 basis

Note *at least*, not exactly. The eligible reserve list is short and it is a
money-market list: US currency or money at a Federal Reserve Bank; demand
deposits at an insured depository institution; **Treasury bills, notes or bonds
with 93 days or less remaining**; overnight repo backed by those bills;
overnight reverse repo, tri-party or centrally cleared; government money-market
funds invested solely in the above; and anything similarly liquid the federal
regulator later approves.

**No yield to the holder, §4(a)(11).** This is the provision the secondary
coverage keeps leaving out, and it is the one that decides who gets paid:

> No permitted payment stablecoin issuer or foreign payment stablecoin issuer
> shall pay the holder of any payment stablecoin any form of interest or yield
> (whether in cash, tokens, or other consideration) solely in connection with
> the holding, use, or retention of such payment stablecoin.

The reserve earns the bill yield. The holder is barred by statute from
receiving it. The issuer keeps it.

**Not a security, not a commodity, §17.** The section is titled "Amendments to
clarify that payment stablecoins are not securities or commodities and
permitted payment stablecoin issuers are not investment companies", and it does
it by amending the definitions themselves — Securities Act 1933 §2(a)(1),
Exchange Act 1934 §3(a)(10), Investment Company Act 1940, Investment Advisers
Act 1940 each gain the sentence that "security" does not include a payment
stablecoin issued by a permitted issuer. This is a carve-out by definition, not
an exemption granted case by case, which is why it is worth more than an SEC
no-action letter.

**Who may issue, and the $10bn line.** A state-qualified issuer may stay under
its state regime up to **$10,000,000,000 of consolidated total outstanding
issuance**, provided Treasury has found that state regime substantially similar
to the federal one. Above the threshold the issuer has 360 days to transition to
the federal framework, or it must cease issuing new stablecoins until it is back
under. So the law is not "federal for the big ones" as a matter of policy
preference; it is a hard, numbered ceiling on the state route.

**No FDIC insurance, no Fed account of its own.** A payment stablecoin is
defined as not a deposit and not a security, and a state-qualified issuer is
defined as *not* an insured depository institution. Nothing in the Act extends
deposit insurance to a holder. The reserve may sit in an account at a Federal
Reserve Bank (§4(a)(1)(A)(i)), but the Act does not itself grant a non-bank
issuer a master account — that stays a Federal Reserve decision. *This last
sentence is my reading of the text, not a quoted provision.*

**It is not fully in force yet, §20.** The Act takes effect on the earlier of
18 months after enactment — **18 January 2027** — or 120 days after the primary
federal regulators issue final implementing regulations. **Whether those final
regulations had issued by August 2026 is not verified in this note.** Anything
that reads the current market as already operating under the finished regime is
ahead of the statute.

**Named criticism.** Consumer Reports: consumer protections are thin and the
structure lets large technology firms do bank-like things without bank-like
supervision. New York Attorney General Letitia James and other prosecutors: the
Act does not require an issuer to return stolen funds to fraud victims. Max
Harris and Kenneth Rogoff: the framework rhymes with the free-banking era of
1837–1862. All three are carried from the audit and the Wikipedia record; the
underlying documents were not read this session.

---

## 2. Layer A — directly regulated (facts, not forecasts)

| What the statute settles | Consequence that follows without a further assumption |
| --- | --- |
| Reserves at least 1:1, in cash and ≤93-day Treasuries | An issuer's revenue is a short-rate revenue. Duration risk is legislated out; rate risk is legislated in. |
| No interest or yield to the holder | The float income belongs to the issuer. A stablecoin cannot compete for balances on yield, so it competes on distribution and acceptance. |
| Carve-out from the security and commodity definitions | Legal uncertainty stops being a cost line for a compliant issuer. It does not become an advantage over other compliant issuers. |
| $10bn state ceiling with a 360-day transition | Scale forces federal supervision. A state charter is a starting position, not a destination. |
| No FDIC insurance | A run is met by the reserve and the redemption process, not by an insurer. The 93-day maturity cap is what that promise rests on. |
| Effective on the earlier of 18 Jan 2027 or regs + 120 days | Compliance dates are still ahead. Nothing here is a fait accompli. |

---

## 3. Layer B — plausible second-order effects (hypotheses, labelled)

Each of these is my inference. None is stated in the Act, and none should be
read as verified.

**B1 · The incumbent issuers are the first winners, and it is narrow.**
Compliance certainty is worth most to whoever already has the balances. The
carve-out removes a legal-risk discount from USDC and USDT rather than
generating new revenue. Circle (CRCL) is the only listed pure-play in this
book. *Confidence: moderate. What would change it: a large bank consortium
issuing under the federal route and winning distribution the incumbents cannot
match.*

**B2 · The yield ban pushes yield-seeking behaviour one layer out, and that
layer is not covered by the carve-out.** If a holder cannot be paid for holding
a payment stablecoin, the yield has to be manufactured somewhere the Act does
not reach — a wrapper, a lending market, a synthetic dollar. The crypto tab
already holds the names this describes: ENA (USDe, $330M of trailing fees), SKY
($1.25bn cap, the only decentralised stablecoin at scale with real
stability-fee revenue), ONDO ($58M of fees from tokenised treasuries), CAP
($91M cap, stablecoin credit engine). **The important half of this hypothesis
is the risk, not the opportunity: a yield-bearing dollar token is by
construction not a payment stablecoin, so it does not get the §17 carve-out.**
The Act legitimises the thing next to it, not the thing itself. *Confidence:
moderate on the direction, low on the regulatory outcome for those specific
tokens.*

**B3 · Card rails are the displaced party, and the book is already long the
displaced party.** `positions.ts` MQ says it in its own edge field: card-issuing
infrastructure sits underneath agentic payments "regardless of which agent
wins — but the section also names the thing that breaks it, which is stablecoin
rails bypassing cards entirely." A legitimised on-chain dollar is exactly the
condition under which that break happens. MQ is currently held as a long on the
agentic tab; on this note's reading it is closer to a short leg against the
stablecoin thesis than an expression of it. *Confidence: moderate on the
mechanism, low on the timing — card interchange has survived every previous
rail that was going to replace it.*

**B4 · Settlement layers capture volume, not margin.** ETH settles about half of
global stablecoin supply per the crypto tab's own driver text. Plasma (XPL) is
built for it — "$631M TVL and zero-fee USDT transfers by design". Note what
those two sentences do to each other: the chain designed for stablecoin
settlement earns near-zero fees on it by design, and the tab already flags this
("chain fees are structurally near zero"). Volume moving on-chain is not the
same event as a token capturing it. *Confidence: high on the distinction, low
on which layer eventually prices it.*

**B5 · Foreign issuers face a separate regime and this note has not read it.**
The Act contains foreign-issuer provisions with a comparability determination.
USDT's treatment is the single largest open question for anything routed
through it, including XPL. **Not analysed here. Do not infer from silence.**

---

## 4. Layer C — the narrative jump, stated so it can be refused

**"The GENIUS Act is bullish for crypto."** No. The carve-out is written into
the definition of *payment stablecoin* issued by a *permitted issuer*. It does
nothing for a governance token, a layer one, a privacy coin or a proving
network. The channel from this law to any of the forty assets on the crypto tab
is second-order at best: more on-chain dollars, therefore more settlement
volume, therefore possibly more fees, therefore possibly a token that captures
some of them. Each "therefore" is a place where the argument can fail, and §5
of the tab documents a stack where fee capture and token capture come apart
routinely.

**"Circle is a crypto proxy."** Also no, and this is where the repo was already
right. On a 1:1 reserve of ≤93-day paper with the yield ban blocking any
pass-through, an issuer is a short-rate business with a distribution moat. The
existing `positions.ts` note has it: "A Fed cut to 2% roughly halves reserve
income independent of volume — hence rates-macro first." That is the correct
factor and this note does not change it.

---

## 5. Losers, named

1. **Algorithmic and under-collateralised stablecoins.** The 1:1 identifiable
   reserve requirement is a definitional bar, not a standard to aspire to.
   Anything that cannot meet it is outside the carve-out and stays exposed to
   the securities analysis the compliant issuers just escaped.
2. **Yield-bearing dollar tokens** (see B2). They gain from the category's
   legitimacy and lose from being visibly outside its safe harbour.
3. **Card networks and card-issuing infrastructure** (see B3). Long-dated, and
   the book is long it.
4. **Privacy coins, by second-order compliance pressure.** As the compliant
   dollar becomes the default on-chain settlement instrument, the venues that
   list it inherit its compliance posture. ZEC's own risk 6 on the crypto tab
   already names tier-1 delisting as the position-breaking event; this note is
   the reason to take that risk more seriously rather than less. *Hypothesis,
   not a prediction — no delisting has been announced that I verified.*
5. **Offshore and non-compliant issuers**, subject to the foreign-issuer
   provisions this note did not read (B5).

---

## 6. What to watch, and what would falsify the frame

| Indicator | Where it is visible | What it would mean |
| --- | --- | --- |
| Final implementing regulations from the primary federal regulators | Federal Register | Starts the 120-day clock; the regime binds before 18 Jan 2027 |
| First state regimes certified "substantially similar" | Treasury / Stablecoin Certification Review Committee | The $10bn state route is real rather than theoretical |
| An issuer crossing $10bn and transitioning within 360 days | Issuer disclosures | The ceiling has teeth |
| Circle's reserve income against the short rate | CRCL filings | Tests B1 and the rates-macro factor at the same time |
| Enforcement or rulemaking against a yield-bearing dollar wrapper | SEC / state regulators | Tests B2 directly, and it is the fastest way this note is proved wrong |

**The frame is falsified if** a compliant issuer's economics turn out not to be
rate-driven (a distribution or transaction-fee model dominating reserve income),
or if the carve-out is narrowed by rulemaking to the point where compliance
stops being a moat. Both are observable in filings within a year.

---

## 7. Where this note is wired

- `public/dashboards/crypto.html` §06 "Stablecoins and payments" renders the
  three layers above.
- `public/dashboards/agentic.html` — the CRCL profile points at this note
  instead of asserting the GENIUS conclusion on its own.
- [crypto-research-index.md](crypto-research-index.md) — listed under DeFi &
  stablecoins.
- `src/data/positions.ts` CRCL and MQ carry the two positions this note argues
  about.
