import { Models } from '@rematch/core';
import { Validator } from '@lum-network/sdk-javascript/build/codegen/cosmos/staking/v1beta1/staking';
import { Proposal as BaseProposal } from '@lum-network/sdk-javascript/build/codegen/cosmos/gov/v1/gov';
import { Coin } from '@lum-network/sdk-javascript/build/codegen/cosmos/base/v1beta1/coin';

import { governance } from '../redux/models/governance';
import { staking } from '../redux/models/staking';
import { wallet } from '../redux/models/wallet';
import { stats } from '../redux/models/stats';

export interface RootModel extends Models<RootModel> {
    wallet: typeof wallet;
    staking: typeof staking;
    governance: typeof governance;
    stats: typeof stats;
}

export const reduxModels: RootModel = { wallet, staking, governance, stats };

export interface Wallet {
    address: string;
    isExtensionImport?: boolean;
    isNanoS?: boolean;
}

export interface OtherBalance {
    denom: string;
    amount: number;
}

export interface CommonTransactionProps {
    messages: string[];
    hash: string;
    height: number;
    amount: Coin[];
    memo?: string;
    success?: boolean;
    [key: string]: string | Coin[] | number | boolean | string[] | undefined;
}

export interface Transaction extends CommonTransactionProps {
    fromAddress: string;
    toAddress: string;
}

export interface StakingTransaction extends CommonTransactionProps {
    delegatorAddress: string;
    validatorAddress: string;
}

export interface Reward {
    validatorAddress: string;
    reward: Coin[];
}

export interface Rewards {
    rewards: Reward[];
    total: Coin[];
}

export interface UserValidator extends Validator {
    reward: number;
    stakedCoins: string;
}

export enum PasswordStrengthType {
    Strong = 'strong',
    Medium = 'medium',
    Weak = 'weak',
}

export type PasswordStrength = PasswordStrengthType.Weak | PasswordStrengthType.Medium | PasswordStrengthType.Strong;

export enum SoftwareMethod {
    Mnemonic = 'mnemonic',
    PrivateKey = 'privateKey',
    Keystore = 'keystore',
    Guarda = 'guarda',
}

export enum ExtensionMethod {
    Keplr = 'keplr',
}

export enum HardwareMethod {
    Cosmos = 'cosmos',
    Lum = 'lum',
}

export interface Vestings {
    endsAt: Date;
    lockedCoins: Coin;
    lockedBankCoins: Coin;
    lockedDelegatedCoins: Coin;
}

export interface Airdrop {
    amount: number;
    vote: boolean;
    delegate: boolean;
}

export interface VotesResult {
    yes: number;
    no: number;
    noWithVeto: number;
    abstain: number;
}

export interface Proposal extends BaseProposal {
    content: {
        title: string;
        description: string;
    } | null;
    finalResult: VotesResult;
}

export interface PreviousDayPrice {
    value: number;
    time: number;
}

export interface LumInfo {
    price: number;
    denom: string;
    symbol: string;
    volume_24h: number;
    name: number;
    previousDaysPrices: PreviousDayPrice[];
}

export type SignMsg = {
    msg: string;
    address: string;
    sig: Uint8Array;
    publicKey: Uint8Array;
    signer: string;
    version: string;
};

/**
 * KeyStore storage format (web3 secret storage format)
 */
export interface KeyStore {
    version: number;
    id: string;
    crypto: {
        ciphertext: string;
        cipherparams: {
            iv: string;
        };
        cipher: string;
        kdf: string;
        kdfparams: {
            dklen: number;
            salt: string;
            c: number;
            prf: string;
        };
        /** Must use sha3 according to web3 secret storage spec. */
        mac: string;
    };
}

export { default as MetadataModel } from './Metadata';
export { default as TokenModel } from './Token';
