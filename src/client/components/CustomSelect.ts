import { $, observe, proxy, type ValueRef } from "aberdeen";

// TODO: Select with arrow keys

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
	const search = proxy("");
	const opened = proxy(false);
	// Selected index into filteredEntries
	const selectedIndex = proxy<number | undefined>(undefined);

	function selectEntry(entry: Entry<number>) {
		console.debug("selecting", entry);
		valueProxy.value = entry.value;
		search.value = entry.label;
		opened.value = false;
	}
	observe(() => {
		if (!opened.value) selectedIndex.value = undefined;
	});
	const filteredEntries = observe(() =>
		entries.filter((entry) =>
			entry.label.toLowerCase().includes(search.value.toLowerCase()),
		),
	);
	const enabledEntries = observe(() =>
		filteredEntries.value.filter((entry) => !entry.disabled),
	);

	observe(() => {
		const index = filteredEntries.value.findIndex(
			(entry) => entry.label === search.value,
		);
		if (index >= 0) selectedIndex.value = index;
		else valueProxy.value = undefined;
	});

	function increaseSelectedIndex() {
		if (selectedIndex.value === undefined) selectedIndex.value = 0;
		else if (selectedIndex.value < filteredEntries.value.length - 1)
			selectedIndex.value++;

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
		else if (selectedIndex.value > 0) selectedIndex.value--;

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

	return $(
		"div.customSelect",
		{
			".opened": opened,
			".enabled": enabled,
		},
		() => {
			$("div.input", () => {
				const input = $("input", {
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
				$("button:Clear", {
					click() {
						search.value = "";
						selectedIndex.value = undefined;
					},
				});
			});
			let disableAutoScroll = false;
			let autoScrollTimeout: ReturnType<typeof setTimeout> | undefined =
				undefined;
			$("ul", () => {
				for (let idx = 0; idx < filteredEntries.value.length; idx++) {
					const entry = filteredEntries.value[idx];
					const listItem = $(`li:${entry.label}`, {
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
