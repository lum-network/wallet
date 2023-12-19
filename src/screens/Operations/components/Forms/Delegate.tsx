import React, { useState } from 'react';
import { Input, Button as CustomButton } from 'components';
import { FormikContextType } from 'formik';
import { Button } from 'frontend-elements';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/store';
import { calculateTotalVotingPower, NumbersUtils, sortByVotingPower, trunc } from 'utils';
import CustomSelect from '../CustomSelect/CustomSelect';
import numeral from 'numeral';
import { LumConstants } from 'constant';

interface Props {
    isLoading: boolean;
    form: FormikContextType<{
        amount: string;
        memo: string;
        address: string;
    }>;
}

const Delegate = ({ form, isLoading }: Props): JSX.Element => {
    const [confirming, setConfirming] = useState(false);

    const { t } = useTranslation();

    const { balance, vestings, bondedValidators } = useSelector((state: RootState) => ({
        balance: state.wallet.currentBalance,
        vestings: state.wallet.vestings,
        bondedValidators: state.staking.validators.bonded,
    }));

    const onMax = () => {
        let max = vestings
            ? balance.lum - Number(NumbersUtils.convertUnit(vestings.lockedBankCoins, LumConstants.LumDenom))
            : balance.lum;

        // Max balance minus avg fees
        max -= 0.005;

        form.setFieldValue('amount', max > 0 ? max.toFixed(6) : 0);
    };

    return (
        <>
            {confirming ? (
                <h6 className="mt-3">{t('operations.confirmation')}</h6>
            ) : (
                <>
                    <h6 className="not-recommended mt-3 mb-1">{t('staking.warning.title')}</h6>
                    <p className="not-recommended">{t('staking.warning.description')}</p>
                </>
            )}
            <form className="row w-100 align-items-start text-start mt-3">
                <div className="col-12">
                    <Input
                        {...form.getFieldProps('amount')}
                        readOnly={confirming}
                        placeholder={t('operations.inputs.amount.label')}
                        label={t('operations.inputs.amount.label')}
                        onMax={confirming ? undefined : onMax}
                    />
                    {form.errors.amount && <p className="ms-3 mt-2 color-error">{form.errors.amount}</p>}
                </div>
                <div className="col-12 mt-4">
                    <CustomSelect
                        options={sortByVotingPower(
                            bondedValidators,
                            NumbersUtils.convertUnitNumber(calculateTotalVotingPower([...bondedValidators])),
                        ).map((val) => ({
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
                                              form.setFieldValue(
                                                  'amount',
                                                  numeral(form.values.amount).format('00.000000'),
                                              );
                                              setConfirming(true);
                                          }
                                      });
                                  }
                        }
                    >
                        {confirming ? t('operations.types.delegate.name') : t('common.continue')}
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

export default Delegate;
