import { createCanvas } from "canvas";
import { constants } from "fs";
import fs from "fs/promises";
import path from "path";
import {
	BeforeDestroy,
	Column,
	DataType,
	Default,
	IsUUID,
	Max,
	Min,
	Model,
	PrimaryKey,
	Table,
} from "sequelize-typescript";
import { AudioContext } from "web-audio-api";

@Table({
	timestamps: true,
})
export class Snippet extends Model {
	@IsUUID(4)
	@PrimaryKey
	@Default(DataType.UUIDV4)
	@Column(DataType.UUID)
	id!: string;

	@Column(DataType.STRING)
	artist!: string;

	@Column(DataType.STRING)
	title!: string;

	@Max(1024)
	@Min(0)
	@Column(DataType.INTEGER)
	bpm!: number;

	@Column(DataType.FLOAT)
	duration?: number;

	@Column(DataType.STRING)
	mimetype!: string;

	@Default(false)
	@Column(DataType.BOOLEAN)
	ready!: boolean;

	// TODO: Does not work.
	@BeforeDestroy
	static async removeDirectory(instance: Snippet) {
		console.log("Removing directory", instance.getPath());
		await fs.rm(instance.getPath(), { force: true, recursive: true });
	}

	getPath() {
		return path.resolve(process.cwd(), "snippets", this.id);
	}

	async parseFile(file: Express.Multer.File): Promise<Snippet> {
		this.mimetype = file.mimetype;

		try {
			await fs.access(this.getPath(), constants.R_OK | constants.W_OK);
			// Directory exists
		} catch (error) {
			// Directory doesn't exist
		}

		// Move audio
		await fs.mkdir(this.getPath());
		await fs.cp(
			path.resolve(process.cwd(), "uploads", file.filename),
			path.resolve(this.getPath(), "audio"),
			{
				force: true,
			}
		);
		await fs.rm(path.resolve(process.cwd(), "uploads", file.filename));

		// Create wave image
		const context = new AudioContext();
		const buffer = Buffer.from(
			await fs.readFile(path.resolve(this.getPath(), "audio"), "binary"),
			"binary"
		);

		const audioBuffer: AudioBuffer = await new Promise((res) =>
			context.decodeAudioData(buffer, (b: AudioBuffer) => res(b))
		);
		this.duration = parseFloat((audioBuffer.duration * 1e3).toFixed(4));
		const imageBuffer = await generateImage(audioBuffer);

		await fs.writeFile(path.resolve(this.getPath(), "image"), imageBuffer);

		this.ready = true;
		await this.save();

		return this;
	}
}

const generateImage = (buffer: AudioBuffer): Buffer => {
	const peaks = buffer.getChannelData(0);

	const canvas = createCanvas(1024, 512, "svg");
	const c = canvas.getContext("2d");

	const steps = 2 ** 6;

	const bps = peaks.length / steps;
	const xs = canvas.width / steps;

	const highest = peaks.map(Math.abs).reduce((a, b) => (a > b ? a : b), 0);

	c.fillStyle = "#707070";
	for (let i = 0; i <= steps; i += 1) {
		const bufferStart = bps * i;
		const slice = peaks.slice(bufferStart, bufferStart + bps).map(Math.abs);
		const sum = slice.reduce((p, c) => c + p, 0) / bps;

		const h = (sum / highest) * (canvas.height * 2);

		const x = xs * i,
			y = (canvas.height - h) / 2;

		c.rect(x, y, xs * 0.8, h);
	}
	c.fill();

	return canvas.toBuffer();
};
