<script>
	import { page } from '$app/stores';
    export let title;
    export let description;
    export let norobots = false;
    export let image;
    export let type = 'article';
    export let url = `https://${$page.host}${$page.path}`;
    export let keywords;
</script>

<svelte:head>
	<title>{title}</title>
	<meta
		name="keywords"
		content={keywords}
	/>
	<meta name="description" content={description} />

	{#if norobots}
		<meta name="robots" content="noindex" />
	{/if}

	<!-- https://ogp.me -->
	<meta property="og:image" content={`${$page.host}/${image}`} />
	<meta property="og:description" content={description} />
	<meta property="og:title" content={title} />
	<meta property="og:type" content={type} />
	<meta property="og:url" content={url} />

	<!-- https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:site" content="@brandenbuilds" />
	<meta name="twitter:creator" content="@brandenbuilds" />
	<meta name="twitter:image" content={`${$page.host}/${image}`} />
	
</svelte:head>
