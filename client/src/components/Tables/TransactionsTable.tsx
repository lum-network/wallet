import { Transaction } from 'models';
import React from 'react';

interface IProps {
    transactions: Transaction[];
}

interface RowProps {
    rows: Transaction[];
    headers: string[];
}

const TransactionsRows = (props: RowProps): JSX.Element => {
    const { rows, headers } = props;

    const renderRow = (row: Transaction, headers: string[]) => {
        return (
            <tr key={row.id}>
                {headers.map((header, index) => {
                    if (header === 'id') {
                        return (
                            <td key={index}>
                                <a className="link-primary" href={`/transaction/${row.id}`}>
                                    {row[header]}
                                </a>
                            </td>
                        );
                    }
                    return (
                        <td key={index}>
                            <div className="text-truncate">{row[header]}</div>
                        </td>
                    );
                })}
            </tr>
        );
    };

    return (
        <tbody>
            {rows.map((value) => {
                return renderRow(value, headers);
            })}
        </tbody>
    );
};

const TransactionsTable = (props: IProps): JSX.Element => {
    if (props.transactions.length > 0) {
        const headers = Object.keys(props.transactions[0]);

        return (
            <div className="table-responsive">
                <table className="table table-hover table-borderless table-striped">
                    <thead>
                        <tr>
                            {headers.map((header, index) => {
                                return (
                                    <th scope="col" key={index}>
                                        {header}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <TransactionsRows rows={props.transactions} headers={headers} />
                </table>
            </div>
        );
    }
    return <div />;
};

export default TransactionsTable;
