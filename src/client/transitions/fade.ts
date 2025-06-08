const FADE_TIME = 1_000;
const FADE_TRANSITION = `opacity ${FADE_TIME}ms linear`;

const INVISIBLE: Partial<CSSStyleDeclaration> = {
	opacity: "0",
};

const VISIBLE: Partial<CSSStyleDeclaration> = {
	opacity: "1",
};

export async function fadeIn(element: HTMLElement) {
	Object.assign(element.style, INVISIBLE);
	element.style.transition = FADE_TRANSITION;

	// Make sure the layouting has been performed, to cause transitions to trigger
	element.innerText;

	Object.assign(element.style, VISIBLE);

	setTimeout(() => {
		element.style.transition = "";
		element.style.opacity = "";
		if (element.getAttribute("style")?.length === 0)
			element.removeAttribute("style");
	}, FADE_TIME);
}

export async function fadeOut(element: HTMLElement) {
	Object.assign(element.style, VISIBLE);
	element.style.transition = FADE_TRANSITION;

	// Make sure the layouting has been performed, to cause transitions to trigger
	element.innerText;

	Object.assign(element.style, INVISIBLE);

	setTimeout(() => {
		element.remove();
	}, FADE_TIME);
}
