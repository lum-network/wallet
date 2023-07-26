import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import numeral from 'numeral';
import { Validator } from '@lum-network/sdk-javascript/build/codec/cosmos/staking/v1beta1/staking';

import { Table, ValidatorLogo } from 'frontend-elements';
import { Reward, Rewards } from 'models';
import { DenomsUtils, NumbersUtils, WalletClient, getExplorerLink, trunc } from 'utils';
import { SmallerDecimal } from 'components';
import { RootState } from 'redux/store';
import { CLIENT_PRECISION, LUM_ASSETS_GITHUB } from 'constant';

const OtherStakingRewards = ({
    validators,
    otherRewards,
    onClaim,
}: {
    validators: Validator[];
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

    const onClaimPress = (reward: Reward, index: number) => {
        //const addresses = rewards.map((r) => r.validatorAddress).join(',');

        onClaim(reward.validatorAddress, index);
    };

    const renderRow = (rewards: Reward, index: number) => {
        const normalDenom = DenomsUtils.computeDenom(rewards.reward[0].denom);
        const icon = DenomsUtils.getIconFromDenom(normalDenom);
        const price = prices.find((p) => p.denom === normalDenom);
        const amount = NumbersUtils.convertUnitNumber(parseFloat(rewards.reward[0].amount) / CLIENT_PRECISION);
        const validator = validators.find((val) => val.operatorAddress === rewards.validatorAddress);

        return (
            <tr key={`other-staking-reward-${index + 1}`}>
                <td data-label={headers[0]}>
                    <a
                        href={`${getExplorerLink()}/validators/${rewards.validatorAddress}`}
                        target="_blank"
                        rel="noreferrer"
                    >
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
                </td>
                <td data-label={headers[1]}>
                    <div className="d-flex flex-row align-items-center">
                        {icon && <img src={icon} alt="denom icon" className="me-2" width="32" height="32" />}
                        {DenomsUtils.computeDenom(rewards.reward[0].denom).toUpperCase()}
                    </div>
                </td>
                <td data-label={headers[2]} className="text-end">
                    <div className="d-flex flex-column justify-content-center">
                        <div>
                            <SmallerDecimal nb={NumbersUtils.formatTo6digit(amount)} className="me-1" />
                            <span className="denom">
                                {DenomsUtils.computeDenom(rewards.reward[0].denom).toUpperCase()}
                            </span>
                        </div>
                        <div className="usd-price">{price && numeral(amount * price.price).format('$0,0[.]00')}</div>
                    </div>
                </td>
                <td data-label={headers[3]} className="text-end">
                    <button
                        type="button"
                        className="normal-btn outline rounded-pill ms-auto action-btn"
                        onClick={() => onClaimPress(rewards, index)}
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
            {otherRewards.map((oR) => (
                <>
                    <Table head={headers}>{oR.rewards.map(renderRow)}</Table>
                </>
            ))}
        </>
    );
};

export default OtherStakingRewards;
