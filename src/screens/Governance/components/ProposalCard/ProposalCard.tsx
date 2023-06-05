import React, { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Namespace, TFunction } from 'i18next';
import { LumConstants } from '@lum-network/sdk-javascript';
import { ProposalStatus } from '@lum-network/sdk-javascript/build/codec/cosmos/gov/v1beta1/gov';
import numeral from 'numeral';
import dayjs from 'dayjs';

import { Badge, SmallerDecimal } from 'components';
import { Button, Card } from 'frontend-elements';
import { Proposal, VotesResult } from 'models';
import { calculateTotalVotingPower, dateFromNow, GovernanceUtils, NumbersUtils } from 'utils';
import { useRematchDispatch } from 'redux/hooks';
import { RootDispatch, RootState } from 'redux/store';

import VoteBar from '../VoteBar/VoteBar';

import './ProposalCard.scss';
import VoteButton from '../VoteButton/VoteButton';
import { useSelector } from 'react-redux';
import { Validator } from '@lum-network/sdk-javascript/build/codec/cosmos/staking/v1beta1/staking';

interface Props {
    proposal: Proposal;
    onVote: (proposal: Proposal) => void;
    onDetails?: (proposal: Proposal) => void;
    full?: boolean;
}

const LargeProposalCard = ({
    proposal,
    results,
    validators,
    onVote,
    t,
}: {
    proposal: Proposal;
    results: VotesResult;
    validators: Validator[];
    onVote: (proposal: Proposal) => void;
    t: TFunction<Namespace<'en'>>;
}) => {
    const renderResult = (): JSX.Element | null => {
        if (!proposal || proposal.status === ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD) {
            return null;
        }

        const total = GovernanceUtils.sumOfVotes(results);
        const yesPercentage = NumbersUtils.getPercentage(results.yes, total);
        const noPercentage = NumbersUtils.getPercentage(results.no, total);
        const noWithVetoPercentage = NumbersUtils.getPercentage(results.noWithVeto, total);
        const abstainPercentage = NumbersUtils.getPercentage(results.abstain, total);

        return (
            <Card className="mt-5" flat>
                <div className="mb-4 d-flex justify-content-between">
                    <div className="d-flex flex-row">
                        <h4 className="me-2">{t('common.total')}:</h4>
                        <SmallerDecimal nb={numeral(NumbersUtils.convertUnitNumber(total)).format('0,0.000000')} />
                        <span className="ms-2 color-type">{LumConstants.LumDenom}</span>
                    </div>
                    <div className="d-flex flex-row">
                        <h4 className="me-2">{t('governance.proposalCard.turnout')}:</h4>
                        <p>
                            {NumbersUtils.getPercentage(
                                GovernanceUtils.sumOfVotes(results),
                                calculateTotalVotingPower(validators),
                            ).toFixed(2)}
                            %
                        </p>
                    </div>
                </div>
                <VoteBar
                    results={{
                        yes: yesPercentage,
                        no: noPercentage,
                        noWithVeto: noWithVetoPercentage,
                        abstain: abstainPercentage,
                    }}
                />
                <div className="row mt-4 gy-2 ms-1">
                    <div className="col-12 col-md-6 col-xl-3 border-vote-green">
                        <h4>{t('governance.votes.yes')}</h4>
                        <small>{numeral(yesPercentage).format('0.00')}%</small>
                        <br />
                        <SmallerDecimal
                            nb={numeral(NumbersUtils.convertUnitNumber(results.yes)).format('0,0.000000')}
                        />
                        <span className="ms-2 color-type">{LumConstants.LumDenom}</span>
                    </div>
                    <div className="col-12 col-md-6 col-xl-3 border-vote-red">
                        <h4>{t('governance.votes.no')}</h4>
                        <small>{numeral(noPercentage).format('0.00')}%</small>
                        <br />
                        <SmallerDecimal nb={numeral(NumbersUtils.convertUnitNumber(results.no)).format('0,0.000000')} />
                        <span className="ms-2 color-type">{LumConstants.LumDenom}</span>
                    </div>
                    <div className="col-12 col-md-6 col-xl-3 border-vote-yellow">
                        <h4>{t('governance.votes.noWithVeto')}</h4>
                        <small>{numeral(noWithVetoPercentage).format('0.00')}%</small>
                        <br />
                        <SmallerDecimal
                            nb={numeral(NumbersUtils.convertUnitNumber(results.noWithVeto)).format('0,0.000000')}
                        />
                        <span className="ms-2 color-type">{LumConstants.LumDenom}</span>
                    </div>
                    <div className="col-12 col-md-6 col-xl-3 border-vote-grey">
                        <h4>{t('governance.votes.abstain')}</h4>
                        <small>{numeral(abstainPercentage).format('0.00')}%</small>
                        <br />
                        <SmallerDecimal
                            nb={numeral(NumbersUtils.convertUnitNumber(results.abstain)).format('0,0.000000')}
                        />
                        <span className="ms-2 color-type">{LumConstants.LumDenom}</span>
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <Card className="proposal-card w-100 mx-4">
            <div className="container">
                <div className="row gy-4">
                    <div className="col-6">
                        <h6 className="mb-2">{t('governance.proposalCard.title')}</h6>
                        <p>{proposal.content ? proposal.content.title : ''}</p>
                    </div>
                    <div className="col-6">
                        <h6 className="mb-2">ID</h6>
                        <p>{`#${proposal.id.toString()}`}</p>
                    </div>
                    <div className="col-6">
                        <h6 className="mb-2">{t('governance.proposalCard.status')}</h6>
                        <Badge proposalStatus={proposal.status} />
                    </div>
                    <div className="col-6">
                        <h6 className="mb-2">{t('governance.proposalCard.proposerName')}</h6>
                        <p>Not available yet</p>
                    </div>
                    <div className="col-6">
                        <h6 className="mb-2">{t('governance.proposalCard.submitTime')}</h6>
                        <p>
                            {dayjs(proposal.submitTime?.toISOString() || '')
                                .utc()
                                .tz(dayjs.tz.guess())
                                .format('ll')}{' '}
                            <span className="text-muted">
                                ({dateFromNow(proposal.submitTime?.toISOString() || '')})
                            </span>
                        </p>
                    </div>
                    <div className="col-6">
                        <h6 className="mb-2">{t('governance.proposalCard.depositEnd')}</h6>
                        <p>
                            {dayjs(proposal.depositEndTime?.toISOString() || '')
                                .utc()
                                .tz(dayjs.tz.guess())
                                .format('ll')}{' '}
                            <span className="text-muted">
                                ({dateFromNow(proposal.depositEndTime?.toISOString() || '')})
                            </span>
                        </p>
                    </div>
                    <div className="col-6">
                        <h6 className="mb-2">{t('governance.proposalCard.votingStart')}</h6>
                        <p>
                            {dayjs(proposal.votingStartTime?.toISOString() || '')
                                .utc()
                                .tz(dayjs.tz.guess())
                                .format('ll')}{' '}
                            <span className="text-muted">
                                ({dateFromNow(proposal.votingStartTime?.toISOString() || '')})
                            </span>
                        </p>
                    </div>
                    <div className="col-6">
                        <h6 className="mb-2">{t('governance.proposalCard.votingEnd')}</h6>
                        <p>
                            {dayjs(proposal.votingEndTime?.toISOString() || '')
                                .utc()
                                .tz(dayjs.tz.guess())
                                .format('ll')}{' '}
                            <span className="text-muted">
                                ({dateFromNow(proposal.votingEndTime?.toISOString() || '')})
                            </span>
                        </p>
                    </div>
                    <div className="col-12">
                        <h6 className="mb-2">{t('governance.proposalCard.details')}</h6>
                        <p>
                            {proposal.content
                                ? proposal.content.description.split('\\n').map((line, i) => (
                                      <span key={i}>
                                          {line}
                                          <br />
                                      </span>
                                  ))
                                : ''}
                        </p>
                    </div>
                    <div className="col-12">
                        {renderResult()}
                        <div className="d-flex flex-row justify-content-center mt-4">
                            <VoteButton proposal={proposal} onVote={onVote} />
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

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

    const validators = useSelector((state: RootState) => [...state.staking.validators.bonded]);

    useEffect(() => {
        if (!proposal) {
            return;
        }

        setResult(proposal.finalResult);

        if (proposal.status === ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD) {
            getTally(proposal.id.toString()).then(setResult);
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
        return <span className={`dot-size ${dotClass}`}>•</span>;
    };

    const renderTurnout = () => {
        return (
            <div className="d-flex flex-column justify-content-between align-items-start align-items-lg-end align-items-xl-start h-100">
                <h6>{t('governance.proposalCard.turnout')}</h6>
                <p>
                    {NumbersUtils.getPercentage(
                        GovernanceUtils.sumOfVotes(result),
                        calculateTotalVotingPower(validators),
                    ).toFixed(2)}
                    %
                </p>
            </div>
        );
    };

    const renderResult = () => {
        if (GovernanceUtils.isNoVoteYet(result || proposal.finalResult)) {
            return <p className="mb-1 mt-2">{t('governance.proposalCard.noVoteYet')}</p>;
        } else {
            const [name, percent, dotClass] = GovernanceUtils.maxVote({
                yes: voteYes,
                no: voteNo,
                noWithVeto: voteNoWithVeto,
                abstain: voteAbstain,
            });

            return (
                <div className="d-flex flex-column justify-content-between align-items-start align-items-lg-end align-items-xl-start h-100">
                    <h6>{t('governance.proposalCard.mostVotedOn')}</h6>
                    <p>
                        {renderDot(dotClass)} <strong>{name}</strong>{' '}
                        <small className="text-muted">{numeral(percent).format('0.00')}%</small>
                    </p>
                </div>
            );
        }
    };

    const renderDates = () => {
        let dateTitle: string;
        let date: string | undefined;

        switch (proposal.status) {
            case ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD:
                dateTitle = t('governance.proposalCard.depositEnd');
                date = proposal.depositEndTime?.toISOString() || '';
                break;

            case ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD:
                dateTitle = t('governance.proposalCard.votingEnd');
                date = proposal.votingEndTime?.toISOString() || '';
                break;

            default:
                dateTitle = t('governance.proposalCard.votingEnd');
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
                t={t}
                onVote={onVote}
                proposal={proposal}
                validators={validators}
                results={{
                    yes: result?.yes || 0,
                    no: result?.no || 0,
                    noWithVeto: result?.noWithVeto || 0,
                    abstain: result?.abstain || 0,
                }}
            />
        );
    }

    return (
        <Card className="mb-4">
            <div className="d-flex flex-row align-items-center">
                <h3 className="me-4">{`#${proposal.id}`}</h3>
                <Badge proposalStatus={proposal.status} />
            </div>
            <p className="proposal-title mb-4 mt-2">{proposal.content ? proposal.content.title : ''}</p>
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
                    <div className="col-12 col-lg-6 col-xl-3">{renderTurnout()}</div>
                    <div className="col-12 col-lg-6 col-xl-3">{renderResult()}</div>
                    <div className="col-12 col-lg-6 col-xl-3">{renderDates()}</div>
                    <div className="col-12 col-lg-6 col-xl-3">
                        <div className="d-flex flex-row justify-content-start justify-content-lg-end align-items-center h-100">
                            <Button
                                outline
                                onPress={() => {
                                    if (onDetails) onDetails(proposal);
                                }}
                            >
                                {t('governance.proposalCard.details')}
                            </Button>
                            {!(
                                proposal.status !== ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD &&
                                proposal.status !== ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD
                            ) && <VoteButton small className="ms-3" proposal={proposal} onVote={onVote} />}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ProposalCard;
