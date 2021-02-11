import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { RootState } from 'redux/store';
import { Card, TransactionsTable } from 'components';

interface IProps {}

const mapState = (state: RootState) => ({
    loading: state.loading.global,
    transactions: state.wallet.transactions,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mapDispatch = (_dispatch: Dispatch) => ({});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

type Props = IProps & StateProps & DispatchProps;

class Transactions extends PureComponent<Props> {
    render(): JSX.Element {
        return (
            <Card className="col">
                <h5 className="p-2">Latest Transactions</h5>
                <TransactionsTable transactions={this.props.transactions} />
            </Card>
        );
    }
}

export default connect(mapState, mapDispatch)(Transactions);
