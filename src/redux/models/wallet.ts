import axios from 'axios';
import { createModel } from '@rematch/core';
import { Window as KeplrWindow } from '@keplr-wallet/types';
import { DelegationDelegatorReward } from '@lum-network/sdk-javascript/build/codegen/cosmos/distribution/v1beta1/distribution';
import { VoteOption } from '@lum-network/sdk-javascript/build/codegen/cosmos/gov/v1/gov';

import { stringToPath } from '@cosmjs/crypto';
import { LedgerSigner } from '@cosmjs/ledger-amino';

import { Secp256k1HdWallet, Secp256k1Wallet } from '@cosmjs/amino';

import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import { DeviceModelId } from '@ledgerhq/devices';

import { CLIENT_PRECISION, LUM_COINGECKO_ID, LumConstants } from 'constant';
import i18n from 'locales';
import {
    getRpcFromNode,
    getWalletLink,
    GuardaUtils,
    LumUtils,
    NumbersUtils,
    showErrorToast,
    showSuccessToast,
    WalletClient,
} from 'utils';
import { LOGOUT } from 'redux/constants';

import {
    Airdrop,
    HardwareMethod,
    KeyStore,
    OtherBalance,
    Proposal,
    Rewards,
    RootModel,
    Transaction,
    Vestings,
    Wallet,
} from '../../models';

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

interface GetRewardsFromValidatorsPayload {
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

interface SetWithdrawAddressPayload {
    from: Wallet;
    withdrawAddress: string;
    memo: string;
}

interface SignInKeystorePayload {
    data: KeyStore | string;
    password: string;
}

interface SetWalletDataPayload {
    transactions?: Transaction[];
    currentBalance?: {
        fiat: number;
        lum: number;
    };
    otherBalances?: OtherBalance[];
    rewards?: Rewards;
    otherRewards?: Rewards[];
    vestings?: Vestings;
    airdrop?: Airdrop;
}

interface VotePayload {
    voter: Wallet;
    proposal: Proposal;
    vote: VoteOption;
}

interface WalletState {
    currentWallet: Wallet | null;
    currentBalance: {
        fiat: number;
        lum: number;
    };
    otherBalances: OtherBalance[];
    transactions: Transaction[];
    rewards: Rewards;
    otherRewards: Rewards[];
    vestings: Vestings | null;
    airdrop: Airdrop | null;
    currentNode: string;
}

export const wallet = createModel<RootModel>()({
    name: 'wallet',
    state: {
        currentWallet: null,
        currentBalance: {
            fiat: 0,
            lum: 0,
        },
        otherBalances: [],
        transactions: [],
        rewards: {
            rewards: [],
            total: [],
        },
        otherRewards: [],
        vestings: null,
        airdrop: null,
        currentNode: process.env.REACT_APP_RPC_URL || '',
    } as WalletState,
    reducers: {
        signIn(state, wallet: Wallet) {
            return {
                ...state,
                currentWallet: {
                    ...wallet,
                },
            };
        },
        setWalletData(state, data: SetWalletDataPayload) {
            return {
                ...state,
                rewards: data.rewards || state.rewards,
                otherRewards: data.otherRewards || state.otherRewards,
                currentBalance: data.currentBalance || state.currentBalance,
                otherBalances: data.otherBalances || state.otherBalances,
                transactions: data.transactions || state.transactions,
                vestings: data.vestings || state.vestings,
                airdrop: data.airdrop || state.airdrop,
            };
        },
        setCurrentNode(state, node: string) {
            return {
                ...state,
                currentNode: node,
            };
        },
    },
    effects: (dispatch) => ({
        async getWalletBalance(address: string) {
            const result = await WalletClient.getWalletBalance(address);

            if (result) {
                const { currentBalance, otherBalances } = result;
                dispatch.wallet.setWalletData({ currentBalance, otherBalances });
            }
        },
        async getTransactions(address: string) {
            const transactions = await WalletClient.getTransactions(address);

            if (transactions) {
                dispatch.wallet.setWalletData({ transactions });
            }
        },
        async getRewards(address: string) {
            const res = await WalletClient.getRewards(address);

            if (res) {
                const { rewards: r } = res;

                const oRewards: DelegationDelegatorReward[] = [];
                const lumRewards: DelegationDelegatorReward[] = [];

                for (const delegatorReward of r) {
                    const otherReward = delegatorReward.reward.filter(
                        (reward) => reward.denom !== LumConstants.MicroLumDenom,
                    );

                    const lumReward = delegatorReward.reward.filter(
                        (reward) => reward.denom === LumConstants.MicroLumDenom,
                    );

                    if (otherReward.length > 0) {
                        oRewards.push({
                            validatorAddress: delegatorReward.validatorAddress,
                            reward: otherReward,
                        });
                    }

                    if (lumReward.length > 0) {
                        lumRewards.push({
                            validatorAddress: delegatorReward.validatorAddress,
                            reward: lumReward,
                        });
                    }
                }

                const rewards = {
                    rewards: lumRewards,
                    total: [
                        {
                            denom: LumConstants.MicroLumDenom,
                            amount: NumbersUtils.convertUnitNumber(
                                lumRewards.reduce(
                                    (acc, r) =>
                                        NumbersUtils.convertUnitNumber(r.reward.length > 0 ? r.reward[0].amount : '0') /
                                            CLIENT_PRECISION +
                                        acc,
                                    0,
                                ),
                                LumConstants.LumDenom,
                                LumConstants.MicroLumDenom,
                            ).toFixed(),
                        },
                    ],
                };

                const otherRewards: Rewards[] = [];

                for (const oR of oRewards) {
                    const existsInArrayIndex = otherRewards.findIndex(
                        (item) =>
                            item.rewards.length > 0 &&
                            item.rewards[0].reward.length > 0 &&
                            item.rewards[0].reward[0].denom === (oR.reward[0].denom || ''),
                    );

                    if (oR.reward.length > 0) {
                        if (existsInArrayIndex > -1) {
                            const oldTotal = NumbersUtils.convertUnitNumber(
                                otherRewards[existsInArrayIndex].total[0].amount,
                            );

                            const rewardAmount = NumbersUtils.convertUnitNumber(
                                parseFloat(oR.reward[0].amount) / CLIENT_PRECISION,
                            );

                            otherRewards[existsInArrayIndex].rewards.push({
                                ...oR,
                            });

                            otherRewards[existsInArrayIndex].total[0].amount = NumbersUtils.convertUnitNumber(
                                oldTotal + rewardAmount,
                                LumConstants.LumDenom,
                                LumConstants.MicroLumDenom,
                            ).toFixed();
                        } else {
                            otherRewards.push({
                                rewards: [oR],
                                total: [
                                    {
                                        denom: oR.reward[0].denom,
                                        amount: (parseFloat(oR.reward[0].amount) / CLIENT_PRECISION).toFixed(),
                                    },
                                ],
                            });
                        }
                    }
                }
                dispatch.wallet.setWalletData({ rewards, otherRewards });
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
                dispatch.stats.getPrices(),
                dispatch.wallet.getWalletBalance(address),
                dispatch.wallet.getTransactions(address),
                dispatch.wallet.getRewards(address),
                dispatch.wallet.getVestings(address),
                dispatch.wallet.getAirdrop(address),
                dispatch.staking.getValidatorsInfosAsync(address),
                dispatch.governance.getProposals(),
            ]);
        },
        async signInWithKeplrAsync(coinType: number) {
            const keplrWindow = window as KeplrWindow;
            if (!keplrWindow.getOfflineSigner || !keplrWindow.keplr) {
                showErrorToast(i18n.t('wallet.errors.keplr.notInstalled'));
            } else if (!keplrWindow.keplr.experimentalSuggestChain) {
                showErrorToast(i18n.t('wallet.errors.keplr.notLatest'));
            } else {
                const chainId = WalletClient.getChainId();

                if (!chainId) {
                    showErrorToast(i18n.t('wallet.errors.keplr.network'));
                    return;
                }

                const rpc = getRpcFromNode(WalletClient.getNode());

                try {
                    await keplrWindow.keplr.experimentalSuggestChain({
                        chainId: chainId,
                        chainName: chainId.includes('testnet') ? 'Lum Network [Test]' : 'Lum Network',
                        rpc,
                        rest: rpc.replace('rpc', 'rest'),
                        stakeCurrency: {
                            coinDenom: LumConstants.LumDenom,
                            coinMinimalDenom: LumConstants.MicroLumDenom,
                            coinDecimals: LumConstants.LumExponent,
                            coinGeckoId: LUM_COINGECKO_ID,
                        },
                        walletUrlForStaking: getWalletLink(),
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
                                coinDenom: LumConstants.LumDenom,
                                coinMinimalDenom: LumConstants.MicroLumDenom,
                                coinDecimals: LumConstants.LumExponent,
                                coinGeckoId: LUM_COINGECKO_ID,
                            },
                            {
                                coinDenom: 'dfr',
                                coinMinimalDenom: 'udfr',
                                coinDecimals: 6,
                            },
                        ],
                        // List of coin/tokens used as a fee token in this chain.
                        feeCurrencies: [
                            {
                                coinDenom: LumConstants.LumDenom,
                                coinMinimalDenom: LumConstants.MicroLumDenom,
                                coinDecimals: LumConstants.LumExponent,
                                coinGeckoId: LUM_COINGECKO_ID,
                                gasPriceStep: {
                                    low: 0.01,
                                    average: 0.025,
                                    high: 0.04,
                                },
                            },
                        ],
                        beta: chainId.includes('testnet'),
                    });
                } catch {
                    showErrorToast(i18n.t('wallet.errors.keplr.networkAdd'));
                    return;
                }

                try {
                    await keplrWindow.keplr.enable(chainId);
                    if (!keplrWindow.getOfflineSignerOnlyAmino) {
                        throw 'Cannot fetch offline signer';
                    }
                    const offlineSigner = keplrWindow.getOfflineSignerOnlyAmino(chainId);

                    if (offlineSigner) {
                        await WalletClient.connectSigner(offlineSigner);

                        const accounts = await offlineSigner.getAccounts();
                        const address = accounts[0].address;
                        const isNanoS = (await keplrWindow.keplr.getKey(chainId)).isNanoLedger;

                        dispatch.wallet.signIn({ address, isExtensionImport: true, isNanoS });
                        dispatch.wallet.reloadWalletInfos(address);
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
                let ledgerSigner: LedgerSigner | null = null;
                let breakLoop = false;
                let userCancelled = false;
                let isNanoS = false;

                // 10 sec timeout to let the user unlock his hardware
                const to = setTimeout(() => (breakLoop = true), 10000);

                const hdPaths = [
                    stringToPath(
                        payload.customHdPath
                            ? payload.customHdPath
                            : payload.app === HardwareMethod.Cosmos
                            ? `m/44'/118'/0'/0/0`
                            : LumConstants.getLumHdPath(),
                    ),
                ];

                while (!ledgerSigner && !breakLoop) {
                    try {
                        const transport = await TransportWebUSB.create();
                        isNanoS = transport.deviceModel?.id === DeviceModelId.nanoS;

                        ledgerSigner = new LedgerSigner(transport, {
                            hdPaths,
                            prefix: LumConstants.LumBech32PrefixAccAddr,
                        });
                    } catch (e) {
                        if ((e as Error).name === 'TransportOpenUserCancelled') {
                            breakLoop = true;
                            userCancelled = true;
                        }
                    }
                }

                clearTimeout(to);

                if (ledgerSigner) {
                    const accounts = await ledgerSigner.getAccounts();
                    const address = accounts[0].address;

                    await WalletClient.connectSigner(ledgerSigner);

                    dispatch.wallet.signIn({ address, isNanoS });
                    dispatch.wallet.reloadWalletInfos(address);
                    return;
                } else {
                    if (!userCancelled) {
                        throw new Error(i18n.t('wallet.errors.ledger'));
                    }
                }
            } catch (e) {
                if (e instanceof Error) {
                    showErrorToast(e.message);
                }

                throw e;
            }
        },
        async signInWithMnemonicAsync(payload: { mnemonic: string; customHdPath?: string }) {
            const { mnemonic, customHdPath } = payload;

            try {
                const hdPaths = [stringToPath(customHdPath ? customHdPath : LumConstants.getLumHdPath())];

                const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {
                    hdPaths,
                    prefix: LumConstants.LumBech32PrefixAccAddr,
                });

                await WalletClient.connectSigner(wallet);

                const accounts = await wallet.getAccounts();
                const address = accounts[0].address;

                dispatch.wallet.signIn({ address });
                dispatch.wallet.reloadWalletInfos(address);
            } catch (e) {
                showErrorToast(e instanceof Error ? e.message : i18n.t('wallet.errors.generic'));
                throw e;
            }
        },
        async signInWithPrivateKeyAsync(payload: string) {
            try {
                const wallet = await Secp256k1Wallet.fromKey(
                    LumUtils.fromHex(payload),
                    LumConstants.LumBech32PrefixAccAddr,
                );

                await WalletClient.connectSigner(wallet);

                const accounts = await wallet.getAccounts();
                const address = accounts[0].address;

                dispatch.wallet.signIn({ address });
                dispatch.wallet.reloadWalletInfos(address);
            } catch (e) {
                showErrorToast(e instanceof Error ? e.message : i18n.t('wallet.errors.generic'));
                throw e;
            }
        },
        async signInWithKeystoreAsync(payload: SignInKeystorePayload) {
            const { data, password } = payload;

            try {
                const privateKey = LumUtils.getPrivateKeyFromKeystore(data, password);

                const wallet = await Secp256k1Wallet.fromKey(privateKey, LumConstants.LumBech32PrefixAccAddr);

                await WalletClient.connectSigner(wallet);

                const accounts = await wallet.getAccounts();
                const address = accounts[0].address;

                dispatch.wallet.signIn({ address });
                dispatch.wallet.reloadWalletInfos(address);
            } catch (e) {
                showErrorToast(e instanceof Error ? e.message : i18n.t('wallet.errors.generic'));
                throw e;
            }
        },
        async signInWithGuardaAsync(paylaod: { guardaBackup: string; password: string }) {
            const { guardaBackup, password } = paylaod;

            try {
                const cosmosPrivateKey = GuardaUtils.getCosmosPrivateKey(guardaBackup, password);

                const wallet = await Secp256k1Wallet.fromKey(cosmosPrivateKey, LumConstants.LumBech32PrefixAccAddr);

                await WalletClient.connectSigner(wallet);

                const accounts = await wallet.getAccounts();
                const address = accounts[0].address;

                dispatch.wallet.signIn({ address });
                dispatch.wallet.reloadWalletInfos(address);
            } catch (e) {
                showErrorToast((e as Error).message);
            }
        },
        async sendTx(payload: SendPayload) {
            const result = await WalletClient.sendTx(payload.from, payload.to, payload.amount, payload.memo);

            if (!result) {
                return null;
            }

            dispatch.wallet.reloadWalletInfos(payload.from.address);
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

            dispatch.wallet.reloadWalletInfos(payload.from.address);
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

            dispatch.wallet.reloadWalletInfos(payload.from.address);
            return result;
        },
        async getReward(payload: GetRewardPayload) {
            const result = await WalletClient.getReward(payload.from, payload.validatorAddress, payload.memo);

            if (!result) {
                return null;
            }

            dispatch.wallet.reloadWalletInfos(payload.from.address);
            return result;
        },
        async getRewardsFromValidators(payload: GetRewardsFromValidatorsPayload) {
            const result = await WalletClient.getRewardsFromValidators(
                payload.from,
                payload.validatorsAddresses,
                payload.memo,
            );

            if (!result) {
                return null;
            }

            dispatch.wallet.reloadWalletInfos(payload.from.address);
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

            dispatch.wallet.reloadWalletInfos(payload.from.address);
            dispatch.staking.getValidatorsInfosAsync(payload.from.address);
            return result;
        },
        async vote(payload: VotePayload) {
            const result = await WalletClient.vote(payload.voter, payload.proposal, payload.vote);

            if (!result) {
                return null;
            }

            dispatch.wallet.reloadWalletInfos(payload.voter.address);
            return result;
        },
        async setWithdrawAddress(payload: SetWithdrawAddressPayload) {
            const result = await WalletClient.setWithdrawAddress(payload.from, payload.withdrawAddress, payload.memo);

            if (!result) {
                return null;
            }

            dispatch.wallet.reloadWalletInfos(payload.from.address);
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
        async updateNode(node: string, state) {
            if (state.wallet.currentWallet) {
                dispatch({ type: LOGOUT });
            }

            await WalletClient.updateNode(node);
            await dispatch.wallet.setCurrentNode(node);
        },
    }),
});
