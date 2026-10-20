import { A, onEach, proxy, type ValueRef } from "aberdeen";

const $yesterday = proxy(
	fetch("/api/yesterday").then(
		(response) =>
			response.json() as Promise<{ day: number; game: string[]; par: number }>,
	),
);

export function LastGamePopup(
	$visible: ValueRef<boolean>,
): Element | undefined {
	if (!$visible.value) return;

	return A(
		"div.popupWrapper",
		{
			id: "lastGame",
			click(event: MouseEvent) {
				if (event.target === this) $visible.value = false;
			},
		},
		A("div.popup", () => {
			if ($yesterday.busy) return A("span#Loading...");
			if ($yesterday.error || !$yesterday.value)
				return A("span#Failed to load: ", $yesterday.error);

			const { day, game, par } = $yesterday.value;
			A(`h3#Solution for day ${day}`);
			A(`span text="Par: "#`, par);
			A(`span text="Solution: "#`, game[game.length - 1]);
			A("hr");
			A(`span text="Solver game:"`);

			A("ol", () => {
				onEach(game, (guess, idx) => {
					console.debug(guess);
					if (idx === game.length - 1) A("li em span#", guess);
					else A("li span#", guess);
				});
			});
		}),
	);
}
