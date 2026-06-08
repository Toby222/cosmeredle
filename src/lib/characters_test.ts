import { expect, test } from "bun:test";
import {
	charactersForDay,
	charactersMatch,
	daysSinceEpoch,
	getCharacterName,
	SOFT_HYPHEN,
} from "lib/util";

const characters = charactersForDay(daysSinceEpoch() + 1);

test("No duplicates", () => {
	for (let idx = 0; idx < characters.length; idx++) {
		const lastMatchedCharacterIndex = characters.findLastIndex((character) =>
			charactersMatch(character, characters[idx]),
		);
		expect(
			lastMatchedCharacterIndex,
			`Character ${idx} (${getCharacterName(characters[idx])}) is duplicate`,
		).toBe(idx);
	}
});

const expectedSoloHomeworlds = [
	"The Grand Apparatus", // ZeetZi
];
test("Proper homeworld occurence count", () => {
	const homeWorlds = characters.map((character) => character.homeWorld);
	for (const rawHomeWorld of homeWorlds) {
		const normalizedHomeWorld = rawHomeWorld.replaceAll(SOFT_HYPHEN, "");
		const occurenceCount = homeWorlds.filter(
			(homeWorldB) => homeWorldB === rawHomeWorld,
		).length;
		if (expectedSoloHomeworlds.includes(normalizedHomeWorld)) {
			expect(
				occurenceCount,
				`Homeworld "${rawHomeWorld}" has new characters`,
			).toBe(1);
		} else {
			expect(
				occurenceCount,
				`Homeworld "${rawHomeWorld}" is missing characters`,
			).toBeGreaterThan(1);
		}
	}
});

const expectedSingleCharacterBooks = [
	"Secret History", // Most characters known from Era 1; only Riina new
	"The Eleventh Metal", // Only has two Characters
];
test("Proper book occurence count", () => {
	const books = characters.map((character) => character.firstAppearance[0]);
	for (const rawBook of books) {
		const normalizedBook = rawBook.replaceAll(SOFT_HYPHEN, "");
		const occurenceCount = books.filter((bookB) => bookB === rawBook).length;
		if (expectedSingleCharacterBooks.includes(normalizedBook)) {
			expect(occurenceCount, `Book "${rawBook}" has new characters`).toBe(1);
		} else {
			expect(
				occurenceCount,
				`Book "${rawBook}" is missing characters`,
			).toBeGreaterThan(1);
		}
	}
});

const expectedUniqueSpecies = [
	"Human Khlenni", // Alendi
	"Siah Aimian", // Axies
	"Greatshell Tai-na", // Relu-na
	"Greatshell Larkin", // Chiri-Chiri
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
	"Sho Del Yolish", // Uli Da
	"Human Vaxilian", // Eddlin
	"Human Lawnark", // ZeetZi
	"Koloss Human", // Human (Vershad)
	"Human Rosharan", // Talenel'Elin, Stonesinew, Bearer of Agonies, Herald of War, Patron of the Stonewards
	"Grass Shin", // Tyvnk, Rysn's pet grass
];
test("Proper species occurence count", () => {
	const allSpecies = characters.map((character) => character.species.join(" "));
	for (const rawSpecies of allSpecies) {
		const normalizedSpecies = rawSpecies.replaceAll(SOFT_HYPHEN, "");
		const occurenceCount = allSpecies.filter(
			(speciesB) => speciesB === rawSpecies,
		).length;
		if (expectedUniqueSpecies.includes(normalizedSpecies)) {
			expect(occurenceCount, `Species "${rawSpecies}" has new characters`).toBe(
				1,
			);
		} else {
			expect(
				occurenceCount,
				`Species "${rawSpecies}" is missing characters`,
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
	"Skimmer", // Only Wax is significant
	"Bloodsealer", // Weedfingers
	"Yoki-Hijo", // Yumi
	"Brute", // Forch
	"Starcarved", // Khriss
	"Precognition", // Sak
	"Duralumin Gnat", // Dumad
	"Unnamed electricity power", // ZeetZi
	"Koloss", // Human (Vershad)
];
test("Proper ability occurence count", () => {
	const abilities = characters.flatMap((character) => character.abilities);
	for (const rawAbility of abilities) {
		const normalizedAbility = rawAbility.replaceAll(SOFT_HYPHEN, "");
		const occurenceCount = abilities.filter(
			(abilityB) => abilityB === rawAbility,
		).length;
		if (expectedUniqueAbilities.includes(normalizedAbility)) {
			expect(
				occurenceCount,
				`Ability "${normalizedAbility}" has new characters`,
			).toBe(1);
		} else {
			expect(
				occurenceCount,
				`Ability "${normalizedAbility}" is missing characters`,
			).toBeGreaterThan(1);
		}
	}
});
