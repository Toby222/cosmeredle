#! /usr/bin/env bun
import { $ } from "bun";
import CHARACTERS from "lib/characters.json";
import { type Character, SOFT_HYPHEN } from "lib/util";
import NAMES from "./fixedNames.json";

const newCharacters: Character[] = [];

const unknownNames = new Set<string[]>();
const unknownWorlds = new Set<string>();
const unknownBooks = new Set<string>();
const unknownSeries = new Set<string>();
const unknownSpecies = new Set<string>();
const unknownSubspecies = new Set<string>();
const unknownAbilities = new Set<string>();

function shy(...word: string[]): string {
	return word.join(SOFT_HYPHEN);
}
function shyArr(...words: (string | string[])[]): string {
	return words
		.map((word) => (Array.isArray(word) ? shy(...word) : word))
		.join(" ");
}

function shyName(name: string[], index: number): string[] {
	if (name.join(" ").includes(SOFT_HYPHEN)) return name;
	const fixedName = NAMES[index];
	if (fixedName.join(" ").replaceAll(SOFT_HYPHEN, "") !== name.join(" "))
		throw new Error(
			`Invalid replacement "${fixedName.join(" ")}" (${fixedName.join(" ").replaceAll(SOFT_HYPHEN, "").length}) for name "${name.join(" ")}"`,
		);
	return fixedName;
}

function _shyHomeWorld(world: string): string {
	switch (world) {
		case "Unknown":
			return shy("Un", "known");
		case "Roshar":
			return shy("Ro", "shar");
		case "Canticle":
			return shy("Can", "ti", "cle");
		case "Komashi":
			return shy("Ko", "ma", "shi");
		case "Scadrial":
			return shy("Sca", "dri", "al");
		case "Lumar":
			return shy("Lu", "mar");
		case "Nalthis":
			return shy("Nal", "this");
		case "Sel":
			return "Sel";
		case "Yolen":
			return shy("Yo", "len");
		case "Ashyn":
			return shy("Ash", "yn");
		case "Threnody":
			return shy("Thre", "no", "dy");
		case "First of the Sun":
			return shyArr("First", "of", "the", "Sun");
		case "Silverlight":
			return shy("Sil", "ver", "light");
		case "Taldain":
			return shy("Tal", "dain");
		case "Unspecified":
			return shy("Un", "spec", "i", "fied");
		case "Dhatri":
			return shy("Dha", "tri");
		case "The Grand Apparatus":
			return shyArr("The", "Grand", ["Ap", "pa", "rat", "us"]);
		default:
			unknownWorlds.add(world);
			return world;
	}
}
function shyHomeWorld(world: string): string {
	if (world.includes(SOFT_HYPHEN)) return world;
	const fixedWorld = _shyHomeWorld(world);
	if (fixedWorld.replaceAll(SOFT_HYPHEN, "") !== world) {
		throw new Error(`Invalid replacement "${fixedWorld}" for world "${world}"`);
	}
	return fixedWorld;
}

function shySpecies(species: string): string {
	if (species.includes(SOFT_HYPHEN)) return species;
	switch (species) {
		case "Human":
			return shy("Hu", "man");
		case "Sleepless":
			return shy("Sleep", "less");
		case "Spren":
			return "Spren";
		case "Siah":
			return shy("Si", "ah");
		case "Siah Aimian":
			return shyArr(["Si", "ah"], ["Ai", "mi", "an"]);
		case "Larkin":
			return shy("Lar", "kin");
		case "Singer":
			return shy("Sing", "er");
		case "Aviar":
			return shy("Avi", "ar");
		case "Dragon":
			return shy("Drag", "on");
		case "Kandra":
			return shy("Kan", "dra");
		case "Sword":
			return "Sword";
		case "Sho Del":
			return shyArr("Sho", "Del");
		case "Horse":
			return "Horse";
		case "Unknown":
			return shy("Un", "known");
		case "Shade":
			return "Shade";
		case "Lawnark":
			return shy("Lawn", "ark");
		case "Koloss":
			return shy("Ko", "loss");
		case "Grass":
			return shy("Grass");
		case "Greatshell":
			return shy("Great", "shell");
		default:
			unknownSpecies.add(species);
			return species;
	}
}
function shySubspecies(subspecies: undefined): undefined;
function shySubspecies(subspecies: string): string;
function shySubspecies(subspecies: string | undefined): string | undefined {
	if (subspecies === undefined || subspecies.includes(SOFT_HYPHEN))
		return subspecies;
	switch (subspecies) {
		case "Alethi":
			return shy("A", "le", "thi");
		case "Threnodite":
			return shy("Thre", "no", "dite");
		case "Nagadan":
			return shy("Na", "ga", "dan");
		case "Khlenni":
			return shy("Khlen", "ni");
		case "Malwish":
			return shy("Mal", "wish");
		case "Noble":
			return "Noble";
		case "Unspecified":
			return shy("Un", "spec", "i", "fied");
		case "Aimian":
			return shy("Ai", "mi", "an");
		case "Grand":
			return "Grand";
		case "Highspren":
			return shy("High", "spren");
		case "Unmade":
			return shy("Un", "made");
		case "Ashyn":
			return shy("Ash", "yn");
		case "Skaa":
			return "Skaa";
		case "Pahn Kahl":
			return shyArr("Pahn", "Kahl");
		case "Hallandren":
			return shy("Hal", "lan", "dren");
		case "Diggen's Point":
			return shyArr(["Dig", "gen's"], "Point");
		case "Unkalaki":
			return shy("Un", "ka", "la", "ki");
		case "Listener":
			return shy("Lis", "ten", "er");
		case "Cryptic":
			return shy("Cryp", "tic");
		case "Fjordell":
			return shy("Fjord", "ell");
		case "Eelakin":
			return shy("Eela", "kin");
		case "Elendel":
			return shy("El", "end", "el");
		case "Fused":
			return shy("Fus", "ed");
		case "Islands of Lobu":
			return shyArr(["Is", "lands"], "of", ["Lo", "bu"]);
		case "Dula":
			return shy("Du", "la");
		case "Mistspren":
			return shy("Mist", "spren");
		case "Herdazian":
			return shy("Her", "da", "zi", "an");
		case "Inkspren":
			return shy("Ink", "spren");
		case "Southern Scadrian":
			return shyArr(["South", "ern"], ["Scad", "ri", "an"]);
		case "Darksider":
			return shy("Dark", "si", "der");
		case "Teo":
			return "Teo";
		case "Streamer":
			return shy("Stream", "er");
		case "Terris":
			return shy("Ter", "ris");
		case "Reshi":
			return shy("Re", "shi");
		case "Torish":
			return shy("To", "rish");
		case "Cultivation spren":
			return shyArr(["Cul", "it", "va", "tion"], "spren");
		case "Seventh Generation":
			return shyArr(["Sev", "enth"], ["Gen", "er", "a", "tion"]);
		case "Thaylen":
			return shy("Thay", "len");
		case "Ancient":
			return shy("An", "cient");
		case "nimi":
			return "nimi";
		case "Bondsmith":
			return shy("Bond", "smith");
		case "Azish":
			return shy("Az", "ish");
		case "Third Generation":
			return shyArr("Third", ["Gen", "er", "a", "tion"]);
		case "Honorspren":
			return shy("Hon", "or", "spren");
		case "Aonic":
			return shy("Aon", "ic");
		case "MaiPon":
			return shy("Mai", "Pon");
		case "Veden":
			return shy("Ve", "den");
		case "JinDo":
			return shy("Jin", "Do");
		case "Idrian":
			return shy("Id", "ri", "an");
		case "Shin":
			return "Shin";
		case "Kharbranthian":
			return shy("Khar", "branthi", "an");
		case "Reacher":
			return shy("Reach", "er");
		case "Dzhamarian":
			return shy("Dzha", "ma", "ri", "an");
		case "Ryshadium":
			return shy("Ry", "sha", "di", "um");
		case "Ashspren":
			return shy("Ash", "spren");
		case "Iriali":
			return shy("I", "ri", "a", "li");
		case "Peakspren":
			return shy("Peak", "spren");
		case "Riran":
			return shy("Ri", "ran");
		case "Daysider":
			return shy("Day", "si", "der");
		case "Vaxilian":
			return shy("Vax", "ili", "an");
		case "Human":
			return shy("Hu", "man");
		case "Koloss":
			return shy("Ko", "loss");
		case "Lawnark":
			return shy("Lawn", "ark");
		case "Rosharan":
			return shy("Ro", "shar", "an");
		case "Ashynite":
			return shy("Ash", "yn", "ite");
		case "Yolish":
			return shy("Yol", "ish");
		case "Tai-na":
			return "Tai-na";
		case "Larkin":
			return shy("Lar", "kin");
		case "Lumaran":
			return shy("Lu", "ma", "ran");
		default:
			unknownSubspecies.add(subspecies);
			return subspecies;
	}
}
function shyFullSpecies(
	species: string[],
): [species: string, subspecies: string] | [species: string] {
	const fixedSpecies = shySpecies(species[0]);
	const fixedSubspecies = shySubspecies(species[1]);

	if (fixedSubspecies) return [fixedSpecies, fixedSubspecies];
	return [fixedSpecies];
}

function shyBook(book: string): string {
	if (book.includes(SOFT_HYPHEN)) return book;
	switch (book) {
		case "The Way of Kings":
			return "The Way of Kings";
		case "The Sunlit Man":
			return shyArr("The", ["Sun", "lit"], "Man");
		case "Yumi and the Nightmare Painter":
			return shyArr(
				["Yu", "mi"],
				"and",
				"the",
				["Night", "mare"],
				["Pain", "ter"],
			);
		case "The Final Empire":
			return shyArr("The", ["Fi", "nal"], ["Em", "pire"]);
		case "The Bands of Mourning":
			return shyArr("The", "Bands", "of", ["Mourn", "ing"]);
		case "The Well of Ascension":
			return shyArr("The", "Well", "of", ["As", "cen", "sion"]);
		case "Tress of the Emerald Sea":
			return shyArr("Tress", "of", "the", ["Em", "er", "ald"], "Sea");
		case "Edgedancer":
			return shy("Edge", "danc", "er");
		case "Warbreaker":
			return shy("War", "break", "er");
		case "The Emperor's Soul":
			return shyArr("The", ["Emp", "er", "or's"], "Soul");
		case "Rhythm of War":
			return shyArr("Rhythm", "of", "War");
		case "Oathbringer":
			return shy("Oath", "bring", "er");
		case "The Hero of Ages":
			return shyArr("The", ["He", "ro"], "of", "Ages");
		case "Words of Radiance":
			return shyArr("Words", "of", ["Ra", "di", "ance"]);
		case "Shadows for Silence in the Forests of Hell":
			return shyArr(
				["Shad", "ows"],
				"for",
				["Si", "lence"],
				"in",
				"the",
				["For", "ests"],
				"of",
				"Hell",
			);
		case "Elantris":
			return shy("El", "ant", "ris");
		case "Sixth of the Dusk":
			return shyArr("Sixth", "of", "the", "Dusk");
		case "The Alloy of Law":
			return shyArr("The", ["Al", "loy"], "of", "Law");
		case "Wind and Truth":
			return shyArr("Wind", "and", "Truth");
		case "Dawnshard":
			return shy("Dawn", "shard");
		case "Secret History":
			return shyArr(["Se", "cret"], ["His", "to", "ry"]);
		case "The Lost Metal":
			return shyArr("The", "Lost", ["Me", "tal"]);
		case "The Eleventh Metal":
			return shyArr("The", ["E", "lev", "enth"], ["Me", "tal"]);
		case "Allomancer Jak and the Pits of Eltania":
			return shyArr(
				["Al", "lo", "man", "cer"],
				"Jak",
				"and",
				"the",
				"Pits",
				"of",
				["El", "ta", "nia"],
			);
		case "White Sand":
			return shyArr("White", "Sand");
		case "Isles of the Emberdark":
			return shyArr("Isles", "of", "the", ["Em", "ber", "dark"]);
		default:
			unknownBooks.add(book);
			return book;
	}
}
function shySeries(series: string): string {
	if (series.includes(SOFT_HYPHEN)) return series;
	switch (series) {
		case "Stormlight Archive":
			return shyArr(["Storm", "light"], ["Ar", "chive"]);
		case "Mistborn Era 1":
			return shyArr(["Mist", "born"], "Era", "1");
		case "Mistborn Era 2":
			return shyArr(["Mist", "born"], "Era", "2");
		case "Elantris":
			return shy("El", "ant", "ris");
		default:
			unknownSeries.add(series);
			return series;
	}
}
function shyFirstAppearance(
	appearance: string[],
): [book: string, series: string] {
	if (appearance.length !== 2)
		throw new Error(
			`Invalid appearance, length ${appearance.length} (${appearance.join("; ")})`,
		);

	const fixedBook = shyBook(appearance[0]);
	const fixedSeries =
		appearance[0] === appearance[1] ? fixedBook : shySeries(appearance[1]);
	if (
		!appearance[0].includes(SOFT_HYPHEN) &&
		fixedBook.replaceAll(SOFT_HYPHEN, "") !== appearance[0]
	)
		throw new Error(
			`Invalid replacement "${fixedBook}" for book "${appearance[0]}"`,
		);

	if (
		!appearance[1].includes(SOFT_HYPHEN) &&
		fixedSeries.replaceAll(SOFT_HYPHEN, "") !== appearance[1]
	)
		throw new Error(
			`Invalid replacement "${fixedSeries}" for series "${appearance[1]}"`,
		);
	return [fixedBook, fixedSeries];
}

function shyAbility(ability: string) {
	if (ability.includes(SOFT_HYPHEN)) return ability;
	switch (ability) {
		case "Shardbearer":
			return shy("Shard", "bearer");
		case "Unoathed":
			return shy("Un", "oathed");
		case "Uninvested":
			return shy("Un", "in", "vest", "ed");
		case "Misting":
			return shy("Mist", "ing");
		case "Hordelings":
			return shy("Horde", "lings");
		case "Nightmare Painter":
			return `${shy("Night", "mare")} ${shy("Paint", "er")}`;
		case "Seeker":
			return shy("Seek", "er");
		case "Rioter":
			return shy("Riot", "er");
		case "Cognitive Shadow":
			return `${shy("Cog", "ni", "tive")} ${shy("Shad", "ow")}`;
		case "Lifeless":
			return shy("Life", "less");
		case "Returned":
			return shy("Re", "turn", "ed");
		case "Shard Vessel":
			return `Shard ${shy("Ves", "sel")}`;
		case "Nahel Bond":
			return `${shy("Na", "hel")} Bond`;
		case "Skybreaker":
			return shy("Sky", "break", "er");
		case "Splinter":
			return shy("Splint", "er");
		case "Worldhopper":
			return shy("World", "hop", "per");
		case "Curse of Kind":
			return shyArr(["Curse"], ["of"], ["Kind"]);
		case "Herald":
			return shy("Her", "ald");
		case "Surgebinder":
			return shy("Surge", "bind", "er");
		case "Coinshot":
			return shy("Coin", "shot");
		case "Soother":
			return shy("Sooth", "er");
		case "Consumes Investiture":
			return shyArr(["Con", "sumes"], ["In", "vest", "iture"]);
		case "Charred":
			return shy("Char", "red");
		case "Smoker":
			return shy("Smok", "er");
		case "Windrunner Squire":
			return shyArr(["Wind", "run", "ner"], ["Squire"]);
		case "Sighted":
			return shy("Sight", "ed");
		case "Spore Eater":
			return shyArr(["Spore"], ["Eat", "er"]);
		case "Bondsmith":
			return shy("Bond", "smith");
		case "Knight Radiant":
			return shyArr("Knight", ["Ra", "di", "ant"]);
		case "Old Magic":
			return shyArr("Old", "Magic");
		case "Sliver":
			return shy("Sliv", "er");
		case "Forms of Power":
			return shyArr("Forms", "of", ["Pow", "er"]);
		case "Awakener":
			return shy("Awaken", "er");
		case "Royal Locks":
			return shyArr(["Roy", "al"], "Locks");
		case "Lightweaver":
			return shy("Light", "weav", "er");
		case "Dakhor":
			return shy("Dak", "hor");
		case "Aviar Bond":
			return shyArr(["Av", "iar"], "Bond");
		case "Hemalurgy":
			return shy("Hema", "lurgy");
		case "Mistborn":
			return shy("Mist", "born");
		case "Willshaper":
			return shy("Will", "shap", "er");
		case "Fannahn-im":
			return `${shy("Fan", "nahn")}-im`;
		case "Fused":
			return shy("Fus", "ed");
		case "Elantrian":
			return shy("El", "ant", "ri", "an");
		case "Truthwatcher":
			return shy("Truth", "watch", "er");
		case "Pewterarm":
			return shy("Pew", "ter", "arm");
		case "Shanay-im":
			return `Sha${SOFT_HYPHEN}nay-im`;
		case "Dawnshard":
			return shy("Dawn", "shard");
		case "Windrunner":
			return shy("Wind", "run", "ner");
		case "Elsecaller":
			return shy("Else", "cal", "ler");
		case "Starmarks":
			return shy("Star", "marks");
		case "Mental shielding":
			return shyArr(["Men", "tal"], ["shield", "ing"]);
		case "Feruchemist":
			return shy("Fe", "ru", "che", "mist");
		case "Nex-im":
			return "Nex-im";
		case "Edgedancer":
			return shy("Edge", "danc", "er");
		case "Nightmare":
			return shy("Night", "mare");
		case "Pulser":
			return shy("Puls", "er");
		case "Deadeye":
			return shy("Dead", "eye");
		case "Shapeshifting":
			return shy("Shape", "shift", "ing");
		case "Augur":
			return shy("Aug", "ur");
		case "Bloodmaker":
			return shy("Blood", "mak", "er");
		case "Ferring":
			return shy("Fer", "ring");
		case "Savant":
			return shy("Sav", "ant");
		case "Twinborn":
			return shy("Twin", "born");
		case "Comedic timing":
			return shyArr(["Co", "me", "dic"], ["ti", "ming"]);
		case "Lurcher":
			return shy("Lurch", "er");
		case "Voidbinder":
			return shy("Void", "bin", "der");
		case "Precognition":
			return shy("Pre", "cog", "ni", "tion");
		case "Forger":
			return shy("For", "ger");
		case "ChayShan":
			return shy("Chay", "Shan");
		case "Tineye":
			return shy("Tin", "eye");
		case "Avatar":
			return shy("Av", "a", "tar");
		case "Windwhisperer":
			return shy("Wind", "whis", "per", "er");
		case "Blessing of Potency":
			return shyArr(["Bless", "ing"], "of", ["Po", "ten", "cy"]);
		case "Blessing of Presence":
			return shyArr(["Bless", "ing"], "of", ["Pres", "ence"]);
		case "Sprouter":
			return shy("Sprout", "er");
		case "Skimmer":
			return shy("Skim", "mer");
		case "Slider":
			return shy("Slid", "er");
		case "Bloodsealer":
			return shy("Blood", "seal", "er");
		case "Yoki-Hijo":
			return shy("Yo", "ki-Hi", "jo");
		case "Dustbringer":
			return shy("Dust", "bring", "er");
		case "Enlightened":
			return shy("En", "light", "ened");
		case "Stoneward":
			return shy("Stone", "ward");
		case "Unknown":
			return shy("Un", "known");
		case "Seer":
			return shy("Se", "er");
		case "Brute":
			return shy("Bru", "te");
		case "Mastrell":
			return shy("Mas", "trell");
		case "Sand master":
			return shyArr("Sand", ["mas", "ter"]);
		case "Undermastrell":
			return shy("Un", "der", "mas", "trell");
		case "Starcarved":
			return shy("Star", "carved");
		case "Navigator":
			return shy("Nav", "i", "ga", "tor");
		case "Duralumin Gnat":
			return shyArr(["Du", "ral", "u", "min"], "Gnat");
		case "Leecher":
			return shy("Leech", "er");
		case "Immortal":
			return shy("Im", "mor", "tal");
		case "Shapeshifter":
			return shy("Shape", "shift", "er");
		case "Honorbearer":
			return shy("Hon", "or", "bear", "er");
		case "Aetherbound":
			return shy("Ae", "ther", "bound");
		case "Unnamed electricity power":
			return shyArr(
				["Un", "named"],
				["e", "lec", "tric", "i", "ty"],
				["pow", "er"],
			);
		case "Shade":
			return "Shade";
		// throw new Error("Unhandled ability");

		default:
			unknownAbilities.add(ability);
			return ability;
	}
}
function shyAbilities(abilities: string[]) {
	const fixedAbilities = [];
	for (const ability of abilities) {
		const fixedAbility = shyAbility(ability);
		if (
			!ability.includes(SOFT_HYPHEN) &&
			fixedAbility.replaceAll(SOFT_HYPHEN, "") !== ability
		)
			throw new Error(
				`Invalid replacement "${fixedAbility}" for ability ${ability}`,
			);
		fixedAbilities.push(fixedAbility);
	}
	return fixedAbilities;
}

for (let idx = 0; idx < CHARACTERS.length; idx++) {
	const character = CHARACTERS[idx];
	try {
		newCharacters.push({
			name: shyName(character.name, idx),
			homeWorld: shyHomeWorld(character.homeWorld),
			firstAppearance: shyFirstAppearance(character.firstAppearance),
			species: shyFullSpecies(character.species),
			abilities: shyAbilities(
				character.abilities
					.filter(
						(ability, idx, abilities) => abilities.indexOf(ability) === idx,
					)
					.sort(),
			),
			validFrom: character.validFrom,
			validUntil: character.validUntil,
		});
	} catch (err) {
		console.error("Failed to add character", character);
		throw err;
	}
}

if (unknownNames.size > 0) {
	for (const name of unknownNames) {
		console.error(name);
	}
	throw new Error(`Unhandled names: ${unknownNames.size}`);
}
if (unknownWorlds.size > 0) {
	for (const world of unknownWorlds) {
		console.error(world);
	}
	throw new Error(`Unhandled homeworlds: ${unknownWorlds.size}`);
}
if (unknownBooks.size > 0) {
	for (const book of unknownBooks) {
		console.error(book);
	}
	throw new Error(`Unhandled books: ${unknownBooks.size}`);
}
if (unknownSeries.size > 0) {
	for (const series of unknownSeries) {
		console.error(series);
	}
	throw new Error(`Unhandled series: ${unknownSeries.size}`);
}
if (unknownSpecies.size > 0) {
	for (const species of unknownSpecies) {
		console.error(species);
	}
	throw new Error(`Unhandled species: ${unknownSpecies.size}`);
}
if (unknownSubspecies.size > 0) {
	for (const subspecies of unknownSubspecies) {
		console.error(subspecies);
	}
	throw new Error(`Unhandled subspecies: ${unknownSubspecies.size}`);
}
if (unknownAbilities.size > 0) {
	for (const ability of unknownAbilities) {
		console.error(ability);
	}
	throw new Error(`Unhandled abilities: ${unknownAbilities.size}`);
}

Bun.file("./src/lib/characters.json").write(
	JSON.stringify(newCharacters, null, 2),
);
for await (const line of $`nix fmt`.lines()) {
	console.log(line);
}
