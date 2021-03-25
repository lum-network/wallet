import { Models } from '@rematch/core';
import { wallet } from '../redux/models/wallet';

export interface RootModel extends Models<RootModel> {
    wallet: typeof wallet;
}

export const reduxModels: RootModel = { wallet };

export interface Amount {
    denom: string;
    amount: number;
}

export interface Transaction {
    hash: string;
    amount?: Amount;
    addresses: string[];
    time: string;
    code: number;
    success: boolean;
    [key: string]: string | number | Amount | undefined | string[] | boolean;
}

export enum PasswordStrengthType {
    Strong = 'strong',
    Medium = 'medium',
    Weak = 'weak',
}

export type PasswordStrength = PasswordStrengthType.Weak | PasswordStrengthType.Medium | PasswordStrengthType.Strong;
