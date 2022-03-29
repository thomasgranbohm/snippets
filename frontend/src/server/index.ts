import { createServer } from "http";
import next from "next";
import { parse } from "url";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
	createServer(async (req, res) => {
		try {
			const parsedUrl = parse(req.url || "", true);
			const { pathname } = parsedUrl;

			if (!pathname?.includes("/v1/")) {
				await handle(req, res, parsedUrl);
			}
		} catch (err) {
			console.error("Error occurred handling", req.url, err);
			res.statusCode = 500;
			res.end("internal server error");
		}
	}).listen(port, () => {
		console.log(`> Ready on http://${hostname}:${port}`);
	});
});
