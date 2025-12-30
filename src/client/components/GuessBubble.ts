import { $ } from "aberdeen";
import { OVERLAP_COLORS } from "client/util";

export function GuessBubble(
	text: string,
	overlap: keyof typeof OVERLAP_COLORS,
): Element | undefined {
	return $(
		`div backgroundColor:${OVERLAP_COLORS[overlap]} .guessBubble #${text}`,
	);
}
