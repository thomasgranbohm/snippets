import { createContext, FC, ReactNode, useContext, useState } from "react";
import { PUBLIC_API } from "../constants";

class ControllerMap {
	map: Map<String, AbortController>;

	constructor() {
		this.map = new Map();
	}

	find(id: string) {
		return this.map.get(id);
	}

	create(id: string) {
		const controller = new AbortController();

		this.map.set(id, controller);

		return controller;
	}

	destroy(id: string) {
		return this.map.delete(id);
	}
}

interface ListeningContext {
	activeItem: string | null;
	loading: boolean;
	onClick: (uuid: string) => void;
}

export const ListeningContext = createContext<ListeningContext>({
	activeItem: null,
	loading: false,
	onClick: () => {},
});

export const useListeningContext = () => useContext(ListeningContext);

const ListeningProvider: FC<ReactNode> = ({ children }) => {
	const [activeItem, setActiveItem] = useState<string | null>(null);
	const [context, setContext] = useState<AudioContext>();
	const [loading, setLoading] = useState(false);
	const [node, setNode] = useState<AudioBufferSourceNode>();
	const [controllers] = useState<ControllerMap>(new ControllerMap());

	const onClick = async (uuid: string) => {
		const c = context || new AudioContext();

		if (c.state === "suspended") {
			await c.resume();
		}

		if (node) {
			node.stop();
		}

		const play = (buffer: AudioBuffer) => {
			const localNode = c.createBufferSource();
			localNode.buffer = buffer;

			localNode.connect(c.destination);
			localNode.loop = true;
			localNode.start();

			setNode(localNode);
			setContext(c);
		};

		if (uuid !== activeItem) {
			if (loading === true && activeItem !== null) {
				const controller = controllers.find(activeItem);
				if (controller) {
					controller.abort();

					controllers.destroy(activeItem);
				}
			}

			const controller = controllers.create(uuid);
			setActiveItem(uuid);

			try {
				setLoading(true);
				const { data } = await PUBLIC_API.get(
					"/snippets/" + uuid + "/audio",
					{
						responseType: "arraybuffer",
						signal: controller.signal,
					}
				);
				setLoading(false);

				c.decodeAudioData(data, play);
			} catch (error) {
				if ((error as Error).message === "canceled") {
					controllers.destroy(uuid);
				} else {
					console.log(error);
				}
			}
		} else {
			controllers.destroy(activeItem);
			setActiveItem(null);
		}
	};

	return (
		<ListeningContext.Provider value={{ activeItem, loading, onClick }}>
			{children}
		</ListeningContext.Provider>
	);
};

export default ListeningProvider;
