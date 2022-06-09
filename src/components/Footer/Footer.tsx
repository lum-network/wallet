import React from 'react';
import Assets from 'assets';
import { LUM_WALLET_GITHUB, LUM_DISCORD /* LUM_MAIL, LUM_TELEGRAM */, NODES } from 'constant';

import './Footer.scss';
import { DropdownButton } from 'components';
import { RootDispatch } from 'redux/store';
import { useRematchDispatch } from 'redux/hooks';
import { WalletClient } from 'utils';

const Footer = (): JSX.Element => {
    const setCurrentNode = useRematchDispatch((dispatch: RootDispatch) => dispatch.wallet.setCurrentNode);

    return (
        <footer className="mt-auto">
            <div className="d-flex w-100 justify-content-sm-end justify-content-center align-items-center flex-column flex-sm-row p-4">
                <div className="d-flex flex-column flex-sm-row align-items-center justify-content-center">
                    <DropdownButton
                        plainButton
                        withSeparator={false}
                        title={WalletClient.node}
                        selectedItem={WalletClient.node}
                        direction="up"
                        listClassName="node-selection-list pt-3 w-100"
                        items={NODES.map((node) => ({
                            title: node,
                            onPress: () => {
                                setCurrentNode(node);
                            },
                        }))}
                    />
                    <div className="d-flex flex-row align-items-center mt-4 mt-sm-0">
                        <a href={LUM_WALLET_GITHUB} target="_blank" rel="noreferrer" className="ms-sm-4">
                            <img src={Assets.images.githubIcon} className="footer-icon" />
                        </a>
                        <a href={LUM_DISCORD} target="_blank" rel="noreferrer" className="ms-4">
                            <img src={Assets.images.discordIcon} className="footer-icon" />
                        </a>
                    </div>
                    {/* <a href={LUM_MAIL} className="mx-4">
                    <img src={Assets.images.emailIcon} />
                </a>
                <a href={LUM_TELEGRAM}>
                    <img src={Assets.images.telegramIcon} />
                </a> */}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
