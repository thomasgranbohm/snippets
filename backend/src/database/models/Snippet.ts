import fs from "fs/promises";
import path from "path";
import {
	BeforeCreate,
	Column,
	DataType,
	Default,
	IsUUID,
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

	@Column(DataType.STRING)
	mimetype!: string;
}
export async function createSnippet(
	artist: string,
	title: string,
	file: Express.Multer.File
): Promise<Snippet> {
	const snippet = new Snippet({ title, artist, mimetype: file.mimetype });

	const { id } = snippet;

	const SNIPPET_PATH = path.resolve(process.cwd(), "snippets", id);

	// Move audio
	await fs.mkdir(SNIPPET_PATH);
	await fs.rename(
		path.resolve(process.cwd(), "uploads", file.filename),
		path.resolve(SNIPPET_PATH, "audio")
	);

	// TODO: Create wave image

	await snippet.save();

	return snippet;
}
