<script>
	import { page, session } from '$app/stores';
	import MetaTags from '$lib/MetaTags.svelte';
	import BrandCube from '$lib/svgs/brandcube.svelte';
	import PostPreview from '$lib/PostPreview.svelte';

	export let tag = $page.params.tag;
	export let url = `https://${$page.host}${$page.path}`;

	const posts = $session.posts;
	console.log('posts', posts);
	const filteredTagPosts = posts.filter((post) => {
		return post.tags.includes(tag);
	});
</script>

<MetaTags
	title={`Posts tagged ${tag} on Branden Builds Blog `}
	description={`Read Branden Build's articles on ${tag}`}
	keywords={`frontend posts, backend posts, technical SEO articles tagged ${tag}`}
	openGraph={{
		url,
		title: `Posts tagged ${tag} on Branden Builds Blog `,
		description: `Read Branden Build's articles on ${tag}`,
		images: [
			{
				url: 'images/brandenbuilds-opengraph.jpg',
				width: 800,
				height: 600,
				alt: `Branden Build's articles on ${tag}`
			},
		],
		site_name: 'Branden Builds'
	}}
/>


<!-- <OpenGraph
	title={`Posts tagged ${tag} on Branden Builds Blog `}
	keywords={`frontend posts, backend posts, technical SEO articles tagged ${tag}`}
	description={`Read Branden Build's articles on ${tag}`}
	{url}
	image={`images/brandenbuilds-opengraph.jpg`}
/> -->

<section
	id="tag-hero"
	class="py-16 bg-bbuilds-black text-bbuilds-gray flex flex-wrap items-center relative"
>
	<div class="container mx-auto px-4">
		<h1 class="text-xl md:text-3xl mb-8 md:w-1/2">Branden Builds Blog Posts Tagged: {tag}</h1>
	</div>
	<div class="hero-brand-cube hidden md:block absolute right-0 bottom-0">
		<BrandCube />
	</div>
</section>

<section
	id="tagged-posts"
	class="bg-bbuilds-gray py-10 lg:py-20"
>
	<div class="container mx-auto px-4">
		<h2 class=" mt-6 mb-16 text-center text-h2">Articles Tagged: {tag}</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
			{#each filteredTagPosts as post}
				<div class="posts-grid__item">
					<PostPreview {post} />
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.hero-brand-cube {
		max-width: 20%;
	}

	:global(.svg.link) {
		position: absolute;
		width: 5rem;
		height: 5rem;
	}
</style>
