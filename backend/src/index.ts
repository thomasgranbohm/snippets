import cors from "cors";
import express from "express";
import { connect } from "./database";

// Routes
import SnippetRouter from "./routes/Snippet";

const server = express();

server.use(cors());
server.use(express.json());

// Routes
server.use("/snippets", SnippetRouter);

server.get("/", (_, res) => res.send("Hello, World!"));

const start = async () => {
	await connect();

	server.listen(1337, () =>
		console.log(
			"Started at %s.",
			new Date().toUTCString().substring(17, 25)
		)
	);
};

start();
