declare module Express {
	export interface Request {
		limit?: number;
		offset?: number;
	}
}

declare module "web-audio-api";
