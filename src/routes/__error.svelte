<script context="module">
	export function load({ error, status }) {
		return {
			props: { error, status }
		};
	}
</script>

<script>
	import { dev } from '$app/env';
	import { page } from '$app/stores';
	import BrandCube from '$lib/svgs/brandcube.svelte';
	import MetaTags from '$lib/MetaTags.svelte';

	export let status;
	export let error;
	export let url = `https://${$page.host}${$page.path}`;
</script>

<MetaTags
	title={`Branden Builds | ${status}`}
	description="The system is down"
	keywords='branden builds, web developer, frontend developer, backend developer'
	openGraph={{
		url,
		title: `Branden Builds | ${status}`,
		description: 'The system is down',
		images: [
			{
				url: 'images/brandenbuilds-opengraph.jpg',
				width: 800,
				height: 600,
				alt: 'Branden Builds Website Development Services'
			},
		],
		site_name: 'Branden Builds'
	}}
/>

<article>
	<section
		id="404-hero"
		class="theme-full-height hero bg-bbuilds-black text-bbuilds-gray flex flex-wrap items-center relative"
	>
		<div class="container mx-auto px-4">
			<h1 class="mb-8">Oh no! You've reached a {status}</h1>
			{#if error && error.message}
				<p class="md:w-1/2">{error.message}</p>
			{/if}
			{#if dev && error.stack}
				<pre>{error.stack}</pre>
			{/if}
		</div>
		<div class="hero-brand-cube hidden md:block absolute right-0 bottom-0">
			<BrandCube />
		</div>
	</section>
</article>

<style>
	.hero-brand-cube {
		max-width: 20%;
	}
</style>
