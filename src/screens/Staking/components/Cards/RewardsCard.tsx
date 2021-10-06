import React from 'react';

import assets from 'assets';
import { CLIENT_PRECISION } from 'constant';
import { Button, Card } from 'frontend-elements';
import { Rewards } from 'models';
import { useTranslation } from 'react-i18next';
import { NumbersUtils } from 'utils';
import { useRematchDispatch } from 'redux/hooks';
import { RootDispatch, RootState } from 'redux/store';
import { useSelector } from 'react-redux';

interface Props {
    rewards: Rewards;
}

const RewardsCard = ({ rewards }: Props): JSX.Element => {
    const { t } = useTranslation();

    const { delegations, wallet, isLoading } = useSelector((state: RootState) => ({
        delegations: state.staking.delegations,
        wallet: state.wallet.currentWallet,
        isLoading: state.loading.effects.wallet.getReward,
    }));

    const { getReward } = useRematchDispatch((dispatch: RootDispatch) => ({
        getReward: dispatch.wallet.getReward,
    }));

    const claimRewards = () => {
        for (const delegation of delegations) {
            if (wallet && delegation.delegation) {
                getReward({
                    validatorAddress: delegation.delegation?.validatorAddress,
                    memo: 'Claim Reward',
                    from: wallet,
                });
            }
        }
    };

    return (
        <Card withoutPadding className="h-100 dashboard-card flex-row flex-wrap align-items-center rewards-card p-4">
            <div className="d-flex flex-column">
                <h2 className="ps-2 pt-3 text-white">{t('staking.rewards')}</h2>
                <div className="px-2 my-3 d-flex flex-row align-items-baseline w-100">
                    <h1 className="display-6 fw-normal me-2 me-sm-3 text-white text-truncate">
                        {rewards.total && rewards.total.length > 0
                            ? NumbersUtils.formatTo6digit(
                                  NumbersUtils.convertUnitNumber(rewards.total[0].amount) / CLIENT_PRECISION,
                              )
                            : '0'}
                    </h1>
                    <img src={assets.images.lumTicker} className="ticker" />
                </div>
            </div>
            <Button loading={isLoading} onPress={claimRewards} className="claim-reward-btn fs-4 p-4 rounded-pill">
                Claim
            </Button>
        </Card>
    );
};

export default RewardsCard;