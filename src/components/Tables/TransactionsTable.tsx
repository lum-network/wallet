import React from 'react';

import { useTranslation } from 'react-i18next';
import { LumConstants } from '@lum-network/sdk-javascript';

import { Table } from 'frontend-elements';
import { Transaction, Wallet } from 'models';
import { getExplorerLink, NumbersUtils, trunc } from 'utils';
import { SmallerDecimal, TransactionTypeBadge } from 'components';
import assets from 'assets';

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
                <a href={`${getExplorerLink()}/txs/${row.hash}`} target="_blank" rel="noreferrer">
                    {trunc(row.hash)}
                </a>
            </td>
            <td data-label={headers[1]}>
                <TransactionTypeBadge
                    type={row.messages[0]}
                    userAddress={wallet.getAddress()}
                    toAddress={row.toAddress}
                />
                {row.messages.length > 1 && (
                    <span className="ms-2 color-type round-tags">+{row.messages.length - 1}</span>
                )}
            </td>
            <td data-label={headers[2]}>
                {row.fromAddress && row.fromAddress.startsWith('lum') ? (
                    <a
                        href={`${getExplorerLink()}/${
                            row.fromAddress.includes(LumConstants.LumBech32PrefixValAddr) ? 'validators' : 'account'
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
                        href={`${getExplorerLink()}/${
                            row.toAddress.includes(LumConstants.LumBech32PrefixValAddr) ? 'validators' : 'account'
                        }/${row.toAddress}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {trunc(row.toAddress)}
                    </a>
                ) : row.messages.length > 1 ? (
                    '-'
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
                                              ? LumConstants.MicroLumDenom
                                              : row.amount[0].denom,
                                      }
                                    : {
                                          amount: '0',
                                          denom: LumConstants.LumDenom,
                                      },
                                true,
                            )}
                        />
                        <span className="ms-2">{LumConstants.LumDenom}</span>
                    </>
                ) : (
                    <a href={`${getExplorerLink()}/txs/${row.hash}`} rel="noreferrer" target="_blank">
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
