import React from 'react';

import { Table } from 'frontend-elements';
import { Transaction } from 'models';
import { toLocaleDateFormat, trunc } from 'utils';
import { Namespace, Resources, TFunction, useTranslation } from 'react-i18next';
import { LUM_EXPLORER } from 'constant';

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
            <td data-label="Hash">
                <a href={`${LUM_EXPLORER}/txs/${row.hash}`}>{trunc(row.hash)}</a>
            </td>
            <td data-label="Date">
                <div className="text-truncate">{toLocaleDateFormat(row.time ? new Date(row.time) : new Date())}</div>
            </td>
            <td data-label={t('transactions.table.from')}>
                <div className="text-truncate">{trunc(row.fromAddress)}</div>
            </td>
            <td data-label={t('transactions.table.to')} className="text-end">
                <div className="text-truncate">{trunc(row.toAddress)}</div>
            </td>
            <td data-label={t('transactions.table.amount')} className="text-end">
                <div className="text-truncate">{row.amount && row.amount[0] ? row.amount[0].amount : 0}</div>
            </td>
        </tr>
    );
};

const TransactionsTable = (props: TransactionsTableProps): JSX.Element => {
    if (props.transactions.length > 0) {
        const { transactions } = props;
        const { t } = useTranslation();
        const headers = [
            'Hash',
            'Date',
            t('transactions.table.from'),
            t('transactions.table.to'),
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
