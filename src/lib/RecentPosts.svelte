<script>
	import { session } from '$app/stores';
    import PostPreview from "$lib/PostPreview.svelte";

    const posts = $session.posts
</script>

<section id="recent-posts" class="bg-bbuilds-gray py-10 lg:py-20">
    <div class="container mx-auto px-4">
        <h2 class=" mt-6 mb-16 text-center text-h2">Blog</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {#each posts.slice(0, 3) as post, index}
                <div class="posts-grid__item">
                    <PostPreview {post} />
                </div>
            {/each}
        </div>
        <div class="text-center pt-10">
            <a sveltekit:prefetch rel="external" href="/blog" class="button">View Blog</a>
        </div>
    </div>
</section>

<style>
    :global(.svg.link) {
        position: absolute;
        width: 5rem;
        height: 5rem;
    }
</style>