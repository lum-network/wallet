import React, { PureComponent } from 'react';
import QRCode from 'qrcode.react';
import { connect } from 'react-redux';
import ClipboardJS from 'clipboard';
import { Tooltip } from 'bootstrap';

import { Card, Modal, TransactionsTable } from 'components';
import { RootDispatch, RootState } from 'redux/store';
import { withTranslation, WithTranslation } from 'react-i18next';

interface IProps extends WithTranslation {}

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
    clipboard: ClipboardJS | null = null;

    componentDidMount() {
        this.clipboard = new ClipboardJS('#copy-btn');

        this.clipboard.on('success', () => {
            const btnEl = document.getElementById('copy-btn');
            if (btnEl) {
                const tooltip = new Tooltip(btnEl, { placement: 'bottom', title: 'Copied!' });
                tooltip.show();
            }
        });

        this.clipboard.on('error', (e) => {
            console.log(e);
        });
    }

    componentWillUnmount() {
        if (this.clipboard) {
            this.clipboard.destroy();
        }
    }
    render(): JSX.Element {
        const { t } = this.props;
        return (
            <>
                <div className="container-fluid">
                    <div className="row">
                        <h3 className="mt-4">{t('navbar.dashboard')}</h3>
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
                                            {ClipboardJS.isSupported() && (
                                                <button
                                                    type="button"
                                                    id="copy-btn"
                                                    className="btn btn-primary"
                                                    data-clipboard-text={this.props.address}
                                                >
                                                    Copy
                                                </button>
                                            )}
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

export default connect(mapState, mapDispatch)(withTranslation()(Dashboard));
