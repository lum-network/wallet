import React from 'react';
import assets from 'assets';
import { Card } from 'frontend-elements';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { useRematchDispatch } from 'redux/hooks';
import { RootDispatch, RootState } from 'redux/store';

import { NumbersUtils, WalletClient } from 'utils';

import SmallerDecimal from '../SmallerDecimal/SmallerDecimal';
import './Cards.scss';
import { HoverTooltip } from 'components';

const BalanceCard = ({ balance, address }: { balance: number; address: string }): JSX.Element => {
    const isLoading = useSelector((state: RootState) => state.loading.effects.wallet.reloadWalletInfos.loading);

    const { mintFaucet, getWalletInfos } = useRematchDispatch((dispatch: RootDispatch) => ({
        mintFaucet: dispatch.wallet.mintFaucet,
        getWalletInfos: dispatch.wallet.reloadWalletInfos,
    }));

    const { t } = useTranslation();

    return (
        <Card withoutPadding className="h-100 dashboard-card balance-card p-4">
            <h2 className="ps-2 pt-3 text-white">{t('dashboard.availableBalance')}</h2>
            <div className="ps-2 my-3 d-flex flex-row align-items-baseline w-100">
                <div className="me-2 me-sm-3 text-white text-truncate">
                    <SmallerDecimal nb={NumbersUtils.formatTo6digit(balance < 0 ? 0 : balance)} big />
                </div>
                <img src={assets.images.lumTicker} className="ticker" />
            </div>
            <div>
                <HoverTooltip text={t('common.refreshBalance')}>
                    <button type="button" className="ps-2 pb-2" onClick={() => getWalletInfos(address)}>
                        <img
                            src={assets.images.syncIcon}
                            className={`tint-white refresh-img ${isLoading && 'loading'}`}
                        />
                    </button>
                </HoverTooltip>
                {WalletClient.isTestnet() && (
                    <HoverTooltip text={t('common.mintFaucet')}>
                        <button type="button" className="ps-2 pb-2" onClick={() => mintFaucet(address)}>
                            <img src={assets.images.addIcon} className="tint-white" />
                        </button>
                    </HoverTooltip>
                )}
            </div>
        </Card>
    );
};

export default BalanceCard;
