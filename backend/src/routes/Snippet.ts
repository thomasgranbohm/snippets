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

	const { title, artist } = req.body;

	if (!title || !artist)
		res.status(400).jsonp({ error: "Missing title or artist" });

	const snippet = await createSnippet(artist, title, req.file);

	return res.jsonp(snippet);
});

router.get("/:uuid", async (req, res) => {
	const snippet = await Snippet.findOne({ where: { id: req.params.uuid } });

	if (!snippet) return res.status(404).send("Not found.");

	return res.jsonp(snippet);
});

router.get("/:uuid/audio", async (req, res) => {
	const snippet = await Snippet.findOne({
		attributes: ["id", "mimetype"],
		where: { id: req.params.uuid },
	});

	if (!snippet) return res.status(404).send("Not found.");

	return stream(
		req,
		res,
		resolve(process.cwd(), "snippets", snippet.id, "audio"),
		snippet.mimetype
	);
});

router.delete("/:uuid", async (req, res) => {
	await Snippet.destroy({ where: { id: req.params.uuid } });

	return res.status(200).send("Removed.");
});

export default router;
