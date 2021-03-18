import React from 'react';
import { useSelector } from 'react-redux';

import { AddressCard, BalanceCard } from 'components';
import { Redirect } from 'react-router';
import { RootState } from 'redux/store';
import Button from './components/Button/Button';
import assets from 'assets';

const Send = (): JSX.Element => {
    const wallet = useSelector((state: RootState) => state.wallet.currentWallet);
    const balance = useSelector((state: RootState) => state.wallet.currentBalance);

    const buttons = [
        { name: 'Send', icon: assets.images.messageSend },
        { name: 'Delegate', icon: assets.images.messageDelegate },
        { name: 'Undelegate', icon: assets.images.messageUndelegate },
        { name: 'Multi Send', icon: assets.images.messageMultiSend },
        { name: 'Get rewards', icon: assets.images.messageGetReward },
        { name: 'Create Validator', icon: assets.images.messageCreateValidator },
        { name: 'Edit Validator', icon: assets.images.messageEditValidator },
    ];

    const renderButtons = (): JSX.Element => {
        return (
            <div className="row gy-3 mt-4">
                {buttons.map((button, index) => (
                    <div key={index} className="col-sm-6 col-lg-3">
                        <Button name={button.name} icon={button.icon} />
                    </div>
                ))}
            </div>
        );
    };

    if (!wallet) {
        return <Redirect to="/welcome" />;
    }

    return (
        <div className="mt-4">
            <div className="container">
                <div className="row gy-4">
                    <div className="col-md-6">
                        <AddressCard address={wallet.address} />
                    </div>
                    <div className="col-md-6">
                        <BalanceCard balance={balance} />
                    </div>
                </div>
                {renderButtons()}
            </div>
        </div>
    );
};

export default Send;
