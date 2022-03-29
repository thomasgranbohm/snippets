import { NextFunction, Request, RequestHandler, Response } from "express";

const Authorization: RequestHandler = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (!req.headers.authorization) {
		return res.status(401).send("Not authorized.");
	}

	const [type, encoded] = req.headers.authorization.split(" ");
	if (
		!encoded ||
		type !== "Basic" ||
		encoded !== process.env.AUTHORIZATION_STRING
	) {
		return res.status(401).send("Not authorized.");
	}

	next();
};

export default Authorization;
