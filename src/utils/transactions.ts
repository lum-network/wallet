import { LumMessages } from '@lum-network/sdk-javascript';

import assets from 'assets';

import i18n from 'locales';
import { Transaction } from 'models';

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
        default:
            return { name: type, icon: assets.images.messageTypes.beam };
    }
};

export const sortByBlockHeight = (txs: Transaction[]): Transaction[] => txs.sort((txA, txB) => txA.height - txB.height);
