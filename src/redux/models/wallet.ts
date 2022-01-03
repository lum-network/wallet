import axios from 'axios';
import { createModel } from '@rematch/core';
import { Window as KeplrWindow } from '@keplr-wallet/types';
import { LumUtils, LumWalletFactory, LumWallet, LumConstants } from '@lum-network/sdk-javascript';

import TransportWebUsb from '@ledgerhq/hw-transport-webusb';

import { showErrorToast, showSuccessToast, WalletClient } from 'utils';

import i18n from 'locales';
import { LUM_WALLET } from 'constant';

import { Airdrop, HardwareMethod, Rewards, RootModel, Transaction, Vestings, Wallet } from '../../models';
import { VoteOption } from '@lum-network/sdk-javascript/build/codec/cosmos/gov/v1beta1/gov';

interface SendPayload {
    to: string;
    from: Wallet;
    amount: string;
    memo: string;
}

interface DelegatePayload {
    validatorAddress: string;
    from: Wallet;
    amount: string;
    memo: string;
}

interface GetRewardPayload {
    validatorAddress: string;
    from: Wallet;
    memo: string;
}

interface GetAllRewardsPayload {
    validatorsAddresses: string[];
    from: Wallet;
    memo: string;
}

interface RedelegatePayload {
    from: Wallet;
    memo: string;
    validatorSrcAddress: string;
    validatorDestAddress: string;
    amount: string;
}

interface SignInKeystorePayload {
    data: LumUtils.KeyStore | string;
    password: string;
}

interface SetWalletDataPayload {
    transactions?: Transaction[];
    currentBalance?: number;
    rewards?: Rewards;
    vestings?: Vestings;
    airdrop?: Airdrop;
}

interface VotePayload {
    voter: Wallet;
    proposalId: string;
    vote: VoteOption;
}

interface WalletState {
    currentWallet: Wallet | null;
    currentBalance: number;
    transactions: Transaction[];
    rewards: Rewards;
    vestings: Vestings | null;
    airdrop: Airdrop | null;
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
        vestings: null,
        airdrop: null,
    } as WalletState,
    reducers: {
        signIn(state, wallet: LumWallet, isExtensionImport?: boolean) {
            return {
                ...state,
                currentWallet: {
                    useAccount: wallet.useAccount,
                    sign: wallet.sign,
                    signMessage: wallet.signMessage,
                    signTransaction: wallet.signTransaction,
                    signingMode: wallet.signingMode,
                    canChangeAccount: wallet.canChangeAccount,
                    getPublicKey: wallet.getPublicKey,
                    getAddress: wallet.getAddress,
                    isExtensionImport,
                },
            };
        },
        setWalletData(state, data: SetWalletDataPayload) {
            return {
                ...state,
                rewards: data.rewards || state.rewards,
                currentBalance: data.currentBalance || state.currentBalance,
                transactions: data.transactions || state.transactions,
                vestings: data.vestings || state.vestings,
                airdrop: data.airdrop || state.airdrop,
            };
        },
    },
    effects: (dispatch) => ({
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
        async getVestings(address: string) {
            const vestings = await WalletClient.getVestingsInfos(address);

            if (vestings) {
                dispatch.wallet.setWalletData({ vestings });
            }
        },
        async getAirdrop(address: string) {
            const airdrop = await WalletClient.getAirdropInfos(address);

            if (airdrop) {
                dispatch.wallet.setWalletData({ airdrop });
            }
        },
        async reloadWalletInfos(address: string) {
            await Promise.all([
                dispatch.wallet.getWalletBalance(address),
                dispatch.wallet.getTransactions(address),
                dispatch.wallet.getRewards(address),
                dispatch.wallet.getVestings(address),
                dispatch.wallet.getAirdrop(address),
                dispatch.staking.getValidatorsInfosAsync(address),
            ]);
        },
        async signInWithKeplrAsync(coinType: number) {
            const keplrWindow = window as KeplrWindow;
            if (!keplrWindow.getOfflineSigner || !keplrWindow.keplr) {
                showErrorToast(i18n.t('wallet.errors.keplr.notInstalled'));
            } else if (!keplrWindow.keplr.experimentalSuggestChain) {
                showErrorToast(i18n.t('wallet.errors.keplr.notLatest'));
            } else {
                const { chainId } = WalletClient;

                if (!chainId) {
                    showErrorToast(i18n.t('wallet.errors.keplr.network'));
                    return;
                }
                try {
                    await keplrWindow.keplr.experimentalSuggestChain({
                        chainId: chainId,
                        chainName: chainId.includes('testnet') ? 'Lum Network [Test]' : 'Lum Network',
                        rpc: process.env.REACT_APP_RPC_URL,
                        rest: process.env.REACT_APP_RPC_URL.replace('rpc', 'rest'),
                        stakeCurrency: {
                            coinDenom: LumConstants.LumDenom.toUpperCase(),
                            coinMinimalDenom: LumConstants.MicroLumDenom,
                            coinDecimals: LumConstants.LumExponent,
                        },
                        walletUrlForStaking: LUM_WALLET,
                        bip44: {
                            coinType,
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
                            },
                        ],
                        // List of coin/tokens used as a fee token in this chain.
                        feeCurrencies: [
                            {
                                coinDenom: LumConstants.LumDenom.toUpperCase(),
                                coinMinimalDenom: LumConstants.MicroLumDenom,
                                coinDecimals: LumConstants.LumExponent,
                            },
                        ],
                        coinType,
                        gasPriceStep: {
                            low: 0.01,
                            average: 0.025,
                            high: 0.04,
                        },
                        beta: chainId.includes('testnet'),
                    });
                } catch {
                    showErrorToast(i18n.t('wallet.errors.keplr.networkAdd'));
                    return;
                }

                try {
                    await keplrWindow.keplr.enable(chainId);
                    if (!keplrWindow.getOfflineSignerAuto) {
                        throw 'Cannot fetch offline signer'
                    }
                    const offlineSigner = await keplrWindow.getOfflineSignerAuto(chainId);
                    const wallet = await LumWalletFactory.fromOfflineSigner(offlineSigner);
                    if (wallet) {
                        dispatch.wallet.signIn(wallet, true);
                        dispatch.wallet.reloadWalletInfos(wallet.getAddress());
                    }
                    return;
                } catch (e) {
                    showErrorToast(i18n.t('wallet.errors.keplr.wallet'));
                    throw e;
                }
            }
        },
        async signInWithLedgerAsync(payload: { app: string; customHdPath?: string }) {
            try {
                let wallet: null | LumWallet = null;
                let breakLoop = false;
                let userCancelled = false;

                // 10 sec timeout to let the user unlock his hardware
                const to = setTimeout(() => (breakLoop = true), 10000);

                const HDPath =
                    payload.customHdPath ||
                    (payload.app === HardwareMethod.Cosmos ? `44'/118'/0'/0/0` : LumConstants.getLumHdPath());

                while (!wallet && !breakLoop) {
                    try {
                        const transport = await TransportWebUsb.create();

                        wallet = await LumWalletFactory.fromLedgerTransport(
                            transport,
                            HDPath,
                            LumConstants.LumBech32PrefixAccAddr,
                        );
                    } catch (e) {
                        if ((e as Error).name === 'TransportOpenUserCancelled') {
                            breakLoop = true;
                            userCancelled = true;
                        }
                    }
                }

                clearTimeout(to);

                if (wallet) {
                    dispatch.wallet.signIn(wallet);
                    dispatch.wallet.reloadWalletInfos(wallet.getAddress());
                    return;
                } else {
                    if (!userCancelled) {
                        showErrorToast(i18n.t('wallet.errors.ledger'));
                    }
                    throw new Error('Ledger wallet importation');
                }
            } catch (e) {
                throw e;
            }
        },
        signInWithMnemonicAsync(payload: { mnemonic: string; customHdPath?: string }) {
            LumWalletFactory.fromMnemonic(payload.mnemonic)
                .then((wallet) => {
                    dispatch.wallet.signIn(wallet);
                    if (payload.customHdPath) {
                        wallet.useAccount(payload.customHdPath, LumConstants.LumBech32PrefixAccAddr);
                    }
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
        async getAllRewards(payload: GetAllRewardsPayload) {
            const result = await WalletClient.getAllRewards(payload.from, payload.validatorsAddresses, payload.memo);

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
            dispatch.staking.getValidatorsInfosAsync(payload.from.getAddress());
            return result;
        },
        async vote(payload: VotePayload) {
            const result = await WalletClient.vote(payload.voter, payload.proposalId, payload.vote);

            if (!result) {
                return null;
            }

            dispatch.wallet.reloadWalletInfos(payload.voter.getAddress());
            return result;
        },
        async mintFaucet(address: string) {
            try {
                const res = await axios.get(`https://bridge.testnet.lum.network/faucet/${address}`);

                if (res.status === 200) {
                    showSuccessToast(i18n.t('wallet.success.faucet'));
                    dispatch.wallet.reloadWalletInfos(address);
                } else {
                    showErrorToast(i18n.t('wallet.errors.faucet.generic'));
                }
            } catch {
                showErrorToast(i18n.t('wallet.errors.faucet.generic'));
            }
        },
    }),
});
