import { $ } from "aberdeen";

export type Entry = { label: string; value: string };
export function CustomSelect(entries: Entry[]) {
	$("div.customSelect");
}
