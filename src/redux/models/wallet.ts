import { LumUtils, LumWalletFactory, LumWallet } from '@lum-network/sdk-javascript';
import { createModel } from '@rematch/core';
import { RootModel, Transaction } from '../../models';
import { showErrorToast, WalletUtils } from 'utils';

interface SendPayload {
    to: string;
    from: LumWallet;
    amount: string;
    ticker: string;
    memo: string;
}

interface SignInKeystorePayload {
    data: LumUtils.KeyStore | string;
    password: string;
}

interface WalletState {
    currentWallet: LumWallet | null;
    currentBalance: number;
    transactions: Transaction[];
}

export const wallet = createModel<RootModel>()({
    name: 'wallet',
    state: {
        currentWallet: null,
        currentBalance: 0,
        transactions: [],
    } as WalletState,
    reducers: {
        signIn(state, wallet: LumWallet) {
            state.currentWallet = wallet;
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
            // TODO: Add Fees
            state.currentBalance -= tx.amount + 1;

            return state;
        },
    },
    effects: (dispatch) => ({
        signInAsync(payload: LumWallet) {
            dispatch.wallet.signIn(payload);
        },
        async signInWithMnemonicAsync(payload: string) {
            try {
                const wallet = await LumWalletFactory.fromMnemonic(payload);
                dispatch.wallet.signIn(wallet);

                const accountInfos = await WalletUtils.getWalletInformations(wallet.getAddress());
                if (accountInfos) {
                    dispatch.wallet.setWalletData({
                        currentBalance: accountInfos.currentBalance ? Number(accountInfos.currentBalance) : undefined,
                        //transactions: accountInfos.transactions,
                    });
                }
            } catch (e) {
                showErrorToast(e.message);
            }
        },
        async signInWithPrivateKeyAsync(payload: string) {
            try {
                const wallet = await LumWalletFactory.fromPrivateKey(LumUtils.keyFromHex(payload));
                dispatch.wallet.signIn(wallet);

                const accountInfos = await WalletUtils.getWalletInformations(wallet.getAddress());
                if (accountInfos) {
                    dispatch.wallet.setWalletData({
                        currentBalance: accountInfos.currentBalance ? Number(accountInfos.currentBalance) : undefined,
                        //transactions: accountInfos.transactions,
                    });
                }
            } catch (e) {
                showErrorToast(e.message);
            }
        },
        async signInWithKeystoreAsync(payload: SignInKeystorePayload) {
            const { data, password } = payload;
            try {
                const wallet = await LumWalletFactory.fromKeyStore(data, password);
                dispatch.wallet.signIn(wallet);

                const accountInfos = await WalletUtils.getWalletInformations(wallet.getAddress());
                if (accountInfos) {
                    dispatch.wallet.setWalletData({
                        currentBalance: accountInfos.currentBalance ? Number(accountInfos.currentBalance) : undefined,
                        //transactions: accountInfos.transactions,
                    });
                }
            } catch (e) {
                showErrorToast(e.message);
            }
        },
        async sendTx(payload: SendPayload, state) {
            const tx = {
                ...payload,
                id: `tx-${state.wallet.transactions.length}`,
                amount: Number(payload.amount),
                from: payload.from.getAddress(),
                date: new Date(),
            };

            try {
                await WalletUtils.sendTx(payload.from, payload.to, payload.amount);
            } catch (e) {
                console.log(e);
                return;
            }
            dispatch.wallet.addTransaction(tx);
        },
    }),
});
