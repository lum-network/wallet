import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { WalletClient } from 'utils';
import RootNavigator from '../navigation';
import { RootState } from '../redux/store';

interface IProps {}

const mapState = (state: RootState) => ({
    loading: state.loading.global,
    transactions: state.wallet.transactions,
    wallet: state.wallet.currentWallet,
});

type StateProps = ReturnType<typeof mapState>;

type Props = IProps & StateProps;

class Core extends PureComponent<Props> {
    async componentDidMount() {
        await WalletClient.init();
    }

    renderContent(): JSX.Element {
        return <RootNavigator />;
    }

    renderLoading(): JSX.Element {
        return (
            <div className="spinner-grow" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        );
    }

    render(): JSX.Element {
        const { loading, wallet, transactions } = this.props;

        return (!wallet || !transactions || !transactions.length) && loading
            ? this.renderLoading()
            : this.renderContent();
    }
}

export default connect(mapState)(Core);
