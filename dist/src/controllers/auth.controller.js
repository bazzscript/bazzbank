"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const status_codes = http_status_codes_1.StatusCodes;
const index_model_1 = require("../models/index.model");
const express_validator_1 = require("express-validator");
const database_config_1 = __importDefault(require("../configs/database.config"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
//body validator
// const body = validatorer.body;
// validationResult function
// const validationResult = validatorer.validationResult;
class AuthController {
    // REGISTER OR CREATE AN ACCOUNT 
    async createAccount(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(status_codes.BAD_REQUEST).json({
                status: 'error',
                message: errors.array(),
                data: {}
            });
        }
        const body = await req.body;
        try {
            // Hash Password Before Saving To The Database
            const hashedPassword = await bcrypt_1.default.hash(req.body.password, 10);
            // Check if user already exists in database
            const emailExits = await index_model_1.User.findOne({ where: { email: body.email } });
            if (emailExits) {
                return res.status(status_codes.BAD_REQUEST).json({
                    status: 'error',
                    message: 'Email already exists',
                    data: {}
                });
            }
            // Start a transaction
            const t = await database_config_1.default.transaction();
            try {
                // create a new user
                const user = await index_model_1.User.create({
                    name: body.name,
                    email: body.email,
                    password: hashedPassword,
                }, { transaction: t });
                // create a new wallet for the user
                const wallet = await index_model_1.Wallet.create({ userId: user.id }, { transaction: t });
                // commit the transaction
                await t.commit();
                console.log(user);
                console.log(wallet);
                // confirm user creation
                //  return success response
                return res.status(status_codes.OK).json({
                    status: 'success',
                    message: 'Account created successfully',
                    data: {
                        user: user,
                        wallet: wallet
                    }
                });
            }
            catch (error) {
                // If the execution reaches this line, an error was thrown.
                // We rollback the transaction.
                await t.rollback();
            }
        }
        catch (error) {
            console.log(error);
            return res.status(status_codes.INTERNAL_SERVER_ERROR).json({
                status: 'error',
                message: "Internal Server Error",
                data: {}
            });
        }
    }
    // LOGIN TO ACCOUNT
    async loginToAccount(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(status_codes.BAD_REQUEST).json({
                status: 'error',
                message: errors.array(),
                data: {}
            });
        }
        const body = await req.body;
        try {
            // Check if user already exists in database
            const user = await index_model_1.User.findOne({ where: { email: body.email } });
            if (!user) {
                return res.status(status_codes.BAD_REQUEST).json({
                    status: 'error',
                    message: 'Email does not exist',
                    data: {}
                });
            }
            // Check if password is correct
            const verifyPassword = await bcrypt_1.default.compare(body.password, user.password);
            if (!verifyPassword) {
                return res.status(status_codes.BAD_REQUEST).json({
                    status: 'error',
                    message: 'Password is incorrect',
                    data: {}
                });
            }
            const wallet = await index_model_1.Wallet.findOne({ where: { userId: user.id } });
            const token = jsonwebtoken_1.default.sign({
                email: user.email
            }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
            return res.status(status_codes.OK).json({
                status: 'success',
                message: "SignIn Successful",
                data: {
                    token: token,
                    user: user,
                    wallet: wallet
                }
            });
        }
        catch (error) {
            console.log(error);
            return res.status(status_codes.INTERNAL_SERVER_ERROR).json({
                status: 'error',
                message: "Internal Server Error",
                data: {}
            });
        }
    }
}
exports.default = AuthController;
