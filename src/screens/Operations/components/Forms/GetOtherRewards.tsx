import React, { useState } from 'react';
import { Input, Button as CustomButton } from 'components';
import { FormikContextType } from 'formik';
import { Button } from 'frontend-elements';
import { Rewards } from 'models';
import { useTranslation } from 'react-i18next';
import { NumbersUtils } from 'utils';

interface Props {
    rewards: Rewards;
    isLoading: boolean;
    form: FormikContextType<{
        addresses: string;
        memo: string;
    }>;
}

const GetOtherRewards = ({ form, isLoading, rewards }: Props): JSX.Element => {
    const [confirming, setConfirming] = useState(false);

    const { t } = useTranslation();

    return (
        <>
            {confirming && <h6 className="mt-3">{t('operations.confirmation')}</h6>}
            <form className="row w-100 align-items-start text-start mt-3">
                <div className="col-12 mt-4">
                    <Input
                        value={
                            NumbersUtils.formatTo6digit(
                                rewards.total && rewards.total.length > 0
                                    ? NumbersUtils.convertUnitNumber(rewards.total[0].amount)
                                    : 0,
                            ) +
                            ' ' +
                            rewards.total[0].denom.toUpperCase()
                        }
                        readOnly
                        label={t('operations.inputs.rewards.label')}
                    />
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
                                          if (!errors.memo) {
                                              setConfirming(true);
                                          }
                                      });
                                  }
                        }
                    >
                        {confirming ? t('operations.types.getAllRewards.name') : t('common.continue')}
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

export default GetOtherRewards;
