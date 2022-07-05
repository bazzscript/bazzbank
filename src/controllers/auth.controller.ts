import validatorer from "express-validator";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
const status_codes = StatusCodes;
import { User, Wallet } from "../models/index.model";
import { body, validationResult } from "express-validator";
import sequelize from '../configs/database.config';
import { UserT } from "../types/user.type";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


//body validator
// const body = validatorer.body;

// validationResult function
// const validationResult = validatorer.validationResult;

class AuthController {

    // REGISTER OR CREATE AN ACCOUNT 
    async createAccount(req: Request, res: Response) {
        const errors = validationResult(req);
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
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            // Check if user already exists in database
            const emailExits = await User.findOne({ where: { email: body.email } });
            if (emailExits) {
                return res.status(status_codes.BAD_REQUEST).json({
                    status: 'error',
                    message: 'Email already exists',
                    data: {}
                });
            }


            // Start a transaction
            const t = await sequelize.transaction();
            try {
                // create a new user
                const user = await User.create({
                    name: body.name,
                    email: body.email,
                    password: hashedPassword,
                }, { transaction: t }) as UserT;
                // create a new wallet for the user
                const wallet = await Wallet.create({ userId: user.id }, { transaction: t }) as WalletT;
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

            } catch (error) {
                // If the execution reaches this line, an error was thrown.
                // We rollback the transaction.
                await t.rollback();
            }



        } catch (error) {
            console.log(error);
            return res.status(status_codes.INTERNAL_SERVER_ERROR).json({
                status: 'error',
                message: "Internal Server Error",
                data: {}
            });
        }




    }

    // LOGIN TO ACCOUNT
    async loginToAccount(req: Request, res: Response) {
        const errors = validationResult(req);
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
            const user = await User.findOne({ where: { email: body.email } }) as UserT;
            if (!user) {
                return res.status(status_codes.BAD_REQUEST).json({
                    status: 'error',
                    message: 'Email does not exist',
                    data: {}
                });
            }

            // Check if password is correct
            const verifyPassword = await bcrypt.compare(body.password, user.password as string);
            if (!verifyPassword) {
                return res.status(status_codes.BAD_REQUEST).json({
                    status: 'error',
                    message: 'Password is incorrect',
                    data: {}
                });
            }

            const wallet = await Wallet.findOne({ where: { userId: user.id } }) as WalletT;
            const token = jwt.sign({
                email: user.email
            }, process.env.JWT_SECRET as string, { expiresIn: process.env.JWT_EXPIRES_IN });


            return res.status(status_codes.OK).json({
                status: 'success',
                message: "SignIn Successful",
                data: {
                    token: token,
                    user: user,
                    wallet: wallet
                }
            });
        } catch (error) {

            console.log(error);
            return res.status(status_codes.INTERNAL_SERVER_ERROR).json({
                status: 'error',
                message: "Internal Server Error",
                data: {}
            });
        }
    }
}


export default AuthController