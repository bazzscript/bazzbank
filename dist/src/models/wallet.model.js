"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const database_config_1 = __importDefault(require("../configs/database.config"));
const transaction_model_1 = __importDefault(require("./transaction.model"));
const Wallet = database_config_1.default.define('wallet', {
    id: {
        type: sequelize_1.default.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    withdrawable_balance: {
        type: sequelize_1.default.INTEGER,
        defaultValue: 0,
        // allowNull: false
    },
}, {});
// Relationships
// A wallet belongs to a user
// Wallet.belongsTo(User);
// A Wallet Has Multiple Transactions
Wallet.hasMany(transaction_model_1.default);
// Export Model
exports.default = Wallet;
