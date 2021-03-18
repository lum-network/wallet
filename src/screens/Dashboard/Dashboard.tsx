import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router';

import { Card } from 'frontend-elements';
import { TransactionsTable, AddressCard, BalanceCard } from 'components';
import { RootState } from 'redux/store';

import './styles/Dashboard.scss';
import { LUM_TWITTER } from 'constant';

const Dashboard = (): JSX.Element => {
    // Redux hooks
    const { transactions, balance, wallet } = useSelector((state: RootState) => ({
        loading: state.loading.global,
        transactions: state.wallet.transactions,
        balance: state.wallet.currentBalance,
        wallet: state.wallet.currentWallet,
    }));

    // Utils hooks
    const { t } = useTranslation();

    if (!wallet) {
        return <Redirect to="/welcome" />;
    }

    return (
        <div className="mt-4">
            <div className="container">
                <div className="row gy-4">
                    <div className="col-lg-5 col-12">
                        <AddressCard address={wallet.address} />
                    </div>
                    <div className="col-lg-5 col-12">
                        <BalanceCard balance={balance} />
                    </div>
                    <div className="col-lg-2 col-12">
                        <Card className="h-100 dashboard-card align-items-center text-center">
                            <a href={LUM_TWITTER}>
                                <div className="twitter mb-4 mb-lg-0" />
                            </a>
                            <h4>{t('dashboard.followTwitter')}</h4>
                        </Card>
                    </div>
                </div>
                {transactions.length > 0 && (
                    <div className="row mt-4">
                        <div className="col">
                            <Card withoutPadding>
                                <h2 className="ps-5 pt-5 pb-1">{t('dashboard.latestTx')}</h2>
                                <TransactionsTable transactions={transactions.slice(0, 5)} />
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
