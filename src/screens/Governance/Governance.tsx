import React, { useEffect, useRef, useState } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ProposalStatus, VoteOption } from '@lum-network/sdk-javascript/build/codegen/cosmos/gov/v1beta1/gov';

import { Proposal } from 'models';
import { RootDispatch, RootState } from 'redux/store';

import ProposalCard from './components/ProposalCard/ProposalCard';

import './styles/Governance.scss';
import CustomSwitch from './components/CustomSwitch/CustomSwitch';
import { Button, Modal } from 'components';
import { GovernanceUtils, showErrorToast, showSuccessToast } from 'utils';
import { useRematchDispatch } from 'redux/hooks';

const Governance = (): JSX.Element => {
    const [activeProposals, setActiveProposals] = useState<Proposal[]>([]);
    const [passedProposals, setPassedProposals] = useState<Proposal[]>([]);
    const [activeTab, setActiveTab] = useState<'active' | 'passed'>('active');
    const [onScreenProposal, setOnScreenProposal] = useState<Proposal | undefined>();
    const [proposalToVote, setProposalToVote] = useState<Proposal | null>(null);
    const [vote, setVote] = useState<VoteOption | null>(null);
    const [confirming, setConfirming] = useState(false);

    const nodeRef1 = useRef<HTMLDivElement>(null);
    const nodeRef2 = useRef<HTMLDivElement>(null);
    const modalRef = useRef<React.ElementRef<typeof Modal>>(null);

    const { wallet, proposals } = useSelector((state: RootState) => ({
        wallet: state.wallet.currentWallet,
        proposals: state.governance.proposals,
    }));

    const { sendVote } = useRematchDispatch((dispatch: RootDispatch) => ({
        sendVote: dispatch.wallet.vote,
    }));

    const { t } = useTranslation();
    const { proposalId } = useParams<{ proposalId: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        const ref = modalRef.current;

        const handler = () => {
            setVote(null);
            setConfirming(false);
            setProposalToVote(null);
        };

        if (ref) {
            ref.addEventListener('hidden.bs.modal', handler);
        }

        return () => {
            if (ref) {
                ref.removeEventListener('hidden.bs.modal', handler);
            }
        };
    }, []);

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
        setPassedProposals(GovernanceUtils.sortByDate(passed));
    }, [proposals]);

    useEffect(() => {
        if (proposalId === undefined) {
            setActiveTab(activeTab);
        }
        setOnScreenProposal(proposals.find((proposal) => proposal.id.toString() === proposalId));
    }, [proposalId, proposals]);

    const onDetails = (proposal: Proposal) => {
        navigate(`/governance/proposal/${proposal.id.toString()}`);
    };

    const onVote = (proposal: Proposal) => {
        setProposalToVote(proposal);
    };

    const onSubmitVote = async (proposal: Proposal, voteOption: VoteOption) => {
        if (wallet) {
            try {
                const voteResult = await sendVote({ voter: wallet, proposal, vote: voteOption });

                if (!voteResult || (voteResult && voteResult.error)) {
                    throw new Error(voteResult?.error || 'An error when voting, try again later');
                } else {
                    showSuccessToast(t('governance.voteSuccess'));
                }
            } catch (e) {
                console.error(e);
                showErrorToast((e as Error).message);
            }
        }
    };

    const currentTabProposals = [...(activeTab === 'active' ? activeProposals : passedProposals)];

    return (
        <>
            <div className="mt-4">
                <div className="container-xxl">
                    <SwitchTransition>
                        <CSSTransition
                            nodeRef={nodeRef1}
                            key={onScreenProposal ? proposalId : 'proposals-list'}
                            timeout={100}
                        >
                            <div ref={nodeRef1}>
                                <div className="d-flex flex-row align-items-center justify-content-center mb-4 py-1">
                                    {onScreenProposal ? (
                                        <button
                                            type="button"
                                            onClick={() => navigate('/governance', { replace: true })}
                                            className="close-btn bg-white rounded-circle mt-2"
                                            aria-label={t('common.close')}
                                        >
                                            <div className="btn-close mx-auto" />
                                        </button>
                                    ) : (
                                        <CustomSwitch
                                            defaultChecked={activeTab === 'passed'}
                                            onChange={(event) =>
                                                setActiveTab(event.target.checked ? 'passed' : 'active')
                                            }
                                        />
                                    )}
                                </div>
                                {onScreenProposal ? (
                                    <div className="d-flex flex-column align-items-center mt-4">
                                        <ProposalCard full proposal={onScreenProposal} onVote={onVote} />
                                    </div>
                                ) : (
                                    <SwitchTransition>
                                        <CSSTransition
                                            key={activeTab}
                                            nodeRef={nodeRef2}
                                            classNames="list-transition"
                                            addEndListener={(done) => {
                                                if (nodeRef2.current) {
                                                    nodeRef2.current.addEventListener('transitionend', done, false);
                                                }
                                            }}
                                        >
                                            <div ref={nodeRef2}>
                                                {currentTabProposals.length > 0 ? (
                                                    currentTabProposals.map((proposal) => (
                                                        <ProposalCard
                                                            key={proposal.id.toString()}
                                                            proposal={proposal}
                                                            onVote={onVote}
                                                            onDetails={onDetails}
                                                        />
                                                    ))
                                                ) : (
                                                    <div className="d-flex flex-column align-items-center justify-content-center no-proposal-container">
                                                        <div className="bg-white rounded-circle align-self-center p-3 mb-3 shadow-sm">
                                                            <div
                                                                className="btn-close mx-auto"
                                                                style={{
                                                                    filter: 'brightness(0) invert(0.8)',
                                                                }}
                                                            />
                                                        </div>
                                                        {`No proposal ${activeTab}`}
                                                    </div>
                                                )}
                                            </div>
                                        </CSSTransition>
                                    </SwitchTransition>
                                )}
                            </div>
                        </CSSTransition>
                    </SwitchTransition>
                </div>
            </div>
            <Modal ref={modalRef} id="voteModal" dataBsBackdrop="static" dataBsKeyboard={false} bodyClassName="w-100">
                <div className="d-flex flex-column align-items-center">
                    {proposalToVote && (
                        <>
                            {confirming && vote ? (
                                <>
                                    <h3 className="fw-bolder mx-3">
                                        {t('governance.confirmingTitle', {
                                            proposal: `#${proposalToVote.id.toString()} ${
                                                proposalToVote.content ? proposalToVote.content.title : ''
                                            }`,
                                        })}
                                    </h3>
                                    <div className="my-4">
                                        {t('governance.confirmingVote', { vote: GovernanceUtils.getVoteName(vote) })}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h4 className="text-center mt-4">
                                        #{proposalToVote.id.toString()}{' '}
                                        {proposalToVote.content ? proposalToVote.content.title : ''}
                                    </h4>

                                    <div className="d-flex flex-column mt-4 px-4 w-100">
                                        <button
                                            type="button"
                                            onClick={() => setVote(VoteOption.VOTE_OPTION_YES)}
                                            className={`import-software-btn mb-4 ${
                                                vote === VoteOption.VOTE_OPTION_YES && 'selected'
                                            }`}
                                        >
                                            <p className="d-flex fw-normal align-items-center justify-content-center">
                                                {t('governance.votes.yes')}
                                            </p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setVote(VoteOption.VOTE_OPTION_NO)}
                                            className={`import-software-btn mb-4 ${
                                                vote === VoteOption.VOTE_OPTION_NO && 'selected'
                                            }`}
                                        >
                                            <p className="d-flex fw-normal align-items-center justify-content-center">
                                                {t('governance.votes.no')}
                                            </p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setVote(VoteOption.VOTE_OPTION_NO_WITH_VETO)}
                                            className={`import-software-btn mb-4 ${
                                                vote === VoteOption.VOTE_OPTION_NO_WITH_VETO && 'selected'
                                            }`}
                                        >
                                            <p className="d-flex fw-normal align-items-center justify-content-center">
                                                {t('governance.votes.noWithVeto')}
                                            </p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setVote(VoteOption.VOTE_OPTION_ABSTAIN)}
                                            className={`import-software-btn mb-4 ${
                                                vote === VoteOption.VOTE_OPTION_ABSTAIN && 'selected'
                                            }`}
                                        >
                                            <p className="d-flex fw-normal align-items-center justify-content-center">
                                                {t('governance.votes.abstain')}
                                            </p>
                                        </button>
                                    </div>
                                </>
                            )}
                            <div className="d-flex flex-row justify-content-between mb-4">
                                <Button outline data-bs-dismiss="modal" className="me-4">
                                    {t('common.cancel')}
                                </Button>
                                <Button
                                    disabled={vote === null}
                                    className={confirming ? 'vote-button-confirming' : ''}
                                    {...(vote &&
                                        confirming && {
                                            'data-bs-dismiss': 'modal',
                                        })}
                                    onClick={
                                        confirming
                                            ? () => {
                                                  if (vote) onSubmitVote(proposalToVote, vote);
                                              }
                                            : () => setConfirming(true)
                                    }
                                >
                                    {confirming
                                        ? t('common.confirm')
                                        : t('governance.proposalCard.voteButtonStates.active')}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </>
    );
};

export default Governance;
