import axios from 'axios';
import { createModel } from '@rematch/core';
import { Window as KeplrWindow } from '@keplr-wallet/types';
import { LumUtils, LumWalletFactory, LumWallet, LumConstants } from '@lum-network/sdk-javascript';

import { Rewards, RootModel, Transaction } from '../../models';
import { showErrorToast, showSuccessToast, WalletClient } from 'utils';

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
        async signInWithKeplrAsync() {
            const keplrWindow = window as KeplrWindow;
            if (!keplrWindow.getOfflineSigner || !keplrWindow.keplr) {
                showErrorToast('Please install keplr extension');
            } else if (!keplrWindow.keplr.experimentalSuggestChain) {
                showErrorToast('Please use and up to date version of the Keplr extension');
            } else {
                const chainId = await WalletClient.lumClient?.getChainId();
                if (!chainId) {
                    showErrorToast('Failed to connect to the network');
                    return;
                }
                try {
                    await keplrWindow.keplr.experimentalSuggestChain({
                        chainId: chainId,
                        chainName: chainId.includes('testnet') ? 'Lum Network [Test]' : 'Lum Network',
                        rpc: process.env.REACT_APP_RPC_URL,
                        // TODO:
                        // this should come from the environment settings
                        rest: 'https://node0.testnet.lum.network/rest',
                        stakeCurrency: {
                            coinDenom: LumConstants.LumDenom.toUpperCase(),
                            coinMinimalDenom: LumConstants.MicroLumDenom,
                            coinDecimals: LumConstants.LumExponent,
                            // TODO:
                            // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
                            // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
                            // coinGeckoId: ""
                        },
                        walletUrlForStaking: 'https://wallet.lum.network', // TODO: should be in constants
                        bip44: {
                            coinType: 837,
                        },
                        bech32Config: {
                            bech32PrefixAccAddr: LumConstants.LumBech32PrefixAccAddr,
                            bech32PrefixAccPub: LumConstants.LumBech32PrefixAccPub,
                            bech32PrefixValAddr: LumConstants.LumBech32PrefixValAddr,
                            bech32PrefixValPub: LumConstants.LumBech32PrefixValPub,
                            bech32PrefixConsAddr: LumConstants.LumBech32PrefixConsAddr,
                            bech32PrefixConsPub: LumConstants.LumBech32PrefixConsPub,
                        },
                        currencies: [
                            {
                                coinDenom: LumConstants.LumDenom.toUpperCase(),
                                coinMinimalDenom: LumConstants.MicroLumDenom,
                                coinDecimals: LumConstants.LumExponent,
                                // TODO:
                                // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
                                // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
                                // coinGeckoId: ""
                            },
                        ],
                        // List of coin/tokens used as a fee token in this chain.
                        feeCurrencies: [
                            {
                                coinDenom: LumConstants.LumDenom.toUpperCase(),
                                coinMinimalDenom: LumConstants.MicroLumDenom,
                                coinDecimals: LumConstants.LumExponent,
                                // TODO:
                                // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
                                // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
                                // coinGeckoId: ""
                            },
                        ],
                        coinType: 837,
                        // TODO: to improve and set to appropriate amounts
                        gasPriceStep: {
                            low: 0.01,
                            average: 0.025,
                            high: 0.04,
                        },
                        beta: chainId.includes('testnet'),
                    });
                } catch {
                    showErrorToast('Failed to add network to Keplr');
                    return;
                }

                try {
                    await keplrWindow.keplr.enable(chainId);
                    const offlineSigner = keplrWindow.getOfflineSigner(chainId);
                    LumWalletFactory.fromOfflineSigner(offlineSigner)
                        .then((wallet) => {
                            dispatch.wallet.signIn(wallet);
                            dispatch.wallet.reloadWalletInfos(wallet.getAddress());
                        })
                        .catch((e) => showErrorToast(e.message));
                } catch {
                    showErrorToast('Failed to connect to Keplr wallet');
                    return;
                }
            }
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
