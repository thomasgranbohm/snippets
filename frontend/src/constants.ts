import axios from "axios";

export const PUBLIC_API = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
});
export const PRIVATE_API = axios.create({ baseURL: "http://backend:1337/" });
