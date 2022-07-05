"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const database_config_1 = __importDefault(require("../configs/database.config"));
const Deposit = database_config_1.default.define('deposit', {
    id: {
        type: sequelize_1.default.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    amount: {
        type: sequelize_1.default.DECIMAL(10, 2),
        allowNull: false
    },
    fees: {
        type: sequelize_1.default.DECIMAL(10, 2),
        defaultValue: 0,
        allowNull: true
    },
    type: {
        type: sequelize_1.default.ENUM('card_deposit', 'bank_deposit'),
        allowNull: false
    },
    destination_account: {
        type: sequelize_1.default.STRING,
        allowNull: false
    },
    source_card_number: {
        type: sequelize_1.default.STRING,
        allowNull: true
    },
    source_card_holder_name: {
        type: sequelize_1.default.STRING,
        allowNull: true
    }
}, {});
// Relationships
//Export Model
exports.default = Deposit;
