/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: false,
	async rewrites() {
		return [
			{
				source: "/api/audio/:uuid([a-zA-Z0-9\\_\\-\\.]+)",
				destination: "http://backend:1337/snippets/:uuid/audio",
			},
			{
				source: "/api/image/:uuid([a-zA-Z0-9\\_\\-\\.]+)",
				destination: "http://backend:1337/snippets/:uuid/image",
			},
		];
	},
};

module.exports = nextConfig;
