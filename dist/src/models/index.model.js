"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transfer = exports.Deposit = exports.Withdrawal = exports.Transaction = exports.Wallet = exports.User = void 0;
const user_model_1 = __importDefault(require("./user.model"));
exports.User = user_model_1.default;
const wallet_model_1 = __importDefault(require("./wallet.model"));
exports.Wallet = wallet_model_1.default;
const transaction_model_1 = __importDefault(require("./transaction.model"));
exports.Transaction = transaction_model_1.default;
const withdrawal_model_1 = __importDefault(require("./withdrawal.model"));
exports.Withdrawal = withdrawal_model_1.default;
const deposit_model_1 = __importDefault(require("./deposit.model"));
exports.Deposit = deposit_model_1.default;
const transfer_model_1 = __importDefault(require("./transfer.model"));
exports.Transfer = transfer_model_1.default;
