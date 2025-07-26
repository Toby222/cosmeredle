import CHARACTERS from "lib/characters.json";

export function formatTime(milliseconds: number, useLetters: boolean) {
	const numSeconds = Math.floor(milliseconds / 1000);
	const numMinutes = Math.floor(numSeconds / 60);
	const numHours = Math.floor(numMinutes / 60);

	const formatSeconds = (numSeconds % 60)
		.toString(10)
		.padStart(numSeconds >= 60 ? 2 : 0, "0");
	const formatMinutes =
		numMinutes > 60
			? `${(numMinutes % 60).toString(10).padStart(2, "0")}${useLetters ? "m" : ":"}`
			: numMinutes > 0
				? `${numMinutes.toString(10)}${useLetters ? "m" : ":"}`
				: "";
	const formatHours =
		numHours > 0
			? `${(numHours % 24).toString()}${useLetters ? "h" : ":"}`
			: "";

	return `${formatHours + formatMinutes + formatSeconds}${useLetters ? "s" : ""}`;
}

export function dateDiff(
	now: number,
	then: number,
	useLetters = false,
): string {
	return formatTime(then - now, useLetters);
}

export const Overlap = {
	Full: "Full",
	Partial: "Partial",
	None: "None",
} as const;
export type OverlapType = keyof typeof Overlap;

export function formatSpecies(species: string[]) {
	if (species.length === 1) {
		return species[0];
	}
	if (species.length > 2) {
		throw new Error(`Species has too many parts: ${species.join(", ")}`);
	}
	return `${species[0]} (${species[1]})`;
}

export function getSeries(book: string): [string, string] {
	switch (book) {
		case "The Sunlit Man":
		case "Yumi and the Nightmare Painter":
		case "Tress of the Emerald Sea":
		case "Warbreaker":
		case "Shadows for Silence in the Forests of Hell":
		case "White Sand":
		case "Sixth of the Dusk":
		case "Isles of the Emberdark":
			return [book, book];

		case "The Emperor's Soul":
		case "Elantris":
			return [book, "Elantris"];

		case "Edgedancer":
		case "The Way of Kings":
		case "Words of Radiance":
		case "Oathbringer":
		case "Dawnshard":
		case "Rhythm of War":
		case "Wind and Truth":
			return [book, "Stormlight Archive"];

		case "The Final Empire":
		case "The Well of Ascension":
		case "The Hero of Ages":
		case "Secret History":
		case "The Eleventh Metal":
			return [book, "Mistborn Era 1"];

		case "The Alloy of Law":
		case "Shadows of Self":
		case "The Bands of Mourning":
		case "The Lost Metal":
		case "Allomancer Jak and the Pits of Eltania":
			return [book, "Mistborn Era 2"];
	}
	console.warn(`Unknown book ${book} adding as its own series`);
	return [book, book];
}

export const MS_PER_DAY = 24 * 60 * 60 * 1000;
export function daysSinceEpoch() {
	return Math.floor(Date.now() / MS_PER_DAY);
}

export function emojiFromOverlap(overlap: OverlapType) {
	switch (overlap) {
		case Overlap.None:
			return "🟥";
		case Overlap.Partial:
			return "🟨";
		case Overlap.Full:
			return "🟩";
	}
}

export type Character = {
	name: string[];
	homeWorld: string;
	firstAppearance: string[];
	species: string[];
	abilities: string[];
	validFrom: number;
	validUntil?: number;
};

export function charactersForDay(day: number): Character[] {
	return CHARACTERS.filter(
		(character) =>
			character.validFrom <= day &&
			(character.validUntil === undefined || character.validUntil >= day),
	);
}

// Memoized because I CAN
export const charactersForToday: () => Character[] = (() => {
	let characterMemoDay: number | undefined;
	let todaysCharacters: Character[] | undefined;

	return () => {
		if (
			daysSinceEpoch() !== characterMemoDay ||
			todaysCharacters === undefined
		) {
			characterMemoDay = daysSinceEpoch();
			todaysCharacters = charactersForDay(characterMemoDay);
		}
		return todaysCharacters;
	};
})();

function compareSpecies(speciesA: string[], speciesB: string[]): OverlapType {
	if (speciesA[0] !== speciesB[0]) return Overlap.None;
	if (speciesA[1] !== speciesB[1]) return Overlap.Partial;
	return Overlap.Full;
}

export function compareName(nameA: string[], nameB: string[]): OverlapType {
	const normalizedNameA = nameA.map((namePart) =>
		namePart.replaceAll(/(^\(|\)$)/g, ""),
	);
	const normalizedNameB = nameB.map((namePart) =>
		namePart.replaceAll(/(^\(|\)$)/g, ""),
	);
	return fuzzyCompareArray(normalizedNameA, normalizedNameB);
}

function compareAbilities(
	abilitiesA: string[],
	abilitiesB: string[],
): OverlapType {
	return fuzzyCompareArray(abilitiesA, abilitiesB);
}

function fuzzyCompareArray(arrayA: string[], arrayB: string[]): OverlapType {
	const biggerLength = Math.max(arrayA.length, arrayB.length);
	const [biggerArray, smallerArray] =
		arrayA.length === biggerLength ? [arrayA, arrayB] : [arrayB, arrayA];

	let matching = 0;
	for (const value of biggerArray) {
		if (smallerArray.includes(value)) matching++;
	}
	return matching === 0
		? Overlap.None
		: matching === biggerLength
			? Overlap.Full
			: Overlap.Partial;
}

export function compareFirstAppearance(
	firstAppearanceA: string[],
	firstAppearanceB: string[],
): OverlapType {
	if (firstAppearanceA.length !== firstAppearanceB.length) {
		return Overlap.None;
	}
	if (firstAppearanceA[0] === firstAppearanceB[0]) {
		return Overlap.Full;
	}
	if (firstAppearanceA[1] === firstAppearanceB[1]) {
		return Overlap.Partial;
	}
	return Overlap.None;
}

export function compareCharacters(
	characterA: Character,
	characterB: Character,
): [
	nameMatch: OverlapType,
	homeWorldMatch: OverlapType,
	firstAppearanceMatch: OverlapType,
	speciesMatch: OverlapType,
	abilitiesMatch: OverlapType,
] {
	return [
		compareName(characterA.name, characterB.name),
		characterA.homeWorld === characterB.homeWorld ? Overlap.Full : Overlap.None,
		compareFirstAppearance(
			characterA.firstAppearance,
			characterB.firstAppearance,
		),
		compareSpecies(characterA.species, characterB.species),
		compareAbilities(characterA.abilities, characterB.abilities),
	];
}

export function charactersMatch(
	characterA: Character,
	characterB: Character,
): boolean {
	const match = compareCharacters(characterA, characterB);
	return (
		match[0] === Overlap.Full &&
		match[1] === Overlap.Full &&
		match[2] === Overlap.Full &&
		match[3] === Overlap.Full &&
		match[4] === Overlap.Full
	);
}
