import { expect, test } from "bun:test";
import { OVERLAP_COLORS } from "client/util";
import { charactersForToday, formatSpecies, Overlap } from "lib/util";
import { GuessRow } from "./GuessRow";

const characters = charactersForToday();
test("GuessRow looks sane", () => {
	for (let idx = 0; idx < characters.length; idx++) {
		expect(
			GuessRow([
				Overlap.None,
				Overlap.Partial,
				Overlap.Full,
				Overlap.Full,
				Overlap.Full,
				idx,
			])?.innerHTML,
			`GuessRow broken for ${characters[idx].name.join(" ")}`,
		).toBe(
			`<div style="background-color: ${OVERLAP_COLORS[Overlap.None]};" class="guessBubble">${characters[idx].name.join(" ")}</div>` +
				`<div style="background-color: ${OVERLAP_COLORS[Overlap.Partial]};" class="guessBubble">${characters[idx].homeWorld}</div>` +
				`<div style="background-color: ${OVERLAP_COLORS[Overlap.Full]};" class="guessBubble">${characters[idx].firstAppearance[0]}</div>` +
				`<div style="background-color: ${OVERLAP_COLORS[Overlap.Full]};" class="guessBubble">${formatSpecies(characters[idx].species)}</div>` +
				`<div style="background-color: ${OVERLAP_COLORS[Overlap.Full]};" class="guessBubble">${characters[idx].abilities.join(", ")}</div>`,
		);
	}
});
