import { type STANDARD_LEVELS, createSimpleLogger } from "simple-node-logger";
import FAVICON from "../../public/favicon.svg" with { type: "text" };
import INDEX from "../../public/index.html" with { type: "text" };
import INDEX_JS from "../../public/js/index.js" with { type: "text" };
import INDEX_JS_MAP from "../../public/js/index.js.map" with { type: "text" };
import STYLE from "../../public/style.css" with { type: "text" };
import CHARACTERS from "lib/characters.json";

import { daysSinceEpoch, Overlap } from "lib/util";
import { seededRandom } from "./random";

type Character = (typeof CHARACTERS)[number];

const logLevel = Bun.env.LOG_LEVEL;
const logToFile = Bun.env.LOG_TO_FILE === "true";

type LoggerConfig = Parameters<typeof createSimpleLogger>[number];

const loggerConfig: LoggerConfig = {
	timestampFormat: "YYYY-MM-DDTHH:mm:ss",
};

if (logToFile) {
	loggerConfig.logFilePath = "cosmeredle.log";
}
if (
	logLevel !== undefined &&
	["all", "trace", "debug", "info", "warn", "error", "fatal"].includes(logLevel)
) {
	loggerConfig.level = logLevel as STANDARD_LEVELS;
} else {
	loggerConfig.level = "info";
}

for (let i = 0; i < daysSinceEpoch(); i++) {
	seededRandom();
}
let todaysCharacterIndex = Math.floor(seededRandom() * CHARACTERS.length);
let today = daysSinceEpoch();

setInterval(() => {
	if (today !== daysSinceEpoch()) {
		todaysCharacterIndex = Math.floor(seededRandom() * CHARACTERS.length);
		today = daysSinceEpoch();
	}
}, 1_000);

const log = createSimpleLogger(loggerConfig);

function compareArrayPositional(
	arrayA: string[],
	arrayB: string[],
): keyof typeof Overlap {
	const biggerLength = Math.max(arrayA.length, arrayB.length);
	let matching = 0;
	for (let i = 0; i < biggerLength; i++) {
		if (arrayA[i] === arrayB[i]) matching++;
	}
	return matching === 0
		? Overlap.None
		: matching === biggerLength
			? Overlap.Full
			: Overlap.Partial;
}
function compareArrayFuzzy(
	arrayA: string[],
	arrayB: string[],
): keyof typeof Overlap {
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

function compareCharacters(
	characterA: Character,
	characterB: Character,
): (keyof typeof Overlap)[] {
	if (characterA.id === characterB.id)
		return [
			Overlap.Full,
			Overlap.Full,
			Overlap.Full,
			Overlap.Full,
			Overlap.Full,
		];

	return [
		characterA.name === characterB.name ? Overlap.Full : Overlap.None,
		characterA.homeWorld === characterB.homeWorld ? Overlap.Full : Overlap.None,
		characterA.firstAppearance === characterB.firstAppearance
			? Overlap.Full
			: Overlap.None,
		compareArrayPositional(characterA.species, characterB.species),
		compareArrayFuzzy(characterA.abilities, characterB.abilities),
	];
}

const PORT = 45065;

log.info("listening on port ", PORT);
Bun.serve({
	port: PORT,
	fetch: (request) => {
		console.debug(request);
		return Response.redirect("/", 301);
	},
	routes: {
		"/": () =>
			new Response(INDEX, {
				headers: { "Content-Type": "text/html" },
			}),
		"/style.css": () =>
			new Response(STYLE, {
				headers: { "Content-Type": "text/css" },
			}),
		"/favicon.svg": () =>
			new Response(FAVICON, {
				headers: { "Content-Type": "image/svg+xml" },
			}),
		"/js/index.js": () =>
			new Response(INDEX_JS, {
				headers: {
					"Content-Type": "text/javascript",
					SourceMap: "/js/index.js.map",
				},
			}),
		"/js/index.js.map": () =>
			new Response(INDEX_JS_MAP, {
				headers: { "Content-Type": "application/json" },
			}),
		"/guess/:characterId": {
			async POST(request) {
				const { characterId } = request.params;
				if (!/[0-9]+/.test(characterId)) return Response.error();
				const char = CHARACTERS[Number.parseInt(characterId, 10)];

				return new Response(
					JSON.stringify(
						compareCharacters(char, CHARACTERS[todaysCharacterIndex]),
					),
					{
						headers: { "Content-Type": "application/json" },
					},
				);
			},
		},
		"/current": () =>
			new Response(JSON.stringify(CHARACTERS[todaysCharacterIndex]), {
				headers: { "Content-Type": "application/json" },
			}),
	},
});
