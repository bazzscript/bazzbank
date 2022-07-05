"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthorized = void 0;
const index_model_1 = require("../models/index.model");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_status_codes_1 = require("http-status-codes");
const status_codes = http_status_codes_1.StatusCodes;
// Auth Middleware
const isAuthorized = async (req, res, next) => {
    try {
        // Confirm that the token is in the authorization header
        if (!req.headers.authorization) {
            return res.status(status_codes.UNAUTHORIZED).json({
                status: 'error',
                message: 'No token provided',
                data: {}
            });
        }
        const token = req.headers.authorization.split(' ')[1];
        if (token === 'null' || token === undefined) {
            return res.status(status_codes.UNAUTHORIZED).json({
                status: 'error',
                message: 'No token provided',
                data: {}
            });
        }
        // Verify the token
        let decoded;
        try {
            decoded = await jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch (error) {
            return res.status(status_codes.UNAUTHORIZED).json({
                status: 'error',
                message: 'Invalid token',
                data: {}
            });
        }
        const userEmail = await decoded.email;
        // Check if user exists
        const user = await index_model_1.User.findOne({
            where: { email: userEmail }
        });
        if (!user || user === null) {
            return res.status(status_codes.UNAUTHORIZED).json({
                status: 'error',
                message: 'Invalid token',
                data: {}
            });
        }
        req.body.user = user;
        next();
    }
    catch (error) {
        console.log(error);
        res.status(status_codes.INTERNAL_SERVER_ERROR).json({
            status: 'error',
            message: 'Internal Server Error',
            data: {}
        });
    }
};
exports.isAuthorized = isAuthorized;
