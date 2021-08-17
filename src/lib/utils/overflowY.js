export const showHideOverflowY = (bool) => {
	const html = document.querySelector('html');
	if (bool) {
		html.classList.add('overflow-y-hidden');
	} else {
		html.classList.remove('overflow-y-hidden');
	}
};
