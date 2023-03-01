import { Snippet } from "database/models/Snippet";
import { Request, Response } from "express";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { resolve } from "path";
import mime from "mime-types";

export const stream = async (req: Request, res: Response, snippet: Snippet) => {
	const path = resolve(snippet.getPath(), "audio");
	const videoStat = await stat(path);
	const { size } = videoStat;

	const { range } = req.headers;

	if (range) {
		const parts = range.replace(/bytes=/, "").split("-");
		const start = parseInt(parts[0], 10);
		const end = parts[1] ? parseInt(parts[1], 10) : size - 1;

		const chunkSize = end - start + 1;

		res.writeHead(206, {
			"Content-Range": `bytes ${start}-${end}/${size}`,
			"Accept-Ranges": "bytes",
			"Content-Length": chunkSize,
			"Content-Type": snippet.mimetype,
		});

		createReadStream(path, { start, end }).pipe(res);
	} else {
		res.writeHead(200, {
			"Content-Length": size,
			"Content-Type": snippet.mimetype,
			"Content-Disposition": `attachment; filename="${snippet.artist} - ${
				snippet.title
			}.${mime.extension(snippet.mimetype)}"`,
		});

		return createReadStream(path).pipe(res);
	}
};
