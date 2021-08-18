<script>
	import BlogHeader from '$lib/BlogHeader.svelte';
	import LinkSVG from '$lib/svgs/link.svelte';
	import Image from "svelte-image";

	export let post;
</script>

<article>
	<a href={`/blog/${post.slug}`} class="post-preview-link" sveltekit:prefetch rel="external">
		<div
			class="bg-bbuilds-black m-auto overflow-hidden rounded-xl h-48 relative w-full flex items-center justify-center text-bbuilds-gray relative"
		>
			<Image class="object-cover img" wrapperClass="object-cover absolute top-0" alt={post.title} src={`/images/blog/${post.slug}/${post.image}`} />
			<LinkSVG />
		</div>
	</a>
	<BlogHeader rawDate={post.date} title={post.title} tags={post.tags} postPreview={true} />
	<p>{post.excerpt}</p>
	<a sveltekit:prefetch rel="external" class="flex items-center underline" href={`/blog/${post.slug}`}>Read Post</a>
</article>

<style>
	:global(.svg.link) {
		opacity: 0;
	}

	.post-preview-link:hover :global(.svg.link) {
		opacity: 1;
	}

	.post-preview-link :global(.wrapper) {
		opacity: 1;
	}

	.post-preview-link:hover :global(.wrapper) {
		opacity: 0.25;
	}
</style>
