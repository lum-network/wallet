import React from 'react';

import assets from 'assets';
import { CLIENT_PRECISION } from 'constant';
import { Button, Card } from 'frontend-elements';
import { Rewards } from 'models';
import { useTranslation } from 'react-i18next';
import { NumbersUtils } from 'utils';
import { SmallerDecimal } from 'components';

interface Props {
    rewards: Rewards;
    onClaim: () => void;
    isLoading: boolean;
}

const RewardsCard = ({ rewards, onClaim, isLoading }: Props): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Card withoutPadding className="h-100 dashboard-card flex-row flex-wrap align-items-center rewards-card p-4">
            <div className="row g-0 w-100">
                <div className="col-md-8">
                    <h2 className="ps-2 pt-3 text-white">{t('staking.rewards')}</h2>
                    <div className="px-2 my-3 d-flex flex-row align-items-baseline w-100">
                        <div className="me-2 me-sm-3 text-white text-truncate">
                            <SmallerDecimal
                                nb={NumbersUtils.formatTo6digit(
                                    rewards.total && rewards.total.length > 0
                                        ? NumbersUtils.convertUnitNumber(rewards.total[0].amount) / CLIENT_PRECISION
                                        : 0,
                                )}
                                big
                            />
                        </div>
                        <img src={assets.images.lumTicker} className="ticker" />
                    </div>
                </div>
                <div className="col-md-4 d-flex align-items-center justify-content-start justify-content-md-end">
                    <Button loading={isLoading} onPress={onClaim} className="claim-reward-btn fs-4 p-4 rounded-pill">
                        {t('staking.claim')}
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default RewardsCard;
