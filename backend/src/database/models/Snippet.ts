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
}

export async function createSnippet(
	artist: string,
	title: string,
	bpm: number,
	file: Express.Multer.File
): Promise<Snippet> {
	const snippet = new Snippet({
		title,
		artist,
		bpm,
		mimetype: file.mimetype,
	});

	// Move audio
	await fs.mkdir(snippet.getPath());
	await fs.cp(
		path.resolve(process.cwd(), "uploads", file.filename),
		path.resolve(snippet.getPath(), "audio")
	);
	await fs.rm(path.resolve(process.cwd(), "uploads", file.filename));

	// TODO: Create wave image

	snippet.ready = true;
	await snippet.save();

	return snippet;
}
