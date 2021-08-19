<script>
	import BlogHeader from '$lib/BlogHeader.svelte';
	import LinkSVG from '$lib/svgs/link.svelte';
	import Image from 'svelte-image';

	export let post;
</script>

<article class="post-preview relative">
	<div
		class="post-preview-image bg-bbuilds-black m-auto overflow-hidden rounded-xl h-48 relative w-full flex items-center justify-center text-bbuilds-gray relative transition duration-300 ease-in-out"
	>
		<Image
			class="object-cover img"
			wrapperClass="object-cover absolute top-0 img-wrapper transition duration-300 ease-in-out"
			alt={post.title}
			src={`/images/blog/${post.slug}/${post.image}`}
		/>
		<LinkSVG />
	</div>
	<a href={`/blog/${post.slug}`} class="link-shield" sveltekit:prefetch rel="external">
		<BlogHeader rawDate={post.date} title={post.title} tags={post.tags} postPreview={true} />
	</a>
	<p>{post.excerpt}</p>
</article>

<style>
	:global(.svg.link) {
		opacity: 0;
	}

	.post-preview:hover :global(.svg.link) {
		opacity: 1;
	}

	.post-preview:hover :global(.img-wrapper) {
		opacity: 0.25;
	}
</style>
