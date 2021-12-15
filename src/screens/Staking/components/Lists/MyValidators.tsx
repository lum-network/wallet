import React from 'react';

import { useTranslation } from 'react-i18next';
import { LumConstants } from '@lum-network/sdk-javascript';
import numeral from 'numeral';
import { Table, ValidatorLogo } from 'frontend-elements';

import { CLIENT_PRECISION, LUM_ASSETS_GITHUB, LUM_EXPLORER } from 'constant';
import { calculateTotalVotingPower, NumbersUtils, sortByVotingPower, trunc, WalletClient } from 'utils';
import { UserValidator } from 'models';
import { DropdownButton, SmallerDecimal } from 'components';
import { useSelector } from 'react-redux';
import { RootDispatch, RootState } from 'redux/store';
import { useRematchDispatch } from 'redux/hooks';
import { BondStatus, Validator } from '@lum-network/sdk-javascript/build/codec/cosmos/staking/v1beta1/staking';

interface Props {
    validators: UserValidator[];
    onDelegate: (val: Validator) => void;
    onUndelegate: (val: Validator) => void;
}

const MyValidators = ({ validators, onDelegate, onUndelegate }: Props): JSX.Element => {
    const { wallet, loadingClaim, loadingDelegate, loadingUndelegate } = useSelector((state: RootState) => ({
        wallet: state.wallet.currentWallet,
        loadingClaim: state.loading.effects.wallet.getReward.loading,
        loadingDelegate: state.loading.effects.wallet.delegate.loading,
        loadingUndelegate: state.loading.effects.wallet.undelegate.loading,
    }));

    const { getReward } = useRematchDispatch((dispatch: RootDispatch) => ({
        getReward: dispatch.wallet.getReward,
    }));

    const { t } = useTranslation();

    const headers = [
        t('staking.tableLabels.validator'),
        t('staking.tableLabels.status'),
        t('staking.tableLabels.votingPower'),
        t('staking.tableLabels.commission'),
        t('staking.tableLabels.stakedCoins'),
        t('staking.tableLabels.rewards'),
        '',
    ];

    const totalVotingPower = NumbersUtils.convertUnitNumber(calculateTotalVotingPower(validators));
    const statuses = t('staking.status', { returnObjects: true });

    if (!wallet) {
        return <div />;
    }

    const renderRow = (validator: UserValidator, index: number) => (
        <tr key={index} className="validators-table-row">
            <td data-label={headers[0]}>
                <a href={`${LUM_EXPLORER}/validators/${validator.operatorAddress}`} target="_blank" rel="noreferrer">
                    <ValidatorLogo
                        width={34}
                        height={34}
                        githubUrl={LUM_ASSETS_GITHUB}
                        validatorAddress={validator.operatorAddress}
                        chainId={WalletClient.chainId || ''}
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
                <div className="text-truncate">{validator.status > -1 ? statuses[validator.status] : 'Unknown'}</div>
            </td>
            <td data-label={headers[2]}>
                <div className="d-flex flex-column">
                    <p>{numeral(NumbersUtils.convertUnitNumber(validator.tokens || 0)).format('0,0')}</p>
                    <p className="text-muted">
                        {totalVotingPower &&
                            numeral(NumbersUtils.convertUnitNumber(validator.tokens || 0) / totalVotingPower).format(
                                '0.00%',
                            )}
                    </p>
                </div>
            </td>
            <td data-label={headers[3]}>
                <p>
                    {numeral(parseFloat(validator.commission?.commissionRates?.rate || '') / CLIENT_PRECISION).format(
                        '0.00%',
                    )}
                </p>
            </td>
            <td data-label={headers[4]} className="text-end">
                <SmallerDecimal nb={validator.stakedCoins} />
                <span className="ms-2">{LumConstants.LumDenom}</span>
            </td>
            <td data-label={headers[5]} className="text-end">
                <SmallerDecimal nb={NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(validator.reward))} />
                <span className="ms-2">{LumConstants.LumDenom}</span>
            </td>
            <td data-label={headers[6]} className="text-end">
                <DropdownButton
                    title="Actions"
                    className="d-flex justify-content-end me-lg-4"
                    direction="up"
                    disabled={validator.status !== BondStatus.BOND_STATUS_BONDED}
                    isLoading={loadingClaim || loadingDelegate || loadingUndelegate}
                    items={[
                        {
                            title: t('staking.claim'),
                            onPress: () =>
                                getReward({
                                    from: wallet,
                                    memo: t('operations.defaultMemo.getReward'),
                                    validatorAddress: validator.operatorAddress,
                                }),
                        },
                        {
                            title: t('operations.types.undelegate.name'),
                            onPress: () => onUndelegate(validator),
                        },
                        {
                            title: t('operations.types.delegate.name'),
                            onPress: () => onDelegate(validator),
                        },
                    ]}
                />
            </td>
            {/* Additional Spacer when the table becomes vertical */}
            <td className="d-block d-lg-none" />
        </tr>
    );

    return (
        <>
            <div className="ps-4">
                <h2 className="ps-2 pt-5 pb-1">{t('staking.myValidators.title')}</h2>
            </div>
            {validators.length > 0 ? (
                <Table className="validators-table overflow-visible" head={headers}>
                    {sortByVotingPower(validators, totalVotingPower).map((val, index) =>
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
