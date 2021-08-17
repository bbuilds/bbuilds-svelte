<script>
	// const editURL = `https://github.com/bbuilds/brandenbuilds/tree/master/src/${
	// 	post.fileAbsolutePath.split('/src/')[1]
	// }`;
	export let title;
	export let rawDate;
	export let tags;
	export let postPreview = false;

	const dateDisplay = new Date(Date.parse(rawDate)).toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
</script>

<header>
	{#if postPreview}
		<h2 class="my-3 leading-none text-xl">{title}</h2>
	{:else}
		<h1 class="mt-4">{title}</h1>
	{/if}
	<div class="post-meta {postPreview ? 'mb-2' : 'mb-6'}">
		<p class="text-small">
			Posted: <time dateTime={rawDate}>{dateDisplay}</time> | Tags: 
			{#each tags as tag, index}
				<a sveltekit:prefetch rel="external" href={`/tags/${tag}`}>{tag}</a>{#if index < tags.length - 1},&nbsp;{/if}
			{/each}
		</p>
	</div>
</header>
