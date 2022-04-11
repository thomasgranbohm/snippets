import "../styles/globals.scss";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";

function CustomApp({ Component, pageProps }: AppProps) {
	useEffect(() => {
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.register("/sw.js");
		}
	}, []);

	return (
		<>
			<Head>
				<title>Snippets</title>
			</Head>
			<Component {...pageProps} />
		</>
	);
}

export default CustomApp;
