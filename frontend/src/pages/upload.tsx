import { AxiosError } from "axios";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { PUBLIC_API } from "../constants";
import { concat } from "../functions";
import classes from "../styles/pages/Upload.module.scss";

const UploadPage = () => {
	const ref = useRef<HTMLInputElement>(null);
	const [fileName, setFileName] = useState<string>("");
	const router = useRouter();

	const [title, setTitle] = useState<string>("");
	const [artist, setArtist] = useState<string>("");
	const [bpm, setBPM] = useState<string>("");

	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");

	const handleSubmit = async () => {
		try {
			const encoded = Buffer.from(
				`${username}:${password}`,
				"ascii"
			).toString("base64");

			const data = new FormData();
			data.append("title", title);
			data.append("artist", artist);
			data.append("bpm", bpm);

			if (
				!ref.current ||
				!ref.current.files ||
				ref.current.files.length === 0
			) {
				alert("You need to select a file.");
				return;
			}

			data.append("audio", ref.current.files[0]);

			const resp = await PUBLIC_API.post("/snippets", data, {
				headers: {
					"Content-Type": "multipart/form-data",
					Authorization: `Basic ${encoded}`,
				},
			});

			if (resp.status === 201) {
				alert("Snippet created!");
				return router.push("/");
			}
		} catch (error) {
			if (
				"isAxiosError" in (error as any) &&
				(error as AxiosError).isAxiosError
			) {
				const { response } = error as AxiosError;

				if (response?.status === 401) {
					alert("Invalid credentials");
				} else if (response?.data) {
					alert(response?.data.error);
				}
			} else {
				alert("Something went wrong. Check the console.");
			}
			console.error(error);
		}
	};

	const onInput = () => {
		const files = ref.current?.files;
		if (!files) {
			return;
		}

		const file = files.item(0);
		if (!file) {
			return;
		}

		setFileName(file.name);
	};

	return (
		<main className={classes["container"]}>
			<header>
				<h1>Upload</h1>
			</header>
			<article>
				<label
					htmlFor="audio"
					className={concat(classes["upload"], classes["label"])}
				>
					{fileName || "Upload file"}
				</label>
				<input
					ref={ref}
					type="file"
					name="audio"
					id="audio"
					className={classes["upload"]}
					accept="audio/wav, audio/wave, audio/ogg, audio/mpeg, audio/mpeg3, audio/x-wav, audio/mp3, audio/flac, audio/x-flac"
					onInput={onInput}
				/>
				<div className={classes["information"]}>
					<label htmlFor="title">Title</label>
					<input
						type="text"
						placeholder="Meat Grinder"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
					<label htmlFor="artist">Artist</label>
					<input
						type="text"
						name="artist"
						id="artist"
						placeholder="Madvillain"
						value={artist}
						onChange={(e) => setArtist(e.target.value)}
					/>
					<label htmlFor="bpm">BPM</label>
					<input
						type="number"
						min={0}
						max={1024}
						name="bpm"
						id="bpm"
						placeholder="88"
						className={classes["bpm"]}
						value={bpm}
						onChange={(e) => setBPM(e.target.value)}
					/>
				</div>
				<div className={classes["credentials"]}>
					<label htmlFor="username">Username</label>
					<label htmlFor="password">Password</label>
					<input
						type="text"
						name="username"
						id="username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
					<input
						type="password"
						name="password"
						id="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>
				<button className={classes["submit"]} onClick={handleSubmit}>
					Submit
				</button>
			</article>
		</main>
	);
};

export default UploadPage;
