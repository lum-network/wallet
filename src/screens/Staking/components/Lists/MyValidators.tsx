import React, { useEffect, useState } from 'react';

import numeral from 'numeral';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { LUM_DENOM } from '@lum-network/sdk-javascript';
import {
    BondStatus,
    DelegationResponse,
    UnbondingDelegation,
    Validator,
} from '@lum-network/sdk-javascript/build/codegen/cosmos/staking/v1beta1/staking';

import { Badge, DropdownButton, SmallerDecimal } from 'components';
import { LUM_ASSETS_GITHUB, LUM_MINTSCAN_URL } from 'constant';
import { Table, ValidatorLogo } from 'frontend-elements';
import { Rewards, UserValidator } from 'models';
import { RootState } from 'redux/store';
import { getUserValidators, NumbersUtils, sortByVotingPower, trunc, WalletClient } from 'utils';

interface Props {
    validators: Validator[];
    rewards: Rewards;
    delegations: DelegationResponse[];
    unbondings: UnbondingDelegation[];
    totalVotingPower: number;
    onDelegate: (val: Validator, totalVotingPower: number) => void;
    onRedelegate: (val: Validator) => void;
    onUndelegate: (val: Validator) => void;
    onClaim: (val: Validator) => void;
}

const MyValidators = ({
    validators,
    delegations,
    unbondings,
    rewards,
    totalVotingPower,
    onDelegate,
    onRedelegate,
    onUndelegate,
    onClaim,
}: Props): JSX.Element => {
    const [userValidators, setUserValidators] = useState(getUserValidators(validators, delegations, rewards));

    const { wallet, loadingClaim, loadingDelegate, loadingUndelegate } = useSelector((state: RootState) => ({
        wallet: state.wallet.currentWallet,
        loadingClaim: state.loading.effects.wallet.getReward.loading,
        loadingDelegate: state.loading.effects.wallet.delegate.loading,
        loadingUndelegate: state.loading.effects.wallet.undelegate.loading,
    }));

    const { t } = useTranslation();

    useEffect(() => {
        setUserValidators(getUserValidators(validators, delegations, rewards));
    }, [validators, delegations, unbondings, rewards]);

    const headers = [
        t('staking.tableLabels.validator'),
        t('staking.tableLabels.status'),
        t('staking.tableLabels.votingPower'),
        t('staking.tableLabels.commission'),
        t('staking.tableLabels.stakedCoins'),
        t('staking.tableLabels.rewards'),
        '',
    ];

    if (!wallet) {
        return <div />;
    }

    const renderRow = (validator: UserValidator, index: number) => {
        if (validator.stakedCoins === 'NaN' || validator.stakedCoins === '0') {
            return null;
        }

        return (
            <tr key={index} className="validators-table-row">
                <td data-label={headers[0]}>
                    <a
                        href={`${LUM_MINTSCAN_URL}/validators/${validator.operatorAddress}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <ValidatorLogo
                            width={34}
                            height={34}
                            githubUrl={LUM_ASSETS_GITHUB}
                            validatorAddress={validator.operatorAddress}
                            chainId={WalletClient.getChainId() || ''}
                            className="me-2 me-sm-3"
                        />
                        <span>
                            {validator.description?.moniker ||
                                validator.description?.identity ||
                                trunc(validator.operatorAddress)}
                        </span>
                    </a>
                </td>
                <td data-label={headers[1]}>
                    <div className="text-truncate">
                        <Badge validatorStatus={validator.status} jailed={validator.jailed} />
                    </div>
                </td>
                <td data-label={headers[2]}>
                    <div className="d-flex flex-column">
                        <p>{numeral(NumbersUtils.convertUnitNumber(validator.tokens || 0)).format('0,0')}</p>
                        <p className="text-muted">
                            {totalVotingPower &&
                                numeral(
                                    NumbersUtils.convertUnitNumber(validator.tokens || 0) / totalVotingPower,
                                ).format('0.00%')}
                        </p>
                    </div>
                </td>
                <td data-label={headers[3]}>
                    <p>{numeral(validator.commission?.commissionRates?.rate || '').format('0.00%')}</p>
                </td>
                <td data-label={headers[4]} className="text-end">
                    <SmallerDecimal nb={validator.stakedCoins} />
                    <span className="ms-2">{LUM_DENOM}</span>
                </td>
                <td data-label={headers[5]} className="text-end">
                    <SmallerDecimal
                        nb={NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(validator.reward))}
                    />
                    <span className="ms-2">{LUM_DENOM}</span>
                </td>
                <td data-label={headers[6]} className="text-end">
                    <DropdownButton
                        title="Actions"
                        className="d-flex justify-content-end me-lg-4"
                        direction="up"
                        isLoading={loadingClaim || loadingDelegate || loadingUndelegate}
                        items={[
                            ...(validator.status === BondStatus.BOND_STATUS_BONDED
                                ? [
                                      {
                                          title: t('staking.claim'),
                                          onPress: () => onClaim(validator),
                                      },
                                      {
                                          title: t('operations.types.delegate.name'),
                                          onPress: () => onDelegate(validator, totalVotingPower),
                                      },
                                  ]
                                : []),
                            {
                                title: t('operations.types.undelegate.name'),
                                onPress: () => onUndelegate(validator),
                            },
                            {
                                title: t('operations.types.redelegate.name'),
                                onPress: () => onRedelegate(validator),
                            },
                        ]}
                    />
                </td>
                {/* Additional Spacer when the table becomes vertical */}
                <td className="d-block d-lg-none" />
            </tr>
        );
    };

    return (
        <>
            <div className="ps-4">
                <h2 className="ps-2 pt-5 pb-1">{t('staking.myValidators.title')}</h2>
            </div>
            {userValidators.length > 0 ? (
                <Table className="validators-table overflow-visible" head={headers}>
                    {sortByVotingPower(userValidators, totalVotingPower).map((val, index) =>
                        renderRow(val as UserValidator, index),
                    )}
                </Table>
            ) : (
                <div className="d-flex flex-column align-items-center p-5">
                    <div className="bg-white rounded-circle align-self-center p-3 mb-3 shadow-sm">
                        <div
                            className="btn-close mx-auto"
                            style={{
                                filter: 'brightness(0) invert(0.8)',
                            }}
                        />
                    </div>
                    {t('staking.myValidators.empty')}
                </div>
            )}
        </>
    );
};

export default MyValidators;
