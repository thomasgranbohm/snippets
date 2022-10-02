import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";
import ListeningProvider from "../contexts/ListeningContext";
import "../styles/globals.scss";

function CustomApp({ Component, pageProps }: AppProps) {
	useEffect(() => {
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.register("/sw.js");
		}
	}, []);

	return (
		<ListeningProvider>
			<Head>
				<title>Snippets</title>
			</Head>
			<Component {...pageProps} />
		</ListeningProvider>
	);
}

export default CustomApp;
