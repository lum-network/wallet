import React from 'react';

import { useTranslation } from 'react-i18next';
import { LumConstants } from '@lum-network/sdk-javascript';
import numeral from 'numeral';
import { Table } from 'frontend-elements';

import { CLIENT_PRECISION, LUM_EXPLORER } from 'constant';
import { calculateTotalVotingPower, NumbersUtils, trunc } from 'utils';
import { UserValidator } from 'models';
import { SmallerDecimal } from 'components';

interface Props {
    validators: UserValidator[];
}

const MyValidators = ({ validators }: Props): JSX.Element => {
    const { t } = useTranslation();

    const headers = [
        t('staking.tableLabels.validator'),
        t('staking.tableLabels.status'),
        t('staking.tableLabels.votingPower'),
        t('staking.tableLabels.commission'),
        t('staking.tableLabels.stakedCoins'),
        t('staking.tableLabels.rewards'),
    ];

    const totalVotingPower = NumbersUtils.convertUnitNumber(calculateTotalVotingPower(validators));
    const statuses = t('staking.status', { returnObjects: true });

    const renderRow = (validator: UserValidator, index: number) => (
        <tr key={index}>
            <td data-label={headers[0]}>
                <a href={`${LUM_EXPLORER}/validator/${validator.operatorAddress}`} target="_blank" rel="noreferrer">
                    {validator.description?.identity ||
                        validator.description?.moniker ||
                        trunc(validator.operatorAddress)}
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
            <td data-label={headers[3]} className="text-end">
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
        </tr>
    );

    return (
        <>
            <div className="ps-4">
                <h2 className="ps-2 pt-5 pb-1">{t('staking.myValidators.title')}</h2>
            </div>
            {validators.length > 0 ? (
                <Table head={headers}>{validators.map((val, index) => renderRow(val, index))}</Table>
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
