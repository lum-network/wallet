import React from 'react';

import { Namespace, Resources, TFunction, useTranslation } from 'react-i18next';

import { Table } from 'frontend-elements';
import { LUM_EXPLORER } from 'constant';
import { Transaction } from 'models';
import { toLocaleDateFormat, trunc } from 'utils';

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
                <a href={`${LUM_EXPLORER}/txs/${row.hash}`} target="_blank" rel="noreferrer">
                    {trunc(row.hash)}
                </a>
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
        const { t } = useTranslation();
        const headers = [
            'Hash',
            'Date',
            t('transactions.table.from'),
            t('transactions.table.to'),
            t('transactions.table.amount'),
        ];

        const txs = [...props.transactions].sort((txA, txB) => {
            const aDate = txA.time ? new Date(txA.time) : new Date();
            const bDate = txB.time ? new Date(txB.time) : new Date();

            return aDate < bDate ? 1 : -1;
        });

        return (
            <Table head={headers}>
                {txs.map((tx, index) => (
                    <TransactionRow key={index} row={tx} t={t} />
                ))}
            </Table>
        );
    }
    return (
        <div className="d-flex flex-column align-items-center p-5">
            <div className="bg-white rounded-circle align-self-center p-3 mb-3 shadow-sm">
                <div
                    className="btn-close mx-auto"
                    style={{
                        filter: 'brightness(0) invert(0.8)',
                    }}
                />
            </div>
            No transactions yet
        </div>
    );
};

export default TransactionsTable;
