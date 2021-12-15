import { LumMessages } from '@lum-network/sdk-javascript';

import assets from 'assets';

import i18n from 'locales';

export const getTxTypeInfos = (
    type: string,
    userAddress: string,
    toAddress: string,
): { name: string; icon: string } => {
    switch (type) {
        case LumMessages.MsgSendUrl:
            return {
                name: i18n.t(toAddress === userAddress ? 'transactions.types.receive' : 'transactions.types.send'),
                icon: assets.images.messageSend,
            };
        case LumMessages.MsgDelegateUrl:
            return { name: i18n.t('transactions.types.delegate'), icon: assets.images.messageDelegate };
        case LumMessages.MsgUndelegateUrl:
            return { name: i18n.t('transactions.types.undelegate'), icon: assets.images.messageUndelegate };
        case LumMessages.MsgMultiSendUrl:
            return { name: i18n.t('transactions.types.multiSend'), icon: assets.images.messageMultiSend };
        case LumMessages.MsgCreateValidatorUrl:
            return { name: i18n.t('transactions.types.createValidator'), icon: assets.images.messageCreateValidator };
        case LumMessages.MsgEditValidatorUrl:
            return { name: i18n.t('transactions.types.editValidator'), icon: assets.images.messageEditValidator };
        case LumMessages.MsgWithdrawDelegatorRewardUrl:
            return { name: i18n.t('transactions.types.getReward'), icon: assets.images.messageGetReward };
        case LumMessages.MsgOpenBeamUrl:
            return { name: i18n.t('transactions.types.openBeam'), icon: assets.images.messageOpenBeam };
        case LumMessages.MsgUpdateBeamUrl:
            return { name: i18n.t('transactions.types.updateBeam'), icon: assets.images.messageUpdateBeam };
        case LumMessages.MsgClaimBeamUrl:
            return { name: i18n.t('transactions.types.claimBeam'), icon: assets.images.messageClaimBeam };
        case LumMessages.MsgVoteUrl:
            return { name: i18n.t('transactions.types.vote'), icon: assets.images.messageVote };
        default:
            return { name: type, icon: assets.images.messageBeam };
    }
};
