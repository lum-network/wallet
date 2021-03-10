import { LumUtils, LumWallet } from '@lum-network/sdk-javascript';
import { createModel } from '@rematch/core';
import { RootModel, Transaction } from '../../models';
import { showErrorToast } from 'utils';

interface SendPayload {
    to: string;
    from: string;
    amount: number;
    ticker: string;
}

interface SignInKeystorePayload {
    data: LumUtils.KeyStore | string;
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
            try {
                const wallet = await LumWallet.fromMnemonic(payload);

                dispatch.wallet.signIn(wallet.address);
            } catch (e) {
                showErrorToast(e.message);
            }
        },
        async signInWithPrivateKeyAsync(payload: string) {
            try {
                const wallet = await LumWallet.fromPrivateKey(LumUtils.keyFromHex(payload));

                dispatch.wallet.signIn(wallet.address);
            } catch (e) {
                showErrorToast(e.message);
            }
        },
        async signInWithKeystoreAsync(payload: SignInKeystorePayload) {
            const { data, password } = payload;
            try {
                const wallet = await LumWallet.fromKeyStore(data, password);

                dispatch.wallet.signIn(wallet.address);
            } catch (e) {
                showErrorToast(e.message);
            }
        },
        sendTx(payload: SendPayload, state) {
            const tx = { id: `tx-${state.wallet.transactions.length}`, ...payload, date: new Date() };
            dispatch.wallet.addTransaction(tx);
        },
    }),
});
