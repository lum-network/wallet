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
    amount?: Amount[];
    fromAddress: string;
    toAddress: string;
    time?: string;
    memo: string;
    success?: boolean;
    [key: string]: string | Amount[] | undefined | boolean;
}

export enum PasswordStrengthType {
    Strong = 'strong',
    Medium = 'medium',
    Weak = 'weak',
}

export type PasswordStrength = PasswordStrengthType.Weak | PasswordStrengthType.Medium | PasswordStrengthType.Strong;
