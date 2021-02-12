import { createModel } from '@rematch/core';
import { RootModel, Transaction } from '../models';

const exampleTransactions = [
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
];

interface SendPayload {
    to: string;
    from: string;
    amount: number;
    ticker: string;
}

interface WalletState {
    address: string | null;
    currentBalance: number;
    transactions: Transaction[];
}

export const wallet = createModel<RootModel>()({
    name: 'wallet',
    state: {
        address: null,
        currentBalance: 0,
        transactions: [],
    } as WalletState,
    reducers: {
        signIn(state, address: string) {
            return {
                ...state,
                address,
            };
        },
        setWalletData(state, data: { transactions?: Transaction[]; currentBalance?: number }) {
            const newTransactions = [...(data.transactions || state.transactions)];
            const newCurrentBalance = data.currentBalance || state.currentBalance;

            return {
                ...state,
                transactions: newTransactions,
                currentBalance: newCurrentBalance,
            };
        },
    },
    effects: (dispatch) => ({
        signInAsync(payload: string) {
            dispatch.wallet.signIn(payload);
            dispatch.wallet.setWalletData({
                currentBalance: exampleTransactions.reduce((acc, tx) => acc + tx.amount, 0),
                transactions: exampleTransactions,
            });
        },
        sendTx(payload: SendPayload, state) {
            const transactions = [
                { ...payload, id: `tx-${state.wallet.transactions.length}`, date: new Date() },
                ...state.wallet.transactions,
            ];
            dispatch.wallet.setWalletData({
                transactions,
                currentBalance: transactions.reduce((acc, tx) => acc + tx.amount, 0),
            });
        },
    }),
});
