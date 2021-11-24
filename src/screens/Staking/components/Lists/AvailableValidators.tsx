import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Validator } from '@lum-network/sdk-javascript/build/codec/cosmos/staking/v1beta1/staking';
import numeral from 'numeral';
import { Table } from 'frontend-elements';

import { Button, Input } from 'components';
import { CLIENT_PRECISION, LUM_EXPLORER } from 'constant';
import { trunc, NumbersUtils, calculateTotalVotingPower, sortByVotingPower } from 'utils';

import placeholderValidator from 'assets/images/placeholderValidator.svg';
import searchIcon from 'assets/images/search.svg';

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
                            {validator.description?.moniker ||
                                validator.description?.identity ||
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
                icon={searchIcon}
                onChange={onSearch}
            />
            <div className="ps-4">
                <h2 className="ps-2 pb-1">{t('staking.availableValidators.title')}</h2>
            </div>
            {vals.length > 0 ? (
                <Table className="validators-table" head={headers}>
                    {sortByVotingPower(vals, totalVotingPower).map((val, index) => renderRow(val, index))}
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
