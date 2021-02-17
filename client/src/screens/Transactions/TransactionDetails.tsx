/* eslint-disable @typescript-eslint/no-unused-vars */
import { Card } from 'components';
import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { RootState } from 'redux/store';

const TransactionDetails = (): JSX.Element => {
    const { txId } = useParams<{ txId: string }>();
    const transaction = useSelector((state: RootState) => state.wallet.transactions.find((tx) => tx.id === txId));

    if (transaction) {
        return (
            <div className="container-fluid pt-4">
                <div className="row">
                    <Card className="col">
                        <h4>Transaction</h4>
                        <p>{transaction.id}</p>
                        <p className="text-truncate">{transaction.from}</p>
                        <p className="text-truncate">{transaction.to}</p>
                        <p>
                            {transaction.amount + ' '}
                            <span>{transaction.ticker}</span>
                        </p>
                        <p>{transaction.date}</p>
                    </Card>
                </div>
            </div>
        );
    }

    return <div>{`Transaction ${txId} not found`}</div>;
};

export default TransactionDetails;
