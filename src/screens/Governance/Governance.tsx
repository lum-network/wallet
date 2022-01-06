import React, { useEffect, useRef, useState } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { useHistory, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ProposalStatus } from '@lum-network/sdk-javascript/build/codec/cosmos/gov/v1beta1/gov';

import { Card } from 'frontend-elements';
import { SwitchInput } from 'components';
import { Proposal } from 'models';
import { RootState } from 'redux/store';

import ProposalCard from './components/ProposalCard/ProposalCard';

import './styles/Governance.scss';

const Governance = (): JSX.Element => {
    const [activeProposals, setActiveProposals] = useState<Proposal[]>([]);
    const [passedProposals, setPassedProposals] = useState<Proposal[]>([]);
    const [activeTab, setActiveTab] = useState<'active' | 'passed'>('active');
    const [onScreenProposal, setOnScreenProposal] = useState<Proposal | undefined>();

    const nodeRef = useRef(null);

    const { proposals } = useSelector((state: RootState) => ({
        proposals: state.governance.proposals,
    }));

    const { t } = useTranslation();
    const { proposalId } = useParams<{ proposalId: string }>();
    const history = useHistory();

    useEffect(() => {
        const active = proposals.filter(
            (proposal) =>
                proposal.status === ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD ||
                proposal.status === ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD,
        );
        const passed = proposals.filter(
            (proposal) =>
                proposal.status !== ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD &&
                proposal.status !== ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD,
        );

        setActiveProposals(active);
        setPassedProposals(passed);
    }, [proposals]);

    useEffect(() => {
        setOnScreenProposal(proposals.find((proposal) => proposal.proposalId.toString() === proposalId));
    }, [proposalId, proposals]);

    const onDetails = (proposal: Proposal) => {
        history.push(`/governance/proposal/${proposal.proposalId}`);
    };

    const onVote = (proposal: Proposal) => {
        // ON VOTE
    };

    const currentTabProposals = [...(activeTab === 'active' ? activeProposals : passedProposals)];

    return (
        <div className="mt-4">
            <div className="container">
                <SwitchTransition>
                    <CSSTransition key={onScreenProposal ? proposalId : 'proposals-list'} timeout={100}>
                        {onScreenProposal ? (
                            <div className="d-flex flex-column align-items-center mt-4">
                                <button
                                    type="button"
                                    onClick={() => history.goBack()}
                                    className="close-btn bg-white rounded-circle mb-4"
                                    aria-label={t('common.close')}
                                >
                                    <div className="btn-close mx-auto" />
                                </button>
                                <ProposalCard full proposal={onScreenProposal} onVote={onVote} />
                            </div>
                        ) : (
                            <div>
                                <div className="d-flex flex-row align-items-center justify-content-center mb-4">
                                    Active
                                    <SwitchInput
                                        switchSize="large"
                                        onChange={(event) => setActiveTab(event.target.checked ? 'passed' : 'active')}
                                    />
                                    Passed
                                </div>
                                <SwitchTransition>
                                    <CSSTransition
                                        key={activeTab}
                                        classNames="list-transition"
                                        addEndListener={(node, done) =>
                                            node.addEventListener('transitionend', done, false)
                                        }
                                    >
                                        <>
                                            {currentTabProposals.length > 0 ? (
                                                currentTabProposals.map((proposal) => (
                                                    <ProposalCard
                                                        key={proposal.proposalId.toString()}
                                                        proposal={proposal}
                                                        onVote={onVote}
                                                        onDetails={onDetails}
                                                    />
                                                ))
                                            ) : (
                                                <div className="d-flex flex-column align-items-center justify-content-center">
                                                    No proposal available
                                                </div>
                                            )}
                                        </>
                                    </CSSTransition>
                                </SwitchTransition>
                            </div>
                        )}
                    </CSSTransition>
                </SwitchTransition>
            </div>
        </div>
    );
};

export default Governance;
