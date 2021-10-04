import { LumMessages } from '@lum-network/sdk-javascript';

import createLogo from 'assets/images/messageTypes/create.svg';
import editLogo from 'assets/images/messageTypes/edit.svg';
import delegateLogo from 'assets/images/messageTypes/delegate.svg';
import undelegateLogo from 'assets/images/messageTypes/undelegate.svg';
import sendLogo from 'assets/images/messageTypes/send.svg';
import multiSendLogo from 'assets/images/messageTypes/multiSend.svg';
import getRewardLogo from 'assets/images/messageTypes/reward.svg';
import beamLogo from 'assets/images/messageTypes/beam.svg';
import beamOpenLogo from 'assets/images/messageTypes/openBeam.svg';
import beamUpdateLogo from 'assets/images/messageTypes/updateBeam.svg';
import beamClaimLogo from 'assets/images/messageTypes/claimBeam.svg';

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
                icon: sendLogo,
            };
        case LumMessages.MsgDelegateUrl:
            return { name: i18n.t('transactions.types.delegate'), icon: delegateLogo };
        case LumMessages.MsgUndelegateUrl:
            return { name: i18n.t('transactions.types.undelegate'), icon: undelegateLogo };
        case LumMessages.MsgClaimBeamUrl:
            return { name: i18n.t('transactions.types.claimBeam'), icon: beamClaimLogo };
        case LumMessages.MsgMultiSendUrl:
            return { name: i18n.t('transactions.types.multiSend'), icon: multiSendLogo };
        case LumMessages.MsgCreateValidatorUrl:
            return { name: i18n.t('transactions.types.createValidator'), icon: createLogo };
        case LumMessages.MsgEditValidatorUrl:
            return { name: i18n.t('transactions.types.editValidator'), icon: editLogo };
        case LumMessages.MsgWithdrawDelegatorRewardUrl:
            return { name: i18n.t('transactions.types.getReward'), icon: getRewardLogo };
        case LumMessages.MsgOpenBeamUrl:
            return { name: i18n.t('transactions.types.openBeam'), icon: beamOpenLogo };
        case LumMessages.MsgUpdateBeamUrl:
            return { name: i18n.t('transactions.types.updateBeam'), icon: beamUpdateLogo };
        default:
            return { name: type, icon: beamLogo };
    }
};
