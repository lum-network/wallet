import WalletClient from './client';
import { LUM_EXPLORER, LUM_EXPLORER_TESTNET, LUM_WALLET, LUM_WALLET_TESTNET } from 'constant';

export const getExplorerLink = (): string => (WalletClient.isTestnet() ? LUM_EXPLORER_TESTNET : LUM_EXPLORER);
export const getWalletLink = (): string => (WalletClient.isTestnet() ? LUM_WALLET_TESTNET : LUM_WALLET);
