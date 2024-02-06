import React from 'react';
import { ProposalStatus } from '@lum-network/sdk-javascript/build/codegen/cosmos/gov/v1beta1/gov';
import { Button } from 'components';
import { Button as FEButton } from 'frontend-elements';
import { Proposal } from 'models';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/store';

interface Props {
    proposal: Proposal;
    onVote: (proposal: Proposal) => void;
    className?: string;
    small?: boolean;
}

const VoteButton = ({ proposal, onVote, className, small }: Props): JSX.Element => {
    const { loadingVote } = useSelector((state: RootState) => ({
        loadingVote: state.loading.effects.wallet.vote.loading,
    }));

    const { t } = useTranslation();

    let buttonText;

    switch (proposal.status) {
        case ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD:
            buttonText = t('governance.proposalCard.voteButtonStates.active');
            break;
        case ProposalStatus.PROPOSAL_STATUS_FAILED:
        case ProposalStatus.PROPOSAL_STATUS_PASSED:
        case ProposalStatus.PROPOSAL_STATUS_REJECTED:
            buttonText = t('governance.proposalCard.voteButtonStates.ended');
            break;
        case ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD:
            buttonText = t('governance.proposalCard.voteButtonStates.notStarted');
            break;
        default:
            buttonText = t('governance.proposalCard.voteButtonStates.disabled');
            break;
    }

    const isDisabled = !!loadingVote || !(proposal.status === ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD);

    if (small) {
        return (
            <div
                className={className}
                role="button"
                {...(isDisabled
                    ? {}
                    : {
                          onClick: () => onVote(proposal),
                          'data-bs-target': '#voteModal',
                          'data-bs-toggle': 'modal',
                      })}
            >
                <FEButton
                    disabled={isDisabled}
                    loading={!!loadingVote}
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    onPress={() => {}}
                >
                    {t('governance.proposalCard.voteButtonStates.active')}
                </FEButton>
            </div>
        );
    }

    return (
        <Button
            className={className}
            data-bs-target="#voteModal"
            data-bs-toggle="modal"
            disabled={isDisabled}
            onClick={() => onVote(proposal)}
        >
            {buttonText}
        </Button>
    );
};

export default VoteButton;
