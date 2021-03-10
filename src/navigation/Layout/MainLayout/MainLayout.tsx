import assets from 'assets';
import React, { PureComponent } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import store, { RootDispatch, RootState } from 'redux/store';

import './MainLayout.scss';

interface IProps {}

const mapState = (state: RootState) => ({
    loading: state.loading.models.wallet,
    address: state.wallet.address,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mapDispatch = (_dispatch: RootDispatch) => ({});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

type Props = IProps & StateProps & DispatchProps & WithTranslation;

class MainLayout extends PureComponent<Props> {
    renderNavbar(bottom?: boolean) {
        const { t } = this.props;

        return (
            <nav className={`ps-md-2 pe-md-4 py-3 bg-white navbar navbar-expand-lg ${bottom ? 'bottom-navbar' : ''}`}>
                {!bottom && (
                    <img src={assets.images.lumWallet} width="107" height="28" className="lum-logo me-5 ms-4" />
                )}
                <ul className="navbar-nav me-md-auto">
                    <li>
                        <NavLink
                            to="/home"
                            className="navbar-item d-flex flex-column flex-md-row align-items-center justify-content-center mx-md-4"
                            activeClassName="selected"
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
                            activeClassName="selected"
                        >
                            <img src={assets.images.stakeIcon} width="20" height="20" className="me-md-2 nav-icon" />
                            {t('navbar.transactions')}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/send"
                            className="navbar-item d-flex flex-column flex-md-row align-items-center justify-content-center mx-md-4"
                            activeClassName="selected"
                        >
                            <img src={assets.images.sendIcon} width="20" height="20" className="me-md-2 nav-icon" />
                            {t('navbar.send')}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/message"
                            className="navbar-item d-flex flex-column flex-md-row align-items-center justify-content-center mx-md-4"
                            activeClassName="selected"
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
                    <NavLink
                        to="/welcome"
                        className="navbar-item logout d-flex align-items-center justify-content-center"
                        activeClassName="selected"
                        // react-router-dom prop workaround to logout button always seen as active
                        isActive={() => true}
                        onClick={() => store.dispatch({ type: 'LOGOUT' })}
                    >
                        <img src={assets.images.profileIcon} width="22" height="17.5" className="nav-icon" />
                    </NavLink>
                )}
            </nav>
        );
    }
    render(): JSX.Element {
        const { children, address } = this.props;
        return address ? (
            <div className="main-layout">
                {this.renderNavbar()}
                {children}
                {this.renderNavbar(true)}
            </div>
        ) : (
            <div className="vh-100">{children}</div>
        );
    }
}

export default connect(mapState, mapDispatch)(withTranslation()(MainLayout));
