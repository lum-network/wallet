import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ProposalStatus, VoteOption } from '@lum-network/sdk-javascript/build/codegen/cosmos/gov/v1/gov';
import { FormikContextType } from 'formik';

import { Button as CustomButton, Select } from 'components';
import { Button } from 'frontend-elements';
import { RootState } from 'redux/store';

import CustomSelect from '../CustomSelect/CustomSelect';

interface Props {
    isLoading: boolean;
    form: FormikContextType<{
        proposalId: string;
        vote: number;
    }>;
}

const Vote = ({ form, isLoading }: Props): JSX.Element => {
    const [confirming, setConfirming] = useState(false);

    const activeProposals = useSelector((state: RootState) =>
        state.governance.proposals.filter(
            (proposal) => proposal.status === ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD,
        ),
    );

    const { t } = useTranslation();

    return (
        <>
            {confirming && <h6 className="mt-3">{t('operations.confirmation')}</h6>}
            <form className="row w-100 align-items-start text-start mt-3">
                <div className="col-12">
                    <CustomSelect
                        options={activeProposals.map((proposal) => ({
                            value: proposal.id.toString(),
                            label: proposal.content ? proposal.content.title : 'Proposal #' + proposal.id.toString(),
                        }))}
                        onChange={(value) => form.setFieldValue('proposalId', value)}
                        value={form.values.proposalId}
                        label={t('operations.inputs.proposalId.label')}
                        readonly={confirming}
                    />
                    {form.errors.proposalId && <p className="ms-3 mt-2 color-error">{form.errors.proposalId}</p>}
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
                    {form.errors.vote && <p className="ms-3 mt-2 color-error">{form.errors.vote}</p>}
                </div>
                <div className="justify-content-center mt-4 col-10 offset-1 col-sm-6 offset-sm-3">
                    <Button
                        loading={isLoading}
                        onPress={
                            confirming
                                ? form.handleSubmit
                                : () => {
                                      form.validateForm().then((errors) => {
                                          if (!errors.proposalId && !errors.vote) {
                                              setConfirming(true);
                                          }
                                      });
                                  }
                        }
                    >
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
