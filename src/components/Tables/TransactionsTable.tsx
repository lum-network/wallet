import React from 'react';

import { Namespace, Resources, TFunction, useTranslation } from 'react-i18next';

import { Table } from 'frontend-elements';
import { LUM_EXPLORER } from 'constant';
import { Transaction } from 'models';
import { NumbersUtils, trunc } from 'utils';
import { LumConstants, LumWallet } from '@lum-network/sdk-javascript';
import { SmallerDecimal, TransactionTypeBadge } from 'components';

interface TransactionsTableProps {
    transactions: Transaction[];
    wallet: LumWallet;
}

interface RowProps {
    row: Transaction;
    wallet: LumWallet;
    t: TFunction<Namespace<keyof Resources>>;
}

const TransactionRow = (props: RowProps): JSX.Element => {
    const { row, t, wallet } = props;

    return (
        <tr>
            <td data-label="Hash">
                <a href={`${LUM_EXPLORER}/txs/${row.hash}`} target="_blank" rel="noreferrer">
                    {trunc(row.hash)}
                </a>
            </td>
            <td data-label="Type">
                <TransactionTypeBadge type={row.type} userAddress={wallet.getAddress()} toAddress={row.toAddress} />
            </td>
            <td data-label={t('transactions.table.from')}>
                <a
                    href={`${LUM_EXPLORER}/${
                        row.fromAddress.includes(LumConstants.LumBech32PrefixValAddr) ? 'validators' : 'account'
                    }/${row.fromAddress}`}
                    target="_blank"
                    rel="noreferrer"
                >
                    {trunc(row.fromAddress)}
                </a>
            </td>
            <td data-label={t('transactions.table.to')} className="text-end">
                <a
                    href={`${LUM_EXPLORER}/${
                        row.toAddress.includes(LumConstants.LumBech32PrefixValAddr) ? 'validators' : 'account'
                    }/${row.toAddress}`}
                    target="_blank"
                    rel="noreferrer"
                >
                    {trunc(row.toAddress)}
                </a>
            </td>
            <td data-label={t('transactions.table.amount')} className="text-end">
                <SmallerDecimal
                    nb={NumbersUtils.formatUnit(
                        row.amount && row.amount[0]
                            ? row.amount[0]
                            : {
                                  amount: '0',
                                  denom: LumConstants.LumDenom,
                              },
                        true,
                    )}
                />
                <span className="ms-2">{LumConstants.LumDenom}</span>
            </td>
            <td data-label="Time" className="text-end">
                <div className="text-truncate">{row.time}</div>
            </td>
        </tr>
    );
};

const TransactionsTable = (props: TransactionsTableProps): JSX.Element => {
    const { t } = useTranslation();

    if (props.transactions.length > 0) {
        const headers = [
            'Hash',
            'Type',
            t('transactions.table.from'),
            t('transactions.table.to'),
            t('transactions.table.amount'),
            'Time',
        ];

        const txs = [...props.transactions].sort((txA, txB) => (txA.height < txB.height ? 1 : -1));

        return (
            <Table head={headers}>
                {txs.map((tx, index) => (
                    <TransactionRow key={index} row={tx} t={t} wallet={props.wallet} />
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
