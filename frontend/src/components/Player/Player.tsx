import clsx from "clsx";
import { useState } from "react";
import { PUBLIC_API } from "../../constants";
import { ISnippet } from "../../types";
import classes from "./Player.module.scss";

interface PlayerProps extends ISnippet {
	active: boolean;
	onClick: Function;
}

const Player = ({
	active,
	artist,
	bpm,
	duration,
	id,
	onClick,
	title,
}: PlayerProps) => {
	const [loading, setLoading] = useState<boolean>(false);
	const localOnClick = async () => {
		if (active) return onClick(id);

		setLoading(true);
		const resp = await PUBLIC_API.get("snippets/" + id + "/audio", {
			responseType: "arraybuffer",
		});
		const buffer = resp.data;
		setLoading(false);
		onClick(id, buffer);
	};

	return (
		<div
			className={clsx(
				classes["container"],
				active && classes["active"],
				loading && classes["loading"]
			)}
		>
			<div
				className={classes["image-container"]}
				style={
					{
						"--source": `url("${PUBLIC_API.defaults.baseURL}/snippets/${id}/image")`,
						"--duration": `${duration}ms`,
					} as React.CSSProperties
				}
			/>
			<button
				className={classes["button"]}
				onClick={localOnClick}
				aria-label="Play / Stop"
			></button>
			<h2 className={classes["title"]} title={title}>
				{title}
			</h2>
			<h3 className={classes["artist"]} title={artist}>
				{artist}
			</h3>
			<h4 className={classes["bpm"]}>{bpm} BPM</h4>
		</div>
	);
};

export default Player;
