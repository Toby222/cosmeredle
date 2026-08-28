import CHANGE_REQUEST from "assets/changes/changeRequest.html";
import CHANGES from "assets/changes/changes.html";
import CHARACTERS from "assets/characters/characters.html";
import GAME from "assets/game/game.html";
import {
	charactersForDay,
	compareCharacters,
	daysSinceEpoch,
	MS_PER_DAY,
} from "lib/util";
import { seededRandom } from "server/random";
import { characterForDay, getPar } from "server/util";
import {
	type ChangeRequest,
	ChangeRequestColumns,
	getChangeRequest,
	getChangeRequests,
	newChangeRequest,
} from "./database";

let today = 0;

function nextDay() {
	today = daysSinceEpoch();

	console.info(
		"Updating today to",
		today,
		"; today's character is",
		characterForDay(today).name.join(" "),
	);
}

function updateToday(): boolean {
	if (today === daysSinceEpoch()) return false;
	while (today < daysSinceEpoch()) {
		nextDay();
	}
	return true;
}

updateToday();
setInterval(() => {
	updateToday();
}, 1_000);

const PORT = 45065;

console.info("listening on port", PORT);
Bun.serve({
	port: PORT,
	fetch: async (request) => {
		if (new URL(request.url).pathname.startsWith("/api"))
			return Response.json(
				{ error: "api not found" },
				{ status: 404, statusText: "Not Found" },
			);
		console.debug(request.url);
		return Response.redirect("/", 301);
	},
	routes: {
		"/": GAME,
		"/characters": CHARACTERS,
		"/characters.html": Response.redirect("/characters"),
		"/changes": CHANGES,
		"/changes/:id": CHANGE_REQUEST,

		"/api/changes/:id": async (req) => {
			const id = Number.parseInt(req.params.id, 10);
			if (!Number.isFinite(id))
				return Response.json({ error: "Invalid id" }, { status: 400 });
			const changeRequest = await getChangeRequest(id);

			if (changeRequest === null)
				return Response.json({ error: "not found" }, { status: 404 });
			return Response.json(await getChangeRequest(id));
		},
		"/api/changes": {
			async GET() {
				return Response.json(await getChangeRequests());
			},
			async POST(req) {
				const formData = await req.formData();
				const missingColumns = [] as (typeof ChangeRequestColumns)[number][];
				const changeRequest: Partial<ChangeRequest> = {
					day: today,
					accepted: false,
				};

				for (const column of ChangeRequestColumns) {
					if (column === "day") continue;
					if (column === "accepted") continue;

					const value = formData.get(column);

					if (
						value instanceof File ||
						(!["replaces", "shippable"].includes(column) && value === null)
					) {
						console.debug(column, value);
						missingColumns.push(column);
						continue;
					}

					if (column === "shippable") changeRequest[column] = value === "true";
					else if (column === "replaces") changeRequest[column] = value;
					else changeRequest[column] = value as string;
				}

				if (missingColumns.length > 0) {
					return Response.json(
						{ missingColumns },
						{
							status: 400,
							statusText: "missing columns",
						},
					);
				}

				const inserted = await newChangeRequest(changeRequest as ChangeRequest);

				const newId = inserted[0].rowid;

				return Response.redirect(`/changes/${newId}`);
			},
		},
		"/api/guess/:characterIdx": {
			async POST(request) {
				const { characterIdx } = request.params;
				if (!/\d+/.test(characterIdx)) return Response.error();
				const characters = charactersForDay(today);
				const char = characters[Number.parseInt(characterIdx, 10)];

				return Response.json(compareCharacters(char, characterForDay(today)));
			},
		},
		"/api/today": async () =>
			Response.json({
				today: today,
				tomorrow: (today + 1) * MS_PER_DAY,
			}),
		"/api/par": async () => Response.json(getPar(today)),
		"/api/characters": async () => Response.json(charactersForDay(today)),
		"/api/giveUp": async () =>
			Response.json(charactersForDay(today).indexOf(characterForDay(today))),
		"/api/ship": async () => {
			const shippableCharacters = charactersForDay(today).filter(
				(char) => char.shippable,
			);

			const valA = seededRandom(today);
			let next = today;
			let valB: number;
			do {
				valB = seededRandom(++next);
			} while (valA === valB);

			const idxA = Math.floor(valA * shippableCharacters.length);
			const charA = shippableCharacters[idxA];

			const idxB = Math.floor(valB * shippableCharacters.length);
			const charB = shippableCharacters[idxB];
			return Response.json([idxA, charA, idxB, charB]);
		},
	},
});
