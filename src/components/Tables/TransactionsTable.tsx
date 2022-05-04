import React from 'react';

import { useTranslation } from 'react-i18next';
import { LumConstants } from '@lum-network/sdk-javascript';

import { Table } from 'frontend-elements';
import { LUM_EXPLORER } from 'constant';
import { Transaction, Wallet } from 'models';
import { NumbersUtils, trunc } from 'utils';
import { SmallerDecimal, TransactionTypeBadge } from 'components';

interface TransactionsTableProps {
    transactions: Transaction[];
    wallet: Wallet;
}

interface RowProps {
    row: Transaction;
    wallet: Wallet;
    headers: string[];
}

const TransactionRow = (props: RowProps): JSX.Element => {
    const { row, wallet, headers } = props;

    return (
        <tr>
            <td data-label={headers[0]}>
                <a href={`${LUM_EXPLORER}/txs/${row.hash}`} target="_blank" rel="noreferrer">
                    {trunc(row.hash)}
                </a>
            </td>
            <td data-label={headers[1]}>
                <TransactionTypeBadge type={row.type} userAddress={wallet.getAddress()} toAddress={row.toAddress} />
            </td>
            <td data-label={headers[2]}>
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
            <td data-label={headers[3]} className="text-end">
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
            <td data-label={headers[4]} className="text-end">
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
            {/* 
            <td data-label={headers[5]} className="text-end">
                <div className="text-truncate">{row.time}</div>
            </td> */}
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
            //t('transactions.table.time'),
        ];

        const txs = [...props.transactions].sort((txA, txB) => (txA.height < txB.height ? 1 : -1));

        return (
            <Table head={headers}>
                {txs.map((tx, index) => (
                    <TransactionRow key={index} row={tx} wallet={props.wallet} headers={headers} />
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
            {t('dashboard.noTx')}
        </div>
    );
};

export default TransactionsTable;
