import { User } from '../models/index.model';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Response, Request, NextFunction } from 'express';
import { StatusCodes } from "http-status-codes";
const status_codes = StatusCodes;


// Auth Middleware
export const isAuthorized = async (req: Request, res: Response, next: NextFunction) => {
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
            decoded = await jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        } catch (error) {
            return res.status(status_codes.UNAUTHORIZED).json({
                status: 'error',
                message: 'Invalid token',
                data: {}
            });
        }



        const userEmail = await decoded.email;

        // Check if user exists
        const user = await User.findOne({
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




    } catch (error) {
        console.log(error);
        res.status(status_codes.INTERNAL_SERVER_ERROR).json({
            status: 'error',
            message: 'Internal Server Error',
            data: {}
        });

    }
}
