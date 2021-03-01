import React from 'react';
import Assets from 'assets';
import { LUM_GITHUB, LUM_MAIL, LUM_TELEGRAM } from 'constant';

const Footer = (): JSX.Element => {
    return (
        <div className="d-flex w-100 justify-content-sm-between justify-content-center align-items-center flex-column flex-sm-row p-4">
            <div className="d-flex">
                <p className="me-lg-4 me-3 mb-sm-0">Privacy policy</p>
                <p className="ms-lg-4 me-3 mb-sm-0">LUM Wallet 2021</p>
            </div>
            <div>
                <a href={LUM_GITHUB}>
                    <img src={Assets.images.githubIcon} />
                </a>
                <a href={LUM_MAIL} className="mx-4">
                    <img src={Assets.images.emailIcon} />
                </a>
                <a href={LUM_TELEGRAM}>
                    <img src={Assets.images.telegramIcon} />
                </a>
            </div>
        </div>
    );
};

export default Footer;
