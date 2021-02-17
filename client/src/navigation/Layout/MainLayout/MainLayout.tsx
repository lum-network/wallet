import React, { PureComponent } from 'react';
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

type Props = IProps & StateProps & DispatchProps;

class MainLayout extends PureComponent<Props> {
    render(): JSX.Element {
        const { children, address } = this.props;
        return address ? (
            <div className="container-fluid">
                <div className="row">
                    <nav className="col-0 col-md-2 col-xl-1 px-0 d-none d-md-flex flex-column sidebar bg-secondary justify-content-between">
                        <ul className="list-unstyled">
                            <li>
                                <a href="/home">Dashboard</a>
                            </li>
                            <li>
                                <a href="/transactions">Transactions</a>
                            </li>
                            <li>
                                <a href="/send">Send</a>
                            </li>
                            <li>
                                <a href="/message">Message</a>
                            </li>
                        </ul>
                        <ul className="list-unstyled">
                            <li>
                                <a href="/welcome" onClick={() => store.dispatch({ type: 'LOGOUT' })}>
                                    Logout
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

export default connect(mapState, mapDispatch)(MainLayout);
