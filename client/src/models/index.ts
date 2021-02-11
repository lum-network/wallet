import { Models } from '@rematch/core';
import { wallet } from '../redux/wallet';

export interface RootModel extends Models<RootModel> {
    wallet: typeof wallet;
}

export const reduxModels: RootModel = { wallet };

export interface Transaction {
    id: string;
    to: string;
    from: string;
    amount: number;
    ticker: string;
    date: Date;
    [key: string]: string | number | Date;
}
