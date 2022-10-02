import { GetStaticProps } from "next";
import { LegacyRef, useState } from "react";
import Player from "../components/Player/Player";
import { PRIVATE_API, PUBLIC_API } from "../constants";
import { useObserver } from "../functions";
import classes from "../styles/pages/Home.module.scss";
import { ISnippet } from "../types";

export const getStaticProps: GetStaticProps = async () => {
	const { data } = await PRIVATE_API.get("snippets");

	return {
		props: data,
		revalidate: 1,
	};
};

const Homepage = (props) => {
	const [items, setItems] = useState<ISnippet[]>(props.items);

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
						<Player key={snippet.id} {...snippet} />
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
