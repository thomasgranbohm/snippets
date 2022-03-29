import { LegacyRef, useEffect, useRef, useState } from "react";

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

export const useObserver = <T extends HTMLElement>(
	callback: () => {},
	options: {
		shouldStop?: boolean;
	} & IntersectionObserverInit
): [LegacyRef<T>, boolean] => {
	const ref = useRef<T>(null);
	const [loading, setLoading] = useState(false);

	const { shouldStop, ...rest } = options;

	useEffect(() => {
		const observer = new IntersectionObserver(
			async ([entry]) => {
				if (!entry.isIntersecting || shouldStop || loading) return;

				setLoading(true);
				await callback();
				setLoading(false);
			},
			{
				root: null,
				rootMargin: "256px",
				threshold: 0.0,
				...rest,
			}
		);

		const { current } = ref;

		if (current) observer.observe(current);

		return () => {
			if (current) observer.disconnect();
		};
	});

	return [ref, !!shouldStop];
};
