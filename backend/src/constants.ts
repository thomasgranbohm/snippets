export namespace DATABASE {
	export const HOST = process.env.DATABASE_HOST || "localhost";
	export const PORT = parseInt(process.env.DATABASE_PORT as string) || 5432;
	export const USERNAME = process.env.DATABASE_USERNAME || "admin";
	export const PASSWORD = process.env.DATABASE_PASSWORD || "password";
	export const NAME = process.env.DATABASE_NAME || "snippets";
	export const LOGGING = process.env.NODE_ENV !== "production";
}
