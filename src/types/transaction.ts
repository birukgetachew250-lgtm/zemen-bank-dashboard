
export type TransactionType = 'P2P' | 'Bill Payment' | 'Airtime' | 'Merchant Payment' | 'Remittance';
export type TransactionStatus = 'Successful' | 'Failed' | 'Pending' | 'Reversed';
export type TransactionChannel = 'App' | 'USSD' | 'Agent' | 'EthSwitch';

export interface Transaction {
    id: string;
    timestamp: string;
    type: TransactionType;
    amount: number;
    fee: number;
    status: TransactionStatus;
    channel: TransactionChannel;
    from: {
        name: string;
        account: string;
    };
    to: {
        name: string;
        account: string;
    };
}
