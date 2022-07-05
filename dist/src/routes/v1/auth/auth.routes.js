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
const auth_controller_1 = __importDefault(require("../../../controllers/auth.controller"));
const authController = new auth_controller_1.default();
// REGISTER OR CREATE AN ACCOUNT 
router.post('/signup', (0, express_validator_1.body)("name")
    .isString()
    .not()
    .isEmpty()
    .withMessage("Name is empty or invalid")
    .toLowerCase(), (0, express_validator_1.body)("email")
    .isEmail()
    .not()
    .isEmpty()
    .withMessage("Email is empty or invalid")
    .toLowerCase(), (0, express_validator_1.body)("password")
    .isString()
    .not()
    .isEmpty()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"), authController.createAccount);
// LOGIN TO ACCOUNT
router.post('/signin', (0, express_validator_1.body)("email")
    .isEmail()
    .not()
    .isEmpty()
    .withMessage("Email is empty or invalid")
    .toLowerCase(), (0, express_validator_1.body)("password")
    .isString()
    .not()
    .isEmpty()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"), authController.loginToAccount);
module.exports = router;
