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

export const MS_PER_DAY = 24 * 60 * 60 * 1000;
export function daysSinceEpoch() {
	return Math.floor(Date.now() / MS_PER_DAY) + 21;
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
	firstAppearance: string;
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
	return fuzzyCompareArray(nameA, nameB);
}

function compareAbilities(
	abilitiesA: string[],
	abilitiesB: string[],
): OverlapType {
	return fuzzyCompareArray(abilitiesA, abilitiesB);
}

function fuzzyCompareArray(
	abilitiesA: string[],
	abilitiesB: string[],
): OverlapType {
	const biggerLength = Math.max(abilitiesA.length, abilitiesB.length);
	const [biggerArray, smallerArray] =
		abilitiesA.length === biggerLength
			? [abilitiesA, abilitiesB]
			: [abilitiesB, abilitiesA];

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

export function compareCharacters(
	characterA: Character,
	characterB: Character,
): [OverlapType, OverlapType, OverlapType, OverlapType, OverlapType] {
	return [
		compareName(characterA.name, characterB.name),
		characterA.homeWorld === characterB.homeWorld ? Overlap.Full : Overlap.None,
		characterA.firstAppearance === characterB.firstAppearance
			? Overlap.Full
			: Overlap.None,
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
