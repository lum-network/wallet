import React, { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { ProposalStatus } from '@lum-network/sdk-javascript/build/codec/cosmos/gov/v1beta1/gov';
import numeral from 'numeral';
import dayjs from 'dayjs';

import { Badge } from 'components';
import { Button, Card } from 'frontend-elements';
import { Proposal, VotesResult } from 'models';
import { dateFromNow, GovernanceUtils, NumbersUtils } from 'utils';
import { useRematchDispatch } from 'redux/hooks';
import { RootDispatch } from 'redux/store';

import VoteBar from '../VoteBar/VoteBar';

import './ProposalCard.scss';

interface Props {
    proposal: Proposal;
    onVote: (proposal: Proposal) => void;
    onDetails?: (proposal: Proposal) => void;
    full?: boolean;
}

const LargeProposalCard = ({
    proposal,
    results,
    onVote,
}: {
    proposal: Proposal;
    results: VotesResult;
    onVote: (proposal: Proposal) => void;
}) => (
    <Card className="w-100 mx-4">
        <div className="container">
            <div className="row gy-5">
                <div className="col-6">
                    <h6 className="mb-2">Title</h6>
                    <p>{proposal.content.title}</p>
                </div>
                <div className="col-6">
                    <h6 className="mb-2">ID</h6>
                    <p>{`#${proposal.proposalId.toString()}`}</p>
                </div>
                <div className="col-6">
                    <h6 className="mb-2">Status</h6>
                    <Badge proposalStatus={proposal.status} />
                </div>
                <div className="col-6">
                    <h6 className="mb-2">Proposer name</h6>
                    <p>Not available</p>
                </div>
                <div className="col-12">
                    <h6 className="mb-2">Details</h6>
                    <p>{proposal.content.description}</p>
                </div>
            </div>
        </div>
    </Card>
);

const ProposalCard = ({ proposal, full, onVote, onDetails }: Props): JSX.Element => {
    const [voteYes, setVoteYes] = useState(0);
    const [voteNo, setVoteNo] = useState(0);
    const [voteNoWithVeto, setVoteNoWithVeto] = useState(0);
    const [voteAbstain, setVoteAbstain] = useState(0);
    const [result, setResult] = useState<VotesResult | null>(null);

    const { t } = useTranslation();

    const { getTally } = useRematchDispatch((dispatch: RootDispatch) => ({
        getTally: dispatch.governance.getTally,
    }));

    useEffect(() => {
        if (!proposal) {
            return;
        }

        setResult(proposal.finalResult);

        if (proposal.status === ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD) {
            getTally(proposal.proposalId.toString()).then(setResult);
        }
    }, [proposal, getTally]);

    useEffect(() => {
        if (!result) {
            return;
        }

        const total = GovernanceUtils.sumOfVotes(result);

        setVoteYes(NumbersUtils.getPercentage(result.yes, total));
        setVoteNo(NumbersUtils.getPercentage(result.no, total));
        setVoteNoWithVeto(NumbersUtils.getPercentage(result.noWithVeto, total));
        setVoteAbstain(NumbersUtils.getPercentage(result.abstain, total));
    }, [result]);

    const renderDot = (dotClass: string) => {
        return <span className={`${dotClass} dot-size`}>⚫</span>;
    };

    const renderResult = () => {
        if (GovernanceUtils.isNoVoteYet(result || proposal.finalResult)) {
            return <p className="mb-1 mt-2">{t('governance.noVoteYet')}</p>;
        } else {
            const [name, percent, dotClass] = GovernanceUtils.maxVote({
                yes: voteYes,
                no: voteNo,
                noWithVeto: voteNoWithVeto,
                abstain: voteAbstain,
            });

            return (
                <div className="d-flex flex-column justify-content-between h-100">
                    <h6>{t('governance.mostVotedOn')}</h6>
                    <small className="text-muted">
                        {renderDot(dotClass)} <strong>{name}</strong> {numeral(percent).format('0.00')}%
                    </small>
                </div>
            );
        }
    };

    const renderDates = () => {
        let dateTitle: string;
        let date: string | undefined;

        switch (proposal.status) {
            case ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD:
                dateTitle = t('governance.depositEnd');
                date = proposal.depositEndTime?.toISOString() || '';
                break;

            case ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD:
                dateTitle = t('governance.votingEnd');
                date = proposal.votingEndTime?.toISOString() || '';
                break;

            default:
                dateTitle = t('governance.votingEnd');
                date = proposal.votingEndTime?.toISOString() || '';
        }

        return (
            <div className="h-100">
                <h6 className="mb-3">{dateTitle}</h6>
                {date ? (
                    <p>
                        {dayjs(date).utc().tz(dayjs.tz.guess()).format('ll')}{' '}
                        <span className="text-muted">({dateFromNow(date)})</span>
                    </p>
                ) : (
                    '-'
                )}
            </div>
        );
    };

    if (full) {
        return (
            <LargeProposalCard
                onVote={onVote}
                proposal={proposal}
                results={{
                    yes: voteYes,
                    no: voteNo,
                    noWithVeto: voteNoWithVeto,
                    abstain: voteAbstain,
                }}
            />
        );
    }

    return (
        <Card className="mb-4">
            <div className="d-flex flex-row align-items-center">
                <h3 className="me-4">{`#${proposal.proposalId}`}</h3>
                <Badge proposalStatus={proposal.status} />
            </div>
            <p className="proposal-title mb-4 mt-2">{proposal.content.title}</p>
            <VoteBar
                results={{
                    yes: voteYes,
                    no: voteNo,
                    noWithVeto: voteNoWithVeto,
                    abstain: voteAbstain,
                }}
            />
            <div className="container-fluid mt-4">
                <div className="row gy-3">
                    <div className="col-lg-3">
                        <h6>Turnout</h6>
                        <p>TODO</p>
                    </div>
                    <div className="col-lg-3">{renderResult()}</div>
                    <div className="col-lg-3">{renderDates()}</div>
                    <div className="col-lg-3">
                        <div className="d-flex flex-row justify-content-lg-end align-items-center h-100">
                            <Button
                                outline
                                onPress={() => {
                                    if (onDetails) onDetails(proposal);
                                }}
                                className="me-3"
                            >
                                Details
                            </Button>
                            <Button
                                onPress={() => {
                                    if (onVote) onVote(proposal);
                                }}
                            >
                                Vote
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ProposalCard;
