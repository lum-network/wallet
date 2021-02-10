import { Transaction } from 'models';
import React from 'react';

interface IProps {
    transactions: Transaction[];
}

interface RowProps {
    rows: Transaction[];
    headers: string[];
}

const TableBody = (props: RowProps): JSX.Element => {
    const { rows, headers } = props;

    const renderRow = (row: Transaction, headers: string[]) => {
        return (
            <tr key={row.id}>
                {headers.map((header, index) => {
                    return <td key={index}>{row[header]}</td>;
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
    console.log(props.transactions);
    if (props.transactions.length > 0) {
        const headers = Object.keys(props.transactions[0]);
        console.log(headers);
        return (
            <table className="table table-hover">
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
                <TableBody rows={props.transactions} headers={headers} />
            </table>
        );
    }
    return <div></div>;
};

export default TransactionsTable;
