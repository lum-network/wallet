import React from 'react';
import { useTranslation } from 'react-i18next';

import assets from 'assets';
import { SmallerDecimal } from 'components';
import { MEDIUM_AIRDROP_ARTICLE } from 'constant';
import { Card } from 'frontend-elements';
import { Airdrop } from 'models';
import { NumbersUtils } from 'utils';

const CheckBox = ({
    action,
    className,
}: {
    action: { title: string; done: boolean; icon: string };
    className?: string;
}) => (
    <div
        className={`rounded-pill px-3 py-2 ${action.done ? 'done' : ''} ${className}`}
        style={{ backgroundColor: '#FCFDFF' }}
    >
        <h6 className="text-black fw-normal" style={{ opacity: action.done ? 1 : 0.3 }}>
            <span className="me-2">
                <img
                    className="action-icon"
                    src={action.done ? assets.images.checkmarkIcon : action.icon}
                    style={!action.done ? { filter: 'brightness(0)', opacity: 0.3 } : undefined}
                />
            </span>
            {action.title}
        </h6>
    </div>
);

const AirdropCard = ({ airdrop }: { airdrop: Airdrop }): JSX.Element => {
    const { t } = useTranslation();

    return (
        <Card withoutPadding className="h-100 dashboard-card airdrop-card p-4 text-white">
            <img src={assets.images.airdropCoins} className="background-image" />
            <div className="d-flex flex-column flex-md-row align-items-lg-center justify-content-between airdrop-content">
                <div>
                    <h2 className="ps-2 pt-3 text-white">{t('airdrop.title')}</h2>
                    <div className="ps-2 my-3 d-flex flex-row align-items-baseline w-100">
                        <div className="me-2 me-sm-3 text-white text-truncate">
                            <SmallerDecimal nb={NumbersUtils.formatTo6digit(airdrop.amount)} big />
                        </div>
                        <img src={assets.images.lumTicker} className="ticker" />
                    </div>
                </div>
                <div className="d-flex flex-lg-row flex-column align-items-start align-items-md-end my-3 my-lg-0">
                    <CheckBox
                        action={{
                            done: airdrop.delegate,
                            title: t('airdrop.actionsToClaim.delegate'),
                            icon: assets.images.messageDelegate,
                        }}
                    />
                    <CheckBox
                        className="ms-lg-3 mt-2 mt-lg-0"
                        action={{
                            done: airdrop.vote,
                            title: t('airdrop.actionsToClaim.vote'),
                            icon: assets.images.messageVote,
                        }}
                    />
                </div>
            </div>
            <a
                href={MEDIUM_AIRDROP_ARTICLE}
                target="_blank"
                rel="noreferrer"
                className="info-link text-white align-self-end"
            >
                {t('airdrop.moreInformations')}
            </a>
        </Card>
    );
};

export default AirdropCard;
