import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import RootNavigator from '../navigation';
import { RootDispatch, RootState } from '../redux/store';

interface IProps {}

const mapState = (state: RootState) => ({
    loading: state.loading.global,
    transactions: state.wallet.transactions,
    address: state.wallet.address,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mapDispatch = (_dispatch: RootDispatch) => ({});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

type Props = IProps & StateProps & DispatchProps;

class Core extends PureComponent<Props> {
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
        const { loading, transactions } = this.props;

        return (!transactions || !transactions.length) && loading ? this.renderLoading() : this.renderContent();
    }
}

export default connect(mapState, mapDispatch)(Core);
