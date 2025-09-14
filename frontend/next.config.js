/** @type {import('next').NextConfig} */
const nextConfig = {
	basePath: process.env.BASE_PATH,
	reactStrictMode: true,
	swcMinify: false,
	async rewrites() {
		return [
			{
				source: "/api/:path*",
				destination: "http://backend:1337/:path*",
			},
		];
	},
};

module.exports = nextConfig;
