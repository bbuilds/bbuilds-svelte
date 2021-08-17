// grabbing all the posts and sorying them
// https://kit.svelte.dev/docs#hooks
export const getSession = async () => {
	const posts = await Promise.all(
		Object.entries(import.meta.glob('../src/routes/blog/*.md')).map(async ([path, page]) => {
			const { metadata } = await page();
			const filename = path.split('/').pop();
			return Object.assign(Object.assign({}, metadata), { filename });
		})
	);
	posts.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
	return {
		posts
	};
};
