import React from 'react';

import { useTranslation } from 'react-i18next';
import { LUM_DENOM, LumBech32Prefixes, MICRO_LUM_DENOM } from '@lum-network/sdk-javascript';

import assets from 'assets';
import { SmallerDecimal, TransactionTypeBadge } from 'components';
import { Table } from 'frontend-elements';
import { Transaction, Wallet } from 'models';
import { NumbersUtils, DenomsUtils, trunc, getMillionsLink } from 'utils';
import { LUM_MINTSCAN_URL } from 'constant';

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

    const { t } = useTranslation();

    return (
        <tr>
            <td data-label={headers[0]}>
                <a href={`${LUM_MINTSCAN_URL}/tx/${row.hash}`} target="_blank" rel="noreferrer">
                    {trunc(row.hash)}
                </a>
            </td>
            <td data-label={headers[1]}>
                <TransactionTypeBadge type={row.messages[0]} userAddress={wallet.address} toAddress={row.toAddress} />
                {row.messages.length > 1 && (
                    <span className="ms-2 color-type round-tags">+{row.messages.length - 1}</span>
                )}
            </td>
            <td data-label={headers[2]}>
                {row.fromAddress && row.fromAddress.startsWith('lum') ? (
                    <a
                        href={`${LUM_MINTSCAN_URL}/${
                            row.fromAddress.includes(LumBech32Prefixes.VAL_ADDR) ? 'validators' : 'address'
                        }/${row.fromAddress}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {trunc(row.fromAddress)}
                    </a>
                ) : (
                    trunc(row.fromAddress || '-')
                )}
            </td>
            <td data-label={headers[3]} className="text-end">
                {row.toAddress && row.toAddress.startsWith('lum') && row.messages.length === 1 ? (
                    <a
                        href={`${LUM_MINTSCAN_URL}/${
                            row.toAddress.includes(LumBech32Prefixes.VAL_ADDR) ? 'validators' : 'address'
                        }/${row.toAddress}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {trunc(row.toAddress)}
                    </a>
                ) : row.messages.length > 1 ? (
                    '-'
                ) : row.toAddress.startsWith(t('transactions.pool')) ? (
                    <a
                        href={`${getMillionsLink()}/pools/details/${DenomsUtils.computeDenom(
                            row.amount[0].denom,
                        )}/${row.toAddress.replace(t('transactions.pool'), '')}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {row.toAddress}
                    </a>
                ) : row.toAddress.startsWith(t('transactions.proposal')) ? (
                    <a
                        href={`${LUM_MINTSCAN_URL}/proposals/${row.toAddress.replace(t('transactions.proposal'), '')}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {row.toAddress}
                    </a>
                ) : (
                    trunc(row.toAddress || '-')
                )}
            </td>
            <td data-label={headers[4]} className="text-end">
                {row.amount && row.amount[0] && row.messages.length === 1 ? (
                    <>
                        <SmallerDecimal
                            nb={NumbersUtils.formatUnit(
                                row.amount && row.amount[0]
                                    ? {
                                          amount: row.amount[0].amount,
                                          denom: row.amount[0].denom.startsWith('ibc')
                                              ? MICRO_LUM_DENOM
                                              : row.amount[0].denom,
                                      }
                                    : {
                                          amount: '0',
                                          denom: LUM_DENOM,
                                      },
                                true,
                            )}
                        />
                        <span className="ms-2">{DenomsUtils.computeDenom(row.amount[0].denom)}</span>
                    </>
                ) : (
                    <a href={`${LUM_MINTSCAN_URL}/tx/${row.hash}`} rel="noreferrer" target="_blank">
                        <span className="color-type me-1">{t('common.more')}</span>
                        <img src={assets.images.moreIcon} alt="more" />
                    </a>
                )}
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
