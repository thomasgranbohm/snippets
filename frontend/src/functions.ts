export const concat = (...classes: Array<string | [unknown, any] | unknown>) =>
	classes
		.map((c) => {
			if (typeof c === "string") return c;
			if (typeof c !== "object" || !Array.isArray(c)) return false;

			const [className, condition] = c;
			return !!condition ? className : false;
		})
		.filter((c) => !!c)
		.join(" ");
