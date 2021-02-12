/* eslint-disable @typescript-eslint/no-unused-vars */
import { Card } from 'components';
import React from 'react';
import { connect, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { RootDispatch, RootState } from 'redux/store';

interface IProps {}

const mapState = (state: RootState) => ({
    loading: state.loading.models.wallet,
    address: state.wallet.address,
});

const mapDispatch = (_dispatch: RootDispatch) => ({});

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

type Props = IProps & StateProps & DispatchProps;

const TransactionDetails = (props: Props): JSX.Element => {
    const { txId } = useParams<{ txId: string }>();
    const transaction = useSelector((state: RootState) => state.wallet.transactions.find((tx) => tx.id === txId));

    if (transaction) {
        return (
            <div className="pt-4">
                <Card className="px-3 py-2">
                    <h4>Transaction</h4>
                    <p>{transaction.id}</p>
                    <p>{transaction.from}</p>
                    <p>{transaction.to}</p>
                    <p>
                        {transaction.amount + ' '}
                        <span>{transaction.ticker}</span>
                    </p>
                    <p>{transaction.date}</p>
                </Card>
            </div>
        );
    }

    return <div />;
};

export default connect(mapState, mapDispatch)(TransactionDetails);
