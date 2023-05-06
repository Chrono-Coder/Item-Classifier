import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
	return (
		<Html lang='en'>
			<Head />
			<title>Item Classifier</title>
			<meta name='description' content='Item Classifier' />
			<meta name='theme-color' content='#000000' />
			<meta
				name='viewport'
				content='width=device-width, initial-scale=1'
			/>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
