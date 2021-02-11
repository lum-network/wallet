import { createModel } from '@rematch/core';
import { RootModel, Transaction } from '../models';

interface WalletState {
    address: string;
    currentBalance: number;
    transactions: Transaction[];
}

export const wallet = createModel<RootModel>()({
    name: 'wallet',
    state: {
        address: 'sipnIPNzpinQINPI80NO92NOinoiUboOubouzsao',
        currentBalance: 769.23,
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
            {
                id: 'tx-7',
                from: 'sipnIPNzpinQINPI80NO92NOinoiUboOubouzsao',
                to: 'ionIUOoNAoNAoiaABSyebUbe82nuOzBjn2902ninIBDY',
                amount: 12.129,
                ticker: 'LUM',
                date: new Date(),
            },
            {
                id: 'tx-8',
                from: 'sipnIPNzpinQINPI80NO92NOinoiUboOubouzsao',
                to: 'ionIUOoNAoNAoiaABSyebUbe82nuOzBjn2902ninIBDY',
                amount: 12.129,
                ticker: 'LUM',
                date: new Date(),
            },
            {
                id: 'tx-9',
                from: 'sipnIPNzpinQINPI80NO92NOinoiUboOubouzsao',
                to: 'ionIUOoNAoNAoiaABSyebUbe82nuOzBjn2902ninIBDY',
                amount: 12.129,
                ticker: 'LUM',
                date: new Date(),
            },
            {
                id: 'tx-10',
                from: 'sipnIPNzpinQINPI80NO92NOinoiUboOubouzsao',
                to: 'ionIUOoNAoNAoiaABSyebUbe82nuOzBjn2902ninIBDY',
                amount: 12.129,
                ticker: 'LUM',
                date: new Date(),
            },
            {
                id: 'tx-11',
                from: 'sipnIPNzpinQINPI80NO92NOinoiUboOubouzsao',
                to: 'ionIUOoNAoNAoiaABSyebUbe82nuOzBjn2902ninIBDY',
                amount: 12.129,
                ticker: 'LUM',
                date: new Date(),
            },
            {
                id: 'tx-12',
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
