"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const database_config_1 = __importDefault(require("../configs/database.config"));
const Withdrawal = database_config_1.default.define('withdrawal', {
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
        type: sequelize_1.default.ENUM('atm_withdrawal', 'bank_withdrawal'),
        allowNull: false
    },
}, {});
// Relationships
// Export Model
exports.default = Withdrawal;
