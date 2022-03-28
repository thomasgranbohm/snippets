import { Router } from "express";
import Paginator from "../middlewares/Paginator";
import multer from "multer";
import { Snippet } from "../database/models/Snippet";

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
	const snippets = await Snippet.findAll();

	return res.json(snippets);
});

router.post("/", upload.single("audio"), async (req, res) => {
	if (!req.file)
		return res.status(400).jsonp({ error: "File not allowed or found." });

	const { title, artist } = req.body;

	if (!title || !artist)
		res.status(400).jsonp({ error: "Missing title or artist" });

	const snippet = new Snippet({ title, artist });
	await snippet.save();

	return res.jsonp(snippet);
});

export default router;
