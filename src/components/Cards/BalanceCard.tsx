import React from 'react';
import assets from 'assets';
import { Card } from 'frontend-elements';
import { useTranslation } from 'react-i18next';

import './Cards.scss';

const BalanceCard = ({ balance }: { balance: number }): JSX.Element => {
    const { t } = useTranslation();
    return (
        <Card withoutPadding className="h-100 dashboard-card balance-card p-4">
            <h2 className="ps-2 pt-3 text-white">{t('dashboard.currentBalance')}</h2>
            <div className="ps-2 my-3 d-flex flex-row align-items-baseline w-100">
                <h1 className="display-6 fw-normal me-2 me-sm-3 text-white text-truncate">{balance}</h1>
                <img src={assets.images.lumTicker} className="ticker" />
            </div>
            <button type="button" className="ps-2 pb-2">
                <img src={assets.images.syncIcon} className="tint-white" />
            </button>
        </Card>
    );
};

export default BalanceCard;
