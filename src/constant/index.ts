export const IS_TESTNET = process.env.REACT_APP_RPC_URL.includes('testnet');

export const LUM_WALLET_GITHUB = 'https://github.com/lum-network/wallet';
export const LUM_MAIL = 'contact@lum.network';
export const LUM_TELEGRAM = 'https://t.me/lum_network';
export const LUM_TWITTER = 'https://twitter.com/lum_network';
export const LUM_LEDGER_APP_INSTALL_LINK =
    'https://github.com/lum-network/ledger-app#download-and-install-a-prerelease';
export const COSMOS_LEDGER_APP_INSTALL_LINK =
    'https://support.ledger.com/hc/en-us/articles/360013713840-Cosmos-ATOM-?docs=true';
export const LUM_EXPLORER = IS_TESTNET ? 'https://explorer.testnet.lum.network' : 'https://explorer.lum.network';
export const LUM_WALLET = IS_TESTNET ? 'https://wallet.testnet.lum.network' : 'https://wallet.lum.network';

export const CLIENT_PRECISION = 1_000_000_000_000_000_000;
