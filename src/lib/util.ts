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
