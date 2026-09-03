#! /usr/bin/env bun
import { playGame } from "lib/solve";
import { daysSinceEpoch } from "lib/util";

console.log(
	playGame(daysSinceEpoch())
		.map((guess) => guess[0])
		.join(" -> "),
);
