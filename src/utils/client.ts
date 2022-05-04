import { LumClient, LumConstants, LumMessages, LumRegistry, LumTypes, LumUtils } from '@lum-network/sdk-javascript';
import { TxResponse } from '@cosmjs/tendermint-rpc';
import { PasswordStrengthType, PasswordStrength, Transaction, Wallet, Proposal, LumInfo } from 'models';
import { showErrorToast } from 'utils';
import i18n from 'locales';
import { ProposalStatus, VoteOption } from '@lum-network/sdk-javascript/build/codec/cosmos/gov/v1beta1/gov';
import Long from 'long';
import axios from 'axios';
import { OSMOSIS_API_URL } from 'constant';
import { sortByBlockHeight } from './transactions';

export type MnemonicLength = 12 | 24;

export const checkMnemonicLength = (length: number): length is MnemonicLength => {
    return length === 12 || length === 24;
};

export const generateMnemonic = (mnemonicLength: MnemonicLength): string[] => {
    const inputs: string[] = [];
    const mnemonicKeys = LumUtils.generateMnemonic(mnemonicLength).split(' ');

    for (let i = 0; i < mnemonicLength; i++) {
        inputs.push(mnemonicKeys[i]);
    }

    return inputs;
};

export const generateKeystoreFile = (password: string): LumUtils.KeyStore => {
    const privateKey = LumUtils.generatePrivateKey();

    return LumUtils.generateKeyStore(privateKey, password);
};

export const checkPwdStrength = (password: string): PasswordStrength => {
    const strongPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{9,})');
    const mediumPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{9,})');

    if (strongPassword.test(password)) {
        return PasswordStrengthType.Strong;
    } else if (mediumPassword.test(password)) {
        return PasswordStrengthType.Medium;
    }
    return PasswordStrengthType.Weak;
};

type SendTxInfos = {
    fromAddress: string;
    toAddress: string;
    amount: LumTypes.Coin[];
};

type StakingTxInfos = {
    validatorAddress: string;
    delegatorAddress: string;
    amount: LumTypes.Coin;
};

type LumInfoType = {
    price: number;
    denom: string;
    symbol: string;
    liquidity: number;
    volume_24h: number;
    name: number;
};

type PreviousDayLumInfoType = {
    open: number;
    high: number;
    close: number;
    low: number;
    time: number;
};

const isSendTxInfo = (
    info: {
        fromAddress?: string;
        toAddress?: string;
        amount?: LumTypes.Coin[];
    } | null,
): info is SendTxInfos => {
    return !!(info && info.fromAddress && info.toAddress && info.amount);
};

const isStakingTxInfo = (
    info: {
        delegatorAddress?: string;
        validatorAddress?: string;
        amount?: LumTypes.Coin;
    } | null,
): info is StakingTxInfos => {
    return !!(info && info.validatorAddress && info.delegatorAddress && info.amount);
};

const isLumInfo = (
    info: {
        price?: number;
        denom?: string;
        symbol?: string;
        liquidity?: number;
        volume_24h?: number;
        name?: number;
    } | null,
): info is LumInfoType => {
    return !!(info && info.price && info.liquidity && info.denom && info.name && info.volume_24h);
};

const isPreviousDayLumInfo = (
    info: {
        open?: number;
        high?: number;
        close?: number;
        low?: number;
        time?: number;
    } | null,
): info is PreviousDayLumInfoType => {
    return !!(info && info.open && info.close && info.high && info.low && info.time);
};

const alreadyExists = (array: Transaction[], value: Transaction) => {
    return array.length === 0 ? false : array.findIndex((val) => val.hash === value.hash) > -1;
};

export const formatTxs = async (rawTxs: TxResponse[]): Promise<Transaction[]> => {
    const formattedTxs: Transaction[] = [];

    for (const rawTx of rawTxs) {
        // Decode TX to human readable format
        const txData = LumRegistry.decodeTx(rawTx.tx);

        if (txData.body && txData.body.messages) {
            for (const msg of txData.body.messages) {
                const txInfos = LumUtils.toJSON(LumRegistry.decode(msg));
                if (typeof txInfos === 'object') {
                    if (isSendTxInfo(txInfos)) {
                        const tx: Transaction = {
                            ...txInfos,
                            type: msg.typeUrl,
                            height: rawTx.height,
                            hash: LumUtils.toHex(rawTx.hash).toUpperCase(),
                        };
                        if (!alreadyExists(formattedTxs, tx)) {
                            formattedTxs.push(tx);
                        }
                    } else if (isStakingTxInfo(txInfos)) {
                        const fromAddress = txInfos.delegatorAddress;
                        const toAddress = txInfos.validatorAddress;

                        const tx: Transaction = {
                            fromAddress,
                            toAddress,
                            type: msg.typeUrl,
                            amount: [txInfos.amount],
                            height: rawTx.height,
                            hash: LumUtils.toHex(rawTx.hash).toUpperCase(),
                        };

                        if (!alreadyExists(formattedTxs, tx)) {
                            formattedTxs.push(tx);
                        }
                    }
                }
            }
        }
    }

    return sortByBlockHeight(formattedTxs);
};

export const generateSignedMessage = async (wallet: Wallet, message: string): Promise<LumTypes.SignMsg> => {
    return await wallet.signMessage(encodeURI(message));
};

export const validateSignMessage = async (msg: LumTypes.SignMsg): Promise<boolean> => {
    return await LumUtils.verifySignMsg(msg);
};

class WalletClient {
    lumClient: LumClient | null = null;
    lumInfos: LumInfo | null = null;
    chainId: string | null = null;

    // Init

    init = () => {
        LumClient.connect(process.env.REACT_APP_RPC_URL)
            .then(async (client) => {
                this.lumClient = client;
                this.chainId = await client.getChainId();
                this.lumInfos = await this.getLumInfo();
            })
            .catch(() => showErrorToast(i18n.t('wallet.errors.client')));
    };

    // Getters

    private getLumInfo = async (): Promise<LumInfo | null> => {
        const [lumInfos, previousDayLumInfos] = await Promise.all([
            axios.get(`${OSMOSIS_API_URL}/tokens/v2/LUM`).catch(() => null),
            axios.get(`${OSMOSIS_API_URL}/tokens/v2/historical/LUM/chart?tf=60`).catch(() => null),
        ]);

        const lumInfoData = lumInfos && lumInfos.data[0];
        const previousDayLumInfoData = previousDayLumInfos && previousDayLumInfos.data;

        if (isLumInfo(lumInfoData)) {
            const previousDaysPrices = Array.isArray(previousDayLumInfoData)
                ? previousDayLumInfoData.filter(isPreviousDayLumInfo)
                : [];

            return {
                ...lumInfoData,
                previousDaysPrices,
            };
        }

        return null;
    };

    private getAccountAndChainId = (fromWallet: Wallet) => {
        if (this.lumClient === null) {
            return;
        }

        return Promise.all([this.lumClient.getAccount(fromWallet.getAddress()), this.chainId]);
    };

    private getValidators = async () => {
        if (this.lumClient === null) {
            return null;
        }
        const { validators } = this.lumClient.queryClient.staking;

        try {
            const [bondedValidators, unbondedValidators] = await Promise.all([
                validators('BOND_STATUS_BONDED'),
                validators('BOND_STATUS_UNBONDED'),
            ]);

            return { bonded: bondedValidators.validators, unbonded: unbondedValidators.validators };
        } catch (e) {}
    };

    getValidatorsInfos = async (address: string) => {
        if (!this.lumClient) {
            return null;
        }

        try {
            const validators = await this.getValidators();

            const [delegation, unbonding] = await Promise.all([
                this.lumClient.queryClient.staking.delegatorDelegations(address),
                this.lumClient.queryClient.staking.delegatorUnbondingDelegations(address),
            ]);

            const delegations = delegation.delegationResponses;
            const unbondings = unbonding.unbondingResponses;

            let unbondedTokens = 0;
            let stakedCoins = 0;

            for (const delegation of delegations) {
                if (delegation.balance) {
                    stakedCoins += Number(LumUtils.convertUnit(delegation.balance, LumConstants.LumDenom));
                }
            }

            for (const unbonding of unbondings) {
                for (const entry of unbonding.entries) {
                    unbondedTokens += Number(
                        LumUtils.convertUnit(
                            { amount: entry.balance, denom: LumConstants.MicroLumDenom },
                            LumConstants.LumDenom,
                        ),
                    );
                }
            }

            return {
                bonded: validators?.bonded || [],
                unbonded: validators?.unbonded || [],
                delegations,
                unbondings,
                stakedCoins,
                unbondedTokens,
            };
        } catch (e) {}
    };

    getWalletBalance = async (address: string) => {
        if (this.lumClient === null) {
            return null;
        }

        let lum = 0;
        let fiat = 0;

        const balances = await this.lumClient.getAllBalances(address);
        if (balances.length > 0) {
            for (const balance of balances) {
                lum += Number(LumUtils.convertUnit(balance, LumConstants.LumDenom));
            }
        }

        if (this.lumInfos) {
            fiat = lum * this.lumInfos.price;
        }

        return {
            currentBalance: {
                lum,
                fiat,
            },
        };
    };

    getVestingsInfos = async (address: string) => {
        if (this.lumClient === null) {
            return null;
        }

        try {
            const account = await this.lumClient.getAccount(address);

            if (account) {
                const { lockedBankCoins, lockedDelegatedCoins, lockedCoins, endsAt } =
                    LumUtils.estimatedVesting(account);

                return { lockedBankCoins, lockedDelegatedCoins, lockedCoins, endsAt };
            }

            return null;
        } catch {
            return null;
        }
    };

    getAirdropInfos = async (address: string) => {
        if (this.lumClient === null) {
            return null;
        }

        try {
            const airdrop = await this.lumClient.queryClient.airdrop.claimRecord(address);

            if (airdrop.claimRecord) {
                const { initialClaimableAmount, actionCompleted } = airdrop.claimRecord;
                const [vote, delegate] = actionCompleted;

                let amount = initialClaimableAmount.reduce(
                    (acc, coin) => acc + Number(LumUtils.convertUnit(coin, LumConstants.LumDenom)),
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
        if (this.lumClient === null) {
            return null;
        }

        const transactions = await this.lumClient.searchTx([
            LumUtils.searchTxByTags([{ key: 'transfer.recipient', value: address }]),
            LumUtils.searchTxByTags([{ key: 'transfer.sender', value: address }]),
        ]);

        return await formatTxs(transactions);
    };

    getRewards = async (address: string) => {
        if (this.lumClient === null) {
            return null;
        }

        return await this.lumClient.queryClient.distribution.delegationTotalRewards(address);
    };

    getProposals = async (): Promise<Proposal[] | null> => {
        if (this.lumClient === null) {
            return null;
        }

        const result = await this.lumClient.queryClient.gov.proposals(
            ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED |
                ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD |
                ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD |
                ProposalStatus.PROPOSAL_STATUS_PASSED |
                ProposalStatus.PROPOSAL_STATUS_REJECTED |
                ProposalStatus.PROPOSAL_STATUS_FAILED |
                ProposalStatus.UNRECOGNIZED,
            '',
            '',
        );

        return result.proposals.map((proposal) => ({
            ...proposal,
            content: proposal.content ? LumRegistry.decode(proposal.content) : proposal.content,
            finalResult: {
                yes: Number(proposal.finalTallyResult?.yes) || 0,
                no: Number(proposal.finalTallyResult?.no) || 0,
                noWithVeto: Number(proposal.finalTallyResult?.noWithVeto) || 0,
                abstain: Number(proposal.finalTallyResult?.abstain) || 0,
            },
        }));
    };

    getProposalTally = async (id: string) => {
        if (this.lumClient === null) {
            return null;
        }

        const result = await this.lumClient.queryClient.gov.tally(id);

        if (!result || !result.tally) {
            return null;
        }

        return {
            yes: Number(result.tally.yes),
            no: Number(result.tally.no),
            noWithVeto: Number(result.tally.noWithVeto),
            abstain: Number(result.tally.abstain),
        };
    };

    // Operations

    sendTx = async (fromWallet: Wallet, toAddress: string, lumAmount: string, memo = '') => {
        if (this.lumClient === null) {
            return null;
        }

        // Convert Lum to uLum
        const amount = LumUtils.convertUnit(
            { denom: LumConstants.LumDenom, amount: lumAmount },
            LumConstants.MicroLumDenom,
        );

        // Build transaction message
        const sendMsg = LumMessages.BuildMsgSend(fromWallet.getAddress(), toAddress, [
            { denom: LumConstants.MicroLumDenom, amount },
        ]);
        // Define fees
        const fee = {
            amount: [{ denom: LumConstants.MicroLumDenom, amount: '25000' }],
            gas: '100000',
        };
        // Fetch account number and sequence and chain id
        const result = await this.getAccountAndChainId(fromWallet);

        if (!result) {
            return null;
        }

        const [account, chainId] = result;

        if (!account || !chainId) {
            return null;
        }

        const { accountNumber, sequence } = account;
        // Create the transaction document
        const doc: LumTypes.Doc = {
            chainId,
            fee,
            memo,
            messages: [sendMsg],
            signers: [
                {
                    accountNumber,
                    sequence,
                    publicKey: fromWallet.getPublicKey(),
                },
            ],
        };
        // Sign and broadcast the transaction using the client
        const broadcastResult = await this.lumClient.signAndBroadcastTx(fromWallet, doc);
        // Verify the transaction was successfully broadcasted and made it into a block
        const broadcasted = LumUtils.broadcastTxCommitSuccess(broadcastResult);

        return {
            hash: broadcastResult.hash,
            error: !broadcasted
                ? broadcastResult.deliverTx && broadcastResult.deliverTx.log
                    ? broadcastResult.deliverTx.log
                    : broadcastResult.checkTx.log
                : null,
        };
    };

    delegate = async (fromWallet: Wallet, validatorAddress: string, lumAmount: string, memo: string) => {
        if (this.lumClient === null) {
            return null;
        }

        // Convert Lum to uLum
        const amount = LumUtils.convertUnit(
            { denom: LumConstants.LumDenom, amount: lumAmount },
            LumConstants.MicroLumDenom,
        );

        const delegateMsg = LumMessages.BuildMsgDelegate(fromWallet.getAddress(), validatorAddress, {
            denom: LumConstants.MicroLumDenom,
            amount,
        });

        // Define fees
        const fee = {
            amount: [{ denom: LumConstants.MicroLumDenom, amount: '25000' }],
            gas: '200000',
        };

        // Fetch account number and sequence and chain id
        const result = await this.getAccountAndChainId(fromWallet);

        if (!result) {
            return null;
        }

        const [account, chainId] = result;

        if (!account || !chainId) {
            return null;
        }

        const { accountNumber, sequence } = account;

        const doc: LumTypes.Doc = {
            chainId,
            fee,
            memo,
            messages: [delegateMsg],
            signers: [
                {
                    accountNumber,
                    sequence,
                    publicKey: fromWallet.getPublicKey(),
                },
            ],
        };

        const broadcastResult = await this.lumClient.signAndBroadcastTx(fromWallet, doc);
        // Verify the transaction was successfully broadcasted and made it into a block
        const broadcasted = LumUtils.broadcastTxCommitSuccess(broadcastResult);

        return {
            hash: broadcastResult.hash,
            error: !broadcasted
                ? broadcastResult.deliverTx && broadcastResult.deliverTx.log
                    ? broadcastResult.deliverTx.log
                    : broadcastResult.checkTx.log
                : null,
        };
    };

    undelegate = async (fromWallet: Wallet, validatorAddress: string, lumAmount: string, memo: string) => {
        if (this.lumClient === null) {
            return null;
        }

        // Convert Lum to uLum
        const amount = LumUtils.convertUnit(
            { denom: LumConstants.LumDenom, amount: lumAmount },
            LumConstants.MicroLumDenom,
        );

        const undelegateMsg = LumMessages.BuildMsgUndelegate(fromWallet.getAddress(), validatorAddress, {
            denom: LumConstants.MicroLumDenom,
            amount,
        });

        // Define fees
        const fee = {
            amount: [{ denom: LumConstants.MicroLumDenom, amount: '25000' }],
            gas: '200000',
        };

        // Fetch account number and sequence and chain id
        const result = await this.getAccountAndChainId(fromWallet);

        if (!result) {
            return null;
        }

        const [account, chainId] = result;

        if (!account || !chainId) {
            return null;
        }

        const { accountNumber, sequence } = account;
        const doc: LumTypes.Doc = {
            chainId,
            fee,
            memo,
            messages: [undelegateMsg],
            signers: [
                {
                    accountNumber,
                    sequence,
                    publicKey: fromWallet.getPublicKey(),
                },
            ],
        };

        const broadcastResult = await this.lumClient.signAndBroadcastTx(fromWallet, doc);
        // Verify the transaction was successfully broadcasted and made it into a block
        const broadcasted = LumUtils.broadcastTxCommitSuccess(broadcastResult);

        return {
            hash: broadcastResult.hash,
            error: !broadcasted
                ? broadcastResult.deliverTx && broadcastResult.deliverTx.log
                    ? broadcastResult.deliverTx.log
                    : broadcastResult.checkTx.log
                : null,
        };
    };

    getReward = async (fromWallet: Wallet, validatorAddress: string, memo: string) => {
        if (this.lumClient === null) {
            return null;
        }

        const getRewardMsg = LumMessages.BuildMsgWithdrawDelegatorReward(fromWallet.getAddress(), validatorAddress);

        // Define fees
        const fee = {
            amount: [{ denom: LumConstants.MicroLumDenom, amount: '25000' }],
            gas: '140000',
        };

        // Fetch account number and sequence and chain id
        const result = await this.getAccountAndChainId(fromWallet);

        if (!result) {
            return null;
        }

        const [account, chainId] = result;

        if (!account || !chainId) {
            return null;
        }

        const { accountNumber, sequence } = account;

        const doc: LumTypes.Doc = {
            chainId,
            fee,
            memo,
            messages: [getRewardMsg],
            signers: [
                {
                    accountNumber,
                    sequence,
                    publicKey: fromWallet.getPublicKey(),
                },
            ],
        };

        const broadcastResult = await this.lumClient.signAndBroadcastTx(fromWallet, doc);
        // Verify the transaction was successfully broadcasted and made it into a block
        const broadcasted = LumUtils.broadcastTxCommitSuccess(broadcastResult);

        return {
            hash: broadcastResult.hash,
            error: !broadcasted
                ? broadcastResult.deliverTx && broadcastResult.deliverTx.log
                    ? broadcastResult.deliverTx.log
                    : broadcastResult.checkTx.log
                : null,
        };
    };

    getAllRewards = async (fromWallet: Wallet, validatorsAddresses: string[], memo: string) => {
        if (this.lumClient === null) {
            return null;
        }

        const messages = [];
        const limit = fromWallet.isNanoS ? 6 : undefined;
        let gas = 140000;

        for (const [index, valAdd] of validatorsAddresses.entries()) {
            messages.push(LumMessages.BuildMsgWithdrawDelegatorReward(fromWallet.getAddress(), valAdd));
            if (index > 0) {
                gas += 80000;
            }
            if (limit && index + 1 === limit) break;
        }

        // Define fees
        const fee = {
            amount: [{ denom: LumConstants.MicroLumDenom, amount: '25000' }],
            gas: gas.toString(),
        };

        // Fetch account number and sequence and chain id
        const result = await this.getAccountAndChainId(fromWallet);

        if (!result) {
            return null;
        }

        const [account, chainId] = result;

        if (!account || !chainId) {
            return null;
        }

        const { accountNumber, sequence } = account;

        const doc: LumTypes.Doc = {
            chainId,
            fee,
            memo,
            messages,
            signers: [
                {
                    accountNumber,
                    sequence,
                    publicKey: fromWallet.getPublicKey(),
                },
            ],
        };

        const broadcastResult = await this.lumClient.signAndBroadcastTx(fromWallet, doc);
        // Verify the transaction was successfully broadcasted and made it into a block
        const broadcasted = LumUtils.broadcastTxCommitSuccess(broadcastResult);

        return {
            hash: broadcastResult.hash,
            error: !broadcasted
                ? broadcastResult.deliverTx && broadcastResult.deliverTx.log
                    ? broadcastResult.deliverTx.log
                    : broadcastResult.checkTx.log
                : null,
        };
    };

    redelegate = async (
        fromWallet: Wallet,
        validatorScrAddress: string,
        validatorDestAddress: string,
        lumAmount: string,
        memo: string,
    ) => {
        if (this.lumClient === null) {
            return null;
        }

        // Convert Lum to uLum
        const amount = LumUtils.convertUnit(
            { denom: LumConstants.LumDenom, amount: lumAmount },
            LumConstants.MicroLumDenom,
        );

        const redelegateMsg = LumMessages.BuildMsgBeginRedelegate(
            fromWallet.getAddress(),
            validatorScrAddress,
            validatorDestAddress,
            {
                amount,
                denom: LumConstants.MicroLumDenom,
            },
        );

        // Define fees
        const fee = {
            amount: [{ denom: LumConstants.MicroLumDenom, amount: '25000' }],
            gas: '300000',
        };

        // Fetch account number and sequence and chain id
        const result = await this.getAccountAndChainId(fromWallet);

        if (!result) {
            return null;
        }

        const [account, chainId] = result;

        if (!account || !chainId) {
            return null;
        }

        const { accountNumber, sequence } = account;

        const doc: LumTypes.Doc = {
            chainId,
            fee,
            memo,
            messages: [redelegateMsg],
            signers: [
                {
                    accountNumber,
                    sequence,
                    publicKey: fromWallet.getPublicKey(),
                },
            ],
        };

        const broadcastResult = await this.lumClient.signAndBroadcastTx(fromWallet, doc);
        // Verify the transaction was successfully broadcasted and made it into a block
        const broadcasted = LumUtils.broadcastTxCommitSuccess(broadcastResult);

        return {
            hash: broadcastResult.hash,
            error: !broadcasted
                ? broadcastResult.deliverTx && broadcastResult.deliverTx.log
                    ? broadcastResult.deliverTx.log
                    : broadcastResult.checkTx.log
                : null,
        };
    };

    vote = async (fromWallet: Wallet, proposalId: string, vote: VoteOption) => {
        if (this.lumClient === null) {
            return null;
        }

        // Fixme: Update JS SDK to use right type
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const voteMsg = LumMessages.BuildMsgVote(new Long(Number(proposalId)), fromWallet.getAddress(), Number(vote));

        // Define fees
        const fee = {
            amount: [{ denom: LumConstants.MicroLumDenom, amount: '25000' }],
            gas: '100000',
        };

        // Fetch account number and sequence and chain id
        const result = await this.getAccountAndChainId(fromWallet);

        if (!result) {
            return null;
        }

        const [account, chainId] = result;

        if (!account || !chainId) {
            return null;
        }

        const { accountNumber, sequence } = account;

        const doc: LumTypes.Doc = {
            chainId,
            fee,
            messages: [voteMsg],
            memo: '',
            signers: [
                {
                    accountNumber,
                    sequence,
                    publicKey: fromWallet.getPublicKey(),
                },
            ],
        };

        const broadcastResult = await this.lumClient.signAndBroadcastTx(fromWallet, doc);
        // Verify the transaction was successfully broadcasted and made it into a block
        const broadcasted = LumUtils.broadcastTxCommitSuccess(broadcastResult);

        return {
            hash: broadcastResult.hash,
            error: !broadcasted
                ? broadcastResult.deliverTx && broadcastResult.deliverTx.log
                    ? broadcastResult.deliverTx.log
                    : broadcastResult.checkTx.log
                : null,
        };
    };

    updateNode = (node: string) => {
        return LumClient.connect(`https://${node}/rpc`)
            .then(async (client) => {
                this.lumClient = client;
                this.chainId = await client.getChainId();
                this.lumInfos = await this.getLumInfo();

                return true;
            })
            .catch(() => {
                showErrorToast(i18n.t('wallet.errors.client'));

                return false;
            });
    };

    isTestnet = () => !!(this.chainId && this.chainId.includes('testnet'));
}

export default new WalletClient();
