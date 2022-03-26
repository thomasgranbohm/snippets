const FILES = [
	"Vegyn - When I Strike....wav",
	"Tyler, the Creator - OKRA.wav",
	"The Weeknd - Snowchild.wav",
	"Rico Nasty - OHFR?.wav",
	"Laura Les - Haunted.wav",
	"Injury Reserve - Bad Boys.wav",
	"Daft Punk - Touch (feat. Paul Williams).wav",
	"Daft Punk - Around the World.wav",
	"Daft Punk - Around the World - Alternative.wav",
	"Childish Gambino - 3005.wav",
].sort((a, b) => a.localeCompare(b));
const BASE_URL = "https://granbohm.dev/snippets/files/";

const context = new (AudioContext || webkitAudioContext)();
let audioData, node, activePlayer, drawLoop;

async function onButtonClick(e, file) {
	e.target.classList.toggle("play");
	e.target.title = !e.target.classList.contains("play") ? "Play" : "Stop";

	if (activePlayer && activePlayer !== e.target) {
		activePlayer.classList.remove("play");
		activePlayer.title = "Play";
	}

	if (node) {
		clearInterval(drawLoop);
		node.stop();
		node = null;
	}

	activePlayer = e.target;

	if (activePlayer.classList.contains("play")) {
		activePlayer.classList.add("loading");
		const resp = await fetch(BASE_URL + file, { mode: "cors" });
		const buffer = await resp.arrayBuffer();

		context.decodeAudioData(buffer, play);
	}
}

function drawPeaks(buffer, node) {
	const peaks = buffer.getChannelData(node);

	const canvas = activePlayer.parentNode.querySelector("canvas");
	const c = canvas.getContext("2d");
	canvas.width = canvas.clientWidth * 6;
	canvas.height = canvas.clientHeight * 6;

	const steps = 2 ** 6;

	const bps = peaks.length / steps;
	const xs = canvas.width / Math.ceil(steps);

	const highest = peaks.map(Math.abs).reduce((a, b) => (a > b ? a : b), 0);

	const path = new Path2D();

	for (let i = 0; i <= Math.ceil(steps); i += 1) {
		const bufferStart = bps * i;
		const slice = peaks.slice(bufferStart, bufferStart + bps).map(Math.abs);
		const sum = slice.reduce((p, c) => c + p, 0) / bps;

		const h = (sum / highest) * (canvas.height * 2);

		const x = xs * i,
			y = (canvas.height - h) / 2;
		path.rect(x + xs, y, xs * 0.8, h);
	}
	c.clip(path);

	let startTime = Date.now();
	const loop = () => {
		const w =
			canvas.width *
			((((Date.now() - startTime) / 1000) % buffer.duration) /
				buffer.duration);
		c.fillStyle = "#707070";
		c.fillRect(w, 0, canvas.width - w, canvas.height);
		c.fillStyle = "#fc5f2a";
		c.fillRect(0, 0, w, canvas.height);
	};

	loop();
	drawLoop = setInterval(loop, 0.05);
}

function play(buffer) {
	if (!audioData) audioData = buffer;

	node = context.createBufferSource();
	node.buffer = buffer;

	drawPeaks(buffer, node, 2);

	node.connect(context.destination);
	node.loop = true;
	node.start();

	activePlayer.classList.remove("loading");
}

if ("content" in document.createElement("template")) {
	const template = document.getElementById("audio-player");
	const container = document.getElementById("players");

	for (let file of FILES) {
		const clone = template.content.cloneNode(true);
		const title = clone.querySelector("h2.title");
		const artist = clone.querySelector("h3.artist");
		const toggle = clone.querySelector("button.toggle");

		const [a, ...t] = file.replace(/\.\w*$/, "").split(" - ");

		title.innerText = title.title = t.join(" - ");
		artist.innerText = artist.title = a;

		toggle.addEventListener("click", (e) => onButtonClick(e, file));

		container.appendChild(clone);
	}
}
