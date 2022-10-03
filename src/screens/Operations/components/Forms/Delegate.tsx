import { LumUtils, LumConstants } from '@lum-network/sdk-javascript';
import { Input, Button as CustomButton } from 'components';
import { FormikContextType } from 'formik';
import { Button } from 'frontend-elements';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/store';

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

    const balance = useSelector((state: RootState) => state.wallet.currentBalance);
    const vestings = useSelector((state: RootState) => state.wallet.vestings);

    const onMax = () => {
        let max = vestings
            ? balance.lum - Number(LumUtils.convertUnit(vestings.lockedBankCoins, LumConstants.LumDenom))
            : balance.lum;

        // Max balance minus avg fees
        max -= 0.0025;

        form.setFieldValue('amount', max.toFixed(6));
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
                    {form.touched.amount && form.errors.amount && (
                        <p className="ms-2 color-error">{form.errors.amount}</p>
                    )}
                </div>
                <div className="col-12 mt-4">
                    <Input
                        {...form.getFieldProps('address')}
                        readOnly={confirming}
                        placeholder={t('operations.inputs.validator.label')}
                        label={t('operations.inputs.validator.label')}
                    />
                    {form.touched.address && form.errors.address && (
                        <p className="ms-2 color-error">{form.errors.address}</p>
                    )}
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
                    {form.touched.memo && form.errors.memo && <p className="ms-2 color-error">{form.errors.memo}</p>}
                </div>
                <div className="justify-content-center mt-4 col-10 offset-1 col-sm-6 offset-sm-3">
                    <Button loading={isLoading} onPress={confirming ? form.handleSubmit : () => setConfirming(true)}>
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
