const CACHES = [
	{
		name: "snippets-images",
		regex: /\/snippets\/([0-9a-zA-Z\-]+)\/image$/,
	},
	{
		name: "snippets-audios",
		regex: /\/snippets\/([0-9a-zA-Z\-]+)\/audio$/,
	},
];

self.addEventListener("install", (event) => {
	event.waitUntil(Promise.all(CACHES.map(({ name }) => caches.open(name))));

	self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
	event.respondWith(
		caches
			.match(event.request)
			.then((resp) => {
				if (resp) {
					return resp;
				}

				return fetch(event.request).then((response) => {
					if (!response || response.status !== 200) {
						return response;
					}

					for (const { name, regex } of CACHES) {
						if (regex.test(response.url)) {
							const responseToCache = response.clone();

							caches
								.open(name)
								.then((cache) =>
									cache.put(event.request, responseToCache)
								);
						}
					}

					return response;
				});
			})
			.catch((err) => console.error(err))
	);
});
