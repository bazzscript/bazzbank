"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const status_codes = http_status_codes_1.StatusCodes;
const express_validator_1 = require("express-validator");
// import Wallet from "../models/wallet.model";
const database_config_1 = __importDefault(require("../configs/database.config"));
const index_model_1 = require("../models/index.model");
const paystack_services_1 = __importDefault(require("../services/paystack.services"));
const uuid4_1 = __importDefault(require("uuid4"));
const paystackServices = new paystack_services_1.default();
//body validator
// const body = validatorer.body;
// validationResult function
// const validationResult = validatorer.validationResult;
class WalletController {
    //GET WALLET BALANCE
    async getWalletBalance(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(status_codes.BAD_REQUEST).json({
                status: 'error',
                message: errors.array(),
                data: {}
            });
        }
        const user = await req.body.user;
        try {
            const wallet = await index_model_1.Wallet.findOne({ where: { userId: user.id } });
            const balance = wallet.withdrawable_balance;
            return res.status(status_codes.OK).json({
                status: 'success',
                message: 'Account Balance Retrieved Successfully',
                data: {
                    withdrawable_balance: balance
                }
            });
        }
        catch (error) {
            res.status(status_codes.INTERNAL_SERVER_ERROR).json({
                status: 'error',
                message: 'Internal Server Error',
                data: {}
            });
        }
    }
    // FUND WALLET / DEPOSIT MONEY TO ACCOUNT
    async fundWallet(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(status_codes.BAD_REQUEST).json({
                status: 'error',
                message: errors.array(),
                data: {}
            });
        }
        var depositAmount = await req.body.amount;
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
        var description = await req.body.description;
        if (!description) {
            description = 'Fund Wallet';
        }
        try {
            // Start A Transaction
            const t = await database_config_1.default.transaction();
            try {
                // Find Wallet Attached To User
                const wallet = await index_model_1.Wallet.findOne({ where: { userId: user.id }, transaction: t });
                // TODO initialise transaction with paystack and add reference number to trsf
                paystackServices.initializeDeposit(user.email, depositAmount, async (error, body) => {
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
                    const transaction = await index_model_1.Transaction.create({
                        userId: user.id,
                        walletId: wallet.id,
                        amount: depositAmount,
                        type: 'deposit',
                        trsf: response.data.reference,
                        status: 'pending',
                        description: description,
                    }, { transaction: t });
                    // Create A Deposit
                    const deposit = await index_model_1.Deposit.create({
                        transactionId: transaction.id,
                        amount: transaction.amount,
                        type: 'card_deposit',
                        destination_account: user.email,
                        // source_card_number: ''
                    }, {
                        transaction: t
                    });
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
                });
            }
            catch (error) {
                // If the execution reaches this line, an error was thrown.
                // We rollback the transaction.
                await t.rollback();
            }
        }
        catch (error) {
            res.status(status_codes.INTERNAL_SERVER_ERROR).json({
                status: 'error',
                message: 'Internal Server Error',
                data: {}
            });
        }
    }
    // A Verify Transaction Webhook & Callback Url
    async verifyTransaction(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(status_codes.BAD_REQUEST).json({
                status: 'error',
                message: errors.array(),
                data: {}
            });
        }
        // const user = await req.body.user;
        const trsf = await req.query.reference;
        if (!trsf) {
            return res.status(status_codes.BAD_REQUEST).json({
                status: 'error',
                message: 'No Transaction Reference Provided',
                data: {}
            });
        }
        try {
            // Start A Transaction
            const t = await database_config_1.default.transaction();
            try {
                // Find Transaction With Ref Number
                var transaction;
                try {
                    transaction = await index_model_1.Transaction.findOne({ where: { trsf: trsf }, transaction: t });
                }
                catch (error) {
                    return res.status(status_codes.NOT_FOUND).json({
                        status: 'error',
                        message: 'Transaction With Given Ref Number Not Found',
                        data: {}
                    });
                }
                const user = await index_model_1.User.findOne({ where: { id: transaction.userId }, transaction: t });
                var type = 'transaction';
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
                paystackServices.verifyTransaction(trsf, type, async (error, body) => {
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
                    const transactionAmount = transaction.amount;
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
                        await index_model_1.Transaction.update({
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
                    const wallet = await index_model_1.Wallet.findOne({ where: { userId: user.id }, transaction: t });
                    // let updatedBalance;
                    if (transaction.type === 'deposit') {
                        // updatedBalance = wallet.withdrawable_balance as number + transactionAmount;
                        // Update users Wallet
                        await index_model_1.Wallet.update({
                            withdrawable_balance: wallet.withdrawable_balance + transactionAmount
                        }, {
                            where: { userId: user.id }, transaction: t
                        });
                    }
                    if (transaction.type === 'withdrawal') {
                        // updatedBalance = await wallet.withdrawable_balance as number - transactionAmount;
                        // Update users Wallet
                        await index_model_1.Wallet.update({
                            withdrawable_balance: wallet.withdrawable_balance - transactionAmount
                        }, {
                            where: { userId: user.id },
                            transaction: t
                        });
                    }
                    // Update Transaction Status
                    // let updatedTransaction;
                    if (transaction.status === 'pending') {
                        await index_model_1.Transaction.update({
                            status: 'completed',
                        }, { where: { trsf: trsf }, transaction: t });
                    }
                    ;
                    // If All Goes Well Commit The Transaction and return success response
                    const updatedWallet = await index_model_1.Wallet.findOne({ where: { userId: user.id }, transaction: t });
                    const updatedTransaction = await index_model_1.Transaction.findOne({ where: { trsf: trsf }, transaction: t });
                    await t.commit();
                    res.status(status_codes.OK).json({
                        status: 'success',
                        message: `${transaction.type} successfully verified and completed.`,
                        data: {
                            transaction: updatedTransaction,
                            wallet: updatedWallet,
                        }
                    });
                });
            }
            catch (error) {
                // If the execution reaches this line, an error was thrown.
                // We rollback the transaction.
                await t.rollback();
                res.status(status_codes.BAD_REQUEST).json({
                    status: 'error',
                    message: 'Error With Transaction Verification, Please Try Again',
                    data: {}
                });
            }
        }
        catch (error) {
            res.status(status_codes.INTERNAL_SERVER_ERROR).json({
                status: 'error',
                message: 'Internal Server Error',
                data: {}
            });
        }
    }
    // TRANSACTION HISTORY
    async transactionHistory(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(status_codes.BAD_REQUEST).json({
                status: 'error',
                message: errors.array(),
                data: {}
            });
        }
        const user = await req.body.user;
        try {
            const transactions = await index_model_1.Transaction.findAll({ where: { userId: user.id } });
            res.status(status_codes.OK).json({
                status: 'success',
                message: 'Transaction History',
                data: {
                    transactions: transactions
                }
            });
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
    async transferMoney(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(status_codes.BAD_REQUEST).json({
                status: 'error',
                message: errors.array(),
                data: {}
            });
        }
        const user = await req.body.user;
        const amountToSend = req.body.amount;
        const receiverEmail = req.body.reciever_email;
        if (amountToSend < 50) {
            return res.status(status_codes.BAD_REQUEST).json({
                status: 'error',
                message: 'Minimum Transfer Amount is NGN50',
                data: {}
            });
        }
        try {
            // random number generator for transaction reference
            const trsf1 = (0, uuid4_1.default)();
            const trsf2 = (0, uuid4_1.default)();
            trsf1.toString();
            trsf2.toString();
            console.log('Trabsaction reference 1: ' + trsf1);
            console.log('Trabsaction reference 2: ' + trsf2);
            // Start Transaction
            const t = await database_config_1.default.transaction();
            try {
                // retrieve sender wallet
                // Retrieve Recievers Wallet From Email
                var receiver;
                receiver = await index_model_1.User.findOne({ where: { email: receiverEmail }, transaction: t });
                if (!receiver) {
                    res.status(status_codes.BAD_REQUEST).json({
                        status: 'error',
                        message: 'Receiver Email Not Found',
                        data: {}
                    });
                }
                ;
                const receiverWallet = await index_model_1.Wallet.findOne({ where: { userId: receiver.id }, transaction: t });
                const senderWallet = await index_model_1.Wallet.findOne({ where: { userId: user.id }, transaction: t });
                // Confirm Sender Has Enough Balance To Send
                if (senderWallet.withdrawable_balance < amountToSend) {
                    return res.status(status_codes.BAD_REQUEST).json({
                        status: 'error',
                        message: 'Insufficient Funds',
                        data: {}
                    });
                }
                // Create Transaction
                const senderTransaction = await index_model_1.Transaction.create({
                    userId: user.id,
                    type: 'transfer',
                    status: 'completed',
                    amount: amountToSend,
                    trsf: trsf1,
                    description: `Transfer to ${receiverEmail}`
                }, { transaction: t });
                // Create Transaction
                const recieverTransaction = await index_model_1.Transaction.create({
                    userId: receiver.id,
                    type: 'transfer',
                    status: 'completed',
                    amount: amountToSend,
                    trsf: trsf2,
                    description: `Transfer From ${user.email}`
                }, { transaction: t });
                // Update Sender Wallet
                await index_model_1.Wallet.update({
                    withdrawable_balance: senderWallet.withdrawable_balance - amountToSend
                }, {
                    where: { userId: user.id },
                    transaction: t
                });
                // Update Reciever Wallet
                await index_model_1.Wallet.update({
                    withdrawable_balance: receiverWallet.withdrawable_balance + amountToSend
                }, {
                    where: { userId: receiver.id },
                    transaction: t
                });
                // Commit Transaction
                await t.commit();
                res.status(status_codes.OK).json({
                    status: 'success',
                    message: `${amountToSend} NGN successfully transferred to ${receiverEmail}`,
                });
            }
            catch (error) {
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
        }
        catch (error) {
            res.status(status_codes.INTERNAL_SERVER_ERROR).json({
                status: 'error',
                message: 'Internal Server Error',
                data: {}
            });
        }
    }
}
exports.default = WalletController;
function uuidv4() {
    throw new Error("Function not implemented.");
}
