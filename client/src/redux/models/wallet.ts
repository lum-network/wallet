import { LumUtils, LumWallet } from '@lum-network/sdk-javascript';
import { createModel } from '@rematch/core';
import { RootModel, Transaction } from '../../models';

interface SendPayload {
    to: string;
    from: string;
    amount: number;
    ticker: string;
}

interface SignInKeystorePayload {
    data: LumUtils.KeyStore;
    password: string;
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
        async signInWithMnemonicAsync(payload: string) {
            const wallet = await LumWallet.fromMnemonic(payload);

            dispatch.wallet.signIn(wallet.address);
        },
        async signInWithKeystoreAsync(payload: SignInKeystorePayload) {
            const { data, password } = payload;
            const wallet = await LumWallet.fromKeyStore(data, password);

            dispatch.wallet.signIn(wallet.address);
        },
        sendTx(payload: SendPayload, state) {
            const tx = { id: `tx-${state.wallet.transactions.length}`, ...payload, date: new Date() };
            dispatch.wallet.addTransaction(tx);
        },
    }),
});
