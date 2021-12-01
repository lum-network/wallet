import React from 'react';
import { useTranslation } from 'react-i18next';

import { Airdrop } from 'models';
import { Card } from 'frontend-elements';
import { SmallerDecimal } from 'components';
import { NumbersUtils } from 'utils';

const AirdropCard = ({ airdrop }: { airdrop: Airdrop }): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Card withoutPadding className="h-100 dashboard-card balance-card p-4 text-white">
            <div className="px-2 mb-2">
                {t('airdrop.amountToClaim', { returnObjects: true })[0]}
                <SmallerDecimal nb={NumbersUtils.formatTo6digit(airdrop.amount)} />
                {t('airdrop.amountToClaim', { returnObjects: true })[1]}
            </div>
            <div className="px-2">
                {t('airdrop.actionsToClaim.info')}
                <br />
                {!airdrop.vote && (
                    <>
                        {t('airdrop.actionsToClaim.vote')}
                        <br />
                    </>
                )}
                {!airdrop.delegate && t('airdrop.actionsToClaim.delegate')}
            </div>
        </Card>
    );
};

export default AirdropCard;
