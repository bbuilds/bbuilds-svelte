<script>
	import MetaTags from '$lib/MetaTags.svelte';
	import BrandCube from '$lib/svgs/brandcube.svelte';
	import '../content-styles.css';
</script>

<MetaTags
	title="Search Engine Optimization Services | Branden Builds"
	description="Call everyone a peasant as they rank below you - SEO services by Branden Builds"
	keywords='seo, search engine optimization, local seo, technical seo'
	jsonLd={{
		"@type": "WebPage",
		"name": "Branden Builds SEO Services",
		"description": "Call everyone a peasant as they rank below you - SEO services by Branden Builds",
		"publisher": {
			"@type": "ProfilePage",
			"name": "Branden Build's SEO Services"
		}
	}}
/>

<!-- <OpenGraph
	title={'Search Engine Optimization Services | Branden Builds'}
	keywords={'seo, search engine optimization, local seo, technical seo'}
	description="Leaderboard ranking SEO services by Branden Builds"
	image={`images/brandenbuilds-opengraph.jpg`}
/> -->

<article>
	<header
		id="hero"
		class="py-16 bg-bbuilds-black text-bbuilds-gray flex flex-wrap items-center relative"
	>
		<div class="container mx-auto px-4 pb-20 relative z-10">
			<h1 class="text-xl md:text-3xl lg:max-w-2/3 mb-8">Search Engine Optimization Services</h1>
			<p class="md:w-1/2">
				To excel at search engine optimization, one must understand the technical action needed to
				improve search results.
			</p>
			<a href="/contact" class="button mt-8 inline-block">Talk nerdy to me</a>
		</div>
		<div class="hero-brand-cube absolute right-0 bottom-0 max-w-1/2 md:max-w-1/4">
			<BrandCube />
		</div>
	</header>
	<section class="py-10 post-content">
		<div class="px-4 max-w-3xl mx-auto">
			<p>SEO agencies have really given SEO a bad name. In the world of web and tech, they get the reputaiton as used car salesman. Most liekly because a lot of "SEO experts" claim to be marketing gensisuses and not in depth technical experts of how the web and search engines work. Let's work together to change that.</p>
			<h2>Content Strategy</h2>
			<p>
				This is where we need to start. Before we can display the content, we first need to focus
				and define with research and data what our content will be. Our goal is to understand what
				your audience wants to fine and how we can use our research to create an engaging message.
				Some things we will do here:
			</p>
			<ul>
				<li>Market Research</li>
				<li>Keyword Research</li>
				<li>Content Creation</li>
			</ul>
			<ul>
				<li>On page SEO (getting into technical SEO below)</li>
				<li>urls</li>
				<li>meta tags</li>
				<li>Semantic structured HTML with a content flow.</li>
			</ul>
			<h2>Technical SEO</h2>
			<p>
				You can have the best keyword research driven content, but poor search results and
				conversions if your website your website isn&#x27;t optimized to be crawled, indexed, and
				&quot;understood&quot; by search engines. This requires in depth knowledge of how websites
				are built and the how search engines operate. Below are some technical SEO categories and
				services I can optimize.
			</p>
			<h3>Crawlability</h3>
			<p>
				How well can search engines discover your website and find what you want them to discover.
				Some methods and properties to service are:
			</p>
			<ul>
				<li>URL Structure</li>
				<li>Site Maps</li>
				<li>Internal linking and Breadcrumbs</li>
				<li>Robots.txt</li>
				<li>More!</li>
			</ul>
			<h3>Performance</h3>
			<p>
				We always have known that website speed played a factor in ranking but as of this year,
				2021, Google announced directly that their rollout of Core Web Vitals will be a direct
				ranking factor. I understand these metrics and modern development tools and practices to
				make sure website is meeting performance metrics specified such as:
			</p>
			<ul>
				<li>Website loading with 2.5s or less</li>
				<li>Interactivity, your site should be interactive within 100ms or less</li>
				<li>Stable layout, content isn&#x27;t shifting all over the place as the website loads.</li>
				<li>Mobile usability</li>
			</ul>
			<h3>Indexation / Understanding</h3>
			<p>
				Once the search engines can easily crawl and discover your content, we want them to
				&quot;understand&quot; what it&#x27;s crawling. This is where the technical expertise as a
				web developer really comes in.
			</p>
			<ul>
				<li>Structured Data using JSON</li>
				<li>Semantic HTML setup</li>
				<li>Accessibility checks</li>
				<li>Well written content</li>
				<li>More!</li>
			</ul>
			<h2>Local SEO</h2>
			<p>
				Getting on the map is easy, dominating the map takes skill. Since 2015, over <a
					href="https://searchengineland.com/report-nearly-60-percent-searches-now-mobile-devices-255025"
					target="_blank"
					rel="noopener noreferrer nofollow">60% of searches have been mobile</a
				>
				with research showing that
				<a
					href="https://www.searchenginewatch.com/2014/04/09/80-of-local-searches-on-mobile-phones-convert-study/"
					target="_blank"
					rel="noopener noreferrer nofollow external">80% of local searches on mobile phones convert</a
				>. We can safely admit these numbers have increased since 2015 and will only continue. This
				is one of the most important marketing strategies fo a local business ready to connect to
				potential buyers.
			</p>
			<p>Some things we can focus on here:</p>
			<ul>
				<li>Google My Business (GMB) page optimization</li>
				<li>Google My Business Posts</li>
				<li>
					<a
						href="https://developers.google.com/search/docs/advanced/structured-data/local-business"
						target="_blank"
						rel="noopener noreferrer nofollow external">Local Business Schema Markup</a
					>
				</li>
				<li>Spam Fighting</li>
			</ul>
		</div>
	</section>
</article>