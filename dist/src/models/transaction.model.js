"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const database_config_1 = __importDefault(require("../configs/database.config"));
const withdrawal_model_1 = __importDefault(require("./withdrawal.model"));
const deposit_model_1 = __importDefault(require("./deposit.model"));
const transfer_model_1 = __importDefault(require("./transfer.model"));
const Transaction = database_config_1.default.define('transaction', {
    id: {
        type: sequelize_1.default.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: sequelize_1.default.INTEGER,
        allowNull: false
    },
    amount: {
        type: sequelize_1.default.INTEGER,
        allowNull: false
    },
    type: {
        type: sequelize_1.default.ENUM('transfer', 'withdrawal', 'deposit'),
        allowNull: false
    },
    trsf: {
        type: sequelize_1.default.STRING,
        allowNull: false
    },
    status: {
        type: sequelize_1.default.ENUM('pending', 'completed', 'failed'),
        allowNull: false
    },
    description: {
        type: sequelize_1.default.STRING,
        allowNull: false
    },
}, {});
// Relationships
// Transaction Has One Withdrawal
Transaction.hasOne(withdrawal_model_1.default);
// Transaction Has One Deposit
Transaction.hasOne(deposit_model_1.default);
// Transaction Has One Transfer
Transaction.hasOne(transfer_model_1.default);
// Export Model
exports.default = Transaction;
