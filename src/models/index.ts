import { LumTypes } from '@lum-network/sdk-javascript';
import { Models } from '@rematch/core';
import { wallet } from '../redux/models/wallet';

export interface RootModel extends Models<RootModel> {
    wallet: typeof wallet;
}

export const reduxModels: RootModel = { wallet };

export interface Transaction {
    hash: string;
    height: number;
    fromAddress: string;
    toAddress: string;
    amount: LumTypes.Coin[];
    memo?: string;
    success?: boolean;
    [key: string]: string | LumTypes.Coin[] | number | boolean | undefined;
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
