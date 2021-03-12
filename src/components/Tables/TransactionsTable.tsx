import React from 'react';
import { Link } from 'react-router-dom';

import { Table } from 'frontend-elements';
import { Transaction } from 'models';
import { toLocaleDateFormat, trunc } from 'utils';
import { Namespace, Resources, TFunction, useTranslation } from 'react-i18next';

interface TransactionsTableProps {
    transactions: Transaction[];
}

interface RowProps {
    row: Transaction;
    t: TFunction<Namespace<keyof Resources>>;
}

const TransactionRow = (props: RowProps): JSX.Element => {
    const { row, t } = props;
    return (
        <tr>
            <td data-label="Id">
                <Link to={`/transaction/${row.id}`}>{row.id}</Link>
            </td>
            <td data-label="Date">
                <div className="text-truncate">{toLocaleDateFormat(row.date)}</div>
            </td>
            <td data-label={t('transactions.table.to')}>
                <div className="text-truncate">{trunc(row.to)}</div>
            </td>
            <td data-label={t('transactions.table.from')} className="text-end">
                <div className="text-truncate">{trunc(row.from)}</div>
            </td>
            <td data-label={t('transactions.table.amount')} className="text-end">
                <div className="text-truncate">{row.amount}</div>
            </td>
        </tr>
    );
};

const TransactionsTable = (props: TransactionsTableProps): JSX.Element => {
    if (props.transactions.length > 0) {
        const { transactions } = props;
        const { t } = useTranslation();
        const headers = [
            'Id',
            'Date',
            t('transactions.table.to'),
            t('transactions.table.from'),
            t('transactions.table.amount'),
        ];

        return (
            <Table head={headers}>
                {transactions.map((tx, index) => (
                    <TransactionRow key={index} row={tx} t={t} />
                ))}
            </Table>
        );
    }
    return <div />;
};

export default TransactionsTable;
