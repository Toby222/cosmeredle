import { expect, test } from "bun:test";
import {
	charactersForToday,
	formatSpecies,
	getCharacterName,
	Overlap,
} from "lib/util";
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
			`GuessRow broken for ${getCharacterName(characters[idx])}`,
		).toBe(
			`<div class="guessBubble overlapNone">${getCharacterName(characters[idx])}</div>` +
				`<div class="guessBubble overlapPartial">${characters[idx].homeWorld}</div>` +
				`<div class="guessBubble overlapFull">${characters[idx].firstAppearance[0]}</div>` +
				`<div class="guessBubble overlapFull">${formatSpecies(characters[idx].species)}</div>` +
				`<div class="guessBubble overlapFull">${characters[idx].abilities.join(", ")}</div>`,
		);
	}
});
