import assets from 'assets';
import React, { PureComponent } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import store, { RootState } from 'redux/store';
import { LOGOUT } from 'redux/constants';
import { Footer, Modal, Button } from 'components';

import './MainLayout.scss';
import { IS_TESTNET } from 'utils/wallet';

interface IProps {
    children: React.ReactNode;
}

const mapState = (state: RootState) => ({
    loading: state.loading.models.wallet,
    wallet: state.wallet.currentWallet,
});

type StateProps = ReturnType<typeof mapState>;

type Props = IProps & StateProps & WithTranslation;

class MainLayout extends PureComponent<Props> {
    renderNavbar(bottom?: boolean) {
        const { t } = this.props;

        return (
            <div className="navbar-container position-fixed w-100">
                {!bottom && IS_TESTNET && (
                    <div className="warning-bar text-center py-2">{t('common.testnetBanner')}</div>
                )}
                <nav
                    className={`ps-lg-2 pe-lg-4 py-3 justify-content-center justify-content-lg-between navbar navbar-expand-lg ${
                        bottom ? 'position-fixed w-100 bottom-navbar' : ''
                    }`}
                >
                    {!bottom && (
                        <ul className="navbar-nav lum-logo">
                            <li>
                                <NavLink to="/home" className="navbar-item me-lg-5 ms-lg-4 selected-navbar-item">
                                    <img src={assets.images.lumWallet} width="107" height="28" className="lum-logo" />
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
                                    src={assets.images.dashboardIcon}
                                    width="20"
                                    height="20"
                                    className="me-md-2 nav-icon"
                                />
                                {t('navbar.dashboard')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/transactions"
                                className="navbar-item d-flex flex-column flex-md-row align-items-center justify-content-center mx-md-4"
                                activeClassName="selected-navbar-item"
                            >
                                <img src={assets.images.sendIcon} width="20" height="20" className="me-md-2 nav-icon" />
                                {t('navbar.transactions')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/staking"
                                className="navbar-item d-flex flex-column flex-md-row align-items-center justify-content-center mx-md-4"
                                activeClassName="selected-navbar-item"
                            >
                                <img
                                    src={assets.images.stakeIcon}
                                    width="20"
                                    height="20"
                                    className="me-md-2 nav-icon"
                                />
                                {t('navbar.staking')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/message"
                                className="navbar-item d-flex flex-column flex-md-row align-items-center justify-content-center mx-md-4"
                                activeClassName="selected-navbar-item"
                            >
                                <img
                                    src={assets.images.messageMauveIcon}
                                    width="20"
                                    height="20"
                                    className="me-md-2 nav-icon"
                                />
                                {t('navbar.message')}
                            </NavLink>
                        </li>
                    </ul>
                    {!bottom && (
                        <ul className="navbar-nav">
                            <li>
                                <a
                                    role="button"
                                    data-bs-toggle="modal"
                                    data-bs-target="#logoutModal"
                                    className="navbar-item selected-navbar-item"
                                >
                                    <img src={assets.images.logoutIcon} width="50" height="50" className="nav-icon" />
                                </a>
                            </li>
                        </ul>
                    )}
                </nav>
            </div>
        );
    }
    render(): JSX.Element {
        const { children, wallet, t } = this.props;
        return wallet ? (
            <div className="main-layout">
                <div className="d-flex flex-column">
                    {this.renderNavbar()}
                    <div className={`content ${IS_TESTNET && 'testnet'}`}>{children}</div>
                </div>
                <footer className="mt-auto">
                    <Footer />
                </footer>
                {this.renderNavbar(true)}
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
            </div>
        ) : (
            <div className="auth-layout">
                {IS_TESTNET && (
                    <div className="sticky-top vw-100 warning-bar text-center py-2">{t('common.testnetBanner')}</div>
                )}
                {children}
            </div>
        );
    }
}

const LayoutWithTranslation = withTranslation()(MainLayout);
export default connect(mapState)(LayoutWithTranslation);
