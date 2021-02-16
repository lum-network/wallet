import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/store';
import { Card, TransactionsTable } from 'components';

const Transactions = (): JSX.Element => {
    const transactions = useSelector((state: RootState) => state.wallet.transactions);
    return (
        <div className="p-4">
            <h3>Latest Transactions</h3>
            <Card>
                <TransactionsTable transactions={transactions} />
            </Card>
        </div>
    );
};

export default Transactions;
