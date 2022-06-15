import WalletClient from './client';
import { LUM_EXPLORER, LUM_EXPLORER_TESTNET, LUM_WALLET, LUM_WALLET_TESTNET } from 'constant';

const CUSTOM_NODE_KEY = 'custom-nodes';

export const saveCustomNode = (node: string): void => {
    const nodes = getCustomNodes();

    if (nodes.length > 0) {
        nodes.push(node);
        localStorage.setItem(CUSTOM_NODE_KEY, JSON.stringify(nodes));
    } else {
        localStorage.setItem(CUSTOM_NODE_KEY, JSON.stringify([node]));
    }
};

export const getCustomNodes = (): string[] => {
    const data = localStorage.getItem(CUSTOM_NODE_KEY);

    if (!data) return [];

    const nodes: string[] = JSON.parse(data);

    return nodes;
};

export const getRpcFromNode = (node: string): string => `https://${node}/rpc`;

export const getExplorerLink = (): string => (WalletClient.isTestnet() ? LUM_EXPLORER_TESTNET : LUM_EXPLORER);
export const getWalletLink = (): string => (WalletClient.isTestnet() ? LUM_WALLET_TESTNET : LUM_WALLET);
