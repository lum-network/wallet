import React from 'react';
import { TransactionsUtils } from 'utils';

import './TransactionTypeBadge.scss';

interface Props {
    type: string;
}

const TransactionTypeBadge = ({ type }: Props): JSX.Element => {
    const { name, icon } = TransactionsUtils.getTxTypeInfos(type);

    return (
        <div className="transaction-type-badge">
            <p className="badge-text d-flex align-items-center">
                <img src={icon} />
                {name}
            </p>
        </div>
    );
};

export default TransactionTypeBadge;
