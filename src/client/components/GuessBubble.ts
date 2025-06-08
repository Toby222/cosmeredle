import { $ } from "aberdeen";
import { OVERLAP_STYLES } from "client/util";
import type { OverlapType } from "lib/util";

export function GuessBubble(
	text: string,
	overlap: OverlapType,
): Element | undefined {
	return $(`div.guessBubble${OVERLAP_STYLES[overlap]}:${text}`);
}
