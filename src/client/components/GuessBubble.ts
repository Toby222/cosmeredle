import A from "aberdeen";
import type { Overlap } from "lib/util";

export function GuessBubble(
	text: string,
	overlap: keyof typeof Overlap,
): Element | undefined {
	return A(`div .guessBubble .overlap${overlap} #${text}`);
}
