import React from 'react';
import { useTranslation } from 'react-i18next';
import { Validator } from '@lum-network/sdk-javascript/build/codec/cosmos/staking/v1beta1/staking';
import numeral from 'numeral';
import { Table } from 'frontend-elements';

import { Button } from 'components';
import { CLIENT_PRECISION, LUM_EXPLORER } from 'constant';
import { trunc, NumbersUtils, calculateTotalVotingPower } from 'utils';

import placeholderValidator from 'assets/images/placeholderValidator.svg';

import './styles/Lists.scss';

interface Props {
    validators: Validator[];
    onDelegate: (val: Validator) => void;
}

const AvailableValidators = ({ validators, onDelegate }: Props): JSX.Element => {
    const { t } = useTranslation();

    const headers = [
        t('staking.tableLabels.rank'),
        t('staking.tableLabels.validator'),
        '',
        t('staking.tableLabels.votingPower'),
        /* t('staking.tableLabels.uptime'), */
        t('staking.tableLabels.commission'),
        '',
    ];

    const totalVotingPower = NumbersUtils.convertUnitNumber(calculateTotalVotingPower(validators));

    const renderRow = (validator: Validator, index: number) => {
        const rank = validators.findIndex((val) => val.operatorAddress === validator.operatorAddress);

        return (
            <tr key={index}>
                <td data-label={headers[0]}>{rank > -1 ? rank + 1 : NaN}</td>
                <td data-label={headers[1]}>
                    <a href={`${LUM_EXPLORER}/validator/${validator.operatorAddress}`} target="_blank" rel="noreferrer">
                        <img src={placeholderValidator} width={34} height={34} className="me-2 validator-logo" />
                        <span>
                            {validator.description?.identity ||
                                validator.description?.moniker ||
                                trunc(validator.operatorAddress)}
                        </span>
                    </a>
                </td>
                <td></td>
                <td data-label={headers[3]} className="text-end">
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
                {/* TO RE-ENABLE WHEN UPTIME IS AVAILABLE <td data-label={headers[3]}>{validator.}</td> */}
                <td data-label={headers[4]} className="text-end">
                    <p>
                        {numeral(
                            parseFloat(validator.commission?.commissionRates?.rate || '0') / CLIENT_PRECISION,
                        ).format('0.00%')}
                    </p>
                </td>
                <td data-label={headers[5]} className="text-end">
                    <Button
                        buttonType="custom"
                        onClick={() => onDelegate(validator)}
                        className="delegate-btn ms-auto rounded-pill"
                    >
                        Delegate
                    </Button>
                </td>
            </tr>
        );
    };

    return (
        <>
            <div className="ps-4">
                <h2 className="ps-2 pt-5 pb-1">{t('staking.availableValidators.title')}</h2>
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
                    {t('staking.availableValidators.empty')}
                </div>
            )}
        </>
    );
};

export default AvailableValidators;
