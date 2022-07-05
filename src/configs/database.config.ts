import * as dotenv from "dotenv";
dotenv.config();

import {Sequelize} from 'sequelize';

const db = new Sequelize(`${process.env.DATABASE_NAME}`, `${process.env.DATABASE_USERNAME}`, `${process.env.DATABASE_PASSWORD}`,  {
    dialect: "mysql",
    host: `${process.env.DATABASE_HOST}`,
})

export default db;