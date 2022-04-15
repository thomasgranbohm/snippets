import { Sequelize, SequelizeOptions } from "sequelize-typescript";
import { DATABASE } from "../constants";
import { Snippet } from "./models/Snippet";

const CONFIG: SequelizeOptions = {
	dialect: "postgres",
	host: DATABASE.HOST,
	port: DATABASE.PORT,
	database: DATABASE.NAME,
	username: DATABASE.USERNAME,
	password: DATABASE.PASSWORD,
	logging: process.env.NODE_ENV !== "production" && console.debug,
	models: [Snippet],
};

export const connect = async () => new Sequelize(CONFIG);
