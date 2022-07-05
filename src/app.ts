import * as dotenv from "dotenv";
dotenv.config();

import express from 'express';
import { Application, Response, Request, NextFunction } from "express";

import { StatusCodes } from "http-status-codes";
const status_codes = StatusCodes;

const app: Application = express();

require("./middlewares/pre-route.middleware")(app);



// ROUTES
app.use("/api", require("./routes/versions"));




// DEFUALT ROUTE
app.all("/",  (req: Request, res: Response, next: NextFunction) => {
    res.status(status_codes.OK).json({ 
      status: "success",
      message: `Welcome To The BAZZ BANK ${process.env.NODE_ENV} API`,
      data: {
        docs: "https://documenter.getpostman.com/view/15534491/UzJHRdqe"
      }
     });
  });
  

// NOT FOUND ROUTE
app.all("*", (req: Request, res: Response, next: NextFunction) => {
    res.status(status_codes.NOT_FOUND).json({
      status: "error",
      message: "Can't find ' " + req.originalUrl + " ' on this server",
      data:{}
    });
  });


module.exports = app;
