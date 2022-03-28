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
	logging: console.log,
	sync: { force: true },
	models: [Snippet],
};

export const connect = async () => {
	const db = new Sequelize(CONFIG);
	await db.sync();
};
