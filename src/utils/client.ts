import axios from 'axios';

import { OfflineAminoSigner, StdSignDoc, coins, isSinglePubkey } from '@cosmjs/amino';
import { SigningStargateClient, assertIsDeliverTxSuccess } from '@cosmjs/stargate';
import { Window as KeplrWindow } from '@keplr-wallet/types';
import { Dec, IntPretty } from '@keplr-wallet/unit';
import {
    getSigningCosmosClient,
    cosmos,
    lum,
    LumRegistry,
    LUM_DENOM,
    MICRO_LUM_DENOM,
    estimatedVesting,
    accountFromAny,
    convertUnit,
} from '@lum-network/sdk-javascript';
import { ProposalStatus, VoteOption } from '@lum-network/sdk-javascript/build/codegen/cosmos/gov/v1/gov';

import { COINGECKO_API_URL, IPFS_GATEWAY, MessageTypes } from 'constant';
import i18n from 'locales';
import { Wallet, Proposal, LumInfo } from 'models';
import { DenomsUtils, NumbersUtils, showErrorToast, showSuccessToast } from 'utils';

import { formatTxs } from './transactions';
import { getRpcFromNode } from './links';

const { send } = cosmos.bank.v1beta1.MessageComposer.withTypeUrl;
const { delegate, beginRedelegate, undelegate } = cosmos.staking.v1beta1.MessageComposer.withTypeUrl;
const { withdrawDelegatorReward, setWithdrawAddress } = cosmos.distribution.v1beta1.MessageComposer.withTypeUrl;
const { vote } = cosmos.gov.v1beta1.MessageComposer.withTypeUrl;

class WalletClient {
    private lumInfos: LumInfo | null = null;
    private node: string = new URL(process.env.REACT_APP_RPC_URL).hostname;
    private chainId: string | null = null;
    private queryClient: Awaited<ReturnType<typeof lum.ClientFactory.createRPCQueryClient>> | null = null;
    private cosmosSigningClient: SigningStargateClient | null = null;
    private signArbitraryMessage:
        | ((
              message: string,
              fromExtension: boolean,
          ) => Promise<{
              pubkey: string;
              signature: string;
          } | null>)
        | null = null;
    private static instance: WalletClient;

    private constructor() {
        this.connect();
        this.getLumInfo().then((infos) => (this.lumInfos = infos));
    }

    static get Instance() {
        if (!WalletClient.instance) {
            WalletClient.instance = new WalletClient();
        }

        return WalletClient.instance;
    }

    // Utils

    connect = async (node?: string) => {
        if (node) {
            this.node = node;
        }

        try {
            const queryClient = await lum.ClientFactory.createRPCQueryClient({
                rpcEndpoint: getRpcFromNode(this.node),
            });
            this.queryClient = queryClient;
            this.chainId =
                (await queryClient.cosmos.base.tendermint.v1beta1.getNodeInfo()).nodeInfo?.network || 'lum-network-1';

            if (node) {
                showSuccessToast(i18n.t('wallet.success.switchNode'));
            }
        } catch {
            showErrorToast(i18n.t('wallet.errors.client'));
        }
    };

    connectSigner = async (offlineSigner: OfflineAminoSigner) => {
        try {
            const cosmosSigningClient = await getSigningCosmosClient({
                rpcEndpoint: getRpcFromNode(this.node),
                signer: offlineSigner,
            });

            this.cosmosSigningClient = cosmosSigningClient;

            this.signArbitraryMessage = async (message, fromExtension) => {
                const accounts = await offlineSigner.getAccounts();

                if (!accounts.length || !this.chainId) {
                    return null;
                }

                const address = accounts[0].address;

                if (fromExtension) {
                    const keplrWindow = window as KeplrWindow;

                    if (!keplrWindow.keplr) {
                        throw new Error('Keplr is not installed');
                    }

                    const signMsg = await keplrWindow.keplr.signArbitrary(this.chainId, address, encodeURI(message));

                    if (signMsg) {
                        return {
                            pubkey: signMsg.pub_key.value,
                            signature: signMsg.signature,
                        };
                    } else {
                        throw new Error('Unable to sign message');
                    }
                }

                const doc: StdSignDoc = {
                    chain_id: '',
                    account_number: '0',
                    sequence: '0',
                    fee: {
                        amount: [{ amount: '', denom: '' }],
                        gas: '',
                    },
                    msgs: [],
                    memo: encodeURI(message),
                };

                const res = await offlineSigner.signAmino(address, doc);

                if (!isSinglePubkey(res.signature.pub_key)) {
                    return null;
                }

                return {
                    pubkey: res.signature.pub_key.value,
                    signature: res.signature.signature,
                };
            };
        } catch {}
    };

    isTestnet = () => {
        return this.node.includes('testnet');
    };

    // Getters

    private getLumInfo = async (): Promise<LumInfo | null> => {
        try {
            const [lumInfos, previousLumInfos] = await Promise.all([
                axios.get(`${COINGECKO_API_URL}/coins/lum-network`).catch(() => null),
                axios.get(`${COINGECKO_API_URL}/coins/lum-network/market_chart?vs_currency=usd&days=14`),
            ]);

            const lumInfoData = lumInfos && lumInfos.data;
            const previousDays: [number, number][] =
                previousLumInfos && previousLumInfos.data && previousLumInfos.data.prices;

            const price = lumInfoData.market_data.current_price.usd;

            const previousDaysPrices = previousDays.map(([time, value]) => ({ time, value }));

            return {
                price: price,
                denom: lumInfoData.platforms.cosmos,
                symbol: lumInfoData.symbol.toUpperCase(),
                volume_24h: lumInfoData.market_data.total_volume.usd,
                name: lumInfoData.name,
                previousDaysPrices,
            };
        } catch {
            return null;
        }
    };

    private getValidators = async () => {
        if (this.queryClient === null) {
            return null;
        }
        const { validators } = this.queryClient.cosmos.staking.v1beta1;

        try {
            const [bondedValidators, unbondedValidators, unbondingValidators] = await Promise.all([
                validators({ status: 'BOND_STATUS_BONDED' }),
                validators({ status: 'BOND_STATUS_UNBONDED' }),
                validators({ status: 'BOND_STATUS_UNBONDING' }),
            ]);

            return {
                bonded: bondedValidators.validators,
                unbonded: unbondedValidators.validators,
                unbonding: unbondingValidators.validators,
            };
        } catch (e) {}
    };

    getChainId = (): string | null => {
        return this.chainId;
    };

    getNode = (): string => {
        return this.node;
    };

    getLumInfos = (): LumInfo | null => {
        return this.lumInfos;
    };

    getValidatorsInfos = async (address: string) => {
        if (!this.queryClient) {
            return null;
        }

        try {
            const validators = await this.getValidators();

            const [delegation, unbonding] = await Promise.all([
                this.queryClient.cosmos.staking.v1beta1.delegatorDelegations({ delegatorAddr: address }),
                this.queryClient.cosmos.staking.v1beta1.delegatorUnbondingDelegations({ delegatorAddr: address }),
            ]);

            const delegations = delegation.delegationResponses;
            const unbondings = unbonding.unbondingResponses;

            let unbondedTokens = 0;
            let stakedCoins = 0;

            for (const delegation of delegations) {
                if (delegation.balance) {
                    stakedCoins += Number(convertUnit(delegation.balance, LUM_DENOM));
                }
            }

            for (const unbonding of unbondings) {
                for (const entry of unbonding.entries) {
                    unbondedTokens += Number(convertUnit({ amount: entry.balance, denom: MICRO_LUM_DENOM }, LUM_DENOM));
                }
            }

            return {
                bonded: validators?.bonded || [],
                unbonded: validators?.unbonded || [],
                unbonding: validators?.unbonding || [],
                delegations,
                unbondings,
                stakedCoins,
                unbondedTokens,
            };
        } catch (e) {}
    };

    getWalletBalance = async (address: string) => {
        if (this.queryClient === null) {
            return null;
        }

        let lum = 0;
        let fiat = 0;

        const otherBalancesArr = [];

        const { balances } = await this.queryClient.cosmos.bank.v1beta1.allBalances({ address });

        const ulumBalance = balances.find((balance) => balance.denom === MICRO_LUM_DENOM);
        const otherBalances = balances.filter((balance) => balance.denom !== MICRO_LUM_DENOM);

        if (ulumBalance) {
            lum += Number(convertUnit(ulumBalance, LUM_DENOM));
        }

        for (const oB of otherBalances) {
            otherBalancesArr.push({
                denom: DenomsUtils.computeDenom(oB.denom),
                amount: NumbersUtils.convertUnitNumber(oB.amount),
            });
        }

        if (this.lumInfos) {
            fiat = lum * this.lumInfos.price;
        }

        return {
            currentBalance: {
                lum,
                fiat,
            },
            otherBalances: otherBalancesArr,
        };
    };

    getVestingsInfos = async (address: string) => {
        if (this.queryClient === null) {
            return null;
        }

        try {
            const { account } = await this.queryClient.cosmos.auth.v1beta1.account({ address });

            if (account) {
                const typedAccount = accountFromAny(account);

                const { lockedBankCoins, lockedDelegatedCoins, lockedCoins, endsAt } = estimatedVesting(typedAccount);

                return { lockedBankCoins, lockedDelegatedCoins, lockedCoins, endsAt };
            }

            return null;
        } catch {
            return null;
        }
    };

    getAirdropInfos = async (address: string) => {
        if (this.queryClient === null) {
            return null;
        }

        try {
            const airdrop = await this.queryClient.lum.network.airdrop.claimRecord({ address });

            if (airdrop.claimRecord) {
                const { initialClaimableAmount, actionCompleted } = airdrop.claimRecord;
                const [vote, delegate] = actionCompleted;

                let amount = initialClaimableAmount.reduce(
                    (acc, coin) => acc + Number(convertUnit(coin, LUM_DENOM)),
                    0,
                );

                if (vote && delegate) {
                    amount = 0;
                } else if (vote || delegate) {
                    amount = amount / 2;
                }

                return {
                    amount,
                    vote,
                    delegate,
                };
            }

            return null;
        } catch {
            return null;
        }
    };

    getTransactions = async (address: string) => {
        if (this.cosmosSigningClient === null) {
            return null;
        }

        const res = await this.cosmosSigningClient.searchTx(`transfer.recipient='${address}'`);
        const res2 = await this.cosmosSigningClient.searchTx(`transfer.sender='${address}'`);

        return formatTxs([...res, ...res2]);
    };

    getRewards = async (address: string) => {
        if (this.queryClient === null) {
            return null;
        }

        return await this.queryClient.cosmos.distribution.v1beta1.delegationTotalRewards({ delegatorAddress: address });
    };

    getProposals = async (): Promise<Proposal[] | null> => {
        if (this.queryClient === null) {
            return null;
        }

        const proposals: Proposal[] = [];
        const result = await this.queryClient.cosmos.gov.v1.proposals({
            proposalStatus:
                ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED |
                ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD |
                ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD |
                ProposalStatus.PROPOSAL_STATUS_PASSED |
                ProposalStatus.PROPOSAL_STATUS_REJECTED |
                ProposalStatus.PROPOSAL_STATUS_FAILED |
                ProposalStatus.UNRECOGNIZED,
            voter: '',
            depositor: '',
        });

        result.proposals.map(async (proposal) => {
            let content: {
                title: string;
                description: string;
            } | null = null;

            if (proposal.messages[0]) {
                if (proposal.messages[0].typeUrl === MessageTypes.SOFTWARE_UPDGRADE && proposal.metadata) {
                    try {
                        const { data } = await axios.get(`${IPFS_GATEWAY}/${proposal.metadata.replace('ipfs://', '')}`);
                        content = {
                            title: data.title,
                            description: data.details,
                        };
                    } catch {}
                } else if (proposal.messages[0].typeUrl === MessageTypes.LEGACY_PROPOSAL) {
                    const messageData = LumRegistry.decode(proposal.messages[0]);
                    const data = LumRegistry.decode(messageData.content);
                    content = {
                        title: data.title,
                        description: data.description,
                    };
                }
            }

            proposals.push({
                ...proposal,
                content,
                finalResult: {
                    yes: Number(proposal.finalTallyResult?.yesCount) || 0,
                    no: Number(proposal.finalTallyResult?.noCount) || 0,
                    noWithVeto: Number(proposal.finalTallyResult?.noWithVetoCount) || 0,
                    abstain: Number(proposal.finalTallyResult?.abstainCount) || 0,
                },
            });
        });

        return proposals;
    };

    getProposalTally = async (id: string) => {
        if (this.queryClient === null) {
            return null;
        }

        const result = await this.queryClient.cosmos.gov.v1.tallyResult({ proposalId: BigInt(id) });

        if (!result || !result.tally) {
            return null;
        }

        return {
            yes: Number(result.tally.yesCount),
            no: Number(result.tally.noCount),
            noWithVeto: Number(result.tally.noWithVetoCount),
            abstain: Number(result.tally.abstainCount),
        };
    };

    // Operations

    sendTx = async (fromWallet: Wallet, toAddress: string, lumAmount: string, memo = '') => {
        if (this.cosmosSigningClient === null) {
            return null;
        }

        // Convert Lum to uLum
        const amount = convertUnit({ denom: LUM_DENOM, amount: lumAmount }, MICRO_LUM_DENOM);

        // Build transaction message
        const sendMsg = send({
            fromAddress: fromWallet.address,
            toAddress,
            amount: [{ denom: MICRO_LUM_DENOM, amount }],
        });

        // Define fees
        const gasEstimated = await this.cosmosSigningClient.simulate(fromWallet.address, [sendMsg], memo);
        const fee = {
            amount: coins('25000', MICRO_LUM_DENOM),
            gas: new IntPretty(new Dec(gasEstimated).mul(new Dec(1.3))).maxDecimals(0).locale(false).toString(),
        };

        // Fetch chain id
        const chainId = this.getChainId();

        if (!chainId) {
            return null;
        }

        const broadcastResult = await this.cosmosSigningClient.signAndBroadcast(
            fromWallet.address,
            [sendMsg],
            fee,
            memo,
        );

        // Verify the transaction was successfully broadcasted and made it into a block
        assertIsDeliverTxSuccess(broadcastResult);

        return {
            hash: broadcastResult.transactionHash,
            error: broadcastResult.code !== 0 ? broadcastResult.rawLog : null,
        };
    };

    delegate = async (fromWallet: Wallet, validatorAddress: string, lumAmount: string, memo: string) => {
        if (this.cosmosSigningClient === null) {
            return null;
        }

        // Convert Lum to uLum
        const amount = convertUnit({ denom: LUM_DENOM, amount: lumAmount }, MICRO_LUM_DENOM);

        const delegateMsg = delegate({
            delegatorAddress: fromWallet.address,
            validatorAddress,
            amount: {
                denom: MICRO_LUM_DENOM,
                amount,
            },
        });

        // Define fees
        const gasEstimated = await this.cosmosSigningClient.simulate(fromWallet.address, [delegateMsg], memo);
        const fee = {
            amount: coins('25000', MICRO_LUM_DENOM),
            gas: new IntPretty(new Dec(gasEstimated).mul(new Dec(1.3))).maxDecimals(0).locale(false).toString(),
        };

        // Fetch chain id
        const chainId = this.getChainId();

        if (!chainId) {
            return null;
        }

        const broadcastResult = await this.cosmosSigningClient.signAndBroadcast(
            fromWallet.address,
            [delegateMsg],
            fee,
            memo,
        );

        // Verify the transaction was successfully broadcasted and made it into a block
        assertIsDeliverTxSuccess(broadcastResult);

        return {
            hash: broadcastResult.transactionHash,
            error: broadcastResult.code !== 0 ? broadcastResult.rawLog : null,
        };
    };

    undelegate = async (fromWallet: Wallet, validatorAddress: string, lumAmount: string, memo: string) => {
        if (this.cosmosSigningClient === null) {
            return null;
        }

        // Convert Lum to uLum
        const amount = convertUnit({ denom: LUM_DENOM, amount: lumAmount }, MICRO_LUM_DENOM);

        const undelegateMsg = undelegate({
            delegatorAddress: fromWallet.address,
            validatorAddress,
            amount: {
                denom: MICRO_LUM_DENOM,
                amount,
            },
        });

        // Define fees
        const gasEstimated = await this.cosmosSigningClient.simulate(fromWallet.address, [undelegateMsg], memo);
        const fee = {
            amount: coins('25000', MICRO_LUM_DENOM),
            gas: new IntPretty(new Dec(gasEstimated).mul(new Dec(1.3))).maxDecimals(0).locale(false).toString(),
        };

        // Fetch chain id
        const chainId = this.getChainId();

        if (!chainId) {
            return null;
        }

        const broadcastResult = await this.cosmosSigningClient.signAndBroadcast(
            fromWallet.address,
            [undelegateMsg],
            fee,
            memo,
        );

        // Verify the transaction was successfully broadcasted and made it into a block
        assertIsDeliverTxSuccess(broadcastResult);

        return {
            hash: broadcastResult.transactionHash,
            error: broadcastResult.code !== 0 ? broadcastResult.rawLog : null,
        };
    };

    getReward = async (fromWallet: Wallet, validatorAddress: string, memo: string) => {
        if (this.cosmosSigningClient === null) {
            return null;
        }

        const getRewardMsg = withdrawDelegatorReward({ delegatorAddress: fromWallet.address, validatorAddress });

        // Define fees
        const gasEstimated = await this.cosmosSigningClient.simulate(fromWallet.address, [getRewardMsg], memo);
        const fee = {
            amount: coins('25000', MICRO_LUM_DENOM),
            gas: new IntPretty(new Dec(gasEstimated).mul(new Dec(1.3))).maxDecimals(0).locale(false).toString(),
        };

        // Fetch chain id
        const chainId = this.getChainId();

        if (!chainId) {
            return null;
        }

        const broadcastResult = await this.cosmosSigningClient.signAndBroadcast(
            fromWallet.address,
            [getRewardMsg],
            fee,
            memo,
        );

        // Verify the transaction was successfully broadcasted and made it into a block
        assertIsDeliverTxSuccess(broadcastResult);

        return {
            hash: broadcastResult.transactionHash,
            error: broadcastResult.code !== 0 ? broadcastResult.rawLog : null,
        };
    };

    getRewardsFromValidators = async (fromWallet: Wallet, validatorsAddresses: string[], memo: string) => {
        if (this.cosmosSigningClient === null) {
            return null;
        }

        const messages = [];
        const limit = fromWallet.isLedger ? 6 : undefined;

        for (const [index, validatorAddress] of validatorsAddresses.entries()) {
            messages.push(withdrawDelegatorReward({ delegatorAddress: fromWallet.address, validatorAddress }));
            if (limit && index + 1 === limit) break;
        }

        // Define fees
        const gasEstimated = await this.cosmosSigningClient.simulate(fromWallet.address, messages, memo);
        const fee = {
            amount: coins('25000', MICRO_LUM_DENOM),
            gas: new IntPretty(new Dec(gasEstimated).mul(new Dec(1.3))).maxDecimals(0).locale(false).toString(),
        };

        // Fetch chain id
        const chainId = this.getChainId();

        if (!chainId) {
            return null;
        }

        const broadcastResult = await this.cosmosSigningClient.signAndBroadcast(
            fromWallet.address,
            messages,
            fee,
            memo,
        );

        // Verify the transaction was successfully broadcasted and made it into a block
        assertIsDeliverTxSuccess(broadcastResult);

        return {
            hash: broadcastResult.transactionHash,
            error: broadcastResult.code !== 0 ? broadcastResult.rawLog : null,
        };
    };

    redelegate = async (
        fromWallet: Wallet,
        validatorSrcAddress: string,
        validatorDstAddress: string,
        lumAmount: string,
        memo: string,
    ) => {
        if (this.cosmosSigningClient === null) {
            return null;
        }

        // Convert Lum to uLum
        const amount = convertUnit({ denom: LUM_DENOM, amount: lumAmount }, MICRO_LUM_DENOM);

        const redelegateMsg = beginRedelegate({
            delegatorAddress: fromWallet.address,
            validatorSrcAddress,
            validatorDstAddress,
            amount: {
                amount,
                denom: MICRO_LUM_DENOM,
            },
        });

        // Define fees
        const gasEstimated = await this.cosmosSigningClient.simulate(fromWallet.address, [redelegateMsg], memo);
        const fee = {
            amount: coins('25000', MICRO_LUM_DENOM),
            gas: new IntPretty(new Dec(gasEstimated).mul(new Dec(1.3))).maxDecimals(0).locale(false).toString(),
        };

        // Fetch chain id
        const chainId = this.getChainId();

        if (!chainId) {
            return null;
        }

        const broadcastResult = await this.cosmosSigningClient.signAndBroadcast(
            fromWallet.address,
            [redelegateMsg],
            fee,
            memo,
        );

        // Verify the transaction was successfully broadcasted and made it into a block
        assertIsDeliverTxSuccess(broadcastResult);

        return {
            hash: broadcastResult.transactionHash,
            error: broadcastResult.code !== 0 ? broadcastResult.rawLog : null,
        };
    };

    vote = async (fromWallet: Wallet, proposal: Proposal, voteOption: VoteOption) => {
        if (this.cosmosSigningClient === null) {
            return null;
        }

        const voteMsg = vote({
            proposalId: proposal.id,
            voter: fromWallet.address,
            option: voteOption,
        });

        // Define fees
        const gasEstimated = await this.cosmosSigningClient.simulate(fromWallet.address, [voteMsg], undefined);
        const fee = {
            amount: coins('25000', MICRO_LUM_DENOM),
            gas: new IntPretty(new Dec(gasEstimated).mul(new Dec(1.3))).maxDecimals(0).locale(false).toString(),
        };

        // Fetch chain id
        const chainId = this.getChainId();

        if (!chainId) {
            return null;
        }

        const broadcastResult = await this.cosmosSigningClient.signAndBroadcast(
            fromWallet.address,
            [voteMsg],
            fee,
            undefined,
        );

        // Verify the transaction was successfully broadcasted and made it into a block
        assertIsDeliverTxSuccess(broadcastResult);

        return {
            hash: broadcastResult.transactionHash,
            error: broadcastResult.code !== 0 ? broadcastResult.rawLog : null,
        };
    };

    setWithdrawAddress = async (fromWallet: Wallet, withdrawAddress = '', memo = '') => {
        if (this.cosmosSigningClient === null) {
            return null;
        }

        const setWithdrawAddressMsg = setWithdrawAddress({ delegatorAddress: fromWallet.address, withdrawAddress });

        // Define fees
        const gasEstimated = await this.cosmosSigningClient.simulate(fromWallet.address, [setWithdrawAddressMsg], memo);
        const fee = {
            amount: coins('25000', MICRO_LUM_DENOM),
            gas: new IntPretty(new Dec(gasEstimated).mul(new Dec(1.3))).maxDecimals(0).locale(false).toString(),
        };

        // Fetch chain id
        const chainId = this.getChainId();

        if (!chainId) {
            return null;
        }

        const broadcastResult = await this.cosmosSigningClient.signAndBroadcast(
            fromWallet.address,
            [setWithdrawAddressMsg],
            fee,
            memo,
        );

        // Verify the transaction was successfully broadcasted and made it into a block
        assertIsDeliverTxSuccess(broadcastResult);

        return {
            hash: broadcastResult.transactionHash,
            error: broadcastResult.code !== 0 ? broadcastResult.rawLog : null,
        };
    };

    signMessage = async (wallet: Wallet, message: string) => {
        if (!this.signArbitraryMessage) {
            return null;
        }

        return this.signArbitraryMessage(message, !!wallet.isExtensionImport);
    };

    updateNode = (node: string) => this.connect(node);
}

export default WalletClient.Instance;
