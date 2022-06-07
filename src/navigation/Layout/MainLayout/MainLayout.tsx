import assets from 'assets';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import store, { RootState } from 'redux/store';
import { LOGOUT } from 'redux/constants';
import { Footer, Modal, Button } from 'components';

import './MainLayout.scss';
import { IS_TESTNET, KEPLR_DEFAULT_COIN_TYPE } from 'constant';
import { showInfoToast, GovernanceUtils } from 'utils';

const MainLayout: React.FC = ({ children }) => {
    const wallet = useSelector((state: RootState) => state.wallet.currentWallet);
    const proposals = useSelector((state: RootState) => state.governance.proposals);

    const { t } = useTranslation();

    const unload = (e: BeforeUnloadEvent) => {
        if (wallet) {
            e.preventDefault();

            return (e.returnValue = '');
        }
    };

    const keplrKeystoreChangeHandler = () => {
        if (wallet && wallet.isExtensionImport) {
            showInfoToast(t('logout.keplrKeystoreChange'));
            store.dispatch({ type: LOGOUT });
            store.dispatch.wallet.signInWithKeplrAsync(KEPLR_DEFAULT_COIN_TYPE);
        }
    };

    useEffect(() => {
        window.addEventListener('keplr_keystorechange', keplrKeystoreChangeHandler, false);
        window.addEventListener('beforeunload', unload);

        return () => {
            window.removeEventListener('keplr_keystorechange', keplrKeystoreChangeHandler, false);
            window.removeEventListener('beforeunload', unload);
        };
    }, [wallet]);

    const renderNavbar = (bottom?: boolean) => {
        if (!wallet) {
            return null;
        }

        const proposalNotificationDot = GovernanceUtils.proposalInVotingPeriod(proposals);

        return (
            <div className="navbar-container position-fixed w-100">
                {!bottom && IS_TESTNET && (
                    <div className="warning-bar text-center py-2">{t('common.testnetBanner')}</div>
                )}
                <nav
                    className={`px-3 ps-lg-2 pe-lg-4 py-0 py-lg-3 justify-content-between justify-content-lg-between navbar navbar-expand-lg ${
                        bottom ? 'position-fixed w-100 bottom-navbar' : ''
                    }`}
                >
                    {!bottom && (
                        <ul className="navbar-nav navbar-spacer">
                            <li>
                                <div style={{ width: 24 }} />
                            </li>
                        </ul>
                    )}
                    {!bottom && (
                        <ul className="navbar-nav lum-logo">
                            <li>
                                <NavLink to="/home" className="navbar-item me-lg-5 ms-2 ms-lg-4 selected-navbar-item">
                                    <img src={assets.images.lumWallet} width="117" height="38" className="lum-logo" />
                                </NavLink>
                            </li>
                        </ul>
                    )}
                    <ul className="navbar-nav me-md-auto">
                        <li>
                            <NavLink
                                to="/home"
                                className="navbar-item d-flex flex-column flex-md-row align-items-center justify-content-center mx-md-4"
                                activeClassName="selected-navbar-item"
                            >
                                <img
                                    src={assets.images.navbarIcons.dashboard}
                                    width="20"
                                    height="20"
                                    className="me-md-2 nav-icon"
                                />
                                <span className="d-none d-sm-block">{t('navbar.dashboard')}</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/operations"
                                className="navbar-item d-flex flex-column flex-md-row align-items-center justify-content-center mx-md-4"
                                activeClassName="selected-navbar-item"
                            >
                                <img
                                    src={assets.images.navbarIcons.operations}
                                    width="20"
                                    height="20"
                                    className="me-md-2 nav-icon"
                                />
                                <span className="d-none d-sm-block">{t('navbar.transactions')}</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/staking"
                                className="navbar-item d-flex flex-column flex-md-row align-items-center justify-content-center mx-md-4"
                                activeClassName="selected-navbar-item"
                            >
                                <img
                                    src={assets.images.navbarIcons.staking}
                                    width="20"
                                    height="20"
                                    className="me-md-2 nav-icon"
                                />
                                <span className="d-none d-sm-block">{t('navbar.staking')}</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/message"
                                className="navbar-item d-flex flex-column flex-md-row align-items-center justify-content-center mx-md-4"
                                activeClassName="selected-navbar-item"
                            >
                                <img
                                    src={assets.images.navbarIcons.messages}
                                    width="20"
                                    height="20"
                                    className="me-md-2 nav-icon"
                                />
                                <span className="d-none d-sm-block">{t('navbar.message')}</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/governance"
                                className="navbar-item d-flex flex-column flex-md-row align-items-center justify-content-center mx-md-4 position-relative"
                                activeClassName="selected-navbar-item"
                            >
                                <div className="me-md-2 nav-icon position-relative">
                                    <img
                                        src={assets.images.navbarIcons.governance}
                                        width="20"
                                        height="20"
                                        className="nav-icon"
                                    />
                                    {proposalNotificationDot ? (
                                        <span className="d-block d-md-none position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                                            <span className="visually-hidden">New Proposal in Voting Period</span>
                                        </span>
                                    ) : null}
                                </div>
                                <span className="d-none d-sm-block">{t('navbar.governance')}</span>
                                {proposalNotificationDot ? (
                                    <span className="d-none d-md-block position-absolute top-25 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                                        <span className="visually-hidden">New Proposal in Voting Period</span>
                                    </span>
                                ) : null}
                            </NavLink>
                        </li>
                    </ul>
                    {!bottom && (
                        <ul className="navbar-nav navbar-logout-btn">
                            <li>
                                <a
                                    role="button"
                                    data-bs-toggle="modal"
                                    data-bs-target="#logoutModal"
                                    className="navbar-item selected-navbar-item"
                                >
                                    <img src={assets.images.navbarIcons.logout} className="nav-icon logout-icon" />
                                </a>
                            </li>
                        </ul>
                    )}
                </nav>
            </div>
        );
    };

    return (
        <div className={`layout ${!wallet && 'auth-layout'}`}>
            {renderNavbar()}
            {IS_TESTNET && !wallet && (
                <div className="sticky-top vw-100 warning-bar text-center py-2">{t('common.testnetBanner')}</div>
            )}
            <div className={`d-flex flex-column flex-grow-1 ${wallet && 'content'} ${IS_TESTNET && 'testnet'}`}>
                {children}
            </div>
            {wallet && (
                <footer className="mt-auto">
                    <Footer />
                </footer>
            )}
            {renderNavbar(true)}
            {wallet && (
                <Modal id="logoutModal" dataBsBackdrop="static" contentClassName="p-3" withCloseButton={false}>
                    <h1 className="logout-modal-title">{t('logout.title')}</h1>
                    <div className="d-flex flex-column flex-sm-row  justify-content-between mt-5">
                        <Button className="logout-modal-cancel-btn me-sm-4 mb-4 mb-sm-0" data-bs-dismiss="modal">
                            <div className="px-sm-2">{t('common.cancel')}</div>
                        </Button>
                        <Button
                            className="logout-modal-logout-btn text-white"
                            data-bs-dismiss="modal"
                            onClick={() => store.dispatch({ type: LOGOUT })}
                        >
                            <div className="px-sm-2">{t('logout.logoutBtn')}</div>
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default MainLayout;
