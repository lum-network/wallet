import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from 'redux/store';
import { TransactionsTable } from 'components';
import { Card } from 'frontend-elements';

const Transactions = (): JSX.Element => {
    const transactions = useSelector((state: RootState) => state.wallet.transactions);

    return (
        <div className="mt-4">
            <div className="container">
                <div className="row gy-4">
                    <div className="col">
                        <Card withoutPadding>
                            <TransactionsTable transactions={transactions} />
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Transactions;
