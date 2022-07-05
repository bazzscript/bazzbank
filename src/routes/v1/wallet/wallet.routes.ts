import express from "express";
const router = express.Router();
import {body, validationResult} from "express-validator";


//body validator
// const body = validatorer.body;

// validationResult function
// const validationResult = validatorer.validationResult;


import WalletController from '../../../controllers/wallet.controller';
import { isAuthorized } from "../../../middlewares/auth.middleware";

const walletController = new WalletController()

// SEE WALLET BALANCE
router.get('/balance', isAuthorized ,walletController.getWalletBalance);


// FUND WALLET / DEPOSIT MONEY TO ACCOUNT
router.post('/deposit', 
isAuthorized,
body("amount")
.not()
.isEmpty()
.withMessage("amount is empty")
.isNumeric()
.withMessage("amount is not a number"),
walletController.fundWallet);

// WITHDRAW MONEY FROM WALLET
// router.post('/withdraw', isAuthorized ,walletController.withdrawFromWallet);

// TRANSFER / SEND MONEY FROM ONE WALLET TO ANOTHER USER(WALLET), USIGN JUST THIER EMAIL
router.post('/transfer', isAuthorized , 
body("amount")
.not()
.isEmpty()
.withMessage("amount is empty")
.isNumeric()
.withMessage("amount is not a number"),
body("reciever_email")
.not()
.isEmpty()
.withMessage("email is empty")
.isEmail()
.withMessage("not a valid email"),
walletController.transferMoney)

// TRANSACTION HISTORY
router.get('/history',isAuthorized , walletController.transactionHistory);

// A Verify Transaction Webhook & Callback Url
router.get('/verify_transaction', walletController.verifyTransaction)




module.exports = router;
