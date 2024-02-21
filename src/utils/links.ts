import WalletClient from './client';
import { LUM_MILLIONS, LUM_MILLIONS_TESTNET, LUM_WALLET, LUM_WALLET_TESTNET } from 'constant';

const CUSTOM_NODE_KEY = 'custom-nodes';

export const saveCustomNode = (node: string): void => {
    const nodes = getCustomNodes();

    nodes.push(node);
    localStorage.setItem(CUSTOM_NODE_KEY, JSON.stringify(nodes));
};

export const getCustomNodes = (): string[] => {
    const data = localStorage.getItem(CUSTOM_NODE_KEY);

    if (!data) return [];

    const nodes: string[] = JSON.parse(data);

    return nodes;
};

export const getRpcFromNode = (node: string): string => `https://${node}`;

export const getWalletLink = (): string => (WalletClient.isTestnet() ? LUM_WALLET_TESTNET : LUM_WALLET);
export const getMillionsLink = (): string => (WalletClient.isTestnet() ? LUM_MILLIONS_TESTNET : LUM_MILLIONS);
