import React from 'react';

import { ProposalStatus } from '@lum-network/sdk-javascript/build/codegen/cosmos/gov/v1beta1/gov';
import { BondStatus } from '@lum-network/sdk-javascript/build/codegen/cosmos/staking/v1beta1/staking';

import { useTranslation } from 'react-i18next';
import assets from 'assets';

import './Badge.scss';

interface Props {
    proposalStatus?: ProposalStatus;
    text?: boolean;
    validatorStatus?: BondStatus;
    jailed?: boolean;
    success?: boolean;
}

const Badge = ({ proposalStatus, text, validatorStatus, jailed, success }: Props): JSX.Element => {
    const { t } = useTranslation();
    const validatorStatuses = t('staking.status', { returnObjects: true });

    if (jailed) {
        return (
            <div className="d-flex align-items-center">
                <div className="app-badge failure">
                    <p className="text failure">
                        <img alt="checkmark" src={assets.images.crossIcon} /> {validatorStatuses[4]}
                    </p>
                </div>
            </div>
        );
    }

    if (validatorStatus !== undefined) {
        const statusText =
            validatorStatus === BondStatus.UNRECOGNIZED ? validatorStatuses[0] : validatorStatuses[validatorStatus];

        switch (validatorStatus) {
            case BondStatus.BOND_STATUS_BONDED:
                return (
                    <div>
                        <div className="app-badge success">
                            <p className="text success">
                                <img alt="checkmark" src={assets.images.checkmarkIcon} /> {statusText}
                            </p>
                        </div>
                    </div>
                );

            case BondStatus.BOND_STATUS_UNBONDING:
                return (
                    <div>
                        <div className="app-badge warning">
                            <p className="text warning">
                                <img alt="checkmark" src={assets.images.warningIcon} /> {statusText}
                            </p>
                        </div>
                    </div>
                );

            case BondStatus.UNRECOGNIZED:
            case BondStatus.BOND_STATUS_UNSPECIFIED:
            case BondStatus.BOND_STATUS_UNBONDED:
                return (
                    <div>
                        <div className="app-badge failure">
                            <p className="text failure">
                                <img alt="checkmark" src={assets.images.crossIcon} /> {statusText}
                            </p>
                        </div>
                    </div>
                );
        }
    }

    if (proposalStatus) {
        switch (proposalStatus) {
            case ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD:
                return (
                    <div className="">
                        <div className={`app-badge warning ${text && 'text-only'}`}>
                            <p className="text warning">
                                <img alt="checkmark" src={assets.images.depositPeriod} />{' '}
                                {t('governance.statusBadge.deposit')}
                            </p>
                        </div>
                    </div>
                );

            case ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD:
                return (
                    <div className="">
                        <div className={`app-badge info ${text && 'text-only'}`}>
                            <p className="text info">
                                <img alt="checkmark" src={assets.images.votePeriod} />{' '}
                                {t('governance.statusBadge.voting')}
                            </p>
                        </div>
                    </div>
                );

            case ProposalStatus.PROPOSAL_STATUS_PASSED:
                return (
                    <div className="">
                        <div className={`app-badge success ${text && 'text-only'}`}>
                            <p className="text success">
                                <img alt="checkmark" src={assets.images.checkmarkIcon} />{' '}
                                {t('governance.statusBadge.passed')}
                            </p>
                        </div>
                    </div>
                );

            case ProposalStatus.PROPOSAL_STATUS_REJECTED:
                return (
                    <div className="">
                        <div className={`app-badge failure ${text && 'text-only'}`}>
                            <p className="text failure">
                                <img alt="checkmark" src={assets.images.crossIcon} />{' '}
                                {t('governance.statusBadge.rejected')}
                            </p>
                        </div>
                    </div>
                );
            default:
                return <div />;
        }
    }

    return (
        <div>
            <div className={`app-badge ${success ? 'success' : 'failure'}`}>
                <p className={`text ${success ? 'success' : 'failure'}`}>
                    {success ? (
                        <>
                            <img alt="checkmark" src={assets.images.checkmarkIcon} /> {t('common.success')}
                        </>
                    ) : (
                        <>
                            <img alt="checkmark" src={assets.images.crossIcon} /> {t('common.failure')}
                        </>
                    )}
                </p>
            </div>
        </div>
    );
};

export default Badge;
