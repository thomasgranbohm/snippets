import { Head, Html, Main, NextScript } from "next/document";

const CustomDocument = () => (
	<Html>
		<Head>
			<meta charSet="UTF-8" />
			<meta
				name="viewport"
				content="width=device-width, initial-scale=1.0"
			/>
			<link rel="preconnect" href="https://fonts.googleapis.com" />
			<link
				rel="preconnect"
				href="https://fonts.gstatic.com"
				crossOrigin="true"
			/>
			<link
				href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;700&display=swap"
				rel="stylesheet"
			/>
		</Head>

		<body>
			<Main />
			<NextScript />
		</body>
	</Html>
);

export default CustomDocument;
