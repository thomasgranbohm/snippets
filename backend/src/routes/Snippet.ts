import { Router } from "express";
import fs from "fs/promises";
import multer from "multer";
import { resolve } from "path";
import { createSnippet, Snippet } from "../database/models/Snippet";
import Paginator from "../middlewares/Paginator";
import { stream } from "../services/Streamer";

const FILE_TYPES = [
	"audio/wav",
	"audio/wave",
	"audio/ogg",
	"audio/mpeg",
	"audio/mpeg3",
];

const router = Router();

const upload = multer({
	dest: process.cwd() + "/uploads",
	fileFilter: (_, file, cb) => cb(null, FILE_TYPES.includes(file.mimetype)),
});

router.get("/", Paginator, async (req, res) => {
	const items = await Snippet.findAll({
		limit: req.limit,
		offset: req.offset,
		order: [["createdAt", "DESC"]],
		where: { ready: true },
	});

	return res.json({
		items,
		limit: req.limit || 10,
		offset: (req.offset || 0) + items.length,
	});
});

router.post("/", upload.single("audio"), async (req, res) => {
	if (!req.file)
		return res.status(400).jsonp({ error: "File not allowed or found." });

	const { title, artist, bpm } = req.body;

	if (!title || !artist || !bpm)
		return res.status(400).jsonp({ error: "Missing parameter" });

	if (!Number.isInteger(parseInt(bpm)))
		return res.status(400).jsonp({ error: "BPM is not a number" });

	const snippet = await createSnippet(artist, title, parseInt(bpm), req.file);

	return res.jsonp(snippet);
});

router.get("/:uuid", async (req, res) => {
	const snippet = await Snippet.findOne({
		where: { id: req.params.uuid, ready: true },
	});

	if (!snippet) return res.status(404).send("Not found.");

	return res.jsonp(snippet);
});

router.get("/:uuid/audio", async (req, res) => {
	const snippet = await Snippet.findOne({
		attributes: ["id", "mimetype"],
		where: { id: req.params.uuid, ready: true },
	});

	if (!snippet) return res.status(404).send("Not found.");

	return stream(
		req,
		res,
		resolve(snippet.getPath(), "audio"),
		snippet.mimetype
	);
});

router.get("/:uuid/image", async (req, res) => {
	const snippet = await Snippet.findOne({
		attributes: ["id", "mimetype"],
		where: { id: req.params.uuid, ready: true },
	});

	if (!snippet) return res.status(404).send("Not found.");

	return res
		.setHeader("Content-Type", "image/png")
		.sendFile(resolve(snippet.getPath(), "image"));
});

router.delete("/:uuid", async (req, res) => {
	await Snippet.destroy({ where: { id: req.params.uuid } });

	return res.status(200).send("Removed.");
});

export default router;
