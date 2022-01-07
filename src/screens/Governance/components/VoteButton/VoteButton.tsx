import React from 'react';
import { ProposalStatus } from '@lum-network/sdk-javascript/build/codec/cosmos/gov/v1beta1/gov';
import { Button } from 'components';
import { Proposal } from 'models';
import { useTranslation } from 'react-i18next';

const VoteButton = ({
    proposal,
    onVote,
    className,
}: {
    proposal: Proposal;
    onVote: (proposal: Proposal) => void;
    className?: string;
}): JSX.Element => {
    let buttonText;

    const { t } = useTranslation();

    switch (proposal.status) {
        case ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD:
            buttonText = t('governance.voteButtonStates.active');
            break;
        case ProposalStatus.PROPOSAL_STATUS_FAILED:
        case ProposalStatus.PROPOSAL_STATUS_PASSED:
        case ProposalStatus.PROPOSAL_STATUS_REJECTED:
            buttonText = t('governance.voteButtonStates.ended');
            break;
        case ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD:
            buttonText = t('governance.voteButtonStates.notStarted');
            break;
        default:
            buttonText = t('governance.voteButtonStates.disabled');
            break;
    }

    return (
        <Button
            className={className}
            data-bs-target="#voteModal"
            data-bs-toggle="modal"
            disabled={!(proposal.status === ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD)}
            onClick={() => onVote(proposal)}
        >
            {buttonText}
        </Button>
    );
};

export default VoteButton;
