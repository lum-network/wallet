import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { AddressCard, BalanceCard, Input, Modal } from 'components';
import { Redirect } from 'react-router';
import { RootState } from 'redux/store';
import MessageButton from './components/MessageButton/MessageButton';
import assets from 'assets';
import { LumMessages } from '@lum-network/sdk-javascript';
import { WalletUtils } from 'utils';
import { Button } from 'frontend-elements';
import { useTranslation } from 'react-i18next';

import './Send.scss';

type MsgType = { name: string; icon: string; id: string };

const Send = (): JSX.Element => {
    const wallet = useSelector((state: RootState) => state.wallet.currentWallet);
    const balance = useSelector((state: RootState) => state.wallet.currentBalance);

    const { t } = useTranslation();

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

    const sendForm = useFormik({
        initialValues: { address: '', amount: '', memo: '' },
        validationSchema: yup.object().shape({
            address: yup.string().required(t('common.required')),
            amount: yup.string().required(t('common.required')),
            memo: yup.string(),
        }),
        onSubmit: (values) => onSubmitSend(values.address, values.amount, values.memo),
    });

    const onSubmitSend = (address: string, amount: string, memo: string) => {
        console.log('hello');
        WalletUtils.sendTx(wallet, address, amount, memo).then(() => null);
    };

    const onClickButton = (msg: MsgType) => {
        setModal(msg);
    };

    const renderSend = (
        <form className="row w-100 align-items-start text-start mt-3">
            <div className="col-12">
                <Input {...sendForm.getFieldProps('amount')} placeholder="Amount" label="Amount" />
                {sendForm.touched.amount && sendForm.errors.amount && (
                    <p className="ms-2 color-error">{sendForm.errors.amount}</p>
                )}
            </div>
            <div className="col-12 mt-4">
                <Input {...sendForm.getFieldProps('address')} placeholder="To address" label="To Address" />
                {sendForm.touched.address && sendForm.errors.address && (
                    <p className="ms-2 color-error">{sendForm.errors.address}</p>
                )}
            </div>
            <div className="col-12 mt-4">
                <Input {...sendForm.getFieldProps('memo')} placeholder="Memo" label="Memo" />
                {sendForm.touched.memo && sendForm.errors.memo && (
                    <p className="ms-2 color-error">{sendForm.errors.memo}</p>
                )}
            </div>
            <div className="justify-content-center mt-4 col-10 offset-1 col-sm-6 offset-sm-3">
                <Button onPress={sendForm.handleSubmit}>Send</Button>
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
