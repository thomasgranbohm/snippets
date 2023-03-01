import axios from "axios";

export const PUBLIC_API = axios.create({
	baseURL: "/api",
});
export const PRIVATE_API = axios.create({ baseURL: "http://backend:1337/" });
