import React from 'react';
import { TransactionsUtils } from 'utils';

import './TransactionTypeBadge.scss';

interface Props {
    type: string;
    userAddress: string;
    toAddress: string;
}

const TransactionTypeBadge = ({ type, userAddress, toAddress }: Props): JSX.Element => {
    const { name, icon } = TransactionsUtils.getTxTypeInfos(type, userAddress, toAddress);

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
