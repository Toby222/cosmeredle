import { $, observe, onEach, proxy, type ValueRef } from "aberdeen";

// TODO: Select with arrow keys

export type Entry<T> = {
	label: string;
	value: T;
	disabled: boolean;
};
export function CustomSelectNumber(
	entries: Entry<number>[],
	valueProxy: ValueRef<number>,
) {
	if (entries.length === 0) return;
	const search = proxy("");
	const visible = proxy(false);

	$(
		"div.customSelect",
		{
			".opened": observe(() => visible.value),
			click() {
				visible.value = !visible.value;
			},
		},
		() => {
			$("input", {
				type: "text",
				placeholder: "Search",
				bind: search,
				input() {
					if (search.value.length > 0 && !visible.value) {
						visible.value = true;
					}
				},
			});
			$("ul", () => {
				onEach(entries, (entry) => {
					$(`li:${entry.label}`, {
						click(event: MouseEvent) {
							if (event.target === this) {
								event.stopPropagation();
								if (!(this as HTMLLIElement).classList.contains("disabled")) {
									valueProxy.value = entry.value;
									search.value = entry.label;
									visible.value = false;
								}
							}
						},
						".disabled": entry.disabled,
						".hidden": !entry.label
							.toLowerCase()
							.includes(search.value.toLowerCase()),
					});
				});
			});
		},
	);
}
