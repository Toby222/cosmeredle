import { expect, test } from "bun:test";
import {
	type Character,
	charactersForDay,
	compareCharacters,
	compareFirstAppearance,
	daysSinceEpoch,
	getSeries,
	MS_PER_DAY,
	Overlap,
} from "lib/util";

function getCharacter(firstName: string): Character {
	const character = characters.find(
		(character) => character.name[0] === firstName,
	);
	expect(character).not.toBeUndefined();
	return character as Character;
}

const characters = charactersForDay(daysSinceEpoch() + 1);

function charactersShouldMatch(characterA: Character, characterB: Character) {
	const match = compareCharacters(characterA, characterB);
	expect(match[0], "Name matching broken").toBe(Overlap.Full);
	expect(match[1], "Homeworld matching broken").toBe(Overlap.Full);
	expect(match[2], "First Appearance matching broken").toBe(Overlap.Full);
	expect(match[3], "Species matching broken").toBe(Overlap.Full);
	expect(match[4], "Abilities matching broken").toBe(Overlap.Full);
}

test("Characters are self-similar", () => {
	expect(characters).toBeArray();
	for (const character of characters) {
		charactersShouldMatch(character, character);
	}
});

test("Kholin is a family", () => {
	const jasnah = getCharacter("Jasnah");
	const renarin = getCharacter("Renarin");
	const match = compareCharacters(jasnah, renarin);
	expect(match[0], "Name matching broken").toBe(Overlap.Partial);
	expect(match[1], "Homeworld matching broken").toBe(Overlap.Full);
	expect(match[2], "First Appearance matching broken").toBe(Overlap.Full);
	expect(match[3], "Species matching broken").toBe(Overlap.Full);
	expect(match[4], "Abilities matching broken").toBe(Overlap.Partial);
});

test("Gavinor and Gavilar are from different times", () => {
	const gavinor = getCharacter("Gavinor");
	const gavilar = getCharacter("Gavilar");
	const match = compareCharacters(gavinor, gavilar);
	expect(match[0], "Name matching broken").toBe(Overlap.Partial);
	expect(match[1], "Homeworld matching broken").toBe(Overlap.Full);
	expect(match[2], "First Appearance matching broken").toBe(Overlap.Partial);
	expect(match[3], "Species matching broken").toBe(Overlap.Full);
	expect(match[4], "Abilities matching broken").toBe(Overlap.Full);
});

test("Didn't forget to remove debug from daysSinceEpoch", () => {
	expect(daysSinceEpoch()).toBe(Math.floor(Date.now() / MS_PER_DAY));
});

test("Tress and Silence are unrelated", () => {
	const tress = getCharacter("Tress");
	const silence = getCharacter("Silence");
	const match = compareCharacters(tress, silence);
	expect(match[0], "Name matching broken").toBe(Overlap.None);
	expect(match[1], "Homeworld matching broken").toBe(Overlap.None);
	expect(match[2], "First Appearance matching broken").toBe(Overlap.None);
	expect(match[3], "Species matching broken").toBe(Overlap.Partial);
	expect(match[4], "Abilities matching broken").toBe(Overlap.None);
});

test("Series comparison works", () => {
	expect(
		compareFirstAppearance(
			getSeries("The Way of Kings"),
			getSeries("Words of Radiance"),
		),
		"Stormlight Archive should be a series",
	).toBe(Overlap.Partial);

	expect(
		compareFirstAppearance(
			getSeries("The Final Empire"),
			getSeries("The Alloy of Law"),
		),
		"Mistborn Era 1 & 2 should be separate series",
	);

	expect(
		compareFirstAppearance(
			getSeries("Yumi and the Nightmare Painter"),
			getSeries("Tress of the Emerald Sea"),
		),
		"Standalone books should each be their own series",
	).toBe(Overlap.None);

	const tress = "Tress of the Emerald Sea";
	const tressSeries = getSeries(tress);
	expect(tressSeries[0], "Solo books are their own book").toBe(tress);
	expect(tressSeries[1], "Solo books are their own series").toBe(tress);
});
