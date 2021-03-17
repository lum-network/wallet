import React from 'react';
import Assets from 'assets';
import { LUM_WALLET_GITHUB /* LUM_MAIL, LUM_TELEGRAM */ } from 'constant';

const Footer = (): JSX.Element => {
    return (
        <div className="d-flex w-100 justify-content-sm-end justify-content-center align-items-center flex-column flex-sm-row p-4">
            <div>
                <a href={LUM_WALLET_GITHUB} target="_blank" rel="noreferrer">
                    <img src={Assets.images.githubIcon} />
                </a>
                {/* <a href={LUM_MAIL} className="mx-4">
                    <img src={Assets.images.emailIcon} />
                </a>
                <a href={LUM_TELEGRAM}>
                    <img src={Assets.images.telegramIcon} />
                </a> */}
            </div>
        </div>
    );
};

export default Footer;
