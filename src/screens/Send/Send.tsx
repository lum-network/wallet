import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { AddressCard, BalanceCard, Input, Modal, Button as CustomButton } from 'components';
import { Redirect } from 'react-router';
import { RootDispatch, RootState } from 'redux/store';
import MessageButton from './components/MessageButton/MessageButton';
import assets from 'assets';
import { LumConstants, LumMessages, LumUtils } from '@lum-network/sdk-javascript';
import { Button } from 'frontend-elements';
import { useTranslation } from 'react-i18next';

import './Send.scss';

type MsgType = { name: string; icon: string; id: string; description: string };

const Send = (): JSX.Element => {
    const dispatch = useDispatch<RootDispatch>();
    const wallet = useSelector((state: RootState) => state.wallet.currentWallet);
    const balance = useSelector((state: RootState) => state.wallet.currentBalance);

    // Loaders
    const loadingSend = useSelector((state: RootState) => state.loading.effects.wallet.sendTx);
    const loadingDelegate = useSelector((state: RootState) => state.loading.effects.wallet.delegate);
    const loadingUndelegate = useSelector((state: RootState) => state.loading.effects.wallet.undelegate);
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
            id: LumMessages.MsgWithdrawDelegatorRewardUrl,
            name: t('send.types.getRewards.name'),
            icon: assets.images.messageGetReward,
            description: t('send.types.getRewards.description'),
        },
        {
            id: LumMessages.MsgSetWithdrawAddressUrl,
            name: t('send.types.withdrawRewards.name'),
            icon: assets.images.messageWithdrawAddress,
            description: t('send.types.withdrawRewards.description'),
        },
        {
            id: LumMessages.MsgBeginRedelegateUrl,
            name: t('send.types.redelegate.name'),
            icon: assets.images.messageRedelegate,
            description: t('send.types.redelegate.description'),
        },
    ];

    if (!wallet) {
        return <Redirect to="/welcome" />;
    }

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

    const onSubmitSend = async (toAddress: string, amount: string, memo: string) => {
        const sendResult = await dispatch.wallet.sendTx({ from: wallet, to: toAddress, amount, memo });

        if (sendResult) {
            setConfirming(false);
            setTxResult({ hash: LumUtils.toHex(sendResult.hash), error: sendResult.error });
        }
    };

    const onSubmitDelegate = async (validatorAddress: string, amount: string, memo: string) => {
        const delegateResult = await dispatch.wallet.delegate({ validatorAddress, amount, memo, from: wallet });

        if (delegateResult) {
            setTxResult({ hash: LumUtils.toHex(delegateResult.hash), error: delegateResult.error });
        }
    };

    const onSubmitUndelegate = async (validatorAddress: string, amount: string, memo: string) => {
        const undelegateResult = await dispatch.wallet.undelegate({ validatorAddress, amount, memo, from: wallet });

        if (undelegateResult) {
            setTxResult({ hash: LumUtils.toHex(undelegateResult.hash), error: undelegateResult.error });
        }
    };

    const onSubmitGetReward = async (validatorAddress: string, memo: string) => {
        const getRewardResult = await dispatch.wallet.getReward({ validatorAddress, memo, from: wallet });

        if (getRewardResult) {
            setTxResult({ hash: LumUtils.toHex(getRewardResult.hash), error: getRewardResult.error });
        }
    };

    const onClickButton = (msg: MsgType) => {
        setModal(msg);
    };

    const renderSend = (
        <form className="row w-100 align-items-start text-start mt-3">
            <div className="col-12">
                <Input
                    {...sendForm.getFieldProps('amount')}
                    readOnly={confirming}
                    autoComplete="off"
                    placeholder="Amount"
                    label="Amount"
                />
                {sendForm.touched.amount && sendForm.errors.amount && (
                    <p className="ms-2 color-error">{sendForm.errors.amount}</p>
                )}
            </div>
            <div className="col-12 mt-4">
                <Input
                    {...sendForm.getFieldProps('address')}
                    readOnly={confirming}
                    placeholder="To address"
                    label="To Address"
                />
                {sendForm.touched.address && sendForm.errors.address && (
                    <p className="ms-2 color-error">{sendForm.errors.address}</p>
                )}
            </div>
            <div className="col-12 mt-4">
                {(!confirming || (confirming && sendForm.values.memo)) && (
                    <Input
                        {...sendForm.getFieldProps('memo')}
                        readOnly={confirming}
                        placeholder="Memo"
                        label="Memo (optional)"
                    />
                )}
                {sendForm.touched.memo && sendForm.errors.memo && (
                    <p className="ms-2 color-error">{sendForm.errors.memo}</p>
                )}
            </div>
            <div className="justify-content-center mt-4 col-10 offset-1 col-sm-6 offset-sm-3">
                <Button loading={loadingSend} onPress={confirming ? sendForm.handleSubmit : () => setConfirming(true)}>
                    {confirming ? 'Send' : 'Continue'}
                </Button>
                {confirming && (
                    <CustomButton
                        className="bg-transparent text-btn mt-2 mx-auto"
                        onClick={() => {
                            setConfirming(false);
                        }}
                    >
                        Modify
                    </CustomButton>
                )}
            </div>
        </form>
    );

    const renderDelegate = (
        <form className="row w-100 align-items-start text-start mt-3">
            <div className="col-12">
                <Input
                    {...delegateForm.getFieldProps('amount')}
                    readOnly={confirming}
                    placeholder="Amount"
                    label="Amount"
                />
                {delegateForm.touched.amount && delegateForm.errors.amount && (
                    <p className="ms-2 color-error">{delegateForm.errors.amount}</p>
                )}
            </div>
            <div className="col-12 mt-4">
                <Input
                    {...delegateForm.getFieldProps('address')}
                    readOnly={confirming}
                    placeholder="Validator address"
                    label="Validator Address"
                />
                {delegateForm.touched.address && delegateForm.errors.address && (
                    <p className="ms-2 color-error">{delegateForm.errors.address}</p>
                )}
            </div>
            <div className="col-12 mt-4">
                {(!confirming || (confirming && delegateForm.values.memo)) && (
                    <Input
                        {...delegateForm.getFieldProps('memo')}
                        readOnly={confirming}
                        placeholder="Memo"
                        label="Memo (optional)"
                    />
                )}
                {delegateForm.touched.memo && delegateForm.errors.memo && (
                    <p className="ms-2 color-error">{delegateForm.errors.memo}</p>
                )}
            </div>
            <div className="justify-content-center mt-4 col-10 offset-1 col-sm-6 offset-sm-3">
                <Button
                    loading={loadingDelegate}
                    onPress={confirming ? delegateForm.handleSubmit : () => setConfirming(true)}
                >
                    {confirming ? 'Delegate' : 'Continue'}
                </Button>
                {confirming && (
                    <CustomButton
                        className="bg-transparent text-btn mt-2 mx-auto"
                        onClick={() => {
                            setConfirming(false);
                        }}
                    >
                        Modify
                    </CustomButton>
                )}
            </div>
        </form>
    );

    const renderUndelegate = (
        <form className="row w-100 align-items-start text-start mt-3">
            <div className="col-12">
                <Input
                    {...undelegateForm.getFieldProps('amount')}
                    readOnly={confirming}
                    placeholder="Amount"
                    label="Amount"
                />
                {undelegateForm.touched.amount && undelegateForm.errors.amount && (
                    <p className="ms-2 color-error">{undelegateForm.errors.amount}</p>
                )}
            </div>
            <div className="col-12 mt-4">
                <Input
                    {...undelegateForm.getFieldProps('address')}
                    placeholder="Validator address"
                    readOnly={confirming}
                    label="Validator Address"
                />
                {undelegateForm.touched.address && undelegateForm.errors.address && (
                    <p className="ms-2 color-error">{undelegateForm.errors.address}</p>
                )}
            </div>
            <div className="col-12 mt-4">
                {(!confirming || (confirming && undelegateForm.values.memo)) && (
                    <Input
                        {...undelegateForm.getFieldProps('memo')}
                        readOnly={confirming}
                        placeholder="Memo"
                        label="Memo (optional)"
                    />
                )}
                {undelegateForm.touched.memo && undelegateForm.errors.memo && (
                    <p className="ms-2 color-error">{undelegateForm.errors.memo}</p>
                )}
            </div>
            <div className="justify-content-center mt-4 col-10 offset-1 col-sm-6 offset-sm-3">
                <Button
                    loading={loadingUndelegate}
                    onPress={confirming ? undelegateForm.handleSubmit : () => setConfirming(true)}
                >
                    {confirming ? 'Undelegate' : 'Continue'}
                </Button>
                {confirming && (
                    <CustomButton
                        className="bg-transparent text-btn mt-2 mx-auto"
                        onClick={() => {
                            setConfirming(false);
                        }}
                    >
                        Modify
                    </CustomButton>
                )}
            </div>
        </form>
    );

    const renderGetReward = (
        <form className="row w-100 align-items-start text-start mt-3">
            <div className="col-12 mt-4">
                <Input
                    {...getRewardForm.getFieldProps('address')}
                    placeholder="Validator address"
                    readOnly={confirming}
                    label="Validator Address"
                />
                {getRewardForm.touched.address && getRewardForm.errors.address && (
                    <p className="ms-2 color-error">{getRewardForm.errors.address}</p>
                )}
            </div>
            <div className="col-12 mt-4">
                {(!confirming || (confirming && getRewardForm.values.memo)) && (
                    <Input
                        {...getRewardForm.getFieldProps('memo')}
                        readOnly={confirming}
                        placeholder="Memo"
                        label="Memo (optional)"
                    />
                )}
                {getRewardForm.touched.memo && getRewardForm.errors.memo && (
                    <p className="ms-2 color-error">{getRewardForm.errors.memo}</p>
                )}
            </div>
            <div className="justify-content-center mt-4 col-10 offset-1 col-sm-6 offset-sm-3">
                <Button
                    loading={loadingGetReward}
                    onPress={confirming ? getRewardForm.handleSubmit : () => setConfirming(true)}
                >
                    {confirming ? 'Get reward' : 'Continue'}
                </Button>
                {confirming && (
                    <CustomButton
                        className="bg-transparent text-btn mt-2 mx-auto"
                        onClick={() => {
                            setConfirming(false);
                        }}
                    >
                        Modify
                    </CustomButton>
                )}
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

            case LumMessages.MsgWithdrawDelegatorRewardUrl:
                return renderGetReward;

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
                dataBsBackdrop={'static'}
                bodyClassName="w-100"
            >
                {modal && (
                    <div className="d-flex flex-column align-items-center">
                        <h2 className="text-center">{modal.name}</h2>
                        {!txResult ? (
                            <>
                                {confirming && <h6 className="mt-3">Confirmation</h6>}
                                {renderModal()}
                            </>
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
                                <CustomButton className="mt-5" data-bs-target="modalSendTxs" data-bs-dismiss="modal">
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

export default Send;
