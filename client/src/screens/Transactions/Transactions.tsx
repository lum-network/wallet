import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/store';
import { Card, TransactionsTable } from 'components';

const Transactions = (): JSX.Element => {
    const transactions = useSelector((state: RootState) => state.wallet.transactions);
    return (
        <Card className="col mt-4">
            <h5 className="p-2">Latest Transactions</h5>
            <TransactionsTable transactions={transactions} />
        </Card>
    );
};

export default Transactions;
