import { Card, Modal, TransactionsTable } from 'components';
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
            <>
                <div className="container-fluid">
                    <div className="row">
                        <h3 className="mt-4">Dashboard</h3>
                        <div>
                            <div className="row gy-4">
                                <div className="col-lg-6 col-12">
                                    <div className="h-100 w-100">
                                        <Card>
                                            <h5 className="pt-2">Wallet informations</h5>
                                            <h6>Address</h6>
                                            <p className="text-truncate">{this.props.address}</p>
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                data-bs-toggle="modal"
                                                data-bs-target="#qrModal"
                                            >
                                                QR
                                            </button>
                                        </Card>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-12">
                                    <div className="h-100 w-100">
                                        <Card>
                                            <h5 className="pt-2">Current balance</h5>
                                            <div className="d-flex justify-content-center align-items-center">
                                                <h1>{`${this.props.balance} LUM`}</h1>
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="h-100 w-100">
                                        <Card>
                                            <h5 className="pt-2">Latest Transactions</h5>
                                            <TransactionsTable transactions={this.props.transactions.slice(0, 5)} />
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Modal id="qrModal">
                    <QRCode value="https://surprise.io" size={256} />
                </Modal>
            </>
        );
    }
}

export default connect(mapState, mapDispatch)(Dashboard);
