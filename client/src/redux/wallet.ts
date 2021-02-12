import { createModel } from '@rematch/core';
import { RootModel, Transaction } from '../models';

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
            state.address = address;
            return state;
        },
        setWalletData(state, data: { transactions?: Transaction[]; currentBalance?: number }) {
            if (data.currentBalance) {
                state.currentBalance = data.currentBalance;
            }

            if (data.transactions) {
                state.transactions = [...data.transactions];
            }

            return state;
        },
        addTransaction(state, tx: Transaction) {
            state.transactions.unshift(tx);
            state.currentBalance += tx.amount;

            return state;
        },
    },
    effects: (dispatch) => ({
        signInAsync(payload: string) {
            dispatch.wallet.signIn(payload);
        },
        sendTx(payload: SendPayload, state) {
            const tx = { id: `tx-${state.wallet.transactions.length}`, ...payload, date: new Date() };
            dispatch.wallet.addTransaction(tx);
        },
    }),
});
