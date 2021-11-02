import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Redirect, useLocation } from 'react-router';

import { Card } from 'frontend-elements';
import { LUM_TWITTER } from 'constant';
import { TransactionsTable, AddressCard, BalanceCard } from 'components';
import { RootDispatch, RootState } from 'redux/store';

import './styles/Dashboard.scss';
import { usePrevious } from 'utils';
import { useRematchDispatch } from 'redux/hooks';

const Dashboard = (): JSX.Element => {
    // Redux hooks
    const { transactions, balance, wallet } = useSelector((state: RootState) => ({
        loading: state.loading.global.loading,
        transactions: state.wallet.transactions,
        balance: state.wallet.currentBalance,
        wallet: state.wallet.currentWallet,
    }));

    const { getWalletInfos } = useRematchDispatch((dispatch: RootDispatch) => ({
        getWalletInfos: dispatch.wallet.reloadWalletInfos,
    }));

    // Utils hooks
    const { t } = useTranslation();
    const location = useLocation();

    const prevLocation = usePrevious(location);

    // Effects
    useEffect(() => {
        if (wallet && location != prevLocation) {
            getWalletInfos(wallet.getAddress());
        }
    }, [location, prevLocation, wallet, getWalletInfos]);

    if (!wallet) {
        return <Redirect to="/welcome" />;
    }

    return (
        <div className="mt-4">
            <div className="container">
                <div className="row gy-4">
                    <div className="col-lg-5 col-md-6 col-12">
                        <AddressCard address={wallet.getAddress()} />
                    </div>
                    <div className="col-lg-5 col-md-6 col-12">
                        <BalanceCard balance={balance} address={wallet.getAddress()} />
                    </div>
                    <div className="col-lg-2 col-12 scale-animation">
                        <a href={LUM_TWITTER} target="_blank" rel="noreferrer">
                            <Card className="h-100 dashboard-card align-items-center justify-content-center text-center">
                                <div className="twitter mb-2" />
                                <h4>{t('dashboard.followTwitter')}</h4>
                            </Card>
                        </a>
                    </div>
                </div>
                <div className="row mt-4">
                    <div className="col">
                        <Card withoutPadding>
                            <div className="ps-4">
                                <h2 className="ps-2 pt-5 pb-1">{t('dashboard.latestTx')}</h2>
                            </div>
                            <TransactionsTable transactions={transactions} wallet={wallet} />
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
