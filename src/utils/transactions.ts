import { LumMessages, LumRegistry, LumTypes, LumUtils } from '@lum-network/sdk-javascript';
import { TxResponse } from '@lum-network/sdk-javascript/build/types';

import assets from 'assets';

import i18n from 'locales';
import { Transaction } from 'models';
import { MessageTypes } from 'constant';

type SendTxInfos = {
    fromAddress: string;
    toAddress: string;
    amount: LumTypes.Coin[];
};

type StakingTxInfos = {
    validatorAddress?: string;
    validatorDstAddress?: string;
    validatorSrcAddress?: string;
    delegatorAddress: string;
    amount?: LumTypes.Coin;
};

type VoteTxInfos = {
    voter: string;
    proposalId: Long;
};

type IBCTransferInfos = {
    sender: string;
    receiver: string;
    token: LumTypes.Coin;
};

type DFractInfos = {
    depositorAddress: string;
    amount: LumTypes.Coin;
};

export const isSendTxInfo = (
    info: {
        fromAddress?: string;
        toAddress?: string;
        amount?: LumTypes.Coin[];
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
        amount?: LumTypes.Coin;
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
        token?: LumTypes.Coin;
    } | null,
): info is IBCTransferInfos => {
    return !!(info && info.sender && info.receiver && info.token);
};

export const isDfractInfo = (
    info: {
        depositorAddress?: string;
        amount?: LumTypes.Coin;
    } | null,
): info is DFractInfos => {
    return !!(info && info.depositorAddress && info.amount);
};

export const hashExists = (txs: Transaction[], hash: string): boolean => txs.findIndex((tx) => tx.hash === hash) > -1;

export const formatTxs = (rawTxs: readonly TxResponse[] | TxResponse[]): Transaction[] => {
    const formattedTxs: Transaction[] = [];

    for (const rawTx of rawTxs) {
        // Decode TX to human readable format
        const txData = LumRegistry.decodeTx(rawTx.tx);

        const hash = LumUtils.toHex(rawTx.hash).toUpperCase();

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

        if (txData.body && txData.body.messages) {
            for (const msg of txData.body.messages) {
                try {
                    const txInfos = LumUtils.toJSON(LumRegistry.decode(msg));

                    if (typeof txInfos === 'object') {
                        tx.messages.push(msg.typeUrl);

                        if (isDfractInfo(txInfos)) {
                            tx.fromAddress = txInfos.depositorAddress;
                            tx.amount.push(txInfos.amount);
                        } else if (isSendTxInfo(txInfos)) {
                            tx.fromAddress = txInfos.fromAddress;
                            tx.toAddress = txInfos.toAddress;
                            tx.amount = txInfos.amount;
                        } else if (isStakingTxInfo(txInfos)) {
                            msg.typeUrl === LumMessages.MsgUndelegateUrl
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
        case LumMessages.MsgSendUrl:
            return {
                name: i18n.t(toAddress === userAddress ? 'transactions.types.receive' : 'transactions.types.send'),
                icon: assets.images.messageTypes.send,
            };
        case LumMessages.MsgDelegateUrl:
            return { name: i18n.t('transactions.types.delegate'), icon: assets.images.messageTypes.delegate };
        case LumMessages.MsgUndelegateUrl:
            return { name: i18n.t('transactions.types.undelegate'), icon: assets.images.messageTypes.undelegate };
        case LumMessages.MsgBeginRedelegateUrl:
            return { name: i18n.t('transactions.types.redelegate'), icon: assets.images.messageTypes.redelegate };
        case LumMessages.MsgMultiSendUrl:
            return { name: i18n.t('transactions.types.multiSend'), icon: assets.images.messageTypes.multiSend };
        case LumMessages.MsgCreateValidatorUrl:
            return {
                name: i18n.t('transactions.types.createValidator'),
                icon: assets.images.messageTypes.createValidator,
            };
        case LumMessages.MsgEditValidatorUrl:
            return { name: i18n.t('transactions.types.editValidator'), icon: assets.images.messageTypes.editValidator };
        case LumMessages.MsgWithdrawDelegatorRewardUrl:
            return { name: i18n.t('transactions.types.getReward'), icon: assets.images.messageTypes.getReward };
        case LumMessages.MsgOpenBeamUrl:
            return { name: i18n.t('transactions.types.openBeam'), icon: assets.images.messageTypes.openBeam };
        case LumMessages.MsgUpdateBeamUrl:
            return { name: i18n.t('transactions.types.updateBeam'), icon: assets.images.messageTypes.updateBeam };
        case LumMessages.MsgClaimBeamUrl:
            return { name: i18n.t('transactions.types.claimBeam'), icon: assets.images.messageTypes.claimBeam };
        case LumMessages.MsgVoteUrl:
            return { name: i18n.t('transactions.types.vote'), icon: assets.images.messageTypes.vote };
        case LumMessages.MsgDepositDfractUrl:
            return { name: i18n.t('transactions.types.depositDfract'), icon: assets.images.messageTypes.depositDfract };
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
