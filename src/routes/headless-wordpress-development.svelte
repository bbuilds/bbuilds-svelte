<script>
	import MetaTags from '$lib/MetaTags.svelte';
	import BrandCube from '$lib/svgs/brandcube.svelte';
    import Blockquote from '$lib/Blockquote.svelte';
    import '../content-styles.css';
</script>

<MetaTags
	title="Headless WordPress Development | Branden Builds"
	description="Custom built headless WordPress developement by Branden Builds"
	keywords='branden builds, web developer, wordpress, headless wordpress'
	jsonLd={{
		"@type": "WebPage",
		"name": "Branden Builds Headless WP Services",
		"description": "Custom built headless WordPress developement by Branden Builds",
		"publisher": {
			"@type": "ProfilePage",
			"name": "Branden Build's Headless WP Services"
		}
	}}
/>

<article>
	<header
		id="services-hero"
		class="py-16 bg-bbuilds-black text-bbuilds-gray flex flex-wrap items-center relative"
	>
		<div class="container mx-auto px-4 pb-20 relative z-10">
			<h1 class="text-xl md:text-3xl lg:max-w-2/3 mb-8">Custom Headless WordPress Development</h1>
			<p class="md:w-1/2">
				When you merge modern frontend development with the world's most popular CMS, WordPress.
			</p>
			<a href="/contact" class="button mt-8 inline-block">Talk nerdy to me</a>
		</div>
		<div class="hero-brand-cube absolute right-0 bottom-0 max-w-1/2 md:max-w-1/4">
			<BrandCube />
		</div>
	</header>
	<section class="pt-10 pb-20 post-content">
		<div class="px-4 max-w-3xl mx-auto">
			<h2>Defining a Headless CMS</h2>
			<p>
				This seems to be a popular buzz phrase in recent years but for a great meaning, a headless
				content management system or headless CMS is a way to let the a CMS handle only the data and
				a modern JS framework, like react, Vue, Svelte, etc handle how to display the data. <a sveltekit:prefetch rel="external"
					href="/blog/byoungz-headlesswp-gatsby">Headless Wordpress</a
				> is using WordPress to manage the content as the backend.
			</p>
			<h3>Defining JAMstack and Static Site Generation</h3>

			<Blockquote citation="Mathias Biilmann (CEO &amp; Co-founder of Netlify)."> A modern web development architecture based on client-side JavaScript, reusable APIs,
                and prebuilt Markup</Blockquote>

			<p>
				Jamstack approach uses JavaScript to connect to third party backends, such as headless
				WordPress to create static generated sites, called pre-rendering or compiling, the data into
				basic HTML, JS, and CSS files.
			</p>
			<h3>Why a Headless WordPress Approach?</h3>
			<p>
				WordPress already claims <a
					href="https://wordpress.com/"
					target="_blank"
					rel="noopener noreferrer nofollow">over 40%</a
				> of the web is built on its platform. So it&#x27;s familiarity as managing content is widely
				popular. However, WordPress can be infamous for being bloated and insecure. When we remove the
				&quot;head&quot; and only use WordPres to manage data, we can create a blazingly fast and secure
				website that will leave your competitors in your wake.
			</p>
			<p>Some benefits of headless CMS development in general</p>
			<ul class="bulleted-list">
				<li>
					Easy to integrate multiple data sources into one frontend framework like using WordPress
					for basic data and shopify for ecommerce.
				</li>
				<li>
					Removing a lot of security concerns through database exploits. Can&#x27;t exploit a
					database if there isn&#x27;t one connected to the frontend.
				</li>
				<li>
					Blazingly fast static generated site that leveraging modern techniques like code
					splitting, mage optimization, inline critical styles, and much more to give you off the
					charts performance scores.
				</li>
			</ul>
			<h3>Headlesss WordPress JavaScript Frameworks</h3>
			<p>
				I have an experience in a variety of JavaScript frameworks. I have used several JS
				frameworks to build headless CMS and specifically headless Wordpress solutions such as:
			</p>
			<ul>
				<li>Gatsby JS</li>
				<li>Frontity</li>
				<li>Next.JS</li>
				<li>Eleventy</li>
				<li>Wp Engines Atlas</li>
			</ul>
		</div>
	</section>
</article>
