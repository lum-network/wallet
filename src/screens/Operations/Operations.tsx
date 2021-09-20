import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Redirect } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { LumConstants, LumMessages, LumUtils } from '@lum-network/sdk-javascript';
import * as yup from 'yup';

import assets from 'assets';
import { AddressCard, BalanceCard, Input, Modal, Button as CustomButton } from 'components';
import { RootDispatch, RootState } from 'redux/store';
import { useRematchDispatch } from 'redux/hooks';

import MessageButton from './components/MessageButton/MessageButton';
import Delegate from './components/Forms/Delegate';
import Send from './components/Forms/Send';
import Undelegate from './components/Forms/Undelegate';
import GetRewards from './components/Forms/GetRewards';
import Redelegate from './components/Forms/Redelegate';

import './Operations.scss';

type MsgType = { name: string; icon: string; iconClassName?: string; id: string; description: string };

const Operations = (): JSX.Element => {
    const wallet = useSelector((state: RootState) => state.wallet.currentWallet);
    const balance = useSelector((state: RootState) => state.wallet.currentBalance);

    // Rematch effects
    const { sendTx, undelegate, delegate, redelegate, getReward, getWalletInfos } = useRematchDispatch(
        (dispatch: RootDispatch) => ({
            sendTx: dispatch.wallet.sendTx,
            delegate: dispatch.wallet.delegate,
            getReward: dispatch.wallet.getReward,
            undelegate: dispatch.wallet.undelegate,
            redelegate: dispatch.wallet.redelegate,
            getWalletInfos: dispatch.wallet.getWalletInfos,
        }),
    );

    // Loaders
    const loadingSend = useSelector((state: RootState) => state.loading.effects.wallet.sendTx);
    const loadingDelegate = useSelector((state: RootState) => state.loading.effects.wallet.delegate);
    const loadingUndelegate = useSelector((state: RootState) => state.loading.effects.wallet.undelegate);
    const loadingRedelegate = useSelector((state: RootState) => state.loading.effects.wallet.redelegate);
    const loadingGetReward = useSelector((state: RootState) => state.loading.effects.wallet.getReward);

    const loadingAll = loadingSend | loadingDelegate | loadingUndelegate | loadingGetReward;

    const { t } = useTranslation();
    const modalRef = useRef<HTMLDivElement>(null);

    const [modal, setModal] = useState<MsgType | null>(null);
    const [txResult, setTxResult] = useState<{ hash: string; error?: string | null } | null>(null);
    const [confirming, setConfirming] = useState(false);

    const buttons: MsgType[] = [
        {
            id: LumMessages.MsgSendUrl,
            name: t('send.types.send.name'),
            icon: assets.images.messageSend,
            iconClassName: 'send-icon',
            description: t('send.types.send.description'),
        },
        {
            id: LumMessages.MsgDelegateUrl,
            name: t('send.types.delegate.name'),
            icon: assets.images.messageDelegate,
            description: t('send.types.delegate.description'),
        },
        {
            id: LumMessages.MsgUndelegateUrl,
            name: t('send.types.undelegate.name'),
            icon: assets.images.messageUndelegate,
            description: t('send.types.undelegate.description'),
        },
        {
            id: LumMessages.MsgBeginRedelegateUrl,
            name: t('send.types.redelegate.name'),
            icon: assets.images.messageRedelegate,
            description: t('send.types.redelegate.description'),
        },
        {
            id: LumMessages.MsgWithdrawDelegatorRewardUrl,
            name: t('send.types.getRewards.name'),
            icon: assets.images.messageGetReward,
            description: t('send.types.getRewards.description'),
        },
    ];

    useEffect(() => {
        if (modalRef.current) {
            modalRef.current.addEventListener('hidden.bs.modal', () => {
                if (sendForm.touched.address || sendForm.touched.amount || sendForm.touched.memo) {
                    sendForm.resetForm();
                }
                if (delegateForm.touched.address || delegateForm.touched.amount || delegateForm.touched.memo) {
                    delegateForm.resetForm();
                }
                if (undelegateForm.touched.address || undelegateForm.touched.amount || undelegateForm.touched.memo) {
                    undelegateForm.resetForm();
                }
                if (getRewardForm.touched.address || getRewardForm.touched.memo) {
                    getRewardForm.resetForm();
                }
                if (confirming) {
                    setConfirming(false);
                }
                if (txResult) {
                    setTxResult(null);
                }
            });
        }
    });

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
        onSubmit: async (values) => await onSubmitSend(values.address, values.amount, values.memo),
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

    const redelegateForm = useFormik({
        initialValues: { fromAddress: '', toAddress: '', amount: '', memo: 'Redelegated' },
        validationSchema: yup.object().shape({
            fromAddress: yup
                .string()
                .required(t('common.required'))
                .matches(new RegExp(`^${LumConstants.LumBech32PrefixValAddr}`), {
                    message: 'Check source validator address',
                }),
            toAddress: yup
                .string()
                .required(t('common.required'))
                .matches(new RegExp(`^${LumConstants.LumBech32PrefixValAddr}`), {
                    message: 'Check destination validator address',
                }),
            amount: yup.string().required(t('common.required')),
            memo: yup.string(),
        }),
        onSubmit: (values) => onSubmitRedelegate(values.fromAddress, values.toAddress, values.amount, values.memo),
    });

    const getRewardForm = useFormik({
        initialValues: { address: '', amount: '', memo: 'Get reward' },
        validationSchema: yup.object().shape({
            address: yup
                .string()
                .required(t('common.required'))
                .matches(new RegExp(`^${LumConstants.LumBech32PrefixValAddr}`), { message: 'Check validator address' }),
            memo: yup.string(),
        }),
        onSubmit: (values) => onSubmitGetReward(values.address, values.memo),
    });

    if (!wallet) {
        return <Redirect to="/welcome" />;
    }

    const onSubmitSend = async (toAddress: string, amount: string, memo: string) => {
        const sendResult = await sendTx({ from: wallet, to: toAddress, amount, memo });

        if (sendResult) {
            setConfirming(false);
            setTxResult({ hash: LumUtils.toHex(sendResult.hash), error: sendResult.error });
        }
    };

    const onSubmitDelegate = async (validatorAddress: string, amount: string, memo: string) => {
        const delegateResult = await delegate({ validatorAddress, amount, memo, from: wallet });

        if (delegateResult) {
            setTxResult({ hash: LumUtils.toHex(delegateResult.hash), error: delegateResult.error });
        }
    };

    const onSubmitUndelegate = async (validatorAddress: string, amount: string, memo: string) => {
        const undelegateResult = await undelegate({ validatorAddress, amount, memo, from: wallet });

        if (undelegateResult) {
            setTxResult({ hash: LumUtils.toHex(undelegateResult.hash), error: undelegateResult.error });
        }
    };

    const onSubmitRedelegate = async (
        validatorSrcAddress: string,
        validatorDestAddress: string,
        amount: string,
        memo: string,
    ) => {
        const redelegateResult = await redelegate({
            validatorSrcAddress,
            validatorDestAddress,
            amount,
            memo,
            from: wallet,
        });

        if (redelegateResult) {
            setTxResult({ hash: LumUtils.toHex(redelegateResult.hash), error: redelegateResult.error });
        }
    };

    const onSubmitGetReward = async (validatorAddress: string, memo: string) => {
        const getRewardResult = await getReward({ validatorAddress, memo, from: wallet });

        if (getRewardResult) {
            setTxResult({ hash: LumUtils.toHex(getRewardResult.hash), error: getRewardResult.error });
        }
    };

    const onClickButton = (msg: MsgType) => {
        setModal(msg);
    };

    const renderModal = (): JSX.Element | null => {
        if (!modal) {
            return null;
        }

        switch (modal.id) {
            case LumMessages.MsgSendUrl:
                return <Send isLoading={loadingSend} form={sendForm} />;

            case LumMessages.MsgDelegateUrl:
                return <Delegate isLoading={loadingDelegate} form={delegateForm} />;

            case LumMessages.MsgUndelegateUrl:
                return <Undelegate isLoading={loadingUndelegate} form={undelegateForm} />;

            case LumMessages.MsgBeginRedelegateUrl:
                return <Redelegate isLoading={loadingRedelegate} form={redelegateForm} />;

            case LumMessages.MsgWithdrawDelegatorRewardUrl:
                return <GetRewards isLoading={loadingGetReward} form={getRewardForm} />;

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
                        description={msg.description}
                        icon={msg.icon}
                        iconClassName={msg.iconClassName}
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
                            <BalanceCard balance={balance} address={wallet.getAddress()} />
                        </div>
                    </div>
                    {renderButtons}
                </div>
            </div>
            <Modal
                ref={modalRef}
                id="modalSendTxs"
                withCloseButton={!loadingAll && (txResult === null || (txResult && txResult.error !== null))}
                dataBsBackdrop="static"
                dataBsKeyboard={false}
                bodyClassName="w-100"
            >
                {modal && (
                    <div className="d-flex flex-column align-items-center">
                        <h2 className="text-center">{modal.name}</h2>
                        {!txResult ? (
                            renderModal()
                        ) : txResult.error !== null ? (
                            <>
                                <p className="color-error">Failure</p>
                                <p className="color-error my-5 text-start">
                                    {txResult.error || 'An unknown error has occured, please try again later'}
                                </p>
                                <CustomButton className="mt-5" onClick={() => setTxResult(null)}>
                                    Retry
                                </CustomButton>
                            </>
                        ) : (
                            <>
                                <p className="color-success">Success</p>
                                <Input
                                    disabled
                                    value={txResult.hash}
                                    label="Hash"
                                    className="text-start align-self-stretch mb-5"
                                />
                                <CustomButton
                                    className="mt-5"
                                    data-bs-target="modalSendTxs"
                                    data-bs-dismiss="modal"
                                    onClick={() => getWalletInfos(wallet.getAddress())}
                                >
                                    Close
                                </CustomButton>
                            </>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
};

export default Operations;
