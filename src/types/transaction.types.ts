interface TransactionT {
    id?: number;
    userId?: number;
    walletId?: number;
    amount?: number;
    type?: string;
    trsf?:string;
    status?:string;
    description?:string;
    createdAt?: Date;
    updatedAt?: Date;
}

export default TransactionT;