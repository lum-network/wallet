import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { AddressCard, BalanceCard, Input, Modal } from 'components';
import { Redirect } from 'react-router';
import { RootDispatch, RootState } from 'redux/store';
import MessageButton from './components/MessageButton/MessageButton';
import assets from 'assets';
import { LumConstants, LumMessages } from '@lum-network/sdk-javascript';
import { Button } from 'frontend-elements';
import { useTranslation } from 'react-i18next';

import './Send.scss';

type MsgType = { name: string; icon: string; id: string };

const Send = (): JSX.Element => {
    const dispatch = useDispatch<RootDispatch>();
    const wallet = useSelector((state: RootState) => state.wallet.currentWallet);
    const balance = useSelector((state: RootState) => state.wallet.currentBalance);

    // Loaders
    const loadingSend = useSelector((state: RootState) => state.loading.effects.wallet.sendTx);
    const loadingDelegate = useSelector((state: RootState) => state.loading.effects.wallet.delegate);
    const loadingUndelegate = useSelector((state: RootState) => state.loading.effects.wallet.undelegate);

    const loadingAll = loadingSend | loadingDelegate | loadingUndelegate;

    const { t } = useTranslation();

    const [modal, setModal] = useState<MsgType | null>(null);

    const buttons: MsgType[] = [
        { id: LumMessages.MsgSendUrl, name: 'Send', icon: assets.images.messageSend },
        { id: LumMessages.MsgDelegateUrl, name: 'Delegate', icon: assets.images.messageDelegate },
        { id: LumMessages.MsgUndelegateUrl, name: 'Undelegate', icon: assets.images.messageUndelegate },
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
            address: yup
                .string()
                .required(t('common.required'))
                .matches(new RegExp(`^${LumConstants.LumBech32PrefixAccAddr}`), { message: 'Check address' }),
            amount: yup.string().required(t('common.required')),
            memo: yup.string(),
        }),
        onSubmit: (values) => onSubmitSend(values.address, values.amount, values.memo),
    });

    const delegateForm = useFormik({
        initialValues: { address: '', amount: '', memo: 'Delegated' },
        validationSchema: yup.object().shape({
            address: yup
                .string()
                .required(t('common.required'))
                .matches(new RegExp(`^${LumConstants.LumBech32PrefixValAddr}`), { message: 'Check validator address' }),
            amount: yup.string().required(t('common.required')),
            memo: yup.string(),
        }),
        onSubmit: (values) => onSubmitDelegate(values.address, values.amount, values.memo),
    });

    const undelegateForm = useFormik({
        initialValues: { address: '', amount: '', memo: 'Undelegated' },
        validationSchema: yup.object().shape({
            address: yup
                .string()
                .required(t('common.required'))
                .matches(new RegExp(`^${LumConstants.LumBech32PrefixValAddr}`), { message: 'Check validator address' }),
            amount: yup.string().required(t('common.required')),
            memo: yup.string(),
        }),
        onSubmit: (values) => onSubmitUndelegate(values.address, values.amount, values.memo),
    });

    const onSubmitSend = (toAddress: string, amount: string, memo: string) => {
        dispatch.wallet.sendTx({ from: wallet, to: toAddress, amount, memo, ticker: LumConstants.LumDenom });
    };

    const onSubmitDelegate = (validatorAddress: string, amount: string, memo: string) => {
        dispatch.wallet.delegate({ validatorAddress, amount, memo, from: wallet });
    };

    const onSubmitUndelegate = (validatorAddress: string, amount: string, memo: string) => {
        dispatch.wallet.undelegate({ validatorAddress, amount, memo, from: wallet });
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
                <Button loading={loadingSend} onPress={sendForm.handleSubmit}>
                    Send
                </Button>
            </div>
        </form>
    );

    const renderDelegate = (
        <form className="row w-100 align-items-start text-start mt-3">
            <div className="col-12">
                <Input {...delegateForm.getFieldProps('amount')} placeholder="Amount" label="Amount" />
                {delegateForm.touched.amount && delegateForm.errors.amount && (
                    <p className="ms-2 color-error">{delegateForm.errors.amount}</p>
                )}
            </div>
            <div className="col-12 mt-4">
                <Input
                    {...delegateForm.getFieldProps('address')}
                    placeholder="Validator address"
                    label="Validator Address"
                />
                {delegateForm.touched.address && delegateForm.errors.address && (
                    <p className="ms-2 color-error">{delegateForm.errors.address}</p>
                )}
            </div>
            <div className="col-12 mt-4">
                <Input {...delegateForm.getFieldProps('memo')} placeholder="Memo" label="Memo" />
                {delegateForm.touched.memo && delegateForm.errors.memo && (
                    <p className="ms-2 color-error">{delegateForm.errors.memo}</p>
                )}
            </div>
            <div className="justify-content-center mt-4 col-10 offset-1 col-sm-6 offset-sm-3">
                <Button loading={loadingDelegate} onPress={delegateForm.handleSubmit}>
                    Delegate
                </Button>
            </div>
        </form>
    );

    const renderUndelegate = (
        <form className="row w-100 align-items-start text-start mt-3">
            <div className="col-12">
                <Input {...undelegateForm.getFieldProps('amount')} placeholder="Amount" label="Amount" />
                {undelegateForm.touched.amount && undelegateForm.errors.amount && (
                    <p className="ms-2 color-error">{undelegateForm.errors.amount}</p>
                )}
            </div>
            <div className="col-12 mt-4">
                <Input
                    {...undelegateForm.getFieldProps('address')}
                    placeholder="Validator address"
                    label="Validator Address"
                />
                {undelegateForm.touched.address && undelegateForm.errors.address && (
                    <p className="ms-2 color-error">{undelegateForm.errors.address}</p>
                )}
            </div>
            <div className="col-12 mt-4">
                <Input {...undelegateForm.getFieldProps('memo')} placeholder="Memo" label="Memo" />
                {undelegateForm.touched.memo && undelegateForm.errors.memo && (
                    <p className="ms-2 color-error">{undelegateForm.errors.memo}</p>
                )}
            </div>
            <div className="justify-content-center mt-4 col-10 offset-1 col-sm-6 offset-sm-3">
                <Button loading={loadingUndelegate} onPress={undelegateForm.handleSubmit}>
                    Undelegate
                </Button>
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

            case LumMessages.MsgDelegateUrl:
                return renderDelegate;

            case LumMessages.MsgUndelegateUrl:
                return renderUndelegate;

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
            <Modal id="modalSendTxs" withCloseButton={!loadingAll} dataBsBackdrop={'static'} bodyClassName="w-100">
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
