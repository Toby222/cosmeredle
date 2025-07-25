import { expect, test } from "bun:test";
import { OVERLAP_STYLES } from "client/util";
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
			`<div class="guessBubble ${OVERLAP_STYLES[Overlap.None].replace(/^\./, "")}">${characters[idx].name.join(" ")}</div>` +
				`<div class="guessBubble ${OVERLAP_STYLES[Overlap.Partial].replace(/^\./, "")}">${characters[idx].homeWorld}</div>` +
				`<div class="guessBubble ${OVERLAP_STYLES[Overlap.Full].replace(/^\./, "")}">${characters[idx].firstAppearance[0]}</div>` +
				`<div class="guessBubble ${OVERLAP_STYLES[Overlap.Full].replace(/^\./, "")}">${formatSpecies(characters[idx].species)}</div>` +
				`<div class="guessBubble ${OVERLAP_STYLES[Overlap.Full].replace(/^\./, "")}">${characters[idx].abilities.join(", ")}</div>`,
		);
	}
});
