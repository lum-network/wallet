import React from 'react';
import assets from 'assets';
import { Card } from 'frontend-elements';
import { useTranslation } from 'react-i18next';

import './Cards.scss';
import { useRematchDispatch } from 'redux/hooks';
import { RootDispatch } from 'redux/store';

const BalanceCard = ({ balance, address }: { balance: number; address: string }): JSX.Element => {
    const { t } = useTranslation();

    const { mintFaucet, getWalletInfos } = useRematchDispatch((dispatch: RootDispatch) => ({
        mintFaucet: dispatch.wallet.mintFaucet,
        getWalletInfos: dispatch.wallet.getWalletInfos,
    }));

    return (
        <Card withoutPadding className="h-100 dashboard-card balance-card p-4">
            <h2 className="ps-2 pt-3 text-white">{t('dashboard.currentBalance')}</h2>
            <div className="ps-2 my-3 d-flex flex-row align-items-baseline w-100">
                <h1 className="display-6 fw-normal me-2 me-sm-3 text-white text-truncate">{balance}</h1>
                <img src={assets.images.lumTicker} className="ticker" />
            </div>
            <div>
                <button type="button" className="ps-2 pb-2" onClick={() => getWalletInfos(address)}>
                    <img src={assets.images.syncIcon} className="tint-white" />
                </button>
                {process.env.REACT_APP_RPC_URL.includes('testnet') && (
                    <button type="button" className="ps-2 pb-2" onClick={() => mintFaucet(address)}>
                        <img src={assets.images.addIcon} className="tint-white" />
                    </button>
                )}
            </div>
        </Card>
    );
};

export default BalanceCard;
