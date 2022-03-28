import "dotenv/config";
import express from "express";
import { connect } from "./database";

// Routes
import SnippetRouter from "./routes/Snippet";

const server = express();

server.use(express.json());

// Routes
server.use("/snippets", SnippetRouter);

server.get("/", (_, res) => res.send("Hello, World!"));

const start = async () => {
	await connect();

	server.listen(process.env.PORT || 3000, () =>
		console.log("Started at %s.", new Date().toUTCString().substring(5, 25))
	);
};

start();
