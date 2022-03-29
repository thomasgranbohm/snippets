import axios from "axios";
import { GetStaticProps } from "next";
import { LegacyRef, useEffect, useState } from "react";
import Player from "../components/Player/Player";
import { ISnippet } from "../types";
import classes from "../styles/Homepage.module.scss";
import { useObserver } from "../functions";
import { PRIVATE_API, PUBLIC_API } from "../constants";

export const getStaticProps: GetStaticProps = async (context) => {
	const { data } = await PRIVATE_API.get("snippets");

	return {
		props: data,
		revalidate: 1,
	};
};

const Homepage = (props) => {
	const [items, setItems] = useState<ISnippet[]>(props.items);
	const [activeItem, setActiveItem] = useState<string | null>(null);
	const [node, setNode] = useState<AudioBufferSourceNode>();
	const [context, setContext] = useState<AudioContext>();

	const play = (buffer: AudioBuffer) => {
		if (!context) return;

		const localNode = context.createBufferSource();
		localNode.buffer = buffer;

		localNode.connect(context.destination);
		localNode.loop = true;
		localNode.start();

		setNode(localNode);
	};

	const onClick = async (
		uuid: string,
		buffer: ArrayBuffer | undefined = undefined
	) => {
		if (!context) return;

		if (node) {
			node.stop();
		}

		if (uuid !== activeItem && !!buffer) {
			context.decodeAudioData(buffer, play);
			setActiveItem(uuid);
		} else {
			setActiveItem(null);
		}
	};

	useEffect(() => {
		setContext(new AudioContext());
	}, []);

	const [ref, shouldStop] = useObserver(
		async () => {
			const { data } = await PUBLIC_API.get("snippets", {
				params: {
					offset: items.length,
				},
			});
			setItems([...items, ...data.items]);
		},
		{ shouldStop: items.length >= props.total }
	);

	return (
		<main className={classes["container"]}>
			<header className={classes["header"]}>
				<h1 className={classes["title"]}>Snippets</h1>
			</header>
			<article>
				<div className={classes["players"]}>
					{items.map((snippet, key) => (
						<Player
							key={key}
							active={activeItem === snippet.id}
							onClick={onClick}
							{...snippet}
						/>
					))}
				</div>
				{!shouldStop && (
					<div
						ref={ref as LegacyRef<HTMLDivElement>}
						style={{
							display: "flex",
							justifyContent: "center",
							padding: "2rem",
							width: "100%",
						}}
					>
						Loading...
					</div>
				)}
			</article>
			<footer className={classes["footer"]}>
				<a href="https://github.com/thomasgranbohm/snippet">
					Source code
				</a>
			</footer>
		</main>
	);
};

export default Homepage;
