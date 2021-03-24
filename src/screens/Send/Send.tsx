import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { AddressCard, BalanceCard, Input, Modal } from 'components';
import { Redirect } from 'react-router';
import { RootState } from 'redux/store';
import MessageButton from './components/MessageButton/MessageButton';
import assets from 'assets';
import { LumMessages } from '@lum-network/sdk-javascript';
import { WalletUtils } from 'utils';
import { Button } from 'frontend-elements';

type MsgType = { name: string; icon: string; id: string };

const Send = (): JSX.Element => {
    const wallet = useSelector((state: RootState) => state.wallet.currentWallet);
    const balance = useSelector((state: RootState) => state.wallet.currentBalance);

    const [modal, setModal] = useState<MsgType | null>(null);

    const buttons: MsgType[] = [
        { id: LumMessages.MsgSendUrl, name: 'Send', icon: assets.images.messageSend },
        { id: '', name: 'Delegate', icon: assets.images.messageDelegate },
        { id: '', name: 'Undelegate', icon: assets.images.messageUndelegate },
        { id: '', name: 'Multi Send', icon: assets.images.messageMultiSend },
        { id: '', name: 'Get rewards', icon: assets.images.messageGetReward },
        { id: '', name: 'Create Validator', icon: assets.images.messageCreateValidator },
        { id: '', name: 'Edit Validator', icon: assets.images.messageEditValidator },
    ];

    if (!wallet) {
        return <Redirect to="/welcome" />;
    }

    const onClickSendTx = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        WalletUtils.sendTx(wallet, 'lum1raaxnchq5v6ykpksla4wudsn6u39u8dlcacyzd', '15', 'Test');
    };

    const onClickButton = (msg: MsgType) => {
        setModal(msg);
    };

    const renderSend = (
        <form className="row w-100 align-items-start text-start mt-3" onSubmit={onClickSendTx}>
            <div className="col-12">
                <Input placeholder="Amount" label="Amount" />
            </div>
            <div className="col-12 mt-3">
                <Input placeholder="To address" label="To Address" />
            </div>
            <div className="justify-content-center mt-3 col-10 offset-1 col-sm-6 offset-sm-3">
                <Button onPress={() => null}>Send</Button>
            </div>
        </form>
    );

    const renderModal = (): JSX.Element | null => {
        if (!modal) {
            return null;
        }

        switch (modal.id) {
            case LumMessages.MsgSendUrl:
                return renderSend;

            default:
                return <div>Soon</div>;
        }
    };

    const renderButtons = (
        <div className="row gy-3 mt-4">
            {buttons.map((msg, index) => (
                <div key={index} className="col-sm-6 col-lg-3" onClick={() => onClickButton(msg)}>
                    <MessageButton
                        data-bs-target="#modalSendTxs"
                        data-bs-toggle="modal"
                        name={msg.name}
                        icon={msg.icon}
                    />
                </div>
            ))}
        </div>
    );

    return (
        <>
            <div className="mt-4">
                <div className="container">
                    <div className="row gy-4">
                        <div className="col-md-6">
                            <AddressCard address={wallet.getAddress()} />
                        </div>
                        <div className="col-md-6">
                            <BalanceCard balance={balance} />
                        </div>
                    </div>
                    {renderButtons}
                </div>
            </div>
            <Modal id="modalSendTxs" bodyClassName="w-100">
                {modal && (
                    <div className="d-flex flex-column align-items-center">
                        <h2 className="text-center">{modal.name}</h2>
                        {renderModal()}
                    </div>
                )}
            </Modal>
        </>
    );
};

export default Send;
