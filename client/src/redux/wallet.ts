import { createModel } from '@rematch/core';
import { Transaction } from '../models';
import { RootModel } from './models';

interface WalletState {
    address: string | null;
    transactions: Transaction[];
}

export const wallet = createModel<RootModel>()({
    state: {
        address: 'sipnIPNzpinQINPI80NO92NOinoiUboOubouzsao',
        transactions: [
            {
                id: 'tx-1',
                from: 'sipnIPNzpinQINPI80NO92NOinoiUboOubouzsao',
                to: 'ionIUOoNAoNAoiaABSyebUbe82nuOzBjn2902ninIBDY',
                amount: 12.129,
                ticker: 'LUM',
                date: new Date(),
            },
            {
                id: 'tx-2',
                from: 'sipnIPNzpinQINPI80NO92NOinoiUboOubouzsao',
                to: 'ionIUOoNAoNAoiaABSyebUbe82nuOzBjn2902ninIBDY',
                amount: 12.129,
                ticker: 'LUM',
                date: new Date(),
            },
            {
                id: 'tx-3',
                from: 'sipnIPNzpinQINPI80NO92NOinoiUboOubouzsao',
                to: 'ionIUOoNAoNAoiaABSyebUbe82nuOzBjn2902ninIBDY',
                amount: 12.129,
                ticker: 'LUM',
                date: new Date(),
            },
            {
                id: 'tx-4',
                from: 'sipnIPNzpinQINPI80NO92NOinoiUboOubouzsao',
                to: 'ionIUOoNAoNAoiaABSyebUbe82nuOzBjn2902ninIBDY',
                amount: 12.129,
                ticker: 'LUM',
                date: new Date(),
            },
            {
                id: 'tx-5',
                from: 'sipnIPNzpinQINPI80NO92NOinoiUboOubouzsao',
                to: 'ionIUOoNAoNAoiaABSyebUbe82nuOzBjn2902ninIBDY',
                amount: 12.129,
                ticker: 'LUM',
                date: new Date(),
            },
            {
                id: 'tx-6',
                from: 'sipnIPNzpinQINPI80NO92NOinoiUboOubouzsao',
                to: 'ionIUOoNAoNAoiaABSyebUbe82nuOzBjn2902ninIBDY',
                amount: 12.129,
                ticker: 'LUM',
                date: new Date(),
            },
        ],
    } as WalletState,
    reducers: {},
    effects: {},
});
