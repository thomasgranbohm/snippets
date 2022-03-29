import { NextFunction, Request, RequestHandler, Response } from "express";
import QueryString from "querystring";

const check = (
	v:
		| string
		| string[]
		| QueryString.ParsedUrlQuery
		| QueryString.ParsedUrlQuery[]
		| undefined,
	l: number,
	u: number | null = Number.MAX_SAFE_INTEGER
): false | number => {
	if (!v) return false;
	const a = parseInt(v.toString());

	if (!Number.isInteger(a)) {
		return false;
	} else if (a < l) {
		return false;
	} else if (u && a > u) {
		return false;
	}

	return a;
};

const Paginator: RequestHandler = (
	req: Request,
	_: Response,
	next: NextFunction
) => {
	req.offset = check(req.query["offset"] as string, 0) || 0;
	req.limit = check(req.query["limit"] as string, 0, 20) || 10;

	next();
};

export default Paginator;
