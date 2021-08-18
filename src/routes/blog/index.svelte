<script>
	import { session } from '$app/stores';
    import MetaTags from '$lib/MetaTags.svelte';
    import PostPreview from "$lib/PostPreview.svelte";
    import { page } from '$app/stores';
	import BrandCube from '$lib/svgs/brandcube.svelte';
	export let url = `https://${$page.host}${$page.path}`;

    const posts = $session.posts
</script>

<MetaTags
	title="Branden Builds Blog"
	description="A blog that has content on full stack web development, technical SEO, and branding."
	keywords='frontend posts, backend posts, technical SEO articles'
	openGraph={{
		url,
		title: 'Branden Builds Blog',
		description: 'A blog that has content on full stack web development, technical SEO, and branding.',
		images: [
			{
				url: 'images/brandenbuilds-opengraph.jpg',
				width: 800,
				height: 600,
				alt: 'Branden Builds Website Development Services'
			},
		],
		site_name: 'Branden Builds'
	}},
	jsonLd={{
		"@type": "WebPage",
		"name": "Branden Builds Blog",
		"description": "A blog that has content on full stack web development, technical SEO, and branding.",
		"publisher": {
			"@type": "ProfilePage",
			"name": "Branden Builds"
		}
	}}
/>


<section
		id="blog-hero"
		class="hero bg-bbuilds-black text-bbuilds-gray flex flex-wrap items-center relative"
	>
		<div class="container mx-auto px-4">
			<h1 class="mb-8">Branden Builds Blog</h1>
            <p class="md:w-1/2">Read articles and posts on web development, SEO, and branding.</p>
		</div>
		<div class="hero-brand-cube hidden md:block absolute right-0 bottom-0">
			<BrandCube />
		</div>
	</section>

<section id="recent-posts" class="bg-bbuilds-gray py-20">
    <div class="container mx-auto px-4">
        <h2 class="mb-16 text-center text-h2">Articles</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {#each posts as post, index}
                <div class="posts-grid__item">
                    <PostPreview {post} />
                </div>
            {/each}
        </div>
    </div>
</section>

<style>
    .hero {
        height: 35vh;
        min-height: 200px;
    }

    .hero-brand-cube {
        max-width: 20%;
    }

    :global(.svg.link) {
        position: absolute;
        width: 5rem;
        height: 5rem;
    }
</style>