import path from "node:path";

const databasePath = path.resolve(
	Bun.env.DATABASE_PATH ?? "./cosmeredle.sqlite",
);

const sql: Bun.SQL = await new Bun.SQL({
	adapter: "sqlite",
	filename: databasePath,
	readwrite: true,
	safeIntegers: false,
	create: true,
	readonly: false,
	strict: true,
}).connect();

// await sql`DROP TABLE IF EXISTS [change_requests]`;
await sql`CREATE TABLE IF NOT EXISTS [change_requests] (
    day int,
    characterName text,
    homeWorld text,
    firstAppearance text,
    species text,
    abilities text,
    shippable int,
    replaces text null,
    accepted int
) STRICT`;

export async function getChangeRequests() {
	return await sql<ChangeRequest[]>`SELECT * FROM [change_requests]`;
}

export async function getChangeRequest(
	rowid: number,
): Promise<ChangeRequest | null> {
	return (
		(
			await sql<
				ChangeRequest[]
			>`SELECT * FROM [change_requests] WHERE [rowid] = ${rowid}`
		)[0] ?? null
	);
}

export async function newChangeRequest(...changeRequests: ChangeRequest[]) {
	return (await sql`INSERT INTO [change_requests] ${sql(changeRequests)} RETURNING rowid`) as {
		rowid: number;
	}[] & {
		count: number;
		command: "INSERT";
		lastInsertRowid: null;
		affectedRows: null;
	};
}

// console.debug(
// 	await newChangeRequest(
// 		{
// 			day: daysSinceEpoch(),
// 			characterName: "name",
// 			homeWorld: "Roshar",
// 			firstAppearance: "The Way of Kings",
// 			species: "Human",
// 			abilities: "AIOhdg, iagho, asigaho",
// 			shippable: true,
// 			replaces: "Stormfather",
// 			accepted: false,
// 		},
// 		{
// 			day: daysSinceEpoch(),
// 			characterName: "name",
// 			homeWorld: "Roshar",
// 			firstAppearance: "The Way of Kings",
// 			species: "Human",
// 			abilities: "AIOhdg, iagho, asigaho",
// 			shippable: true,
// 			replaces: "Stormfather",
// 			accepted: false,
// 		},
// 	),
// );

export { sql };

export type ChangeRequest = {
	day: number;
	characterName: string;
	homeWorld: string;
	firstAppearance: string;
	species: string;
	abilities: string;
	shippable: boolean;
	replaces: string | null;
	accepted: boolean;
};
export const ChangeRequestColumns = [
	"day",
	"characterName",
	"homeWorld",
	"firstAppearance",
	"species",
	"abilities",
	"shippable",
	"replaces",
	"accepted",
] as const;
