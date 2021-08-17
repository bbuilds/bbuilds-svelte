<script>
	import OpenGraph from '$lib/OpenGraph.svelte';
	import BrandCube from '$lib/svgs/brandcube.svelte';
	import '../content-styles.css';
</script>

<OpenGraph
	title={'Branding and Story Telling Services | Branden Builds'}
	keywords={'branding, market strategy, story telling'}
	description="Telling a story requires an insightful, handcrafted presence propelled by emotional intelligence."
	image={`images/brandenbuilds-opengraph.jpg`}
/>

<article>
	<header
		id="hero"
		class="py-16 bg-bbuilds-black text-bbuilds-gray flex flex-wrap items-center relative"
	>
		<div class="container mx-auto px-4 pb-20 relative z-10">
			<h1 class="text-xl md:text-3xl lg:max-w-2/3 mb-8">Brand Development and Story Telling</h1>
			<p class="md:w-1/2">
				Telling a story requires an insightful, handcrafted presence propelled by emotional
				intelligence.
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
				Designing the story is a craft that connects the company's values, mission, and vision with
				their target audience. A brand is composed of two parts; Brand Image, (the skeleton and DNA
				of an idea) and Brand Identity (the physical appearance of an idea.)
			</p>
			<h2>Branding Goals</h2>
			<p>A successful brand needs to meet these seven goals:</p>
			<ol>
				<li>Emotions – What types of emotions do we want to establish with your clients?</li>
				<li>Desires – What desires will your firm satisfy for your clients?</li>
				<li>Differentiation – How can you stand out from other law firms?</li>
				<li>Trust – How can you establish trust in your law firm?</li>
				<li>
					Value – What are the core values of your firm? Do your clients share the same values?
				</li>
				<li>
					Connection – Law firms will want to connect with the outside world. How can your law firm
					share your clients’ emotions with the outside world?
				</li>
				<li>
					Belongingness – How can you connect and reflect your clients within your brand? You want
					your clients and community to feel like they are a part of your brand.
				</li>
			</ol>
			<p>Below the my process I'm constantly refining to meet the goals above.</p>
			<h2>Branding Process</h2>
			<ol>
				<li>Discovery</li>
				<li>
					Research 
                    <ul>
						<li>Market Research</li>
						<li>Company Research</li>
					</ul>
				</li>
				<li>Brand Image / Strategy
                    <ul>
                        <li>Unique Selling Proposition</li>
                        <li>Mission Statement</li>
                        <li>Vision Statement</li>
                        <li>Values</li>
                        <li>Jungian Archetype / Positioning </li>
                    </ul>
                </li>
				<li>Brand Identity
                    <ul>
                        <li>Logo</li>
                        <li>Typography</li>
                        <li>Color Scheme</li>
                        <li>Complete Style Guide</li>
                    </ul>
                </li>
				<li>Story Telling</li>
			</ol>
		</div>
	</section>
</article>