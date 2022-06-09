import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { RootDispatch } from 'redux/store';
import { useRematchDispatch } from 'redux/hooks';

import Assets from 'assets';
import { LUM_WALLET_GITHUB, LUM_DISCORD /* LUM_MAIL, LUM_TELEGRAM */, NODES } from 'constant';
import { WalletClient, saveCustomNode, getCustomNodes } from 'utils';

import { DropdownButton, Button, Modal, Input } from '../';
import './Footer.scss';

const Footer = (): JSX.Element => {
    const [customNode, setCustomNode] = useState('');
    const setCurrentNode = useRematchDispatch((dispatch: RootDispatch) => dispatch.wallet.setCurrentNode);
    const { t } = useTranslation();

    const userNodes = getCustomNodes();

    const onAddNode = () => {
        saveCustomNode(customNode);
        setCurrentNode(customNode);
        setCustomNode('');
    };

    return (
        <>
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
                            items={[
                                ...[...userNodes, ...NODES].map((node) => ({
                                    title: node,
                                    onPress: () => {
                                        setCurrentNode(node);
                                    },
                                })),
                                {
                                    component: (
                                        <Button
                                            outline
                                            buttonType="custom"
                                            data-bs-toggle="modal"
                                            data-bs-target="#customNodeModal"
                                            className="custom-node-btn d-flex align-items-center justify-content-center mx-auto my-2"
                                        >
                                            {t('footer.customNodeBtn')}
                                        </Button>
                                    ),
                                },
                            ]}
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
            <Modal id="customNodeModal">
                <h3>{t('footer.customNodeModal.title')}</h3>
                <div className="d-flex align-items-center">
                    <Input
                        className="my-4 me-4"
                        value={customNode}
                        onChange={(event) => setCustomNode(event.target.value)}
                    />
                    <Button disabled={!customNode} data-bs-dismiss="modal" onClick={onAddNode}>
                        {t('footer.customNodeModal.addBtn')}
                    </Button>
                </div>
            </Modal>
        </>
    );
};

export default Footer;
