<script>
	import OpenGraph from '$lib/OpenGraph.svelte';
	import BrandCube from '$lib/svgs/brandcube.svelte';
	import '../content-styles.css';
</script>

<OpenGraph
	title={'Traditional WordPress Development Services | Branden Builds'}
	keywords={'wordpress, php, plugin development, theme development'}
	description="WordPress Development Services by Branden Builds"
	image={`images/brandenbuilds-opengraph.jpg`}
/>

<article>
	<header
		id="hero"
		class="py-16 bg-bbuilds-black text-bbuilds-gray flex flex-wrap items-center relative"
	>
		<div class="container mx-auto px-4 pb-20 relative z-10">
			<h1 class="text-xl md:text-3xl lg:max-w-2/3 mb-8">Traditional WordPress Development</h1>
			<p class="md:w-1/2">
				Using WordPress as a traditional monolithic CMS? I come correct in every aspect of real
				WordPress development.
			</p>
			<a href="/contact" class="button mt-8 inline-block">Talk nerdy to me</a>
		</div>
		<div class="hero-brand-cube absolute right-0 bottom-0 max-w-1/2 md:max-w-1/4">
			<BrandCube />
		</div>
	</header>
	<section class="pt-10 pb-20 post-content">
		<div class="px-4 max-w-3xl mx-auto">
			<p>
				WordPress has been around for a long time and dominates the web as <a
					href="https://wordpress.com/"
					target="_blank"
					rel="noopener noreferrer nofollow">42% of the web is powered by WordPress.</a
				> It's a highly flexible and customizable CMS that I have tinkered with every aspect of the WordPress
				ecosystem.
			</p>
			<h2>An Actual WordPress Developer</h2>
			<p>
				WordPress can get a bad reputation from being bloated and having a lot of people
				&quot;claim&quot; to be developers and then build a half-assed website using a site builder.
				It can be really difficult to sift through the thousands of marketing or &quot;web
				development&quot; agencies to see who is legit.
			</p>
			<p>
				When I builds WordPress solutions or join a team, I am looking to build from the ground up
				and use as minimal plugins as possible. I take pride in the speed and code quality of every
				WordPress website project I&#x27;m in.
			</p>
			<p>
				Some WordPress Development Services I offer:
			</p>
			<ul>
				<li>custom plugin development</li>						
				<li>custom built from the ground up theme development</li>						
				<li>migrations to or from WordPress</li>						
				<li>building Block Editor (Gutenberg) blocks</li>						
				<li>optimization / website Audit.</li>			
				<li>agency training</li>
				<li><a href="/headless-wordpress-development">headless WordPress development</a></li>
			</ul>
		</div>
	</section>
</article>