/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: false,
	basePath: process.env.BASE_PATH || "/",
};

module.exports = nextConfig;
