import { LumUtils, LumWalletFactory, LumWallet } from '@lum-network/sdk-javascript';
import { createModel } from '@rematch/core';
import { RootModel, Transaction } from '../../models';
import { showErrorToast, WalletClient } from 'utils';

interface SendPayload {
    to: string;
    from: LumWallet;
    amount: string;
    memo: string;
}

interface DelegatePayload {
    validatorAddress: string;
    from: LumWallet;
    amount: string;
    memo: string;
}

interface GetRewardPayload {
    validatorAddress: string;
    from: LumWallet;
    memo: string;
}

interface RedelegatePayload {
    from: LumWallet;
    memo: string;
    validatorSrcAddress: string;
    validatorDestAddress: string;
    amount: string;
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
        /* addTransaction(state, tx: Transaction) {
            state.transactions.unshift(tx);
            state.currentBalance += tx.amount;

            return state;
        }, */
    },
    effects: (dispatch) => ({
        signInAsync(payload: LumWallet) {
            dispatch.wallet.signIn(payload);
        },
        async signInWithMnemonicAsync(payload: string) {
            try {
                const wallet = await LumWalletFactory.fromMnemonic(payload);
                dispatch.wallet.signIn(wallet);

                const accountInfos = await WalletClient.getWalletInformations(wallet.getAddress());
                if (accountInfos) {
                    dispatch.wallet.setWalletData({
                        currentBalance: accountInfos.currentBalance ? Number(accountInfos.currentBalance) : undefined,
                        transactions: accountInfos.transactions,
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

                const accountInfos = await WalletClient.getWalletInformations(wallet.getAddress());
                if (accountInfos) {
                    dispatch.wallet.setWalletData({
                        currentBalance: accountInfos.currentBalance ? Number(accountInfos.currentBalance) : undefined,
                        transactions: accountInfos.transactions,
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

                const accountInfos = await WalletClient.getWalletInformations(wallet.getAddress());
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
        async sendTx(payload: SendPayload) {
            // const tx = {
            //     ...payload,
            //     id: `tx-${state.wallet.transactions.length}`,
            //     amount: Number(payload.amount),
            //     from: payload.from.getAddress(),
            //     date: new Date(),
            // };

            try {
                await WalletClient.sendTx(payload.from, payload.to, payload.amount, payload.memo);
            } catch (e) {
                console.error(e);
                return;
            }
            //TODO: dispatch action
            //dispatch.wallet.addTransaction(tx);
        },
        async delegate(payload: DelegatePayload) {
            try {
                await WalletClient.delegate(payload.from, payload.validatorAddress, payload.amount, payload.memo);
            } catch (e) {
                console.error(e);
                return;
            }
            //TODO: Dispatch action
        },
        async undelegate(payload: DelegatePayload) {
            try {
                await WalletClient.undelegate(payload.from, payload.validatorAddress, payload.amount, payload.memo);
            } catch (e) {
                console.error(e);
                return;
            }
            //TODO: Dispatch action
        },
        async getReward(payload: GetRewardPayload) {
            try {
                await WalletClient.getReward(payload.from, payload.validatorAddress, payload.memo);
            } catch (e) {
                console.error(e);
                return;
            }
            //TODO: Dispatch action
        },
        async redelegate(payload: RedelegatePayload) {
            try {
                await WalletClient.redelegate(
                    payload.from,
                    payload.validatorSrcAddress,
                    payload.validatorDestAddress,
                    payload.amount,
                    payload.memo,
                );
            } catch (e) {
                console.error(e);
                return;
            }
            //TODO: Dispatch action
        },
    }),
});
