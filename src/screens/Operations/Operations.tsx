import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { LUM_DENOM, LumBech32Prefixes, convertUnit, cosmos } from '@lum-network/sdk-javascript';
import { VoteOption } from '@lum-network/sdk-javascript/build/codegen/cosmos/gov/v1/gov';

import assets from 'assets';
import { AddressCard, AvailableCard, Input, Modal, Button as CustomButton, AirdropCard } from 'components';
import { RootDispatch, RootState } from 'redux/store';
import { useRematchDispatch } from 'redux/hooks';
import { showErrorToast } from 'utils';

import MessageButton from './components/MessageButton/MessageButton';
import Delegate from './components/Forms/Delegate';
import Send from './components/Forms/Send';
import Undelegate from './components/Forms/Undelegate';
import GetRewards from './components/Forms/GetReward';
import Redelegate from './components/Forms/Redelegate';
import Vote from './components/Forms/Vote';
import SetWithdrawAddress from './components/Forms/SetWithdrawAddress';

import './Operations.scss';

const { MsgUndelegate, MsgBeginRedelegate, MsgDelegate } = cosmos.staking.v1beta1;

const { MsgVote } = cosmos.gov.v1;

const { MsgWithdrawDelegatorReward, MsgSetWithdrawAddress } = cosmos.distribution.v1beta1;

const { MsgSend } = cosmos.bank.v1beta1;

type MsgType = { name: string; icon: string; iconClassName?: string; id: string; description: string };

const Operations = (): JSX.Element => {
    const { wallet, balance, vestings, airdrop, proposals } = useSelector((state: RootState) => ({
        wallet: state.wallet.currentWallet,
        balance: state.wallet.currentBalance,
        vestings: state.wallet.vestings,
        airdrop: state.wallet.airdrop,
        proposals: state.governance.proposals,
    }));

    // Rematch effects
    const { sendTx, undelegate, delegate, redelegate, getReward, vote, setWithdrawAddress, getWalletInfos } =
        useRematchDispatch((dispatch: RootDispatch) => ({
            sendTx: dispatch.wallet.sendTx,
            delegate: dispatch.wallet.delegate,
            getReward: dispatch.wallet.getReward,
            undelegate: dispatch.wallet.undelegate,
            redelegate: dispatch.wallet.redelegate,
            vote: dispatch.wallet.vote,
            setWithdrawAddress: dispatch.wallet.setWithdrawAddress,
            getWalletInfos: dispatch.wallet.reloadWalletInfos,
        }));

    // Loaders
    const loadingSend = useSelector((state: RootState) => state.loading.effects.wallet.sendTx);
    const loadingDelegate = useSelector((state: RootState) => state.loading.effects.wallet.delegate);
    const loadingUndelegate = useSelector((state: RootState) => state.loading.effects.wallet.undelegate);
    const loadingRedelegate = useSelector((state: RootState) => state.loading.effects.wallet.redelegate);
    const loadingGetReward = useSelector((state: RootState) => state.loading.effects.wallet.getReward);
    const loadingVote = useSelector((state: RootState) => state.loading.effects.wallet.vote);
    const loadingSetWithdrawAddress = useSelector(
        (state: RootState) => state.loading.effects.wallet.setWithdrawAddress,
    );

    const loadingAll =
        loadingSend.loading || loadingDelegate.loading || loadingUndelegate.loading || loadingGetReward.loading;

    const { t } = useTranslation();
    const modalRef = useRef<React.ElementRef<typeof Modal>>(null);

    const [modal, setModal] = useState<MsgType | null>(null);
    const [txResult, setTxResult] = useState<{ hash: string; error?: string | null } | null>(null);
    const [confirming, setConfirming] = useState(false);

    const buttons: MsgType[] = [
        {
            id: MsgSend.typeUrl,
            name: t('operations.types.send.name'),
            icon: assets.images.messageTypes.send,
            iconClassName: 'send-icon',
            description: t('operations.types.send.description'),
        },
        {
            id: MsgDelegate.typeUrl,
            name: t('operations.types.delegate.name'),
            icon: assets.images.messageTypes.delegate,
            description: t('operations.types.delegate.description'),
        },
        {
            id: MsgUndelegate.typeUrl,
            name: t('operations.types.undelegate.name'),
            icon: assets.images.messageTypes.undelegate,
            description: t('operations.types.undelegate.description'),
        },
        {
            id: MsgBeginRedelegate.typeUrl,
            name: t('operations.types.redelegate.name'),
            icon: assets.images.messageTypes.redelegate,
            description: t('operations.types.redelegate.description'),
        },
        {
            id: MsgWithdrawDelegatorReward.typeUrl,
            name: t('operations.types.getRewards.name'),
            icon: assets.images.messageTypes.getReward,
            description: t('operations.types.getRewards.description'),
        },
        {
            id: MsgVote.typeUrl,
            name: t('operations.types.vote.name'),
            description: t('operations.types.vote.description'),
            icon: assets.images.messageTypes.vote,
        },
        {
            id: MsgSetWithdrawAddress.typeUrl,
            name: t('operations.types.setWithdrawAddress.name'),
            description: t('operations.types.setWithdrawAddress.description'),
            icon: assets.images.messageTypes.setWithdrawAddress,
        },
    ];

    const sendForm = useFormik({
        initialValues: { address: '', amount: '', memo: '' },
        validationSchema: yup.object().shape({
            address: yup
                .string()
                .required(t('common.required'))
                .matches(new RegExp(`^${LumBech32Prefixes.ACC_ADDR}`), {
                    message: t('operations.errors.address'),
                }),
            amount: yup.string().required(t('common.required')),
            memo: yup.string(),
        }),
        onSubmit: async (values) => await onSubmitSend(values.address, values.amount, values.memo),
    });

    const delegateForm = useFormik({
        initialValues: { address: '', amount: '', memo: '' },
        validationSchema: yup.object().shape({
            address: yup
                .string()
                .required(t('common.required'))
                .matches(new RegExp(`^${LumBech32Prefixes.VAL_ADDR}`), {
                    message: t('operations.errors.address'),
                }),
            amount: yup.string().required(t('common.required')),
            memo: yup.string(),
        }),
        onSubmit: (values) => onSubmitDelegate(values.address, values.amount, values.memo),
    });

    const undelegateForm = useFormik({
        initialValues: { address: '', amount: '', memo: '' },
        validationSchema: yup.object().shape({
            address: yup
                .string()
                .required(t('common.required'))
                .matches(new RegExp(`^${LumBech32Prefixes.VAL_ADDR}`), {
                    message: t('operations.errors.address'),
                }),
            amount: yup.string().required(t('common.required')),
            memo: yup.string(),
        }),
        onSubmit: (values) => onSubmitUndelegate(values.address, values.amount, values.memo),
    });

    const redelegateForm = useFormik({
        initialValues: { fromAddress: '', toAddress: '', amount: '', memo: '' },
        validationSchema: yup.object().shape({
            fromAddress: yup
                .string()
                .required(t('common.required'))
                .matches(new RegExp(`^${LumBech32Prefixes.VAL_ADDR}`), {
                    message: t('operations.errors.address'),
                }),
            toAddress: yup
                .string()
                .required(t('common.required'))
                .matches(new RegExp(`^${LumBech32Prefixes.VAL_ADDR}`), {
                    message: t('operations.errors.address'),
                }),
            amount: yup.string().required(t('common.required')),
            memo: yup.string(),
        }),
        onSubmit: (values) => onSubmitRedelegate(values.fromAddress, values.toAddress, values.amount, values.memo),
    });

    const getRewardForm = useFormik({
        initialValues: { address: '', amount: '', memo: '' },
        validationSchema: yup.object().shape({
            address: yup
                .string()
                .required(t('common.required'))
                .matches(new RegExp(`^${LumBech32Prefixes.VAL_ADDR}`), {
                    message: t('operations.errors.address'),
                }),
            memo: yup.string(),
        }),
        onSubmit: (values) => onSubmitGetReward(values.address, values.memo),
    });

    const voteForm = useFormik({
        initialValues: { proposalId: '', vote: VoteOption.UNRECOGNIZED },
        validationSchema: yup.object().shape({
            proposalId: yup.string().required(t('common.required')),
            vote: yup
                .number()
                .required(t('common.required'))
                .min(1, t('operations.errors.vote'))
                .max(4, t('operations.errors.vote')),
        }),
        onSubmit: (values) => onSubmitVote(values.proposalId, values.vote),
    });

    const setWithdrawAddressForm = useFormik({
        initialValues: { withdrawAddress: '', memo: '' },
        validationSchema: yup.object().shape({
            withdrawAddress: yup.string().required(t('common.required')),
            memo: yup.string(),
        }),
        onSubmit: (values) => onSubmitSetWithdrawAddress(values.withdrawAddress, values.memo),
    });

    useEffect(() => {
        const ref = modalRef.current;

        const handler = () => {
            if (sendForm.touched.address || sendForm.touched.amount || sendForm.touched.memo) {
                sendForm.resetForm();
            }
            if (delegateForm.touched.address || delegateForm.touched.amount || delegateForm.touched.memo) {
                delegateForm.resetForm();
            }
            if (
                redelegateForm.touched.amount ||
                redelegateForm.touched.toAddress ||
                redelegateForm.touched.fromAddress ||
                redelegateForm.touched.memo
            ) {
                redelegateForm.resetForm();
            }
            if (undelegateForm.touched.address || undelegateForm.touched.amount || undelegateForm.touched.memo) {
                undelegateForm.resetForm();
            }
            if (getRewardForm.touched.address || getRewardForm.touched.memo) {
                getRewardForm.resetForm();
            }
            if (setWithdrawAddressForm.touched.withdrawAddress || setWithdrawAddressForm.touched.memo) {
                setWithdrawAddressForm.resetForm();
            }
            if (confirming) {
                setConfirming(false);
            }
            if (txResult) {
                setTxResult(null);
            }
        };

        if (ref) {
            ref.addEventListener('hidden.bs.modal', handler);
        }

        return () => {
            if (ref) {
                ref.removeEventListener('hidden.bs.modal', handler);
            }
        };
    }, [
        confirming,
        delegateForm,
        redelegateForm,
        getRewardForm,
        modalRef,
        sendForm,
        txResult,
        undelegateForm,
        setWithdrawAddressForm,
    ]);

    if (!wallet) {
        return <div />;
    }

    const onSubmitSend = async (toAddress: string, amount: string, memo: string) => {
        try {
            const sendResult = await sendTx({ from: wallet, to: toAddress, amount, memo });

            if (sendResult) {
                setConfirming(false);
                setTxResult({ hash: sendResult.hash, error: sendResult.error });
            }
        } catch (e) {
            showErrorToast((e as Error).message);
        }
    };

    const onSubmitDelegate = async (validatorAddress: string, amount: string, memo: string) => {
        try {
            const delegateResult = await delegate({ validatorAddress, amount, memo, from: wallet });

            if (delegateResult) {
                setTxResult({ hash: delegateResult.hash, error: delegateResult.error });
            }
        } catch (e) {
            showErrorToast((e as Error).message);
        }
    };

    const onSubmitUndelegate = async (validatorAddress: string, amount: string, memo: string) => {
        try {
            const undelegateResult = await undelegate({ validatorAddress, amount, memo, from: wallet });

            if (undelegateResult) {
                setTxResult({ hash: undelegateResult.hash, error: undelegateResult.error });
            }
        } catch (e) {
            showErrorToast((e as Error).message);
        }
    };

    const onSubmitSetWithdrawAddress = async (withdrawAddress: string, memo: string) => {
        try {
            const setWithdrawAddressResult = await setWithdrawAddress({ withdrawAddress, memo, from: wallet });

            if (setWithdrawAddressResult) {
                setTxResult({
                    hash: setWithdrawAddressResult.hash,
                    error: setWithdrawAddressResult.error,
                });
            }
        } catch (e) {
            showErrorToast((e as Error).message);
        }
    };

    const onSubmitRedelegate = async (
        validatorSrcAddress: string,
        validatorDestAddress: string,
        amount: string,
        memo: string,
    ) => {
        try {
            const redelegateResult = await redelegate({
                validatorSrcAddress,
                validatorDestAddress,
                amount,
                memo,
                from: wallet,
            });

            if (redelegateResult) {
                setTxResult({ hash: redelegateResult.hash, error: redelegateResult.error });
            }
        } catch (e) {
            showErrorToast((e as Error).message);
        }
    };

    const onSubmitGetReward = async (validatorAddress: string, memo: string) => {
        try {
            const getRewardResult = await getReward({ validatorAddress, memo, from: wallet });

            if (getRewardResult) {
                setTxResult({ hash: getRewardResult.hash, error: getRewardResult.error });
            }
        } catch (e) {
            showErrorToast((e as Error).message);
        }
    };

    const onSubmitVote = async (proposalId: string, voteOption: VoteOption) => {
        try {
            const proposal = proposals.find((p) => p.id === BigInt(proposalId));

            if (!proposal) {
                throw new Error(`Proposal #${proposalId} not found`);
            }

            const voteResult = await vote({ voter: wallet, proposal, vote: voteOption });

            if (voteResult) {
                setTxResult({ hash: voteResult.hash, error: voteResult.error });
            }
        } catch (e) {
            showErrorToast((e as Error).message);
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
            case MsgSend.typeUrl:
                return <Send isLoading={!!loadingSend.loading} form={sendForm} />;

            case MsgDelegate.typeUrl:
                return <Delegate isLoading={!!loadingDelegate.loading} form={delegateForm} />;

            case MsgUndelegate.typeUrl:
                return <Undelegate isLoading={!!loadingUndelegate.loading} form={undelegateForm} />;

            case MsgBeginRedelegate.typeUrl:
                return <Redelegate isLoading={!!loadingRedelegate.loading} form={redelegateForm} />;

            case MsgWithdrawDelegatorReward.typeUrl:
                return <GetRewards isLoading={!!loadingGetReward.loading} form={getRewardForm} />;

            case MsgVote.typeUrl:
                return <Vote isLoading={!!loadingVote.loading} form={voteForm} />;

            case MsgSetWithdrawAddress.typeUrl:
                return (
                    <SetWithdrawAddress isLoading={!!loadingSetWithdrawAddress.loading} form={setWithdrawAddressForm} />
                );

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
                <div className="container-xxl">
                    <div className="row gy-4">
                        {airdrop && airdrop.amount > 0 ? (
                            <div className="col-12">
                                <AirdropCard airdrop={airdrop} />
                            </div>
                        ) : null}
                        <div className="col-md-6">
                            <AddressCard address={wallet.address} />
                        </div>
                        <div className="col-md-6">
                            <AvailableCard
                                balance={
                                    vestings
                                        ? balance.lum - Number(convertUnit(vestings.lockedBankCoins, LUM_DENOM))
                                        : balance.lum
                                }
                                address={wallet.address}
                            />
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
                                <p className="color-error">{t('common.failure')}</p>
                                <p className="color-error my-5 text-start">
                                    {txResult.error || t('wallet.errors.generic')}
                                </p>
                                <CustomButton className="mt-5" onClick={() => setTxResult(null)}>
                                    {t('common.retry')}
                                </CustomButton>
                            </>
                        ) : (
                            <>
                                <p className="color-success">{t('common.success')}</p>
                                <Input
                                    readOnly
                                    value={txResult.hash}
                                    label="Hash"
                                    className="text-start align-self-stretch mb-5"
                                />
                                <CustomButton
                                    className="mt-5"
                                    data-bs-target="modalSendTxs"
                                    data-bs-dismiss="modal"
                                    onClick={() => getWalletInfos(wallet.address)}
                                >
                                    {t('common.close')}
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
