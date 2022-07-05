import helmet from 'helmet';
import express, { Application, Response, Request, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimiter from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import * as dotenv from "dotenv";
import { urlencoded } from 'body-parser';
dotenv.config();


module.exports = (app: Application) =>{
app.use(cors())
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  app.use(
    rateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit request from each IP to 100 requests per windowMs
    })
  );  

//Body Parser
app.use(express.json());
app.use(express.urlencoded({extended: true}))
//cookie parser
app.use(cookieParser());

app.use(hpp());

return app;

}