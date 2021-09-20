import { LumTypes } from '@lum-network/sdk-javascript';
import { Models } from '@rematch/core';
import { wallet } from '../redux/models/wallet';

export interface RootModel extends Models<RootModel> {
    wallet: typeof wallet;
}

export const reduxModels: RootModel = { wallet };

export interface CommonTransactionProps {
    type: string;
    hash: string;
    height: number;
    amount: LumTypes.Coin[];
    time: string;
    memo?: string;
    success?: boolean;
    [key: string]: string | LumTypes.Coin[] | number | boolean | undefined;
}

export interface Transaction extends CommonTransactionProps {
    fromAddress: string;
    toAddress: string;
}

export interface StakingTransaction extends CommonTransactionProps {
    delegatorAddress: string;
    validatorAddress: string;
}

export enum PasswordStrengthType {
    Strong = 'strong',
    Medium = 'medium',
    Weak = 'weak',
}

export type PasswordStrength = PasswordStrengthType.Weak | PasswordStrengthType.Medium | PasswordStrengthType.Strong;

export enum SoftwareType {
    Mnemonic = 'mnemonic',
    PrivateKey = 'privateKey',
    Keystore = 'keystore',
}
