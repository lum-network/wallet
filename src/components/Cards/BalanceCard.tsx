import React from 'react';

import assets from 'assets';
import { Card } from 'frontend-elements';
import { useTranslation } from 'react-i18next';
import { NumbersUtils, WalletClient } from 'utils';
import { SmallerDecimal } from 'components';
import { Rewards } from 'models';
import { CLIENT_PRECISION } from 'constant';

interface Props {
    balance: number;
    rewards: Rewards;
}

const BalanceCard = ({ balance, rewards }: Props): JSX.Element => {
    const { t } = useTranslation();

    const lumAmount =
        balance +
        (rewards.total && rewards.total.length > 0
            ? NumbersUtils.convertUnitNumber(rewards.total[0].amount) / CLIENT_PRECISION
            : 0);
    const fiatAmount = lumAmount * (WalletClient.getLumInfos()?.price || 0);

    return (
        <Card withoutPadding className="h-100 dashboard-card justify-content-start rewards-card p-4">
            <h2 className="ps-2 pt-3 text-white">{t('dashboard.currentBalance')}</h2>
            <div className="ps-2 my-3 d-flex flex-row align-items-baseline w-100">
                <div className="me-2 me-sm-3 text-white text-truncate">
                    <SmallerDecimal nb={NumbersUtils.formatTo6digit(lumAmount)} big />
                </div>
                <img src={assets.images.lumTicker} className="ticker" />
            </div>
            <p className="align-self-end text-white fw-bold">
                $<SmallerDecimal nb={NumbersUtils.formatTo6digit(fiatAmount)} />
            </p>
        </Card>
    );
};

export default BalanceCard;
