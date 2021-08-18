<script>
	import { page } from '$app/stores';
	import MetaTags from '$lib/MetaTags.svelte';

	export let title;
	export let excerpt;
	export let image;
	export let slug;
	export let keywords;
	export let genre;
	export let date;
	export let wordcount;
	export let url = `https://${$page.host}${$page.path}`;

	const socialLinks = [
		{
			href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
				`${title} by @brandenbuilds ${url}`
			)}`,
			alt: 'Twitter',
			icon: '/svg/logos/twitter.svg',
			trackingName: 'twitter'
		},
		{
			href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
				`${url}`
			)}&t=${title}`,
			alt: 'Facebook',
			icon: '/svg/logos/facebook.svg',
			trackingName: 'facebook'
		},
		{
			href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
			alt: 'Linkedin',
			icon: '/svg/logos/linkedin.svg',
			trackingName: 'linkedin'
		},
		{
			href: `http://www.reddit.com/submit?url=${encodeURIComponent(`${url}&title=${title}`)}`,
			alt: 'Reddit',
			icon: '/svg/logos/reddit.svg',
			trackingName: 'reddit'
		}
	];
</script>

<MetaTags
	title={title}
	description={excerpt}
	keywords={keywords}
	image={`https://${$page.host}/images/blog/${slug}/${image}`}
	url={url}
	jsonLd={{
		"@type": "BlogPosting",
        "headline": {title},
        "image": `images/blog/${slug}/${image}`,
        "award": "Best article ever written",
        "editor": "Branden Builds",
        "genre": {genre},
        "keywords": {keywords},
        "wordcount": {wordcount},
        "publisher": "Branden Builds",
        "url": {url},
        "datePublished": {date},
        "dateCreated": {date},
        "dateModified": {date},
        "description": {excerpt},
        "author": {
            "@type": "Person",
            "name": "Branden Builds"
        }
	}}
/>


<article class="blog-post container max-w-3xl mx-auto py-10 lg:py-20 px-4">
	<slot />
	<section class="share border-t border-solid border-bbuilds-black mt-4">
		<h2 class="text-xl my-4">Share This Post</h2>
		<ul class="flex" style="list-style: none; padding-left:0;">
			{#each socialLinks as link}
				<li class="mr-2">
					<a
					sveltekit:prefetch rel="external"
						href={link.href}
						target="_blank"
						class="block transition duration-300 ease-in-out transform hover:-translate-y-1"
					>
						<img
							src={link.icon}
							alt={link.alt}
							height="24"
							width="24"
							class="bg-bbuilds-yellow overflow-hidden"
						/>
					</a>
				</li>
			{/each}
		</ul>
	</section>
</article>

<style>
	:global(body) {
		line-height: 1.5;
		/* white-space: pre-wrap; */
	}

	:global(.blog-post ul) {
		padding-inline-start: 1.7em;
	}

	:global(.blog-post ul) {
		list-style: disc;
	}

	:global(.blog-post ul > li) {
		padding-left: 0.1em;
	}

	:global(.blog-post p) {
		margin-top: 0.5em;
		margin-bottom: 0.5em;
	}

	:global(.post-img) {
		@apply my-4;
	}

	:global(h1),
	:global(h2),
	:global(h3),
	:global(h4),
	:global(h5),
	:global(h6) {
		@apply leading-tight;
		@apply mt-5;
		@apply mb-4;
	}

	:global(h2) {
		@apply mt-8;
	}
</style>
