import { Proposal, VotesResult } from 'models';
import i18n from 'locales';
import { ProposalStatus, VoteOption } from '@lum-network/sdk-javascript/build/codec/cosmos/gov/v1beta1/gov';

export const sumOfVotes = (results: VotesResult | null): number => {
    if (!results) {
        return 0;
    }

    return results.abstain + results.no + results.yes + results.noWithVeto;
};

export const isNoVoteYet = (results: VotesResult): boolean => {
    return !Math.max(results.yes, results.no, results.noWithVeto, results.abstain);
};

export const maxVote = (resultsPercent: VotesResult): [string, number, string] => {
    let max = 0;
    let name: 'yes' | 'no' | 'noWithVeto' | 'abstain' = 'yes';
    let dotClass: string;

    for (const [key, value] of Object.entries(resultsPercent)) {
        if (value > max) {
            max = value;
            name = key as keyof typeof resultsPercent;
        }
    }

    switch (name) {
        case 'yes':
            dotClass = 'vote-option-green';
            break;
        case 'no':
            dotClass = 'vote-option-red';
            break;
        case 'noWithVeto':
            dotClass = 'vote-option-yellow';
            break;
        default:
            dotClass = 'vote-option-grey';
    }

    return [i18n.t(`governance.votes.${name}` as const) as string, max, dotClass];
};

export const getVoteName = (vote: VoteOption): string => {
    switch (vote) {
        case VoteOption.VOTE_OPTION_YES:
            return i18n.t('governance.votes.yes');
        case VoteOption.VOTE_OPTION_NO:
            return i18n.t('governance.votes.no');
        case VoteOption.VOTE_OPTION_NO_WITH_VETO:
            return i18n.t('governance.votes.noWithVeto');
        case VoteOption.VOTE_OPTION_ABSTAIN:
            return i18n.t('governance.votes.abstain');
        default:
            return '';
    }
};

export const sortByDate = (proposals: Proposal[]): Proposal[] =>
    proposals.sort((propA, propB) => {
        if (propA.votingEndTime && propB.votingEndTime) {
            return propB.votingEndTime.getTime() - propA.votingEndTime.getTime();
        }
        return 0;
    });

export const proposalInVotingPeriod = (proposals: Proposal[]): boolean =>
    proposals.filter((proposal) => proposal.status === ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD).length > 0;
