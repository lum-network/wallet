import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withTranslation, WithTranslation } from 'react-i18next';
import ClipboardJS from 'clipboard';
import QRCode from 'qrcode.react';
import { Tooltip } from 'bootstrap';
import { Redirect } from 'react-router';

import { Card } from 'frontend-elements';
import { Modal, TransactionsTable } from 'components';
import { RootDispatch, RootState } from 'redux/store';
import assets from 'assets';
import AddressCard from './components/AddressCard';

import './Dashboard.scss';

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
                const tooltip = new Tooltip(btnEl, { placement: 'bottom', title: 'Copied!', trigger: 'manual' });
                tooltip.show();
                setTimeout(() => tooltip.hide(), 1500);
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
        if (!this.props.address) {
            return <Redirect to="/welcome" />;
        }

        return (
            <>
                <div className="mt-4">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-5 col-12">
                                <AddressCard address={this.props.address} />
                            </div>
                            <div className="col-lg-5 col-12">
                                <Card withoutPadding className="h-100 dashboard-card balance-card p-4">
                                    <h2 className="ps-2 pt-3">{t('dashboard.currentBalance')}</h2>
                                    <div className="ps-2 my-3 d-flex flex-row align-items-baseline">
                                        <h1 className="display-6 fw-normal me-3">{this.props.balance}</h1>
                                        <img src={assets.images.lumTicker} width="57" height="28" />
                                    </div>
                                    <button type="button" className="ps-2 pb-2">
                                        <img src={assets.images.syncIcon} className="tint-white" />
                                    </button>
                                </Card>
                            </div>
                            <div className="col-lg-2 col-12">
                                <Card className="h-100 dashboard-card align-items-center text-center">
                                    <div className="twitter" />
                                    <h4>{t('dashboard.followTwitter')}</h4>
                                </Card>
                            </div>
                        </div>
                        {this.props.transactions.length > 0 && (
                            <div className="row mt-4">
                                <div className="col">
                                    <Card withoutPadding>
                                        <h2 className="ps-5 pt-5 pb-1">{t('dashboard.latestTx')}</h2>
                                        <TransactionsTable transactions={this.props.transactions.slice(0, 5)} />
                                    </Card>
                                </div>
                            </div>
                        )}
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
