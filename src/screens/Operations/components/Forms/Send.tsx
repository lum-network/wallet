import React, { useEffect, useState } from 'react';

import { FormikContextType } from 'formik';
import numeral from 'numeral';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { LUM_DENOM, convertUnit } from '@lum-network/sdk-javascript';

import { Input, Button as CustomButton } from 'components';
import { Button } from 'frontend-elements';
import { RootState } from 'redux/store';

interface Props {
    isLoading: boolean;
    form: FormikContextType<{
        amount: string;
        memo: string;
        address: string;
    }>;
}

const Send = ({ form, isLoading }: Props): JSX.Element => {
    const [confirming, setConfirming] = useState(false);
    const { t } = useTranslation();

    const balance = useSelector((state: RootState) => state.wallet.currentBalance);
    const vestings = useSelector((state: RootState) => state.wallet.vestings);

    const onMax = () => {
        let max = vestings ? balance.lum - Number(convertUnit(vestings.lockedBankCoins, LUM_DENOM)) : balance.lum;

        // Max balance minus avg fees
        max -= 0.005;

        form.setFieldValue('amount', max > 0 ? max.toFixed(6) : 0);
    };

    useEffect(() => {
        return () => {
            setConfirming(false);
        };
    }, []);

    return (
        <>
            {confirming && <h6 className="mt-3">{t('operations.confirmation')}</h6>}
            <form className="row w-100 align-items-start text-start mt-3">
                <div className="col-12">
                    <Input
                        {...form.getFieldProps('amount')}
                        value={form.values.amount}
                        readOnly={confirming}
                        autoComplete="off"
                        placeholder={t('operations.inputs.amount.label')}
                        label={t('operations.inputs.amount.label')}
                        onMax={confirming ? undefined : onMax}
                    />
                    {form.errors.amount && <p className="ms-3 mt-2 color-error">{form.errors.amount}</p>}
                </div>
                <div className="col-12 mt-4">
                    <Input
                        {...form.getFieldProps('address')}
                        readOnly={confirming}
                        placeholder={t('operations.inputs.recipient.label')}
                        label={t('operations.inputs.recipient.label')}
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
                        {confirming ? t('operations.types.send.name') : t('common.continue')}
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

export default Send;
