import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import numeral from 'numeral';
import { Validator } from '@lum-network/sdk-javascript/build/codegen/cosmos/staking/v1beta1/staking';

import { Collapsible, SmallerDecimal } from 'components';
import { CLIENT_PRECISION, LUM_ASSETS_GITHUB, LUM_MINTSCAN_URL } from 'constant';
import { Card, ValidatorLogo } from 'frontend-elements';
import { Reward, Rewards } from 'models';
import { RootState } from 'redux/store';
import { DenomsUtils, NumbersUtils, WalletClient, trunc, useWindowSize } from 'utils';

const OtherStakingRewards = ({ validators, otherRewards }: { validators: Validator[]; otherRewards: Rewards[] }) => {
    const prices = useSelector((state: RootState) => state.stats.prices);

    const { t } = useTranslation();

    const winSizes = useWindowSize();

    const renderRow = (rewards: Reward, index: number) => {
        const normalDenom = DenomsUtils.computeDenom(rewards.reward[0].denom);
        const price = prices.find((p) => p.denom === normalDenom);
        const amount = NumbersUtils.convertUnitNumber(parseFloat(rewards.reward[0].amount) / CLIENT_PRECISION);
        const validator = validators.find((val) => val.operatorAddress === rewards.validatorAddress);

        return (
            <div
                key={`other-staking-reward-${index + 1}`}
                className="other-reward-collapse d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mt-4 pt-4"
            >
                <a href={`${LUM_MINTSCAN_URL}/validators/${rewards.validatorAddress}`} target="_blank" rel="noreferrer">
                    <ValidatorLogo
                        width={34}
                        height={34}
                        githubUrl={LUM_ASSETS_GITHUB}
                        validatorAddress={rewards.validatorAddress}
                        chainId={WalletClient.getChainId() || ''}
                        className="me-2 me-sm-3"
                    />
                    <span>
                        {validator?.description?.moniker ||
                            validator?.description?.identity ||
                            trunc(rewards.validatorAddress)}
                    </span>
                </a>
                <div className="d-flex flex-column justify-content-center align-items-sm-end mt-3 mt-sm-0">
                    <div>
                        <SmallerDecimal nb={NumbersUtils.formatTo6digit(amount)} className="me-1" />
                        <span className="denom">{DenomsUtils.computeDenom(rewards.reward[0].denom).toUpperCase()}</span>
                    </div>
                    <div className="usd-price">{price && numeral(amount * price.price).format('$0,0[.]00')}</div>
                </div>
            </div>
        );
    };

    const renderCollapsible = (rewards: Rewards, index: number) => {
        const normalDenom = DenomsUtils.computeDenom(rewards.total[0].denom);
        const price = prices.find((p) => p.denom === normalDenom);
        const amount = NumbersUtils.convertUnitNumber(rewards.total[0].amount);

        return (
            <Card withoutPadding className="other-rewards-card mt-3 mx-4">
                <Collapsible
                    id={`collapsible-other-rewards-${index}`}
                    key={`other-reward-${rewards.total[0].denom}`}
                    buttonBorder={winSizes.width > 575.98}
                    header={
                        <div className="d-flex flex-row align-items-center">
                            {winSizes.width > 575.98 && (
                                <img
                                    src={DenomsUtils.getIconFromDenom(DenomsUtils.computeDenom(rewards.total[0].denom))}
                                    width="34"
                                    height="34"
                                    className="me-3"
                                />
                            )}
                            <div className="d-flex flex-column justify-content-center">
                                <div>
                                    <SmallerDecimal nb={NumbersUtils.formatTo6digit(amount)} className="me-1" />
                                    <span className="denom">
                                        {DenomsUtils.computeDenom(rewards.total[0].denom).toUpperCase()}
                                    </span>
                                </div>
                                <div className="usd-price">
                                    {price && numeral(amount * price.price).format('$0,0[.]00')}
                                </div>
                            </div>
                        </div>
                    }
                    content={<>{rewards.rewards.map(renderRow)}</>}
                />
            </Card>
        );
    };

    return (
        <>
            <div className="ps-4">
                <h2 className="ps-2 pt-5 pb-1">{t('staking.otherStakingRewards.title')}</h2>
            </div>
            {otherRewards.map(renderCollapsible)}
        </>
    );
};

export default OtherStakingRewards;
