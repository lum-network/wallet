import { Card, TransactionsTable } from 'components';
import React, { PureComponent } from 'react';
import QRCode from 'qrcode.react';
import { RootDispatch, RootState } from 'redux/store';
import { connect } from 'react-redux';

interface IProps {}

const mapState = (state: RootState) => ({
    loading: state.loading.global,
    transactions: state.wallet.transactions,
    balance: state.wallet.currentBalance,
    address: state.wallet.address,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mapDispatch = (_dispatch: RootDispatch) => ({});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

type Props = IProps & StateProps & DispatchProps;

class Dashboard extends PureComponent<Props> {
    render(): JSX.Element {
        return (
            <div className="container-fluid">
                <h3 className="mt-4">Dashboard</h3>
                <div className="row gx-4 mb-4">
                    <Card className="col-lg-6 col-12 text-truncate">
                        <h5 className="pt-2">Wallet informations</h5>
                        <div className="d-inline-flex ms-2">
                            <QRCode value="https://surprise.io" />
                            <div className="ms-2">
                                <h6>Address</h6>
                                <div>{this.props.address}</div>
                            </div>
                        </div>
                    </Card>
                    <Card className="col-lg-6 col-12">
                        <h5 className="pt-2">Current balance</h5>
                        <div className="d-flex justify-content-center align-items-center">
                            <h1>{`${this.props.balance} LUM`}</h1>
                        </div>
                    </Card>
                </div>
                <div className="row">
                    <Card className="col">
                        <h5 className="pt-2">Latest Transactions</h5>
                        <TransactionsTable transactions={this.props.transactions.slice(0, 5)} />
                    </Card>
                </div>
            </div>
        );
    }
}

export default connect(mapState, mapDispatch)(Dashboard);
