import A, { type ValueRef } from "aberdeen";
import { Footer } from "client/game/components/Footer";
import { SettingsPopup } from "client/game/components/popups";

import {
	type Character,
	charactersForDay,
	daysSinceEpoch,
	MS_PER_DAY,
} from "lib/util";

const dates = (await (await fetch("/today")).json()) as { today: number };

function ISODate(date: Date): string {
	const year = date.getUTCFullYear();
	const month = (date.getUTCMonth() + 1).toString(10).padStart(2, "0");
	const day = date.getUTCDate().toString(10).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

const $day = A.proxy(dates.today);
const $date = A.derive(() => new Date($day.value * MS_PER_DAY));
const $dayString = A.derive(() => {
	const date = new Date($day.value * MS_PER_DAY);
	const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
		date.getUTCDay(),
	);
	return `${weekday}, ${ISODate(date)}`;
});
const $descendingSort = A.proxy(false);
const $showSettings = A.proxy(false);

type SortField = keyof Character;
const $sort: ValueRef<SortField> = A.proxy(
	"name" as const,
) as ValueRef<SortField>;

const $characters = A.derive(() => {
	return charactersForDay($day.value);
});

function charKey(char: Character) {
	const keys = {
		name: char.name.join(" "),
		homeWorld: char.homeWorld,
		firstAppearance: char.firstAppearance.join(" "),
		species: char.species.join(" "),
		abilities: char.abilities.join(" "),
		validFrom: char.validFrom.toString(10),
		validUntil: (char.validUntil ?? $day.value).toString(10),
	};

	const value = keys[$sort.value];

	return $descendingSort.value ? A.invertString(value) : value;
}

function setSort(field: SortField) {
	const currentSort = A.unproxy($sort);
	if (field === currentSort.value)
		$descendingSort.value = !$descendingSort.value;
	else {
		$descendingSort.value = false;
		$sort.value = field;
	}
}

function columnHead(key: SortField, label: string) {
	A(
		"th.sortable",
		{
			click() {
				setSort(key);
			},
		},
		() =>
			A("div", () => {
				A(`span#${label}`);
				A("span", () =>
					A(
						$sort.value === key ? ($descendingSort.value ? "#↑" : "#↓") : "#↑↓",
					),
				);
			}),
	);
}

A("header", () => {
	A("label#Select date:", () => {
		A("input", {
			type: "date",
			input(ev: Event) {
				if (ev.target !== this) return;
				console.debug("Setting date to", $date);
				const date = (this as HTMLInputElement).valueAsDate;
				if (date === null) return;

				$day.value = daysSinceEpoch(date);
			},
			value: ISODate(A.unproxy($date.value)),
		});
	});
	A("hr");
});
A("main", () => {
	A("table", () => {
		A(`caption#Characters for ${$dayString.value}`);
		A("thead", () => {
			A("tr", () => {
				columnHead("name", "Name");
				columnHead("homeWorld", "World of Origin");
				columnHead("firstAppearance", "First Appearance");
				columnHead("species", "Species");
				A("th#Abilities/Investiture");
			});
		});
		A("tbody", () => {
			A.onEach(
				$characters.value,
				(character) => {
					A("tr", () => {
						A("td#", character.name.join(" "));
						A("td", () => A(`span#${character.homeWorld}`));
						A("td", () => {
							A(`span#${character.firstAppearance[0]}`);
							if (
								character.firstAppearance[1] !== character.firstAppearance[0]
							) {
								A("br");
								A(`span# (${character.firstAppearance[1]})`);
							}
						});
						A("td", () => {
							A(`span#${character.species[0]}`);
							if (character.species.length > 1) {
								A("br");
								A(
									`span# ${character.species.length > 1 ? ` (${character.species[1]})` : ""}`,
								);
							}
						});
						A("td", () => {
							A.onEach(character.abilities, (ability, idx) => {
								A(`span#${ability}`);
								if (idx < character.abilities.length - 1) {
									A("#, ");
								}
							});
						});
					});
				},
				charKey,
			);
		});
	});
	SettingsPopup($showSettings);
});
Footer();
