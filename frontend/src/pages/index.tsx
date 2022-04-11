import { GetStaticProps } from "next";
import { LegacyRef, useEffect, useState } from "react";
import Player from "../components/Player/Player";
import { PRIVATE_API, PUBLIC_API } from "../constants";
import { useObserver } from "../functions";
import classes from "../styles/pages/Home.module.scss";
import { ISnippet } from "../types";

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
	const [context, setContext] = useState<AudioContext>();
	const [node, setNode] = useState<AudioBufferSourceNode>();

	const onClick = async (uuid: string, buffer: ArrayBuffer | null = null) => {
		const c = context || new AudioContext();

		if (c.state === "suspended") {
			await c.resume();
		}

		if (node) {
			node.stop();
		}

		const play = (buffer: AudioBuffer) => {
			const localNode = c.createBufferSource();
			localNode.buffer = buffer;

			localNode.connect(c.destination);
			localNode.loop = true;
			localNode.start();

			setNode(localNode);
			setContext(c);
		};

		if (uuid !== activeItem && !!buffer) {
			c.decodeAudioData(buffer, play);
			setActiveItem(uuid);
		} else {
			setActiveItem(null);
		}
	};

	useEffect(() => {
		console.log("Updated AudioContext", context);
	}, [context]);

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
					{items.map((snippet) => (
						<Player
							key={snippet.id}
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
				<a href="https://github.com/thomasgranbohm/snippets">
					Source code
				</a>
			</footer>
		</main>
	);
};

export default Homepage;
