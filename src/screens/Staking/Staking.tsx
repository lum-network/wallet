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
import { BalanceCard, Button, Input, Modal } from 'components';
import { UserValidator } from 'models';
import { CLIENT_PRECISION } from 'constant';
import { NumbersUtils, showErrorToast, unbondingsTimeRemaining } from 'utils';
import { Modal as BSModal } from 'bootstrap';

import StakedCoinsCard from './components/Cards/StakedCoinsCard';
import UnbondedTokensCard from './components/Cards/UnbondedTokensCard';
import RewardsCard from './components/Cards/RewardsCard';
import VestedTokensCard from './components/Cards/VestedTokensCard';

import MyValidators from './components/Lists/MyValidators';
import AvailableValidators from './components/Lists/AvailableValidators';

import Delegate from '../Operations/components/Forms/Delegate';
import Undelegate from '../Operations/components/Forms/Undelegate';

const Staking = (): JSX.Element => {
    // State
    const [userValidators, setUserValidators] = useState<UserValidator[]>([]);
    const [txResult, setTxResult] = useState<{ hash: string; error?: string | null } | null>(null);
    const [modalType, setModalType] = useState<{ id: string; name: string } | null>(null);
    const [confirming, setConfirming] = useState(false);
    const [operationModal, setOperationModal] = useState<BSModal | null>(null);

    // Dispatch methods
    const { getValidatorsInfos, delegate, undelegate, getWalletInfos } = useRematchDispatch(
        (dispatch: RootDispatch) => ({
            getValidatorsInfos: dispatch.staking.getValidatorsInfosAsync,
            delegate: dispatch.wallet.delegate,
            undelegate: dispatch.wallet.undelegate,
            getWalletInfos: dispatch.wallet.reloadWalletInfos,
        }),
    );

    // Redux state values
    const {
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
        loadingUndelegate,
    } = useSelector((state: RootState) => ({
        wallet: state.wallet.currentWallet,
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
        loadingUndelegate: state.loading.effects.wallet.undelegate.loading,
    }));

    const loadingAll = loadingDelegate || loadingUndelegate;

    // Utils
    const modalRef = useRef<HTMLDivElement>(null);

    const { t } = useTranslation();

    const delegateForm = useFormik({
        initialValues: { address: '', amount: '', memo: t('operations.defaultMemo.delegate') },
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

    const undelegateForm = useFormik({
        initialValues: { address: '', amount: '', memo: t('operations.defaultMemo.undelegate') },
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

    // Effects
    useEffect(() => {
        if (wallet) {
            getValidatorsInfos(wallet.getAddress());
        }
    }, [getValidatorsInfos, wallet]);

    useEffect(() => {
        const validators: UserValidator[] = [];

        for (const delegation of delegations) {
            for (const reward of rewards.rewards) {
                if (delegation.delegation && reward.validatorAddress === delegation.delegation.validatorAddress) {
                    const validator = bondedValidators.find(
                        (bondedVal) =>
                            delegation.delegation &&
                            bondedVal.operatorAddress === delegation.delegation.validatorAddress,
                    );

                    if (validator) {
                        validators.push({
                            ...validator,
                            reward:
                                parseFloat(reward.reward.length > 0 ? reward.reward[0].amount : '0') / CLIENT_PRECISION,
                            stakedCoins: NumbersUtils.formatTo6digit(
                                NumbersUtils.convertUnitNumber(delegation.delegation.shares || 0) / CLIENT_PRECISION,
                            ),
                        });
                    }
                }
            }
        }
        setUserValidators(validators);
    }, [delegations, unbondings, bondedValidators, unbondedValidators, rewards]);

    useEffect(() => {
        if (modalRef && modalRef.current) {
            setOperationModal(new BSModal(modalRef.current, { backdrop: 'static', keyboard: false }));
        }
    }, []);

    useEffect(() => {
        const ref = modalRef.current;

        const handler = () => {
            if (delegateForm.touched.address || delegateForm.touched.amount || delegateForm.touched.memo) {
                delegateForm.resetForm();
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
    }, [confirming, delegateForm, txResult, undelegateForm]);

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

    // Click methods
    const onDelegate = (validator: Validator) => {
        if (operationModal) {
            delegateForm.initialValues.address = validator.operatorAddress;
            setModalType({ id: LumMessages.MsgDelegateUrl, name: t('operations.types.delegate.name') });
            operationModal.show();
        }
    };

    const onUndelegate = (validator: Validator) => {
        if (operationModal) {
            undelegateForm.initialValues.address = validator.operatorAddress;
            setModalType({ id: LumMessages.MsgUndelegateUrl, name: t('operations.types.undelegate.name') });
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

            case LumMessages.MsgUndelegateUrl:
                return <Undelegate isLoading={!!loadingUndelegate} form={undelegateForm} />;

            default:
                return <div>Soon</div>;
        }
    };

    return (
        <>
            <div className="mt-4">
                <div className="container">
                    <div className="row gy-4">
                        {vestings ? (
                            <div className="col-12">
                                <RewardsCard rewards={rewards} />
                            </div>
                        ) : null}
                        <div className="col-lg-6">
                            <StakedCoinsCard amount={stakedCoins} />
                        </div>
                        <div className="col-lg-6">
                            <BalanceCard
                                balance={
                                    vestings
                                        ? balance -
                                          Number(LumUtils.convertUnit(vestings.lockedBankCoins, LumConstants.LumDenom))
                                        : balance
                                }
                                address={wallet.getAddress()}
                            />
                        </div>
                        <div className="col-lg-6">
                            <UnbondedTokensCard amount={unbondedTokens} endsAt={unbondingsTimeRemaining(unbondings)} />
                        </div>
                        <div className="col-lg-6">
                            {vestings ? <VestedTokensCard vestings={vestings} /> : <RewardsCard rewards={rewards} />}
                        </div>
                        <div className="col-12">
                            <Card withoutPadding className="pb-2">
                                <MyValidators
                                    onDelegate={onDelegate}
                                    onUndelegate={onUndelegate}
                                    validators={userValidators}
                                />
                            </Card>
                        </div>
                        <div className="col-12">
                            <Card withoutPadding className="pb-2">
                                <AvailableValidators onDelegate={onDelegate} validators={bondedValidators} />
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
        </>
    );
};

export default Staking;
