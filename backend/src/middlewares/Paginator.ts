import { NextFunction, Request, RequestHandler, Response } from "express";
import QueryString from "querystring";

const check = (
	variable:
		| string
		| string[]
		| QueryString.ParsedUrlQuery
		| QueryString.ParsedUrlQuery[]
		| undefined,
	lower: number,
	upper: number | null = Number.MAX_SAFE_INTEGER
) => {
	if (!variable) return false;
	const a = parseInt(variable.toString());

	if (!Number.isInteger(a)) {
		return false;
	} else if (a < lower) {
		return false;
	} else if (upper && a > upper) {
		return false;
	}

	return true;
};

const Paginator: RequestHandler = (
	req: Request,
	_: Response,
	next: NextFunction
) => {
	if (!check(req.query["offset"] as string, 0)) {
		req.offset = 0;
	}

	if (!check(req.query["limit"] as string, 0, 20)) {
		req.limit = 10;
	}

	next();
};

export default Paginator;
