import React, { useEffect, useRef, useState } from 'react';

import { useSelector } from 'react-redux';
import { Redirect } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Validator } from '@lum-network/sdk-javascript/build/codec/cosmos/staking/v1beta1/staking';
import { LumConstants, LumMessages, LumUtils } from '@lum-network/sdk-javascript';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { Card } from 'frontend-elements';
import { RootDispatch, RootState } from 'redux/store';
import { useRematchDispatch } from 'redux/hooks';
import { AirdropCard, BalanceCard, Button, Input, Modal } from 'components';
import {
    calculateTotalVotingPower,
    getUserValidators,
    NumbersUtils,
    showErrorToast,
    unbondingsTimeRemaining,
} from 'utils';
import { Modal as BSModal } from 'bootstrap';

import StakedCoinsCard from './components/Cards/StakedCoinsCard';
import UnbondingTokensCard from './components/Cards/UnbondingTokensCard';
import RewardsCard from './components/Cards/RewardsCard';
import VestingTokensCard from './components/Cards/VestingTokensCard';

import MyValidators from './components/Lists/MyValidators';
import AvailableValidators from './components/Lists/AvailableValidators';

import Delegate from '../Operations/components/Forms/Delegate';
import Undelegate from '../Operations/components/Forms/Undelegate';
import GetReward from '../Operations/components/Forms/GetReward';
import GetAllRewards from '../Operations/components/Forms/GetAllRewards';
import Redelegate from 'screens/Operations/components/Forms/Redelegate';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const Staking = (): JSX.Element => {
    // State
    const [txResult, setTxResult] = useState<{ hash: string; error?: string | null } | null>(null);
    const [modalType, setModalType] = useState<{ id: string; name: string } | null>(null);
    const [confirming, setConfirming] = useState(false);
    const [operationModal, setOperationModal] = useState<BSModal | null>(null);
    const [topValidatorConfirmationModal, setTopValidatorConfirmationModal] = useState<BSModal | null>(null);
    const [onConfirmOperation, setOnConfirmOperation] = useState<() => void>(() => noop);
    const [totalVotingPower, setTotalVotingPower] = useState(0);

    // Dispatch methods
    const { getValidatorsInfos, delegate, redelegate, undelegate, getWalletInfos, getAllRewards, getReward } =
        useRematchDispatch((dispatch: RootDispatch) => ({
            getValidatorsInfos: dispatch.staking.getValidatorsInfosAsync,
            delegate: dispatch.wallet.delegate,
            redelegate: dispatch.wallet.redelegate,
            undelegate: dispatch.wallet.undelegate,
            getWalletInfos: dispatch.wallet.reloadWalletInfos,
            getReward: dispatch.wallet.getReward,
            getAllRewards: dispatch.wallet.getAllRewards,
        }));

    // Redux state values
    const {
        airdrop,
        bondedValidators,
        unbondedValidators,
        stakedCoins,
        unbondedTokens,
        wallet,
        vestings,
        rewards,
        balance,
        delegations,
        unbondings,
        loadingDelegate,
        loadingRedelegate,
        loadingUndelegate,
        loadingClaim,
        loadingClaimAll,
    } = useSelector((state: RootState) => ({
        wallet: state.wallet.currentWallet,
        airdrop: state.wallet.airdrop,
        vestings: state.wallet.vestings,
        balance: state.wallet.currentBalance,
        rewards: state.wallet.rewards,
        bondedValidators: state.staking.validators.bonded,
        unbondedValidators: state.staking.validators.unbonded,
        delegations: state.staking.delegations,
        unbondings: state.staking.unbondings,
        stakedCoins: state.staking.stakedCoins,
        unbondedTokens: state.staking.unbondedTokens,
        loadingDelegate: state.loading.effects.wallet.delegate.loading,
        loadingRedelegate: state.loading.effects.wallet.redelegate.loading,
        loadingUndelegate: state.loading.effects.wallet.undelegate.loading,
        loadingClaim: state.loading.effects.wallet.getReward.loading,
        loadingClaimAll: state.loading.effects.wallet.getAllRewards.loading,
    }));

    const loadingAll = loadingDelegate || loadingUndelegate;

    // Utils
    const modalRef = useRef<HTMLDivElement>(null);
    const topValidatorConfirmationModalRef = useRef<HTMLDivElement>(null);

    const { t } = useTranslation();

    const delegateForm = useFormik({
        initialValues: { address: '', amount: '', memo: '' },
        validationSchema: yup.object().shape({
            address: yup
                .string()
                .required(t('common.required'))
                .matches(new RegExp(`^${LumConstants.LumBech32PrefixValAddr}`), {
                    message: t('operations.errors.address'),
                }),
            amount: yup.string().required(t('common.required')),
            memo: yup.string(),
        }),
        onSubmit: (values) => onSubmitDelegate(values.address, values.amount, values.memo),
    });

    const redelegateForm = useFormik({
        initialValues: { fromAddress: '', toAddress: '', amount: '', memo: '' },
        validationSchema: yup.object().shape({
            fromAddress: yup
                .string()
                .required(t('common.required'))
                .matches(new RegExp(`^${LumConstants.LumBech32PrefixValAddr}`), {
                    message: t('operations.errors.address'),
                }),
            toAddress: yup
                .string()
                .required(t('common.required'))
                .matches(new RegExp(`^${LumConstants.LumBech32PrefixValAddr}`), {
                    message: t('operations.errors.address'),
                }),
            amount: yup.string().required(t('common.required')),
            memo: yup.string(),
        }),
        onSubmit: (values) => onSubmitRedelegate(values.fromAddress, values.toAddress, values.amount, values.memo),
    });

    const undelegateForm = useFormik({
        initialValues: { address: '', amount: '', memo: '' },
        validationSchema: yup.object().shape({
            address: yup
                .string()
                .required(t('common.required'))
                .matches(new RegExp(`^${LumConstants.LumBech32PrefixValAddr}`), {
                    message: t('operations.errors.address'),
                }),
            amount: yup.string().required(t('common.required')),
            memo: yup.string(),
        }),
        onSubmit: (values) => onSubmitUndelegate(values.address, values.amount, values.memo),
    });

    const claimForm = useFormik({
        initialValues: { amount: '', address: '', memo: '' },
        validationSchema: yup.object().shape({
            address: yup
                .string()
                .required(t('common.required'))
                .matches(new RegExp(`^${LumConstants.LumBech32PrefixValAddr}`)),
        }),
        onSubmit: (values) => onSubmitClaim(values.address, values.memo),
    });

    const getAllRewardsForm = useFormik({
        initialValues: { memo: '' },
        validationSchema: yup.object().shape({
            memo: yup.string(),
        }),
        onSubmit: (values) => onSubmitGetAllRewards(values.memo),
    });

    // Effects
    useEffect(() => {
        if (wallet) {
            getValidatorsInfos(wallet.getAddress());
        }
    }, [getValidatorsInfos, wallet]);

    useEffect(() => {
        setTotalVotingPower(
            NumbersUtils.convertUnitNumber(calculateTotalVotingPower([...bondedValidators, ...unbondedValidators])),
        );
    }, [bondedValidators, unbondedValidators]);

    useEffect(() => {
        if (modalRef && modalRef.current) {
            setOperationModal(BSModal.getOrCreateInstance(modalRef.current, { backdrop: 'static', keyboard: false }));
        }
        if (topValidatorConfirmationModalRef && topValidatorConfirmationModalRef.current) {
            setTopValidatorConfirmationModal(BSModal.getOrCreateInstance(topValidatorConfirmationModalRef.current));
        }
    }, []);

    useEffect(() => {
        const ref = modalRef.current;

        const handler = () => {
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
    }, [confirming, delegateForm, redelegateForm, txResult, undelegateForm]);

    if (!wallet) {
        return <Redirect to="/welcome" />;
    }

    // Submit methods
    const onSubmitDelegate = async (validatorAddress: string, amount: string, memo: string) => {
        try {
            const delegateResult = await delegate({ validatorAddress, amount, memo, from: wallet });

            if (delegateResult) {
                setTxResult({ hash: LumUtils.toHex(delegateResult.hash), error: delegateResult.error });
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
                setTxResult({ hash: LumUtils.toHex(redelegateResult.hash), error: redelegateResult.error });
            }
        } catch (e) {
            showErrorToast((e as Error).message);
        }
    };

    const onSubmitUndelegate = async (validatorAddress: string, amount: string, memo: string) => {
        try {
            const undelegateResult = await undelegate({ validatorAddress, amount, memo, from: wallet });

            if (undelegateResult) {
                setTxResult({ hash: LumUtils.toHex(undelegateResult.hash), error: undelegateResult.error });
            }
        } catch (e) {
            showErrorToast((e as Error).message);
        }
    };

    const onSubmitClaim = async (validatorAddress: string, memo: string) => {
        try {
            const claimResult = await getReward({
                from: wallet,
                memo,
                validatorAddress,
            });

            if (claimResult) {
                setTxResult({ hash: LumUtils.toHex(claimResult.hash), error: claimResult.error });
            }
        } catch (e) {
            showErrorToast((e as Error).message);
        }
    };

    const onSubmitGetAllRewards = async (memo: string) => {
        try {
            const validatorsAddresses = getUserValidators(bondedValidators, [], delegations, rewards)
                .sort((valA, valB) => {
                    if (valA.reward > valB.reward) {
                        return -1;
                    } else if (valA.reward < valB.reward) {
                        return 1;
                    }
                    return 0;
                })
                .map((val) => val.operatorAddress);

            const getAllRewardsResult = await getAllRewards({
                from: wallet,
                validatorsAddresses,
                memo,
            });

            if (getAllRewardsResult) {
                setTxResult({ hash: LumUtils.toHex(getAllRewardsResult.hash), error: getAllRewardsResult.error });
            }
        } catch (e) {
            showErrorToast((e as Error).message);
        }
    };

    // Click methods
    const onDelegate = (validator: Validator, totalVotingPower: number, force = false) => {
        if (!force && NumbersUtils.convertUnitNumber(validator.tokens || 0) / totalVotingPower > 0.08) {
            if (topValidatorConfirmationModal) {
                topValidatorConfirmationModal.show();
                setOnConfirmOperation(() => () => onDelegate(validator, totalVotingPower, true));
            }
        } else if (operationModal) {
            delegateForm.setFieldValue('address', validator.operatorAddress);
            setModalType({ id: LumMessages.MsgDelegateUrl, name: t('operations.types.delegate.name') });
            operationModal.show();
        }
    };

    const onUndelegate = (validator: Validator) => {
        if (operationModal) {
            undelegateForm.setFieldValue('address', validator.operatorAddress);
            setModalType({ id: LumMessages.MsgUndelegateUrl, name: t('operations.types.undelegate.name') });
            operationModal.show();
        }
    };

    const onRedelegate = (validator: Validator) => {
        if (operationModal) {
            redelegateForm.setFieldValue('fromAddress', validator.operatorAddress);
            setModalType({ id: LumMessages.MsgBeginRedelegateUrl, name: t('operations.types.redelegate.name') });
            operationModal.show();
        }
    };

    const onClaim = (validator: Validator) => {
        if (operationModal) {
            claimForm.setFieldValue('address', validator.operatorAddress);
            setModalType({
                id: LumMessages.MsgWithdrawDelegatorRewardUrl,
                name: t('operations.types.getRewards.name'),
            });
            operationModal.show();
        }
    };

    const onClaimAll = () => {
        if (operationModal) {
            setModalType({
                id: LumMessages.MsgWithdrawDelegatorRewardUrl + '/all',
                name: t('operations.types.getAllRewards.name'),
            });
            operationModal.show();
        }
    };

    // Rendering
    const renderModal = (): JSX.Element | null => {
        if (!modalType) {
            return null;
        }

        switch (modalType.id) {
            case LumMessages.MsgDelegateUrl:
                return <Delegate isLoading={!!loadingDelegate} form={delegateForm} />;

            case LumMessages.MsgBeginRedelegateUrl:
                return <Redelegate isLoading={!!loadingRedelegate} form={redelegateForm} />;

            case LumMessages.MsgUndelegateUrl:
                return <Undelegate isLoading={!!loadingUndelegate} form={undelegateForm} />;

            case LumMessages.MsgWithdrawDelegatorRewardUrl:
                return <GetReward isLoading={!!loadingClaim} form={claimForm} />;

            case LumMessages.MsgWithdrawDelegatorRewardUrl + '/all':
                return <GetAllRewards isLoading={!!loadingClaimAll} form={getAllRewardsForm} rewards={rewards} />;

            default:
                return <div>Soon</div>;
        }
    };

    return (
        <>
            <div className="mt-4">
                <div className="container">
                    <div className="row gy-4">
                        {airdrop && airdrop.amount > 0 ? (
                            <div className="col-12">
                                <AirdropCard airdrop={airdrop} />
                            </div>
                        ) : null}
                        {vestings ? (
                            <div className="col-12">
                                <RewardsCard rewards={rewards} onClaim={onClaimAll} isLoading={!!loadingClaimAll} />
                            </div>
                        ) : null}
                        <div className="col-lg-6">
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
                        <div className="col-lg-6">
                            <BalanceCard
                                balance={
                                    vestings
                                        ? balance.lum -
                                          Number(LumUtils.convertUnit(vestings.lockedBankCoins, LumConstants.LumDenom))
                                        : balance.lum
                                }
                                address={wallet.getAddress()}
                            />
                        </div>
                        <div className="col-lg-6">
                            <UnbondingTokensCard amount={unbondedTokens} endsAt={unbondingsTimeRemaining(unbondings)} />
                        </div>
                        <div className="col-lg-6">
                            {vestings ? (
                                <VestingTokensCard vestings={vestings} />
                            ) : (
                                <RewardsCard rewards={rewards} onClaim={onClaimAll} isLoading={!!loadingClaimAll} />
                            )}
                        </div>
                        <div className="col-12">
                            <Card withoutPadding className="pb-2">
                                <MyValidators
                                    onDelegate={onDelegate}
                                    onRedelegate={onRedelegate}
                                    onUndelegate={onUndelegate}
                                    onClaim={onClaim}
                                    totalVotingPower={totalVotingPower}
                                    delegations={delegations}
                                    unbondings={unbondings}
                                    rewards={rewards}
                                    validators={{ bonded: bondedValidators, unbonded: unbondedValidators }}
                                />
                            </Card>
                        </div>
                        <div className="col-12">
                            <Card withoutPadding className="pb-2">
                                <AvailableValidators
                                    onDelegate={onDelegate}
                                    validators={bondedValidators}
                                    totalVotingPower={totalVotingPower}
                                />
                            </Card>
                        </div>
                    </div>
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
                {modalType && (
                    <div className="d-flex flex-column align-items-center">
                        <h2 className="text-center">{modalType.name}</h2>
                        {!txResult ? (
                            renderModal()
                        ) : txResult.error !== null ? (
                            <>
                                <p className="color-error">{t('common.failure')}</p>
                                <p className="color-error my-5 text-start">
                                    {txResult.error || t('wallet.errors.generic')}
                                </p>
                                <Button className="mt-5" onClick={() => setTxResult(null)}>
                                    {t('common.retry')}
                                </Button>
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
                                <Button
                                    className="mt-5"
                                    data-bs-dismiss="modal"
                                    onClick={() => getWalletInfos(wallet.getAddress())}
                                >
                                    {t('common.close')}
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </Modal>
            <Modal
                id="topValidatorConfirmation"
                ref={topValidatorConfirmationModalRef}
                withCloseButton={false}
                contentClassName="p-3"
            >
                <h1 className="logout-modal-title">{t('staking.topValidatorModal.title')}</h1>
                <div className="d-flex flex-column flex-sm-row justify-content-center mt-5">
                    <Button
                        className="logout-modal-cancel-btn me-sm-4 mb-4 mb-sm-0"
                        data-bs-dismiss="modal"
                        onClick={() => {
                            setOnConfirmOperation(() => noop);
                        }}
                    >
                        <div className="px-sm-2">{t('common.cancel')}</div>
                    </Button>
                    <Button
                        className="logout-modal-logout-btn text-white"
                        data-bs-dismiss="modal"
                        onClick={() => {
                            onConfirmOperation();
                        }}
                    >
                        <div className="px-sm-2">{t('staking.topValidatorModal.go')}</div>
                    </Button>
                </div>
            </Modal>
        </>
    );
};

export default Staking;
