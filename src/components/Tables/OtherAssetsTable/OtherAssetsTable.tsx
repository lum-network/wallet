import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import numeral from 'numeral';

import { Table } from 'frontend-elements';
import { OtherBalance } from 'models';
import { RootState } from 'redux/store';
import { DenomsUtils, NumbersUtils } from 'utils';

import SmallerDecimal from '../../SmallerDecimal/SmallerDecimal';

import './OtherAssetsTable.scss';

const OtherAssetsTable = ({ otherBalances }: { otherBalances: OtherBalance[] }) => {
    const { t } = useTranslation();

    const prices = useSelector((state: RootState) => state.stats.prices);

    const headers = t('dashboard.otherBalancesTable.headers', { returnObjects: true });

    const renderRow = (otherBalance: OtherBalance) => {
        const icon = DenomsUtils.getIconFromDenom(otherBalance.denom);
        const price = prices.find((p) => p.denom === otherBalance.denom);

        return (
            <tr key={`${otherBalance.denom}-balance`}>
                <td data-label={headers[0]}>
                    <div className="d-flex flex-row align-items-center">
                        <img src={icon} alt="denom icon" className="me-2" width="32" height="32" />
                        {otherBalance.denom.toUpperCase()}
                    </div>
                </td>
                <td data-label={headers[1]} className="text-end">
                    <div className="d-flex flex-column justify-content-center">
                        <div>
                            <SmallerDecimal nb={NumbersUtils.formatTo6digit(otherBalance.amount)} className="me-1" />
                            <span className="denom">{otherBalance.denom.toUpperCase()}</span>
                        </div>
                        <div className="usd-price">
                            {price && numeral(otherBalance.amount * price.price).format('$0,0[.]00')}
                        </div>
                    </div>
                </td>
            </tr>
        );
    };

    return <Table head={headers}>{otherBalances.map((bal) => renderRow(bal))}</Table>;
};

export default OtherAssetsTable;
