import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/store';
import { TransactionsTable } from 'components';
import { useTranslation } from 'react-i18next';
import { Card } from 'frontend-elements';

const Transactions = (): JSX.Element => {
    const transactions = useSelector((state: RootState) => state.wallet.transactions);
    const { t } = useTranslation();

    return (
        <div className="p-4">
            <h3>{t('navbar.transactions')}</h3>
            <Card withoutPadding>
                <TransactionsTable transactions={transactions} />
            </Card>
        </div>
    );
};

export default Transactions;
