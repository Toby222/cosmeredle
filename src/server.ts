import INDEX from "assets/index.html";
import { playGame } from "lib/solve";
import {
	charactersForDay,
	compareCharacters,
	daysSinceEpoch,
	MS_PER_DAY,
} from "lib/util";
import { seededRandom } from "server/random";
import { createSimpleLogger, type STANDARD_LEVELS } from "simple-node-logger";

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

const log = createSimpleLogger(loggerConfig);

let todaysCharacterIndex = 0;
let today = 0;
let par = 0;

function nextDay() {
	const yesterday = today;
	const charactersYesterday = charactersForDay(yesterday);
	const yesterdaysCharacterName =
		charactersYesterday[todaysCharacterIndex]?.name;

	today++;

	const characters = charactersForDay(today);
	todaysCharacterIndex = Math.floor(seededRandom() * characters.length);

	if (characters[todaysCharacterIndex].name === yesterdaysCharacterName) {
		todaysCharacterIndex = (todaysCharacterIndex + 1) % characters.length;
	}

	console.log(
		"Updating today to",
		today,
		"; today's character is",
		characters[todaysCharacterIndex].name.join(" "),
	);
}
function setPar() {
	const characters = charactersForDay(today);
	par =
		3 + playGame(characters, characters[todaysCharacterIndex], false).length;
	console.log("par is", par);
}

function updateToday(): boolean {
	if (today === daysSinceEpoch()) return false;
	while (today < daysSinceEpoch()) {
		nextDay();
	}
	return true;
}

updateToday();
setPar();

setInterval(() => {
	if (updateToday()) setPar();
}, 1_000);

const PORT = 45065;

log.info("listening on port ", PORT);
Bun.serve({
	port: PORT,
	fetch: (request) => {
		console.debug(request);
		return Response.redirect("/", 301);
	},
	routes: {
		"/": INDEX,
		"/guess/:characterIdx": {
			async POST(request) {
				const { characterIdx } = request.params;
				if (!/\d+/.test(characterIdx)) return Response.error();
				const characters = charactersForDay(today);
				const char = characters[Number.parseInt(characterIdx, 10)];

				return new Response(
					JSON.stringify(
						compareCharacters(char, characters[todaysCharacterIndex]),
					),
					{ headers: { "Content-Type": "application/json" } },
				);
			},
		},
		"/today": () =>
			new Response(
				JSON.stringify({
					today: today,
					tomorrow: (today + 1) * MS_PER_DAY,
				}),
				{ headers: { "Content-Type": "application/json" } },
			),
		"/par": () =>
			new Response(par.toString(), {
				headers: { "Content-Type": "text/plain" },
			}),
		"/characters": () =>
			new Response(JSON.stringify(charactersForDay(today)), {
				headers: { "Content-Type": "application/json" },
			}),
	},
});
