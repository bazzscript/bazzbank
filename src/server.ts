import * as dotenv from "dotenv";
dotenv.config();
const app = require("./app");

import db from "./configs/database.config";


// Port Server Is running on
const PORT = process.env.PORT || 6000;
const isDev = process.env.NODE_ENV === 'development'

const StartServer = async () => {

    try {
        //Connect to Database Here
        await db.sync({ alter: isDev }).then(
            () => {
                console.log('connected to db');
            }
        );
        

        // Start Up The Server
        const server = app.listen(
            PORT,
            () => {
                console.log(`Bazz Bank Server running on ${process.env.NODE_ENV} mode on port ${PORT}`);
            }
        );

        //Handle unhandled promise rejections
        process.on('unhandledRejections', (error, promise) => {
            console.log(`Unhandled Server Error: ${error.message}`);
            //close server
            // server.close(() => process.exit(1));
        });

    } catch (error: any) {
        console.log(`Unhandled Server Error: ${error.message}`);

    }
}


StartServer();