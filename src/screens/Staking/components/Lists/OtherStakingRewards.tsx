import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import numeral from 'numeral';

import { Table } from 'frontend-elements';
import { Reward, Rewards } from 'models';
import { DenomsUtils, NumbersUtils, trunc } from 'utils';
import { SmallerDecimal } from 'components';
import { RootState } from 'redux/store';

const OtherStakingRewards = ({
    otherRewards,
    onClaim,
}: {
    otherRewards: Rewards[];
    onClaim: (addresses: string, index: number) => void;
}) => {
    const prices = useSelector((state: RootState) => state.stats.prices);

    const { t } = useTranslation();

    const headers = [
        t('staking.tableLabels.validator'),
        t('staking.tableLabels.token'),
        t('staking.tableLabels.rewards'),
        '',
    ];

    const onClaimPress = (rewards: Reward[], index: number) => {
        const addresses = rewards.map((r) => r.validatorAddress).join(',');

        onClaim(addresses, index);
    };

    const renderRow = (rewards: Rewards, index: number) => {
        const icon = DenomsUtils.getIconFromDenom(rewards.total[0].denom);
        const price = prices.find((p) => p.denom === rewards.total[0].denom);
        const amount = NumbersUtils.convertUnitNumber(rewards.total[0].amount);

        return (
            <tr>
                <td data-label={headers[0]}>{trunc(rewards.rewards[0].validatorAddress)}</td>
                <td data-label={headers[1]}>
                    <div className="d-flex flex-row align-items-center">
                        {icon && <img src={icon} alt="denom icon" className="me-2" width="32" height="32" />}
                        {rewards.total[0].denom.toUpperCase()}
                    </div>
                </td>
                <td data-label={headers[2]} className="text-end">
                    <div className="d-flex flex-column justify-content-center">
                        <div>
                            <SmallerDecimal nb={NumbersUtils.formatTo6digit(amount)} className="me-1" />
                            <span className="denom">{rewards.total[0].denom.toUpperCase()}</span>
                        </div>
                        <div className="usd-price">{price && numeral(amount * price.price).format('$0,0[.]00')}</div>
                    </div>
                </td>
                <td data-label={headers[3]} className="text-end">
                    <button
                        type="button"
                        className="normal-btn outline rounded-pill ms-auto action-btn"
                        onClick={() => onClaimPress(rewards.rewards, index)}
                    >
                        {t('staking.claim')}
                    </button>
                </td>
            </tr>
        );
    };

    return (
        <>
            <div className="ps-4">
                <h2 className="ps-2 pt-5 pb-1">{t('staking.otherStakingRewards.title')}</h2>
            </div>
            <Table head={headers}>{otherRewards.map(renderRow)}</Table>
        </>
    );
};

export default OtherStakingRewards;
