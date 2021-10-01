import { LumUtils, LumWalletFactory, LumWallet } from '@lum-network/sdk-javascript';
import { createModel } from '@rematch/core';
import { Rewards, RootModel, Transaction } from '../../models';
import { showErrorToast, showSuccessToast, WalletClient } from 'utils';
import axios from 'axios';

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
    rewards: Rewards;
}

export const wallet = createModel<RootModel>()({
    name: 'wallet',
    state: {
        currentWallet: null,
        currentBalance: 0,
        transactions: [],
        rewards: {
            rewards: [],
            total: [],
        },
    } as WalletState,
    reducers: {
        signIn(state, wallet: LumWallet) {
            state.currentWallet = wallet;
            return state;
        },
        setWalletData(state, data: { transactions?: Transaction[]; currentBalance?: number; rewards?: Rewards }) {
            if (data.currentBalance) {
                state.currentBalance = data.currentBalance;
            }

            if (data.transactions) {
                state.transactions = [...data.transactions];
            }

            if (data.rewards) {
                state.rewards = data.rewards;
            }

            return state;
        },
    },
    effects: (dispatch) => ({
        signInAsync(payload: LumWallet) {
            dispatch.wallet.signIn(payload);
        },
        async getWalletBalance(address: string) {
            const currentBalance = await WalletClient.getWalletBalance(address);

            if (currentBalance) {
                dispatch.wallet.setWalletData({ currentBalance });
            }
        },
        async getTransactions(address: string) {
            const transactions = await WalletClient.getTransactions(address);

            if (transactions) {
                dispatch.wallet.setWalletData({ transactions });
            }
        },
        async getRewards(address: string) {
            const rewards = await WalletClient.getRewards(address);

            if (rewards) {
                dispatch.wallet.setWalletData({ rewards });
            }
        },
        async reloadWalletInfos(address: string) {
            await Promise.all([
                dispatch.wallet.getWalletBalance(address),
                dispatch.wallet.getTransactions(address),
                dispatch.wallet.getRewards(address),
            ]);
        },
        signInWithMnemonicAsync(payload: string) {
            LumWalletFactory.fromMnemonic(payload)
                .then((wallet) => {
                    dispatch.wallet.signIn(wallet);
                    dispatch.wallet.reloadWalletInfos(wallet.getAddress());
                })
                .catch((e) => showErrorToast(e.message));
        },
        signInWithPrivateKeyAsync(payload: string) {
            LumWalletFactory.fromPrivateKey(LumUtils.keyFromHex(payload))
                .then((wallet) => {
                    dispatch.wallet.signIn(wallet);
                    dispatch.wallet.reloadWalletInfos(wallet.getAddress());
                })
                .catch((e) => showErrorToast(e.message));
        },
        signInWithKeystoreAsync(payload: SignInKeystorePayload) {
            const { data, password } = payload;

            LumWalletFactory.fromKeyStore(data, password)
                .then((wallet) => {
                    dispatch.wallet.signIn(wallet);
                    dispatch.wallet.reloadWalletInfos(wallet.getAddress());
                })
                .catch((e) => showErrorToast(e.message));
        },
        async sendTx(payload: SendPayload) {
            const result = await WalletClient.sendTx(payload.from, payload.to, payload.amount, payload.memo);

            if (!result) {
                return null;
            }

            dispatch.wallet.reloadWalletInfos(payload.from.getAddress());
            return result;
        },
        async delegate(payload: DelegatePayload) {
            const result = await WalletClient.delegate(
                payload.from,
                payload.validatorAddress,
                payload.amount,
                payload.memo,
            );

            if (!result) {
                return null;
            }

            dispatch.wallet.reloadWalletInfos(payload.from.getAddress());
            return result;
        },
        async undelegate(payload: DelegatePayload) {
            const result = await WalletClient.undelegate(
                payload.from,
                payload.validatorAddress,
                payload.amount,
                payload.memo,
            );

            if (!result) {
                return null;
            }

            dispatch.wallet.reloadWalletInfos(payload.from.getAddress());
            return result;
        },
        async getReward(payload: GetRewardPayload) {
            const result = await WalletClient.getReward(payload.from, payload.validatorAddress, payload.memo);

            if (!result) {
                return null;
            }

            dispatch.wallet.reloadWalletInfos(payload.from.getAddress());
            return result;
        },
        async redelegate(payload: RedelegatePayload) {
            const result = await WalletClient.redelegate(
                payload.from,
                payload.validatorSrcAddress,
                payload.validatorDestAddress,
                payload.amount,
                payload.memo,
            );
            if (!result) {
                return null;
            }

            dispatch.wallet.reloadWalletInfos(payload.from.getAddress());
            return result;
        },
        async mintFaucet(address: string) {
            if (address) {
                const res = await axios.get(`https://bridge.testnet.lum.network/faucet/${address}`);

                if (res.data.code === 200) {
                    showSuccessToast('Successfully minted faucet');
                    dispatch.wallet.reloadWalletInfos(address);
                } else {
                    showErrorToast('An error occured when minting faucet');
                }
            } else {
                showErrorToast('Mint faucet error: Unknown address');
            }
        },
    }),
});
