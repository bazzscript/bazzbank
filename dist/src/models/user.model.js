"use strict";
// Define User Model For Sequelize
// Language: typescript
// Path: src\models\user.model.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
const database_config_1 = __importDefault(require("../configs/database.config"));
const wallet_model_1 = __importDefault(require("./wallet.model"));
const User = database_config_1.default.define('user', {
    id: {
        type: sequelize_1.default.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: sequelize_1.default.STRING,
        allowNull: false
    },
    email: {
        type: sequelize_1.default.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: sequelize_1.default.STRING,
        allowNull: false
    }
}, {
    // Soft Delete
    paranoid: true,
    // hooks: {
    //     beforeCreate: (user: any, options: any) => {
    //         user.password = bcrypt.hashSync(user.password, 10);
    //     }
    // }
});
// Relationships
// User has one wallet
User.hasOne(wallet_model_1.default);
//export model
exports.default = User;
