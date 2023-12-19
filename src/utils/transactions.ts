import assets from 'assets';

import i18n from 'locales';
import { Transaction } from 'models';
import { MessageTypes } from 'constant';
import { IndexedTx } from '@cosmjs/stargate';
import { Coin } from '@keplr-wallet/types';
import { LumRegistry } from './lum/registry';
import { cosmos, lum } from '@lum-network/sdk-javascript';
import { LumUtils } from 'utils';
import { decodeTxRaw } from '@cosmjs/proto-signing';

const { MsgUndelegate, MsgBeginRedelegate, MsgDelegate, MsgCreateValidator, MsgEditValidator } = cosmos.staking.v1beta1;

const { MsgVote } = cosmos.gov.v1;
const { MsgVote: MsgVoteLegacy } = cosmos.gov.v1beta1;

const { MsgWithdrawDelegatorReward } = cosmos.distribution.v1beta1;

const { MsgSend, MsgMultiSend } = cosmos.bank.v1beta1;

const { MsgDeposit: MsgDepositDfract } = lum.network.dfract;

const { MsgClaimBeam, MsgOpenBeam, MsgUpdateBeam } = lum.network.beam;

const {
    MsgDeposit: MsgMillionsDeposit,
    MsgDepositRetry: MsgMillionsDepositRetry,
    MsgClaimPrize,
    MsgWithdrawDeposit,
    MsgWithdrawDepositRetry,
} = lum.network.millions;

type SendTxInfos = {
    fromAddress: string;
    toAddress: string;
    amount: Coin[];
};

type StakingTxInfos = {
    validatorAddress?: string;
    validatorDstAddress?: string;
    validatorSrcAddress?: string;
    delegatorAddress: string;
    amount?: Coin;
};

type VoteTxInfos = {
    voter: string;
    proposalId: Long;
};

type IBCTransferInfos = {
    sender: string;
    receiver: string;
    token: Coin;
};

type DFractInfos = {
    depositorAddress: string;
    amount: Coin;
};

type MillionsDepositInfos = {
    depositorAddress: string;
    poolId: Long;
    amount: Coin;
    isSponsor: boolean;
    winnerAddress: string;
};

type MillionsLeavePoolInfo = {
    depositId: Long;
    poolId: Long;
    toAddress: string;
    depositorAddress: string;
};

export const isSendTxInfo = (
    info: {
        fromAddress?: string;
        toAddress?: string;
        amount?: Coin[];
    } | null,
): info is SendTxInfos => {
    return !!(info && info.fromAddress && info.toAddress && info.amount);
};

export const isStakingTxInfo = (
    info: {
        delegatorAddress?: string;
        validatorDstAddress?: string;
        validatorSrcAddress?: string;
        validatorAddress?: string;
        amount?: Coin;
    } | null,
): info is StakingTxInfos => {
    return !!(
        info &&
        (info.validatorAddress || (info.validatorDstAddress && info.validatorSrcAddress)) &&
        info.delegatorAddress
    );
};

export const isVoteInfo = (
    info: {
        voter?: string;
        proposalId?: Long;
    } | null,
): info is VoteTxInfos => {
    return !!(info && info.proposalId && info.voter);
};

export const isIBCTransferInfo = (
    info: {
        sender?: string;
        receiver?: string;
        token?: Coin;
    } | null,
): info is IBCTransferInfos => {
    return !!(info && info.sender && info.receiver && info.token);
};

export const isDfractInfo = (
    info: {
        depositorAddress?: string;
        amount?: Coin;
    } | null,
): info is DFractInfos => {
    return !!(info && info.depositorAddress && info.amount);
};

export const isMillionsDepositInfo = (
    info: {
        depositorAddress?: string;
        poolId?: Long;
        amount?: Coin;
        isSponsor?: boolean;
        winnerAddress?: string;
    } | null,
): info is MillionsDepositInfos => {
    return !!(
        info &&
        info.depositorAddress &&
        info.amount &&
        info.poolId &&
        info.winnerAddress &&
        info.isSponsor !== undefined
    );
};

export const isMillionsLeavePoolInfo = (
    info: {
        depositId?: Long;
        poolId?: Long;
        toAddress?: string;
        depositorAddress?: string;
    } | null,
): info is MillionsLeavePoolInfo => {
    return !!(info && info.depositorAddress && info.depositId && info.poolId && info.toAddress);
};

export const hashExists = (txs: Transaction[], hash: string): boolean => txs.findIndex((tx) => tx.hash === hash) > -1;

export const formatTxs = (rawTxs: IndexedTx[]): Transaction[] => {
    const formattedTxs: Transaction[] = [];

    for (const rawTx of rawTxs) {
        // Decode TX to human readable format
        const decodedTxBody = decodeTxRaw(rawTx.tx).body;

        const hash = rawTx.hash.toUpperCase();

        if (hashExists(formattedTxs, hash)) {
            continue;
        }

        const height = rawTx.height;

        const tx: Transaction = {
            hash,
            height,
            messages: [],
            amount: [],
            fromAddress: '',
            toAddress: '',
        };

        if (decodedTxBody.messages) {
            for (const msg of decodedTxBody.messages) {
                try {
                    const txInfos = LumUtils.toJSON(LumRegistry.decode(msg));

                    if (typeof txInfos === 'object') {
                        tx.messages.push(msg.typeUrl);

                        if (isSendTxInfo(txInfos)) {
                            tx.fromAddress = txInfos.fromAddress;
                            tx.toAddress = txInfos.toAddress;
                            tx.amount = txInfos.amount;
                        } else if (isStakingTxInfo(txInfos)) {
                            msg.typeUrl === MsgUndelegate.typeUrl
                                ? ((tx.fromAddress = txInfos.validatorAddress || ''),
                                  (tx.toAddress = txInfos.delegatorAddress))
                                : ((tx.fromAddress = txInfos.validatorSrcAddress || txInfos.delegatorAddress),
                                  (tx.toAddress = txInfos.validatorDstAddress || txInfos.validatorAddress || ''));

                            if (txInfos.amount) {
                                tx.amount.push(txInfos.amount);
                            }
                        } else if (isVoteInfo(txInfos)) {
                            tx.toAddress = i18n.t('transactions.proposal') + Number(txInfos.proposalId).toFixed();
                        } else if (isIBCTransferInfo(txInfos)) {
                            tx.fromAddress = txInfos.sender;
                            tx.toAddress = txInfos.receiver;
                            tx.amount.push(txInfos.token);
                        } else if (isMillionsDepositInfo(txInfos)) {
                            tx.fromAddress = txInfos.depositorAddress;
                            tx.toAddress = i18n.t('transactions.pool') + txInfos.poolId.toString();
                            tx.amount.push(txInfos.amount);
                        } else if (isMillionsLeavePoolInfo(txInfos)) {
                            tx.fromAddress = i18n.t('transactions.pool') + txInfos.poolId.toString();
                        } else if (isDfractInfo(txInfos)) {
                            tx.fromAddress = txInfos.depositorAddress;
                            tx.amount.push(txInfos.amount);
                        }
                    }
                } catch {}
            }
        }

        formattedTxs.push(tx);
    }

    return sortByBlockHeight(formattedTxs);
};

export const getTxTypeInfos = (
    type: string,
    userAddress: string,
    toAddress: string,
): { name: string; icon: string } => {
    switch (type) {
        case MsgSend.typeUrl:
            return {
                name: i18n.t(toAddress === userAddress ? 'transactions.types.receive' : 'transactions.types.send'),
                icon: assets.images.messageTypes.send,
            };
        case MsgDelegate.typeUrl:
            return { name: i18n.t('transactions.types.delegate'), icon: assets.images.messageTypes.delegate };
        case MsgUndelegate.typeUrl:
            return { name: i18n.t('transactions.types.undelegate'), icon: assets.images.messageTypes.undelegate };
        case MsgBeginRedelegate.typeUrl:
            return { name: i18n.t('transactions.types.redelegate'), icon: assets.images.messageTypes.redelegate };
        case MsgMultiSend.typeUrl:
            return { name: i18n.t('transactions.types.multiSend'), icon: assets.images.messageTypes.multiSend };
        case MsgCreateValidator.typeUrl:
            return {
                name: i18n.t('transactions.types.createValidator'),
                icon: assets.images.messageTypes.createValidator,
            };
        case MsgEditValidator.typeUrl:
            return { name: i18n.t('transactions.types.editValidator'), icon: assets.images.messageTypes.editValidator };
        case MsgWithdrawDelegatorReward.typeUrl:
            return { name: i18n.t('transactions.types.getReward'), icon: assets.images.messageTypes.getReward };
        case MsgOpenBeam.typeUrl:
            return { name: i18n.t('transactions.types.openBeam'), icon: assets.images.messageTypes.openBeam };
        case MsgUpdateBeam.typeUrl:
            return { name: i18n.t('transactions.types.updateBeam'), icon: assets.images.messageTypes.updateBeam };
        case MsgClaimBeam.typeUrl:
            return { name: i18n.t('transactions.types.claimBeam'), icon: assets.images.messageTypes.claimBeam };
        case MsgVote.typeUrl:
        case MsgVoteLegacy.typeUrl:
            return { name: i18n.t('transactions.types.vote'), icon: assets.images.messageTypes.vote };
        case MsgDepositDfract.typeUrl:
            return { name: i18n.t('transactions.types.depositDfract'), icon: assets.images.messageTypes.depositDfract };
        case MsgMillionsDeposit.typeUrl:
            return {
                name: i18n.t('transactions.types.depositMillions'),
                icon: assets.images.messageTypes.depositMillions,
            };
        case MsgMillionsDepositRetry.typeUrl:
            return {
                name: i18n.t('transactions.types.depositRetryMillions'),
                icon: assets.images.messageTypes.depositMillions,
            };
        case MsgClaimPrize.typeUrl:
            return {
                name: i18n.t('transactions.types.claimMillions'),
                icon: assets.images.messageTypes.claimMillions,
            };
        case MsgWithdrawDeposit.typeUrl:
            return {
                name: i18n.t('transactions.types.withdrawMillions'),
                icon: assets.images.messageTypes.withdrawMillions,
            };
        case MsgWithdrawDepositRetry.typeUrl:
            return {
                name: i18n.t('transactions.types.withdrawRetryMillions'),
                icon: assets.images.messageTypes.withdrawMillions,
            };
        case MessageTypes.IBC_TRANSFER:
            return { name: i18n.t('transactions.types.ibcTransfer'), icon: assets.images.messageTypes.beam };
        case MessageTypes.IBC_TIMEOUT:
            return { name: i18n.t('transactions.types.ibcTimeout'), icon: assets.images.messageTypes.beam };
        case MessageTypes.IBC_ACKNOWLEDGEMENT:
            return { name: i18n.t('transactions.types.ibcAcknowledgement'), icon: assets.images.messageTypes.beam };
        case MessageTypes.IBC_UPDATE_CLIENT:
            return { name: i18n.t('transactions.types.ibcClientUpdate'), icon: assets.images.messageTypes.beam };
        case MessageTypes.IBC_RECV_PACKET:
            return { name: i18n.t('transactions.types.ibcReceivePacket'), icon: assets.images.messageTypes.beam };
        case MessageTypes.EXEC:
            return { name: i18n.t('transactions.types.exec'), icon: assets.images.messageTypes.beam };
        case MessageTypes.GRANT:
            return { name: i18n.t('transactions.types.grant'), icon: assets.images.messageTypes.beam };
        default:
            return { name: type, icon: assets.images.messageTypes.beam };
    }
};

export const sortByBlockHeight = (txs: Transaction[]): Transaction[] => txs.sort((txA, txB) => txA.height - txB.height);
