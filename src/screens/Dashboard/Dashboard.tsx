import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { LumConstants, LumUtils } from '@lum-network/sdk-javascript';

import { Card } from 'frontend-elements';
import { LUM_TWITTER } from 'constant';
import {
    TransactionsTable,
    AddressCard,
    AvailableCard,
    LumPriceCard,
    BalanceCard,
    AirdropCard,
    OtherAssetsTable,
} from 'components';
import { RootState } from 'redux/store';

import StakedCoinsCard from '../Staking/components/Cards/StakedCoinsCard';
import VestingTokensCard from '../Staking/components/Cards/VestingTokensCard';

import './styles/Dashboard.scss';

const Dashboard = (): JSX.Element => {
    // Redux hooks
    const { transactions, balance, otherBalances, wallet, vestings, airdrop, stakedCoins, rewards } = useSelector(
        (state: RootState) => ({
            loading: state.loading.global.loading,
            transactions: state.wallet.transactions,
            balance: state.wallet.currentBalance,
            otherBalances: state.wallet.otherBalances,
            wallet: state.wallet.currentWallet,
            stakedCoins: state.staking.stakedCoins,
            vestings: state.wallet.vestings,
            airdrop: state.wallet.airdrop,
            rewards: state.wallet.rewards,
        }),
    );

    // Utils hooks
    const { t } = useTranslation();

    if (!wallet) {
        return <div />;
    }

    return (
        <div className="mt-4">
            <div className="container-xxl">
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
                        <AvailableCard
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
                    <div className="col-lg-6 col-12">
                        <BalanceCard balance={balance.lum + stakedCoins} rewards={rewards} />
                    </div>
                    <div className="col-lg-6 col-12">
                        <LumPriceCard />
                    </div>
                </div>
                {otherBalances.length > 0 && (
                    <div className="row mt-4">
                        <div className="col">
                            <Card withoutPadding>
                                <div className="ps-4">
                                    <h2 className="ps-2 pt-5 pb-1">{t('dashboard.otherBalancesTable.title')}</h2>
                                </div>
                                <OtherAssetsTable otherBalances={otherBalances} />
                            </Card>
                        </div>
                    </div>
                )}
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
