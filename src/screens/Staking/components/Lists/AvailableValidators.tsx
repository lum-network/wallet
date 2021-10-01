import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Validator } from '@lum-network/sdk-javascript/build/codec/cosmos/staking/v1beta1/staking';
import numeral from 'numeral';
import { Table } from 'frontend-elements';

import { Button, Input } from 'components';
import { CLIENT_PRECISION, LUM_EXPLORER } from 'constant';
import { trunc, NumbersUtils, calculateTotalVotingPower } from 'utils';

import placeholderValidator from 'assets/images/placeholderValidator.svg';

import './styles/Lists.scss';

interface Props {
    validators: Validator[];
    onDelegate: (val: Validator) => void;
}

const AvailableValidators = ({ validators, onDelegate }: Props): JSX.Element => {
    const [vals, setVals] = useState([...validators]);
    const [searchText, setSearchText] = useState('');
    const { t } = useTranslation();

    const headers = [
        t('staking.tableLabels.rank'),
        t('staking.tableLabels.validator'),
        '',
        '',
        t('staking.tableLabels.votingPower'),
        /* t('staking.tableLabels.uptime'), */
        t('staking.tableLabels.commission'),
        '',
    ];

    const totalVotingPower = NumbersUtils.convertUnitNumber(calculateTotalVotingPower(validators));

    useEffect(() => {
        if (searchText) {
            setVals(
                validators.filter(
                    (validator) =>
                        validator.operatorAddress.includes(searchText) ||
                        validator.description?.moniker.includes(searchText) ||
                        validator.description?.identity.includes(searchText),
                ),
            );
        } else {
            setVals([...validators]);
        }
    }, [searchText, validators]);

    const onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
    };

    const renderRow = (validator: Validator, index: number) => {
        const rank = vals.findIndex((val) => val.operatorAddress === validator.operatorAddress);

        return (
            <tr key={index} className="validators-table-row">
                <td data-label={headers[0]}>
                    <div className={`fs-2 ${rank + 1 > 5 ? 'fw-normal' : 'fw-bold'}`}>{rank > -1 ? rank + 1 : NaN}</div>
                </td>
                <td data-label={headers[1]}>
                    <a
                        href={`${LUM_EXPLORER}/validators/${validator.operatorAddress}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <img src={placeholderValidator} width={34} height={34} className="me-2 validator-logo" />
                        <span>
                            {validator.description?.identity ||
                                validator.description?.moniker ||
                                trunc(validator.operatorAddress)}
                        </span>
                    </a>
                </td>
                <td className="d-none d-lg-table-cell"></td>
                <td className="d-none d-lg-table-cell"></td>
                <td data-label={headers[4]} className="text-end">
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
                <td data-label={headers[5]} className="text-end">
                    <p>
                        {numeral(
                            parseFloat(validator.commission?.commissionRates?.rate || '0') / CLIENT_PRECISION,
                        ).format('0.00%')}
                    </p>
                </td>
                <td data-label={headers[6]} className="text-end">
                    <Button
                        buttonType="custom"
                        onClick={() => onDelegate(validator)}
                        className="delegate-btn ms-auto me-lg-4 rounded-pill"
                    >
                        Delegate
                    </Button>
                </td>
                {/* Additional Spacer when the table becomes vertical */}
                <td className="d-block d-lg-none" />
            </tr>
        );
    };

    return (
        <>
            <Input
                className="ps-4 py-4 validators-search-input"
                inputClass="search-input d-flex flex-row h-100 fs-6 py-2"
                placeholder="Search available validator"
                icon={
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M10.865 9.61897L13.371 12.125C13.762 12.515 13.762 13.148 13.371 13.539C13.176 13.734 12.92 13.832 12.664 13.832C12.408 13.832 12.152 13.734 11.957 13.539L9.451 11.033C8.472 11.73 7.278 12.144 5.988 12.144C2.687 12.144 0 9.45797 0 6.15597C0 2.85397 2.687 0.167969 5.988 0.167969C9.29 0.167969 11.977 2.85397 11.977 6.15597C11.977 7.44597 11.562 8.63897 10.865 9.61897ZM5.988 2.16797C3.789 2.16797 2 3.95697 2 6.15597C2 8.35497 3.789 10.144 5.988 10.144C8.187 10.144 9.977 8.35497 9.977 6.15597C9.977 3.95697 8.187 2.16797 5.988 2.16797Z"
                            fill="#2E2E2E"
                        />
                    </svg>
                }
                onChange={onSearch}
            />
            <div className="ps-4">
                <h2 className="ps-2 pb-1">{t('staking.availableValidators.title')}</h2>
            </div>
            {vals.length > 0 ? (
                <Table className="validators-table" head={headers}>
                    {vals.map((val, index) => renderRow(val, index))}
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
                    {searchText
                        ? t('staking.availableValidators.emptySearch', { searchText })
                        : t('staking.availableValidators.empty')}
                </div>
            )}
        </>
    );
};

export default AvailableValidators;
