import { expect, test } from "bun:test";
import {
	type Character,
	charactersForDay,
	charactersMatch,
	compareCharacters,
	daysSinceEpoch,
	Overlap,
} from "lib/util";

const characters = charactersForDay(daysSinceEpoch() + 1);

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

test("No duplicates", () => {
	for (let idx = 0; idx < characters.length; idx++) {
		const lastMatchedCharacterIndex = characters.findLastIndex((character) =>
			charactersMatch(character, characters[idx]),
		);
		expect(
			lastMatchedCharacterIndex,
			`Character ${idx} (${characters[idx].name.join(" ")}) is duplicate`,
		).toBe(idx);
	}
});

const expectedSoloHomeworlds = [
	"The Grand Apparatus", // ZeetZi
];
test("Proper homeworld occurence count", () => {
	const homeWorlds = characters.map((character) => character.homeWorld);
	for (const homeWorld of homeWorlds) {
		const occurenceCount = homeWorlds.filter(
			(homeWorldB) => homeWorldB === homeWorld,
		).length;
		if (expectedSoloHomeworlds.includes(homeWorld)) {
			expect(
				occurenceCount,
				`Homeworld "${homeWorld}" has new characters`,
			).toBe(1);
		} else {
			expect(
				occurenceCount,
				`Homeworld "${homeWorld}" is missing characters`,
			).toBeGreaterThan(1);
		}
	}
});

const expectedSingleCharacterBooks = [
	"Secret History", // Most characters known from Era 1; only Riina new
	"The Eleventh Metal", // Only has two Characters
	"Allomancer Jak and the Pits of Eltania", // Jak
];
test("Proper book occurence count", () => {
	const books = characters.map((character) => character.firstAppearance[0]);
	for (const book of books) {
		const occurenceCount = books.filter((bookB) => bookB === book).length;
		if (expectedSingleCharacterBooks.includes(book)) {
			expect(occurenceCount, `Book "${book}" has new characters`).toBe(1);
		} else {
			expect(
				occurenceCount,
				`Book "${book}" is missing characters`,
			).toBeGreaterThan(1);
		}
	}
});

const expectedUniqueSpecies = [
	"Human Khlenni", // Alendi
	"Human Malwish", // Allik Neverfar
	"Siah Aimian", // Axies
	"Larkin", // Chiri-Chiri
	"Human Dula", // Galladon
	"Human Southern Scadrian", // Iyatil
	"Human JinDo", // Shuden
	"Human Dzhamarian", // Weedfingers
	"Spren Ashspren", // Spark
	"Sleepless Nagadan", // Masaka
	"Sleepless", // Chrysalis
	"Sword nimi", // Nightblood
	"Kandra Seventh Generation", // MeLaan
	"Kandra Unspecified", // Ulaam
	"Human MaiPon", // Wan ShaiLu
	"Sho Del", // Uli Da
	"Shade", // Nazh
	"Human Vaxilian", // Eddlin
	"Lawnark", // Zeetzi
];
test("Proper species occurence count", () => {
	const allSpecies = characters.map((character) => character.species.join(" "));
	for (const species of allSpecies) {
		const occurenceCount = allSpecies.filter(
			(speciesB) => speciesB === species,
		).length;
		if (expectedUniqueSpecies.includes(species)) {
			expect(occurenceCount, `Species "${species}" has new characters`).toBe(1);
		} else {
			expect(
				occurenceCount,
				`Species "${species}" is missing characters`,
			).toBeGreaterThan(1);
		}
	}
});

const expectedUniqueAbilities: string[] = [
	"Lifeless", // Arsteel
	"Curse of Kind", // Axies
	"Soother", // Somehow Breeze is the only named Soother?
	"Spore Eater", // Crow; Only other named character (Bek) is too insignificant for cosmeredle
	"Nex-im", // Lezian the Pursuer
	"Pulser", // Marasi Colms
	"Augur", // Miles Dagouter
	"Lurcher", // Ranette
	"Forger", // Wan ShaiLu
	"ChayShan", // Shuden
	"Windwhisperer", // Telsin Ladrian
	"Blessing of Presence", // TenSoon
	"Sprouter", // Only Tress is significant
	"Skimmer", // Only Wax is significant
	"Bloodsealer", // Weedfingers
	"Yoki-Hijo", // Yumi
	"Brute", // Forch
	"Starcarved", // Khriss
	"Precognition", // Sak
	"Duralumin Gnat", // Dumad
	"Unnamed electricity power", // ZeetZi
];
test("Proper ability occurence count", () => {
	const abilities = characters.flatMap((character) => character.abilities);
	for (const ability of abilities) {
		const occurenceCount = abilities.filter(
			(abilityB) => abilityB === ability,
		).length;
		if (expectedUniqueAbilities.includes(ability)) {
			expect(occurenceCount, `Ability "${ability}" has new characters`).toBe(1);
		} else {
			expect(
				occurenceCount,
				`Ability "${ability}" is missing characters`,
			).toBeGreaterThan(1);
		}
	}
});
