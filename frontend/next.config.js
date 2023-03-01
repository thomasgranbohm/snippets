/** @type {import('next').NextConfig} */
const nextConfig = {
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
