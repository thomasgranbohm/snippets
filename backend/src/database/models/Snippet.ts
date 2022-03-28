import {
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
}
