import React from 'react';
import { ProposalStatus } from '@lum-network/sdk-javascript/build/codec/cosmos/gov/v1beta1/gov';

import { useTranslation } from 'react-i18next';
import assets from 'assets';

import './Badge.scss';

interface Props {
    proposalStatus: ProposalStatus;
    text?: boolean;
}

const Badge = ({ proposalStatus, text }: Props): JSX.Element => {
    const { t } = useTranslation();

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
                            <img alt="checkmark" src={assets.images.votePeriod} /> {t('governance.statusBadge.voting')}
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
                            <img alt="checkmark" src={assets.images.crossIcon} /> {t('governance.statusBadge.rejected')}
                        </p>
                    </div>
                </div>
            );
        default:
            return <div />;
    }
};

export default Badge;
