import { LumClient, LumConstants, LumMessages, LumRegistry, LumTypes, LumUtils } from '@lum-network/sdk-javascript';
import { PasswordStrengthType, PasswordStrength, Wallet, Proposal, LumInfo } from 'models';
import { showErrorToast, showSuccessToast } from 'utils';
import i18n from 'locales';
import { ProposalStatus, VoteOption } from '@lum-network/sdk-javascript/build/codec/cosmos/gov/v1beta1/gov';
import Long from 'long';
import axios from 'axios';
import { COINGECKO_API_URL } from 'constant';
import { formatTxs } from './transactions';
import { getRpcFromNode } from './links';

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

export const generateSignedMessage = async (wallet: Wallet, message: string): Promise<LumTypes.SignMsg> => {
    return await wallet.signMessage(encodeURI(message));
};

export const validateSignMessage = async (msg: LumTypes.SignMsg): Promise<boolean> => {
    return await LumUtils.verifySignMsg(msg);
};

class WalletClient {
    lumInfos: LumInfo | null = null;
    node: string = new URL(process.env.REACT_APP_RPC_URL).hostname;
    chainId: string | null = null;

    private lumClient: LumClient | null = null;
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
            const client = await LumClient.connect(getRpcFromNode(node || this.node));
            this.lumClient = client;
            this.chainId = await client.getChainId();

            if (node) {
                showSuccessToast(i18n.t('wallet.success.switchNode'));
            }
        } catch {
            showErrorToast(i18n.t('wallet.errors.client'));
        }
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

        const res = await this.lumClient.tmClient.txSearch({
            query: `transfer.recipient='${address}'`,
        });

        const res2 = await this.lumClient.tmClient.txSearch({
            query: `transfer.sender='${address}'`,
        });

        return formatTxs([...res.txs, ...res2.txs]);
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

    setWithdrawAddress = async (fromWallet: Wallet, withdrawAddress = '', memo = '') => {
        if (this.lumClient === null) {
            return null;
        }

        const setWithdrawAddressMsg = LumMessages.BuildMsgSetWithdrawAddress(fromWallet.getAddress(), withdrawAddress);

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
            messages: [setWithdrawAddressMsg],
            memo,
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

    updateNode = (node: string) => this.connect(node);
}

export default WalletClient.Instance;
