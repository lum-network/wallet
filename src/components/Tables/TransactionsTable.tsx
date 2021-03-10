import React from 'react';
import { Link } from 'react-router-dom';

import { Table } from 'frontend-elements';
import { Transaction } from 'models';
import { toLocaleDateFormat } from 'utils';

interface TransactionsTableProps {
    transactions: Transaction[];
}

interface RowProps {
    row: Transaction;
}

const TransactionRow = (props: RowProps): JSX.Element => {
    const { row } = props;
    return (
        <tr>
            <td data-label="id">
                <Link to={`/transaction/${row.id}`}>{row.id}</Link>
            </td>
            <td data-label="date">
                <div className="text-truncate">{toLocaleDateFormat(row.date)}</div>
            </td>
            <td data-label="to">
                <div className="text-truncate">{row.to}</div>
            </td>
            <td data-label="from" className="text-end">
                <div className="text-truncate">{row.from}</div>
            </td>
            <td data-label="amount" className="text-end">
                <div className="text-truncate">{row.amount}</div>
            </td>
        </tr>
    );
};

const TransactionsTable = (props: TransactionsTableProps): JSX.Element => {
    if (props.transactions.length > 0) {
        const { transactions } = props;
        const headers = ['id', 'date', 'to', 'from', 'amount'];

        return (
            <Table head={headers}>
                {transactions.map((tx, index) => (
                    <TransactionRow key={index} row={tx} />
                ))}
            </Table>
        );
    }
    return <div />;
};

export default TransactionsTable;
