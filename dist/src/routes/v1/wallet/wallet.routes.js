"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const express_validator_1 = require("express-validator");
//body validator
// const body = validatorer.body;
// validationResult function
// const validationResult = validatorer.validationResult;
const wallet_controller_1 = __importDefault(require("../../../controllers/wallet.controller"));
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const walletController = new wallet_controller_1.default();
// SEE WALLET BALANCE
router.get('/balance', auth_middleware_1.isAuthorized, walletController.getWalletBalance);
// FUND WALLET / DEPOSIT MONEY TO ACCOUNT
router.post('/deposit', auth_middleware_1.isAuthorized, (0, express_validator_1.body)("amount")
    .not()
    .isEmpty()
    .withMessage("amount is empty")
    .isNumeric()
    .withMessage("amount is not a number"), walletController.fundWallet);
// WITHDRAW MONEY FROM WALLET
// router.post('/withdraw', isAuthorized ,walletController.withdrawFromWallet);
// TRANSFER / SEND MONEY FROM ONE WALLET TO ANOTHER USER(WALLET), USIGN JUST THIER EMAIL
router.post('/transfer', auth_middleware_1.isAuthorized, (0, express_validator_1.body)("amount")
    .not()
    .isEmpty()
    .withMessage("amount is empty")
    .isNumeric()
    .withMessage("amount is not a number"), (0, express_validator_1.body)("reciever_email")
    .not()
    .isEmpty()
    .withMessage("email is empty")
    .isEmail()
    .withMessage("not a valid email"), walletController.transferMoney);
// TRANSACTION HISTORY
router.get('/history', auth_middleware_1.isAuthorized, walletController.transactionHistory);
// A Verify Transaction Webhook & Callback Url
router.get('/verify_transaction', walletController.verifyTransaction);
module.exports = router;
