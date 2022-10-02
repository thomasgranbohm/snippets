import clsx from "clsx";
import { useMemo } from "react";
import { PUBLIC_API } from "../../constants";
import { useListeningContext } from "../../contexts/ListeningContext";
import { ISnippet } from "../../types";
import classes from "./Player.module.scss";

interface PlayerProps extends ISnippet {}

const Player = ({ artist, bpm, duration, id, title }: PlayerProps) => {
	const { activeItem, loading, onClick } = useListeningContext();

	const isActive = useMemo(() => id === activeItem, [activeItem]);
	const isLoading = useMemo(() => isActive && loading, [isActive, loading]);

	return (
		<div
			className={clsx(
				classes["container"],
				isActive && classes["active"],
				isLoading && classes["loading"]
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
				onClick={() => onClick(id)}
				aria-label="Play / Stop"
			>
				<span className={"material-icons"}>
					{isLoading
						? "more_horiz"
						: isActive
						? "stop"
						: "play_arrow"}
				</span>
			</button>
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
