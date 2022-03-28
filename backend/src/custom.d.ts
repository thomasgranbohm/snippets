declare module Express {
	export interface Request {
		limit?: number;
		offset?: number;
	}
}
