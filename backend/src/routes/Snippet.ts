import { Router } from "express";
import multer from "multer";
import { resolve } from "path";
import { Snippet } from "../database/models/Snippet";
import Authorization from "../middlewares/Authorization";
import Paginator from "../middlewares/Paginator";
import { stream } from "../services/Streamer";

const FILE_TYPES = [
	"audio/wav",
	"audio/wave",
	"audio/x-wav",
	"audio/ogg",
	"audio/mpeg",
	"audio/mpeg3",
	"audio/flac",
	"audio/x-flac",
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
	const total = await Snippet.count({
		where: { ready: true },
	});

	return res.json({
		items,
		limit: req.limit || 10,
		offset: (req.offset || 0) + items.length,
		total,
	});
});

router.post("/", Authorization, upload.single("audio"), async (req, res) => {
	if (!req.file)
		return res.status(400).jsonp({ error: "File not allowed or found." });

	const { title, artist, bpm } = req.body;

	if (!title || !artist || !bpm)
		return res.status(400).jsonp({ error: "Missing parameter" });

	if (!Number.isInteger(parseInt(bpm)))
		return res.status(400).jsonp({ error: "BPM is not a number" });

	const snippet = new Snippet({ artist, title, bpm: parseInt(bpm) });

	res.status(201).jsonp(snippet);

	snippet.parseFile(req.file);
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
		attributes: ["id", "mimetype", "artist", "title"],
		where: { id: req.params.uuid, ready: true },
	});

	if (!snippet) return res.status(404).send("Not found.");

	return stream(req, res, snippet);
});

router.get("/:uuid/image", async (req, res) => {
	const snippet = await Snippet.findOne({
		attributes: ["id", "mimetype"],
		where: { id: req.params.uuid, ready: true },
	});

	if (!snippet) return res.status(404).send("Not found.");

	return res
		.setHeader("Content-Type", "image/svg+xml")
		.sendFile(resolve(snippet.getPath(), "image"));
});

router.put(
	"/:uuid",
	Authorization,
	upload.single("audio"),
	async (req, res) => {
		const snippet = await Snippet.findOne({
			where: { id: req.params.uuid, ready: true },
		});

		if (!snippet) return res.status(404).send("Not found.");

		const { title, artist, bpm } = req.body;

		if (bpm && !Number.isInteger(parseInt(bpm)))
			return res.status(400).jsonp({ error: "BPM is not a number" });

		if (title) snippet.title = title;
		if (artist) snippet.artist = artist;
		if (bpm) snippet.bpm = parseInt(bpm);

		await snippet.save();

		res.jsonp(snippet);

		if (req.file) {
			snippet.parseFile(req.file);
		}
	}
);

router.delete("/:uuid", Authorization, async (req, res) => {
	await Snippet.destroy({ where: { id: req.params.uuid } });

	return res.status(200).send("Removed.");
});

export default router;
