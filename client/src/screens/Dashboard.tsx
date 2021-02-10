import { Card, TransactionsTable } from 'components';
import React, { PureComponent } from 'react';
import QRCode from 'qrcode.react';
import { RootState } from 'redux/store';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

interface IProps {}

const mapState = (state: RootState) => ({
    loading: state.loading.global,
    transactions: state.wallet.transactions,
    address: state.wallet.address,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mapDispatch = (_dispatch: Dispatch) => ({});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

type Props = IProps & StateProps & DispatchProps;

class Dashboard extends PureComponent<Props> {
    render(): JSX.Element {
        console.log(this.props);
        return (
            <div className="container-fluid p-4">
                <h3>Dashboard</h3>
                <div className="row g-4">
                    <Card className="p-2 col-6">
                        <div>
                            <h5 className="p-2">Wallet informations</h5>
                            <div className="d-inline-flex ms-2">
                                <QRCode value="https://surprise.io" />
                                <div className="ms-2">
                                    <h6>Address</h6>
                                    <p>{this.props.address}</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-2 col-6">
                        <div>
                            <h5 className="p-2">Current balance</h5>
                            <div className="d-flex justify-content-center align-items-center">
                                <h1>784.20 LUM</h1>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-2 col">
                        <div>
                            <h5 className="p-2">Latest Transactions</h5>
                            <TransactionsTable transactions={this.props.transactions} />
                        </div>
                    </Card>
                </div>
            </div>
        );
    }
}

export default connect(mapState, mapDispatch)(Dashboard);
