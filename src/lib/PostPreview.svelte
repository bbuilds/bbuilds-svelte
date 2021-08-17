<script>
	import BlogHeader from '$lib/BlogHeader.svelte';
	import LinkSVG from '$lib/svgs/link.svelte';
	export let post;
</script>

<article>
	<a href={`/blog/${post.slug}`} class="post-preview-link" sveltekit:prefetch>
		<div
			class="bg-bbuilds-black m-auto overflow-hidden rounded-xl h-48 relative w-full flex items-center justify-center text-bbuilds-gray"
		>
			<img
				class="object-cover absolute duration-200"
				src={`/images/blog/${post.slug}/${post.image}`}
				alt={post.title}
			/>
			<LinkSVG />
		</div>
	</a>
	<BlogHeader rawDate={post.date} title={post.title} tags={post.tags} postPreview={true} />
	<p>{post.excerpt}</p>
	<a class="flex items-center underline" href={`/blog/${post.slug}`}>Read Post</a>
</article>

<style>
	:global(.svg.link) {
		opacity: 0;
	}

	.post-preview-link:hover :global(.svg.link) {
		opacity: 1;
	}
	.post-preview-link:hover img {
		opacity: 0.25;
	}
</style>
