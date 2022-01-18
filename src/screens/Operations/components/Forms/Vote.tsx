import { VoteOption } from '@lum-network/sdk-javascript/build/codec/cosmos/gov/v1beta1/gov';
import { Input, Button as CustomButton, Select } from 'components';
import { FormikContextType } from 'formik';
import { Button } from 'frontend-elements';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
    isLoading: boolean;
    form: FormikContextType<{
        proposalId: string;
        vote: number;
    }>;
}

const Vote = ({ form, isLoading }: Props): JSX.Element => {
    const [confirming, setConfirming] = useState(false);

    const { t } = useTranslation();

    return (
        <>
            {confirming && <h6 className="mt-3">{t('operations.confirmation')}</h6>}
            <form className="row w-100 align-items-start text-start mt-3">
                <div className="col-12">
                    <Input
                        {...form.getFieldProps('proposalId')}
                        readOnly={confirming}
                        autoComplete="off"
                        placeholder={t('operations.inputs.proposalId.label')}
                        label={t('operations.inputs.proposalId.label')}
                    />
                    {form.touched.proposalId && form.errors.proposalId && (
                        <p className="ms-2 color-error">{form.errors.proposalId}</p>
                    )}
                </div>
                <div className="col-12 mt-4 d-flex flex-column">
                    <Select
                        {...form.getFieldProps('vote')}
                        readOnly={confirming}
                        options={[
                            {
                                name: t('operations.inputs.vote.values.placeholder'),
                                value: VoteOption.VOTE_OPTION_UNSPECIFIED,
                            },
                            {
                                name: t('operations.inputs.vote.values.yes'),
                                value: VoteOption.VOTE_OPTION_YES,
                            },
                            { name: t('operations.inputs.vote.values.abstain'), value: VoteOption.VOTE_OPTION_ABSTAIN },
                            {
                                name: t('operations.inputs.vote.values.no'),
                                value: VoteOption.VOTE_OPTION_NO,
                            },
                            {
                                name: t('operations.inputs.vote.values.noWithVeto'),
                                value: VoteOption.VOTE_OPTION_NO_WITH_VETO,
                            },
                        ]}
                        label={t('operations.inputs.vote.label')}
                    />
                </div>
                <div className="justify-content-center mt-4 col-10 offset-1 col-sm-6 offset-sm-3">
                    <Button loading={isLoading} onPress={confirming ? form.handleSubmit : () => setConfirming(true)}>
                        {confirming ? t('operations.types.vote.name') : t('common.continue')}
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

export default Vote;
