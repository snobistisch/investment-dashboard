/** Shared, pinned crypto identifiers.
 *
 * A ticker lookup is unsafe: six symbols in this universe resolve to another
 * project on CoinGecko. Keep the mapping in one module so market, risk and
 * portfolio artefacts cannot silently disagree about which asset they mean.
 */
export const CRYPTO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  NEAR: 'near',
  ZEC: 'zcash',
  MON: 'monad',
  XPL: 'plasma',
  MEGA: 'megaeth',
  HYPE: 'hyperliquid',
  LIT: 'lighter',
  JUP: 'jupiter-exchange-solana',
  ASTER: 'aster-2',
  UNI: 'uniswap',
  AAVE: 'aave',
  SYRUP: 'syrup',
  SKY: 'sky',
  ENA: 'ethena',
  ONDO: 'ondo-finance',
  CAP: 'cap-4',
  UP: 'superform',
  LINK: 'chainlink',
  EIGEN: 'eigenlayer',
  LDO: 'lido-dao',
  AKT: 'akash-network',
  ATH: 'aethir',
  NOS: 'nosana',
  TAO: 'bittensor',
  VIRTUAL: 'virtual-protocol',
  NOCK: 'nockchain',
  ZAMA: 'zama',
  PROVE: 'succinct',
  LA: 'lagrange',
  AZTEC: 'aztec',
  ARX: 'arcium',
  NIL: 'nillion',
  IRYS: 'irys',
  AI: 'gensyn',
  ALEO: 'aleo',
  OCT: 'octra',
  PRL: 'pearl-2',
}

/** CoinGecko's max supply still includes JUP burned in January 2025. The
 * current total supply is the economically relevant denominator. */
export const TOTAL_SUPPLY_DENOMINATOR = new Set(['JUP'])

