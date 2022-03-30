import "../styles/globals.scss";
import type { AppProps } from "next/app";
import Head from "next/head";

function CustomApp({ Component, pageProps }: AppProps) {
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
