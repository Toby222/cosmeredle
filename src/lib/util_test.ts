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
	const jasnah = characters.find((character) => character.name[0] === "Jasnah");
	expect(jasnah).not.toBeUndefined();
	const renarin = characters.find(
		(character) => character.name[0] === "Renarin",
	);
	expect(renarin).not.toBeUndefined();
	const match = compareCharacters(jasnah as Character, renarin as Character);
	expect(match[0], "Name matching broken").toBe(Overlap.Partial);
	expect(match[1], "Homeworld matching broken").toBe(Overlap.Full);
	expect(match[2], "First Appearance matching broken").toBe(Overlap.Full);
	expect(match[3], "Species matching broken").toBe(Overlap.Full);
	expect(match[4], "Abilities matching broken").toBe(Overlap.Partial);
});

test("Gavinor and Gavilar are from different times", () => {
	const gavinor = characters.find(
		(character) => character.name[0] === "Gavinor",
	);
	expect(gavinor).not.toBeUndefined();
	const gavilar = characters.find(
		(character) => character.name[0] === "Gavilar",
	);
	expect(gavilar).not.toBeUndefined();
	const match = compareCharacters(gavinor as Character, gavilar as Character);
	expect(match[0], "Name matching broken").toBe(Overlap.Partial);
	expect(match[1], "Homeworld matching broken").toBe(Overlap.Full);
	expect(match[2], "First Appearance matching broken").toBe(Overlap.Partial);
	expect(match[3], "Species matching broken").toBe(Overlap.Full);
	expect(match[4], "Abilities matching broken").toBe(Overlap.Full);
});

test("Didn't forget to remove debug from daysSinceEpoch", () => {
	expect(daysSinceEpoch()).toBe(Math.floor(Date.now() / MS_PER_DAY));
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
