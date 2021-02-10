export interface Transaction {
    id: string;
    to: string;
    from: string;
    amount: number;
    ticker: string;
    date: Date;
    [key: string]: string | number | Date;
}
