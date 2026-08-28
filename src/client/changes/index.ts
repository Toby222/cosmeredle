import A from "aberdeen";
import { Footer } from "client/game/components/Footer";
import {
	type Character,
	charactersForDay,
	charactersMatch,
	daysSinceEpoch,
	formatSpecies,
	getCharacterName,
	MS_PER_DAY,
} from "lib/util";
import type { ChangeRequest } from "server/database";

function characterToDiffLine(character: Character) {
	return `${character.name.join(" ")} ; ${character.homeWorld} ; ${character.firstAppearance} ; ${formatSpecies(character.species)} ; ${character.abilities.join(", ")}`;
}

function changelogForDay(day: number, heading: string, children?: () => void) {
	A("h3#", heading);
	A("section", () => {
		const from = day - 1;
		const to = day;
		const fromCharacters = charactersForDay(from);
		const toCharacters = charactersForDay(to);

		const removed = fromCharacters.filter(
			(fromCharacter) =>
				!toCharacters.some((toCharacter) =>
					charactersMatch(fromCharacter, toCharacter),
				),
		);
		const added = toCharacters.filter(
			(toCharacter) =>
				!fromCharacters.some((fromCharacter) =>
					charactersMatch(fromCharacter, toCharacter),
				),
		);

		const changed = [...added, ...removed].sort((a, b) =>
			getCharacterName(a).localeCompare(getCharacterName(b)),
		);

		A("ol", () => {
			A("li", () =>
				A(`del#${from} ; ${new Date(from * MS_PER_DAY).toISOString()}`),
			);
			A("li", () =>
				A(`ins#${to} ; ${new Date(MS_PER_DAY * to).toISOString()}`),
			);
			A.onEach(changed, (character) => {
				A("li", () => {
					A(
						character.validFrom === to ? "ins" : "del",
						"text=",
						characterToDiffLine(character),
					);
				});
			});
		});

		children?.();
	});
}

const newRequestDialog = A('dialog popover="" id=newRequestDialog', () => {
	A("h2.both#Make a new request");
	A("hr.both");
	A(
		`form autocomplete=off name=characterRequest action="/api/changes" method=post`,
		() => {
			A(`input type=number value=${daysSinceEpoch() + 1} name=day`, {
				$display: "none",
			});

			A(`label text="Name" for=characterName`);
			A(`input id=characterName required="" name=characterName`);

			A(`label text="World of Origin" for=homeWorld`);
			A(`input id=homeWorld required="" name=homeWorld`);

			A(`label text="First Appearance" for=firstAppearance`);
			A(`input id=firstAppearance required="" name=firstAppearance`);

			A(`label text="Species" for=species`);
			A(`input id=species required="" name=species`);

			A(`label text="Abilities/Investiture" for=abilities`);
			A(`input id=abilities required="" name=abilities`);

			A(`label text="Shippable" for=shippable`);
			A("input type=checkbox id=shippable name=shippable");

			A(`label text="Replaces" for=replaces`);
			A("input id=replaces name=replaces");

			A("hr");
			A("input type=submit value=Submit");
		},
	);
}) as HTMLDialogElement;

const changeResponse = A.proxy(
	fetch("/api/changes").then(
		(response) =>
			response.json() as Promise<
				(ChangeRequest & { rowid: number })[] | { error: string }
			>,
	),
);

A("header#Cosmeredle Changes");
A("main", () => {
	changelogForDay(daysSinceEpoch(), "Changes for today");
	changelogForDay(daysSinceEpoch() + 1, "Changes for tomorrow", () => {});
	const togglePopover = A("button text=New", {}) as HTMLButtonElement;
	togglePopover.popoverTargetElement = newRequestDialog;

	A("section", () => {
		if (changeResponse.busy) {
			A("span#Loading");
		} else if (Array.isArray(changeResponse.value)) {
			const changeRequests = changeResponse.value;
			A("ol", () => {
				A.onEach(
					changeRequests,
					(change) => {
						A("li.accepted=", !!change.accepted, () => {
							A(
								` a href=/changes/${change.rowid} ##${change.rowid} - ${change.characterName}`,
							);
						});
					},
					(change) => change.rowid,
				);
			});
		} else {
			A("span#", JSON.stringify(changeResponse.value));
		}
	});
});
Footer();
