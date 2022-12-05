import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { FormikContextType } from 'formik';
import { Button } from 'frontend-elements';

import { Input, Button as CustomButton } from 'components';
import { trunc, getUserValidators } from 'utils';
import { RootState } from 'redux/store';
import { UserValidator } from 'models';
import numeral from 'numeral';
import CustomSelect from '../CustomSelect/CustomSelect';

interface Props {
    isLoading: boolean;
    form: FormikContextType<{
        amount: string;
        memo: string;
        address: string;
    }>;
}

const Undelegate = ({ form, isLoading }: Props): JSX.Element => {
    const { bondedValidators, unbondedValidators, unbondingValidators, delegations, rewards } = useSelector(
        (state: RootState) => ({
            bondedValidators: state.staking.validators.bonded,
            unbondedValidators: state.staking.validators.unbonded,
            unbondingValidators: state.staking.validators.unbonding,
            delegations: state.staking.delegations,
            rewards: state.wallet.rewards,
        }),
    );

    const { t } = useTranslation();

    const [confirming, setConfirming] = useState(false);
    const [max, setMax] = useState(0);

    const [userValidators, setUserValidators] = useState<UserValidator[]>(
        getUserValidators([...bondedValidators, ...unbondedValidators, ...unbondingValidators], delegations, rewards),
    );

    useEffect(() => {
        setUserValidators(
            getUserValidators(
                [...bondedValidators, ...unbondedValidators, ...unbondingValidators],
                delegations,
                rewards,
            ),
        );
    }, [bondedValidators, unbondedValidators, delegations, rewards]);

    useEffect(() => {
        if (form.values.address) {
            const max = userValidators.find((val) => val.operatorAddress === form.values.address)?.stakedCoins;

            setMax(max ? numeral(max).value() || 0 : 0);
        }
    }, [form.values.address]);

    return (
        <>
            {confirming && <h6 className="mt-3">{t('operations.confirmation')}</h6>}
            <form className="row w-100 align-items-start text-start mt-3">
                <div className="col-12">
                    <Input
                        {...form.getFieldProps('amount')}
                        readOnly={confirming}
                        placeholder={t('operations.inputs.amount.label')}
                        label={t('operations.inputs.amount.label')}
                        max={max}
                        onMax={confirming || max === 0 ? undefined : () => form.setFieldValue('amount', max.toFixed(6))}
                    />
                    {form.errors.amount && <p className="ms-3 mt-2 color-error">{form.errors.amount}</p>}
                </div>
                <div className="col-12 mt-4">
                    <CustomSelect
                        options={userValidators.map((val) => ({
                            value: val.operatorAddress,
                            label: val.description?.moniker || val.description?.identity || trunc(val.operatorAddress),
                        }))}
                        onChange={(value) => form.setFieldValue('address', value)}
                        value={form.values.address}
                        label={t('operations.inputs.validator.label')}
                        readonly={confirming}
                    />
                    {form.errors.address && <p className="ms-3 mt-2 color-error">{form.errors.address}</p>}
                </div>
                <div className="col-12 mt-4">
                    {(!confirming || (confirming && form.values.memo)) && (
                        <Input
                            {...form.getFieldProps('memo')}
                            readOnly={confirming}
                            placeholder={t('operations.inputs.memo.placeholder')}
                            label={t('operations.inputs.memo.label')}
                        />
                    )}
                    {form.errors.memo && <p className="ms-3 mt-2 color-error">{form.errors.memo}</p>}
                </div>
                <div className="justify-content-center mt-4 col-10 offset-1 col-sm-6 offset-sm-3">
                    <Button
                        loading={isLoading}
                        onPress={
                            confirming
                                ? form.handleSubmit
                                : () => {
                                      form.validateForm().then((errors) => {
                                          if (!errors.address && !errors.amount && !errors.memo) {
                                              setConfirming(true);
                                          }
                                      });
                                  }
                        }
                    >
                        {confirming ? t('operations.types.undelegate.name') : t('common.continue')}
                    </Button>
                    {confirming && (
                        <CustomButton
                            className="bg-transparent text-btn mt-2 mx-auto"
                            onClick={() => {
                                setConfirming(false);
                            }}
                        >
                            {t('operations.modify')}
                        </CustomButton>
                    )}
                </div>
            </form>
        </>
    );
};

export default Undelegate;
