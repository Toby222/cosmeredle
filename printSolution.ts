#! /usr/bin/env bun
import { playGame } from "lib/solve";
import { charactersForToday } from "lib/util";
import { characterForToday } from "server/util";

console.log(
	playGame(charactersForToday(), characterForToday(), false)
		.map((guess) => guess[0])
		.join(" -> "),
);
