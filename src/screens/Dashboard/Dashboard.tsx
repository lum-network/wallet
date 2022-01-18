import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Redirect, useLocation } from 'react-router';

import { Card } from 'frontend-elements';
import { LUM_TWITTER } from 'constant';
import { TransactionsTable, AddressCard, BalanceCard, LumPriceCard } from 'components';
import { RootDispatch, RootState } from 'redux/store';

import './styles/Dashboard.scss';
import { usePrevious } from 'utils';
import { useRematchDispatch } from 'redux/hooks';
import { LumConstants, LumUtils } from '@lum-network/sdk-javascript';
import AirdropCard from 'components/Cards/AirdropCard';
import StakedCoinsCard from 'screens/Staking/components/Cards/StakedCoinsCard';
import VestingTokensCard from 'screens/Staking/components/Cards/VestingTokensCard';

const Dashboard = (): JSX.Element => {
    // Redux hooks
    const { transactions, balance, wallet, vestings, airdrop, stakedCoins } = useSelector((state: RootState) => ({
        loading: state.loading.global.loading,
        transactions: state.wallet.transactions,
        balance: state.wallet.currentBalance,
        wallet: state.wallet.currentWallet,
        stakedCoins: state.staking.stakedCoins,
        vestings: state.wallet.vestings,
        airdrop: state.wallet.airdrop,
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
                    {airdrop && airdrop.amount > 0 ? (
                        <div className="col-12">
                            <AirdropCard airdrop={airdrop} />
                        </div>
                    ) : null}
                    <div className="col-lg-5 col-md-6 col-12">
                        <AddressCard address={wallet.getAddress()} />
                    </div>
                    <div className="col-lg-5 col-md-6 col-12">
                        <BalanceCard
                            balance={
                                vestings
                                    ? balance.lum -
                                      Number(LumUtils.convertUnit(vestings.lockedBankCoins, LumConstants.LumDenom))
                                    : balance.lum
                            }
                            address={wallet.getAddress()}
                        />
                    </div>
                    <div className="col-lg-2 col-12 scale-animation">
                        <a href={LUM_TWITTER} target="_blank" rel="noreferrer">
                            <Card className="h-100 dashboard-card align-items-center justify-content-center text-center">
                                <div className="twitter mb-2" />
                                <h4>{t('dashboard.followTwitter')}</h4>
                            </Card>
                        </a>
                    </div>
                    {(vestings !== null || stakedCoins > 0) && (
                        <>
                            <div className="col-md-6 col-12">
                                <StakedCoinsCard
                                    amount={stakedCoins}
                                    amountVesting={
                                        vestings
                                            ? Number(
                                                  LumUtils.convertUnit(
                                                      vestings.lockedDelegatedCoins,
                                                      LumConstants.LumDenom,
                                                  ),
                                              )
                                            : 0
                                    }
                                />
                            </div>
                            <div className="col-md-6 col-12">
                                <VestingTokensCard vestings={vestings} />
                            </div>
                        </>
                    )}
                    <div className="col-12">
                        <LumPriceCard balance={balance.fiat} />
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
