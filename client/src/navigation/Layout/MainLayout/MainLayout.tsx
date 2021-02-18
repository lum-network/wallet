import React, { PureComponent } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
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
    render(): JSX.Element {
        const { children, address, t } = this.props;
        return address ? (
            <div className="container-fluid">
                <div className="row">
                    <nav className="col-0 col-md-2 col-xl-1 px-0 d-none d-md-flex flex-column sidebar bg-secondary justify-content-between">
                        <ul className="list-unstyled">
                            <li>
                                <a href="/home">{t('navbar.dashboard')}</a>
                            </li>
                            <li>
                                <a href="/transactions">{t('navbar.transactions')}</a>
                            </li>
                            <li>
                                <a href="/send">{t('navbar.send')}</a>
                            </li>
                            <li>
                                <a href="/message">{t('navbar.message')}</a>
                            </li>
                        </ul>
                        <ul className="list-unstyled">
                            <li>
                                <a href="/welcome" onClick={() => store.dispatch({ type: 'LOGOUT' })}>
                                    {t('navbar.logout')}
                                </a>
                            </li>
                        </ul>
                    </nav>
                    <div className="col-12 col-md-10 col-xl-11">{children}</div>
                </div>
            </div>
        ) : (
            <div className="vh-100">{children}</div>
        );
    }
}

export default connect(mapState, mapDispatch)(withTranslation()(MainLayout));
