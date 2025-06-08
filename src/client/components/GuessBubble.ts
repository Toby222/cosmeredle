import { $ } from "aberdeen";
import { OVERLAP_STYLES } from "client/util";

export function GuessBubble(
	text: string,
	overlap: keyof typeof OVERLAP_STYLES,
): Element | undefined {
	return $(`div.guessBubble${OVERLAP_STYLES[overlap]}:${text}`);
}
