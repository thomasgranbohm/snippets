import axios from "axios";
import { GetStaticProps } from "next";
import { useEffect, useState } from "react";
import Player from "../components/Player/Player";
import { ISnippet } from "../types";
import classes from "../styles/Homepage.module.scss";

export const getStaticProps: GetStaticProps = async (context) => {
	const { data } = await axios.get("http://localhost:1337/snippets");

	console.log(data);

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

	return (
		<div className={classes["container"]}>
			<h1 className={classes["title"]}>Snippets</h1>
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
		</div>
	);
};

export default Homepage;
