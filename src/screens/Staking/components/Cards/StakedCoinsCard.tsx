import assets from 'assets';
import { Card } from 'frontend-elements';
import React from 'react';
import { useTranslation } from 'react-i18next';

import './styles/Cards.scss';

const StakedCoinsCard = ({ amount }: { amount: number }): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Card withoutPadding className="h-100 dashboard-card justify-content-start staked-coins-card p-4">
            <h2 className="ps-2 pt-3 text-white">{t('staking.stakedCoins')}</h2>
            <div className="ps-2 my-3 d-flex flex-row align-items-baseline w-100">
                <h1 className="display-6 fw-normal me-2 me-sm-3 text-white text-truncate">{amount}</h1>
                <img src={assets.images.lumTicker} className="ticker" />
            </div>
        </Card>
    );
};

export default StakedCoinsCard;
