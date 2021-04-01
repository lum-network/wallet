import assets from 'assets';
import React, { PureComponent } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import store, { RootState } from 'redux/store';
import { LOGOUT } from 'redux/constants';
import { Footer } from 'components';

import './MainLayout.scss';

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
            <nav
                className={`ps-lg-2 pe-lg-4 py-3 position-fixed w-100 justify-content-center justify-content-lg-between navbar navbar-expand-lg ${
                    bottom ? 'bottom-navbar' : ''
                }`}
            >
                {!bottom && (
                    <img src={assets.images.lumWallet} width="107" height="28" className="lum-logo me-lg-5 ms-lg-4" />
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
                            <img src={assets.images.stakeIcon} width="20" height="20" className="me-md-2 nav-icon" />
                            {t('navbar.transactions')}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/send"
                            className="navbar-item d-flex flex-column flex-md-row align-items-center justify-content-center mx-md-4"
                            activeClassName="selected-navbar-item"
                        >
                            <img src={assets.images.sendIcon} width="20" height="20" className="me-md-2 nav-icon" />
                            {t('navbar.send')}
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
                        <li className="dropdown navbar-item selected-navbar-item">
                            <button
                                type="button"
                                id="profileDropdownButton"
                                data-bs-toggle="dropdown"
                                data-bs-target="profileDropdownButton"
                                aria-expanded="false"
                            >
                                <div className="logout d-flex align-items-center justify-content-center">
                                    <img
                                        src={assets.images.profileIcon}
                                        width="22"
                                        height="17.5"
                                        className="nav-icon"
                                    />
                                </div>
                            </button>
                            <ul
                                className="dropdown-menu dropdown-menu-end"
                                aria-labelledby="profileDropdownButton"
                                id="profileDropdownButton"
                            >
                                <NavLink
                                    to="/welcome"
                                    activeClassName="selected-navbar-item dropdown-item"
                                    // NavLink prop workaround to always apply selected-navbar-item style
                                    isActive={() => true}
                                    onClick={() => store.dispatch({ type: LOGOUT })}
                                >
                                    <li>Logout</li>
                                </NavLink>
                            </ul>
                        </li>
                    </ul>
                )}
            </nav>
        );
    }
    render(): JSX.Element {
        const { children, wallet } = this.props;
        return wallet ? (
            <div className="main-layout">
                <div className="d-flex flex-column">
                    {this.renderNavbar()}
                    <div className="content">{children}</div>
                </div>
                <footer className="mt-auto">
                    <Footer />
                </footer>
                {this.renderNavbar(true)}
            </div>
        ) : (
            <div className="auth-layout">{children}</div>
        );
    }
}

const LayoutWithTranslation = withTranslation()(MainLayout);
export default connect(mapState)(LayoutWithTranslation);
