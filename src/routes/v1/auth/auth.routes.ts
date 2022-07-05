
import express from "express";
const router = express.Router();
import validatorer from "express-validator";
import {body, validationResult} from "express-validator";
//body validator
// const body = validatorer.body;

// validationResult function
// const validationResult = validatorer.validationResult;

import AuthController from '../../../controllers/auth.controller';

const authController = new AuthController();


// REGISTER OR CREATE AN ACCOUNT 
router.post('/signup', 
body("name")
.isString()
.not()
.isEmpty()
.withMessage("Name is empty or invalid")
.toLowerCase(),
body("email")
.isEmail()
.not()
.isEmpty()
.withMessage("Email is empty or invalid")
.toLowerCase(),
body("password")
.isString()
.not()
.isEmpty()
.isLength({ min: 6 })
.withMessage("Password must be at least 6 characters long"), authController.createAccount);

// LOGIN TO ACCOUNT
router.post('/signin',
body("email")
.isEmail()
.not()
.isEmpty()
.withMessage("Email is empty or invalid")
.toLowerCase(),
body("password")
.isString()
.not()
.isEmpty()
.isLength({ min: 6 })
.withMessage("Password must be at least 6 characters long"),
authController.loginToAccount);

module.exports = router;
