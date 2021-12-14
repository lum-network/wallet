import React from 'react';
import { useTranslation } from 'react-i18next';

import { Airdrop } from 'models';
import { Card } from 'frontend-elements';
import { SmallerDecimal } from 'components';
import { NumbersUtils } from 'utils';
import { MEDIUM_AIRDROP_ARTICLE } from 'constant';

const AirdropCard = ({ airdrop }: { airdrop: Airdrop }): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Card withoutPadding className="h-100 dashboard-card balance-card p-4 text-white">
            <div className="px-2 mb-2">
                {t('airdrop.amountToClaim', { returnObjects: true })[0]}
                <SmallerDecimal nb={NumbersUtils.formatTo6digit(airdrop.amount)} />
                {t('airdrop.amountToClaim', { returnObjects: true })[1]}
            </div>
            <div className="d-flex flex-row w-100 justify-content-between align-items-end px-2">
                <div>
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
                <a href={MEDIUM_AIRDROP_ARTICLE} target="_blank" rel="noreferrer">
                    More informations
                </a>
            </div>
        </Card>
    );
};

export default AirdropCard;
