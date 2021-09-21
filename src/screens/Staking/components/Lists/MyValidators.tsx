import { LumConstants, LumUtils } from '@lum-network/sdk-javascript';
import { Validator } from '@lum-network/sdk-javascript/build/codec/cosmos/staking/v1beta1/staking';
import { CLIENT_PRECISION, LUM_EXPLORER } from 'constant';
import { Table } from 'frontend-elements';
import React from 'react';
import { calculateTotalVotingPower, convertUnitNumber, trunc } from 'utils';
import numeral from 'numeral';
import { useTranslation } from 'react-i18next';

interface Props {
    validators: Validator[];
}

const MyValidators = ({ validators }: Props): JSX.Element => {
    const { t } = useTranslation();

    const headers = [
        t('staking.tableLabels.validator'),
        t('staking.tableLabels.status'),
        t('staking.tableLabels.votingPower'),
        t('staking.tableLabels.commission'),
    ];

    const totalVotingPower = convertUnitNumber(calculateTotalVotingPower(validators));
    const statuses = t('staking.status', { returnObjects: true });

    const renderRow = (validator: Validator, index: number) => (
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
            <td data-label={headers[2]} className="text-end">
                <div className="d-flex flex-column align-items-end">
                    <p>{numeral(convertUnitNumber(validator.tokens || 0)).format('0,0')}</p>
                    <p className="text-muted">
                        {totalVotingPower &&
                            numeral(convertUnitNumber(validator.tokens || 0) / totalVotingPower).format('0.00%')}
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
        </tr>
    );

    return (
        <>
            <h2 className="ps-5 pt-5 pb-1">My Validators</h2>
            {validators.length > 0 ? (
                <Table head={headers}>{validators.map((val, index) => renderRow(val, index))}</Table>
            ) : (
                <div>No delegations yet</div>
            )}
        </>
    );
};

export default MyValidators;
