import validatorer from "express-validator";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
const status_codes = StatusCodes;
import { body, validationResult } from "express-validator";
import { UserT } from "../types/user.type";
// import Wallet from "../models/wallet.model";
import sequelize from '../configs/database.config';
import TransactionT from "../types/transaction.types";
import { Deposit, Transaction, User, Wallet } from "../models/index.model";
import DepositT from "../types/deposit.type";
import PaystackServices from "../services/paystack.services";
import _ from "lodash";
import { uniqueTrsfGenerator } from "../utils/unique_trsf_gen.utils";
import uuid4 from "uuid4";

const paystackServices = new PaystackServices();
//body validator
// const body = validatorer.body;

// validationResult function
// const validationResult = validatorer.validationResult;

class WalletController {


    //GET WALLET BALANCE
    async getWalletBalance(req: Request, res: Response) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(status_codes.BAD_REQUEST).json({
                status: 'error',
                message: errors.array(),
                data: {}
            });
        }
        const user = await req.body.user;

        try {
            const wallet = await Wallet.findOne({ where: { userId: user.id } }) as WalletT;
            const balance = wallet.withdrawable_balance;

            return res.status(status_codes.OK).json({
                status: 'success',
                message: 'Account Balance Retrieved Successfully',
                data: {
                    withdrawable_balance: balance
                }
            });
        } catch (error) {
            res.status(status_codes.INTERNAL_SERVER_ERROR).json({
                status: 'error',
                message: 'Internal Server Error',
                data: {}
            });

        }
    }


    // FUND WALLET / DEPOSIT MONEY TO ACCOUNT
    async fundWallet(req: Request, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(status_codes.BAD_REQUEST).json({
                status: 'error',
                message: errors.array(),
                data: {}
            });
        }
        var depositAmount: number = await req.body.amount as number;
        if (depositAmount <= 0) {
            return res.status(status_codes.BAD_REQUEST).json({
                status: 'error',
                message: 'Amount must be greater than 0',
                data: {}
            });
        }

        if (depositAmount >= 9000000) {
            return res.status(status_codes.BAD_REQUEST).json({
                status: 'error',
                message: 'Watch Your Spenfing!. Amount must be less than 9000000',
                data: {}
            });
        }



        const user = await req.body.user;
        var description: string = await req.body.description as string;
        if (!description) {
            description = 'Fund Wallet';
        }
        try {

            // Start A Transaction
            const t = await sequelize.transaction();
            try {
                // Find Wallet Attached To User
                const wallet = await Wallet.findOne({ where: { userId: user.id }, transaction: t }) as WalletT;

                // TODO initialise transaction with paystack and add reference number to trsf


                paystackServices.initializeDeposit(
                    user.email,
                    depositAmount,
                    async (error: any, body: any) => {

                        if (error) {
                            console.log(error);
                            return res.status(status_codes.INTERNAL_SERVER_ERROR).json({
                                status: 'error',
                                message: 'Internal Server Error',
                                data: {}
                            });
                        }

                        const response = await JSON.parse(body);
                        console.log('this is the body:' + body);
                        console.log('this is the response:' + response);

                        // Create Transaction
                        const transaction = await Transaction.create({
                            userId: user.id,
                            walletId: wallet.id,
                            amount: depositAmount,
                            type: 'deposit',
                            trsf: response.data.reference,
                            status: 'pending',
                            description: description as string,
                        }, { transaction: t }) as TransactionT;

                        // Create A Deposit
                        const deposit = await Deposit.create({
                            transactionId: transaction.id,
                            amount: transaction.amount,
                            type: 'card_deposit',
                            destination_account: user.email,
                            // source_card_number: ''

                        }, {
                            transaction: t
                        }) as DepositT;

                        // Commit The Transaction To Database
                        await t.commit();
                        res.status(status_codes.OK).json({
                            status: 'success',
                            message: 'Deposit Successfully Initialized, make a post request to /api/v1/wallet/verify to verify the deposit',
                            data: {
                                authorization_url: response.data.authorization_url,
                                transaction,
                                deposit_type: deposit.type,
                            }
                        });

                    }


                );





            } catch (error) {
                // If the execution reaches this line, an error was thrown.
                // We rollback the transaction.
                await t.rollback();
            }

        } catch (error) {
            res.status(status_codes.INTERNAL_SERVER_ERROR).json({
                status: 'error',
                message: 'Internal Server Error',
                data: {}
            });
        }

    }

    // A Verify Transaction Webhook & Callback Url
    async verifyTransaction(req: Request, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(status_codes.BAD_REQUEST).json({
                status: 'error',
                message: errors.array(),
                data: {}
            });
        }

        // const user = await req.body.user;
        const trsf = await req.query.reference as string;
        if (!trsf) {
            return res.status(status_codes.BAD_REQUEST).json({
                status: 'error',
                message: 'No Transaction Reference Provided',
                data: {}
            });
        }


        try {

            // Start A Transaction
            const t = await sequelize.transaction();
            try {

                // Find Transaction With Ref Number
                var transaction: TransactionT;
                try {
                    transaction = await Transaction.findOne({ where: { trsf: trsf }, transaction: t }) as TransactionT;
                    
                } catch (error) {
                    return res.status(status_codes.NOT_FOUND).json({
                        status: 'error',
                        message: 'Transaction With Given Ref Number Not Found',
                        data: {}
                    });
                }
                const user = await User.findOne({ where: { id: transaction.userId }, transaction: t }) as UserT;

                var type: string = 'transaction';
                if (transaction === 'deposit') {
                    type = 'transaction';
                }
                if (transaction === 'withdrawal') {
                    type = 'transfer';
                }

                if (transaction === 'transfer') {
                    return res.status(status_codes.NOT_ACCEPTABLE).json({
                        status: 'error',
                        message: 'Same Bank Transfer Currently Not Allowed To Be Verified With this API endpoint',
                        data: {}
                    });
                }

                console.log('TRANSACTION TYPE IS ' + type);

                paystackServices.verifyTransaction(
                    trsf,
                    type,
                    async (error: any, body: any) => {
                        if (error) {
                            console.log(error);
                            return res.status(status_codes.INTERNAL_SERVER_ERROR).json({
                                status: 'error',
                                message: 'Internal Server Error',
                                data: {}
                            });
                        }

                        const response = await JSON.parse(body);

                        // Get Transaction Amount
                        const transactionAmount = transaction.amount as number;

                        // If transaction has already been confirmed, return error
                        if (transaction.status === 'completed') {
                            return res.status(status_codes.BAD_REQUEST).json({
                                status: 'error',
                                message: 'Transaction Already Completed',
                                data: {}
                            });
                        }

                        // if transaction failed, return transaction failed and chamge transaction.status to failed
                        if (response.data.status === 'failed') {
                            await Transaction.update({
                                status: 'failed'
                            }, { where: { trsf: trsf }, transaction: t });

                            return res.status(status_codes.BAD_REQUEST).json({
                                status: 'error',
                                message: 'Transaction Failed',
                                data: {}
                            });
                        }

                        if (response.data.status === 'abandoned') {

                            return res.status(status_codes.BAD_REQUEST).json({
                                status: 'error',
                                message: 'Transaction Was Abondoned , i.e it has not been paid for, Please Try Again Or Pay',
                                data: {}
                            });
                        }

                        // Find Wallet And Get Current Amount
                        const wallet = await Wallet.findOne({ where: { userId: user.id }, transaction: t }) as WalletT;
                        // let updatedBalance;

                        if (transaction.type === 'deposit') {
                            // updatedBalance = wallet.withdrawable_balance as number + transactionAmount;

                            // Update users Wallet
                            await Wallet.update({
                                withdrawable_balance: wallet.withdrawable_balance as number + transactionAmount
                            }, {
                                where: { userId: user.id }, transaction: t
                            }) as WalletT;

                        }
                        if (transaction.type === 'withdrawal') {
                            // updatedBalance = await wallet.withdrawable_balance as number - transactionAmount;
                            // Update users Wallet
                            await Wallet.update({
                                withdrawable_balance: wallet.withdrawable_balance as number - transactionAmount
                            }, {
                                where: { userId: user.id },
                                transaction: t
                            }) as WalletT;
                        }


                        // Update Transaction Status
                        // let updatedTransaction;
                        if (transaction.status === 'pending') {
                            await Transaction.update({
                                status: 'completed',
                            }, { where: { trsf: trsf }, transaction: t }) as TransactionT;
                        };

                        // If All Goes Well Commit The Transaction and return success response
                        const updatedWallet = await Wallet.findOne({ where: { userId: user.id }, transaction: t }) as WalletT;
                        const updatedTransaction = await Transaction.findOne({ where: { trsf: trsf }, transaction: t }) as TransactionT;
                        await t.commit();
                        res.status(status_codes.OK).json({
                            status: 'success',
                            message: `${transaction.type} successfully verified and completed.`,
                            data: {
                                transaction: updatedTransaction,
                                wallet: updatedWallet,
                            }
                        });


                    }
                );


            } catch (error) {
                // If the execution reaches this line, an error was thrown.
                // We rollback the transaction.
                await t.rollback();
                res.status(status_codes.BAD_REQUEST).json({
                    status: 'error',
                    message: 'Error With Transaction Verification, Please Try Again',
                    data: {}
                });
            }



        } catch (error) {
            res.status(status_codes.INTERNAL_SERVER_ERROR).json({
                status: 'error',
                message: 'Internal Server Error',
                data: {}
            });
        }

    }

        // TRANSACTION HISTORY
     async transactionHistory(req: Request, res: Response) {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(status_codes.BAD_REQUEST).json({
                    status: 'error',
                    message: errors.array(),
                    data: {}
                });
            }
            const user = await req.body.user;
    
            try {
                const transactions = await Transaction.findAll({ where: { userId: user.id } }) as TransactionT;
                res.status(status_codes.OK).json({
                    status: 'success',
                    message: 'Transaction History',
                    data: {
                        transactions: transactions
                    }});
    
            }
            catch (error) {
                res.status(status_codes.INTERNAL_SERVER_ERROR).json({
                    status: 'error',
                    message: 'Internal Server Error',
                    data: {}
                });
            }
             }
    
     // TRANSFER / SEND MONEY FROM ONE WALLET TO ANOTHER USER(WALLET), USIGN JUST THIER EMAIL
    async transferMoney(req: Request, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(status_codes.BAD_REQUEST).json({
                status: 'error',
                message: errors.array(),
                data: {}
            });
        }
        const user = await req.body.user;
        const amountToSend: number = req.body.amount as number;
        const receiverEmail: string = req.body.reciever_email as string;
        if(amountToSend < 50){
            return res.status(status_codes.BAD_REQUEST).json({
                status: 'error',
                message: 'Minimum Transfer Amount is NGN50',
                data: {}
            });
        }

        try {
            // random number generator for transaction reference
            const trsf1 = uuid4();
            const trsf2 = uuid4();
            trsf1.toString();
            trsf2.toString();

            console.log('Trabsaction reference 1: ' + trsf1);
            console.log('Trabsaction reference 2: ' + trsf2);


            // Start Transaction
            const t = await sequelize.transaction();
            try {
                // retrieve sender wallet
                // Retrieve Recievers Wallet From Email
                var receiver: UserT;
                receiver = await User.findOne({ where: { email: receiverEmail }, transaction:t }) as UserT;
                if(!receiver){
                    res.status(status_codes.BAD_REQUEST).json({
                        status: 'error',
                        message: 'Receiver Email Not Found',
                        data: {}
                    });
                };
                const receiverWallet = await Wallet.findOne({ where: { userId: receiver.id }, transaction: t }) as WalletT;  
                const senderWallet = await Wallet.findOne({ where: { userId: user.id }, transaction: t }) as WalletT;

                // Confirm Sender Has Enough Balance To Send
                if(senderWallet.withdrawable_balance as number < amountToSend){
                    return res.status(status_codes.BAD_REQUEST).json({
                        status: 'error',
                        message: 'Insufficient Funds',
                        data: {}
                    });
                }
                
                            // Create Transaction
            const senderTransaction = await Transaction.create({
                userId: user.id,
                type: 'transfer',
                status: 'completed',
                amount: amountToSend,
                trsf: trsf1,
                description:`Transfer to ${receiverEmail}`
            }, { transaction: t }) as TransactionT;
            // Create Transaction
            const recieverTransaction = await Transaction.create({
                userId: receiver.id,
                type: 'transfer',
                status: 'completed',
                amount: amountToSend,
                trsf: trsf2,
                description: `Transfer From ${user.email}`
            }, { transaction: t }) as TransactionT;

            // Update Sender Wallet
            await Wallet.update({
                withdrawable_balance: senderWallet.withdrawable_balance as number - amountToSend
            }, {
                where: { userId: user.id },
                transaction: t
            }) as WalletT;


            // Update Reciever Wallet
            await Wallet.update({
                withdrawable_balance: receiverWallet.withdrawable_balance as number + amountToSend
            }, {
                where: { userId: receiver.id },
                transaction: t
            }) as WalletT;


            // Commit Transaction
            await t.commit();
            res.status(status_codes.OK).json({
                status: 'success',
                message:   `${amountToSend} NGN successfully transferred to ${receiverEmail}`,
            });
                
            } catch (error) {
                // If the execution reaches this line, an error was thrown.
                // We rollback the transaction.
                console.log(error);
                await t.rollback();
                res.status(status_codes.BAD_REQUEST).json({
                    status: 'error',
                    message: 'Error With Transaction, Please Try Again',
                    data: {}
                });
            }

        } catch (error) {
            res.status(status_codes.INTERNAL_SERVER_ERROR).json({
                status: 'error',
                message: 'Internal Server Error',
                data: {}
            });
        }
    }

    
    // WITHDRAW MONEY FROM WALLET
    // async withdrawFromWallet(req: Request, res: Response) {
    //     const errors = validationResult(req);
    //     if (!errors.isEmpty()) {
    //         return res.status(status_codes.BAD_REQUEST).json({
    //             status: 'error',
    //             message: errors.array(),
    //             data: {}
    //         });
    //     }
    //     return undefined;
    // }





}


export default WalletController;
function uuidv4(): any {
    throw new Error("Function not implemented.");
}

