import A, { type ValueRef } from "aberdeen";
export type Entry<T> = {
	label: string;
	value: T;
	disabled: boolean;
};

export function CustomSelectNumber(
	entries: Entry<number>[],
	valueProxy: ValueRef<number | undefined>,
	enabled: ValueRef<boolean>,
	enterValue: () => void,
): HTMLDivElement | undefined {
	const search = A.proxy("");
	const opened = A.proxy(false);
	// Selected index into filteredEntries
	const selectedIndex = A.proxy<number | undefined>(undefined);

	function selectEntry(entry: Entry<number>) {
		console.debug("selecting", entry);
		valueProxy.value = entry.value;
		search.value = entry.label;
		opened.value = false;
	}
	A.derive(() => {
		if (!opened.value) selectedIndex.value = undefined;
	});
	const filteredEntries = A.derive(() =>
		entries.filter((entry) =>
			entry.label.toLowerCase().includes(search.value.toLowerCase()),
		),
	);
	const enabledEntries = A.derive(() =>
		filteredEntries.value.filter((entry) => !entry.disabled),
	);

	A.derive(() => {
		const index = filteredEntries.value.findIndex(
			(entry) => entry.label === search.value,
		);
		if (index >= 0) selectedIndex.value = index;
		else valueProxy.value = undefined;
	});

	function increaseSelectedIndex() {
		if (selectedIndex.value === undefined) selectedIndex.value = 0;
		else
			selectedIndex.value = Math.min(
				selectedIndex.value + 1,
				filteredEntries.value.length - 1,
			);

		// Avoid landing on disabled fields
		while (
			filteredEntries.value[selectedIndex.value].disabled &&
			selectedIndex.value < filteredEntries.value.length - 1
		) {
			selectedIndex.value++;
		}
		while (
			filteredEntries.value[selectedIndex.value].disabled &&
			selectedIndex.value > 0
		) {
			selectedIndex.value--;
		}
	}
	function decreaseSelectedIndex() {
		if (selectedIndex.value === undefined)
			selectedIndex.value = filteredEntries.value.length - 1;
		else selectedIndex.value = Math.max(selectedIndex.value - 1, 0);

		// Avoid landing on disabled fields
		while (
			filteredEntries.value[selectedIndex.value].disabled &&
			selectedIndex.value > 0
		) {
			selectedIndex.value--;
		}
		while (
			filteredEntries.value[selectedIndex.value].disabled &&
			selectedIndex.value < filteredEntries.value.length - 1
		) {
			selectedIndex.value++;
		}
	}

	return A(
		"div.customSelect",
		{
			".opened": opened,
			".enabled": enabled,
		},
		() => {
			A("div.input", () => {
				const input = A("input", {
					type: "text",
					placeholder: "Search",
					bind: search,
					input() {
						if (enabled.value && search.value.length > 0 && !opened.value) {
							opened.value = true;
						}
					},
					click() {
						opened.value = enabled.value && !opened.value;
					},
					keydown(ev: KeyboardEvent) {
						if (ev.target !== this) return;

						if (ev.key === "Enter") {
							if (!opened.value) enterValue();
							else if (selectedIndex.value !== undefined)
								selectEntry(filteredEntries.value[selectedIndex.value]);
							(this as HTMLInputElement).focus();
							ev.stopPropagation();
						} else if (enabledEntries.value.length === 0) {
							selectedIndex.value = undefined;
						} else if (ev.key === "ArrowUp") {
							opened.value = true;
							decreaseSelectedIndex();
						} else if (ev.key === "ArrowDown") {
							opened.value = true;
							increaseSelectedIndex();
						}
					},
					disabled: enabled.value ? undefined : true,
				});
				(input as HTMLInputElement | undefined)?.focus();
				A("button#Clear", {
					click() {
						search.value = "";
						selectedIndex.value = undefined;
					},
				});
			});
			let disableAutoScroll = false;
			let autoScrollTimeout: ReturnType<typeof setTimeout> | undefined;
			A("ul", () => {
				const entries = filteredEntries.value.sort((entryA, entryB) =>
					entryA.label.localeCompare(entryB.label),
				);
				for (let idx = 0; idx < entries.length; idx++) {
					const entry = entries[idx];
					const listItem = A(`li#${entry.label}`, {
						click(event: MouseEvent) {
							if (event.target === this) {
								event.stopPropagation();
								if (!(this as HTMLLIElement).classList.contains("disabled")) {
									selectEntry(entry);
								}
							}
						},
						mousemove(ev: MouseEvent) {
							if (ev.target === this) {
								disableAutoScroll = true;
								if (entry.disabled) selectedIndex.value = undefined;
								else selectedIndex.value = idx;
								if (autoScrollTimeout !== undefined) {
									clearTimeout(autoScrollTimeout);
								}
								autoScrollTimeout = setTimeout(() => {
									disableAutoScroll = false;
								}, 200);
								ev.stopPropagation();
							}
						},
						".disabled": entry.disabled,
						".selected": idx === selectedIndex.value,
					});
					if (idx === selectedIndex.value && !disableAutoScroll) {
						listItem?.scrollIntoView({
							behavior: "smooth",
							block: "nearest",
						});
					}
				}
			});
		},
	) as HTMLDivElement | undefined;
}
