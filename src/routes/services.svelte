<script>
	import { page } from '$app/stores';
	import MetaTags from '$lib/MetaTags.svelte';
	import Process from '$lib/Process.svelte';
	import BrandCube from '$lib/svgs/brandcube.svelte';
	export let url = `https://${$page.host}${$page.path}`;
	
	const services = [
		{
			title: 'Web Development',
			tagline:
				'Creating intuitive sexy client facing front ends while writing lean and clean structured backends.',
			specialities: [
				'JavaScript Framework Development',
				'back-end development',
				'eCommerce',
				'API integrations',
				'content management system solutions'
			],
			image: '/images/web-development-illustration.svg',
			url: '/web-development'
		},
		{
			title: 'WordPress Solutions',
			tagline:
				'WordPress dominates the web world and I come correct to tackle every aspect of the development ecosystem.',
			specialities: [
				'Headlesss Wordpress / Jamstack Builds',
				'Block Editor Development',
				'traditional theme development',
				'agency development training',
			],
			image: '/images/wordpress-development-illustration.svg',
			url: '/wordpress-development'
		},
		{
			title: 'Branding',
			tagline:
				'Telling a story requires an insightful, handcrafted presence propelled by emotional intelligence.',
			specialities: [
				'market research',
				'brand strategy / positioning',
				'brand identity',
				'storytelling',
			],
			image: '/images/branding-service-illustration.svg',
			url: '/branding'
		},
		{
			title: 'Search Engine Optimization',
			tagline:
				'Telling a story requires an insightful, handcrafted presence propelled by emotional intelligence.',
			specialities: [
				'local ranking',
				'on site optimization',
				'technical seo analysis',
				'complete SEO audit',
			],
			image: '/images/seo-service-illustration.svg',
			url: '/seo'
		}
	];
</script>

<MetaTags
	title="Web Developemnt, SEO, and Branding Services from Branden Builds"
	description="Top notch web development, digital marketing, and branding services from Branden Builds."
	keywords='web dev, frontend development, backend development, seo services'
	openGraph={{
		url,
		title: 'Web Developemnt, SEO, and Branding Services from Branden Builds',
		description: 'Top notch web development, digital marketing, and branding services from Branden Builds.',
		images: [
			{
				url: 'images/brandenbuilds-opengraph.jpg',
				width: 800,
				height: 600,
				alt: 'Branden Builds Kick Ass Services'
			},
		],
		site_name: 'Branden Builds'
	}},
	jsonLd={{
		"@context": "http://schema.org",
		"@type": "WebPage",
		"name": "Branden Builds WordPress Services",
		"description": "Top notch web development, digital marketing, and branding services from Branden Builds.",
		"publisher": {
			"@type": "ProfilePage",
			"name": "Branden Build's Website Services"
		}
	}}
/>
<section
	id="services-hero"
	class="py-16 bg-bbuilds-black text-bbuilds-gray flex flex-wrap items-center relative"
>
	<div class="container mx-auto px-4 pb-20 relative z-10">
		<h1 class="text-xl md:text-3xl lg:max-w-2/3 mb-8">
			Branden Builds Web Development | Branding | SEO Freelance Services
		</h1>
		<blockquote class="text-lg md:text-xl md:mb-6 lg:max-w-2/3 leading-snug">
			"modern problems require modern solutions" <cite class="block text-md">-Dave Chappelle</cite>
		</blockquote>
		<a sveltekit:prefetch rel="external" href="/contact" class="button mt-8 inline-block">Talk nerdy to me</a>
	</div>
	<div class="hero-brand-cube absolute right-0 bottom-0 max-w-1/2 md:max-w-1/4">
		<BrandCube />
	</div>
</section>
<section id="services-list" class="bg-bbuilds-yellow py-10 lg:py-20">
	<div class="mx-auto max-w-3xl px-4">
		<ul>
			{#each services as service, index}
				<li
					class="mb-10"
				>
				<a href={service.url} sveltekit:prefetch rel="external" class="service block md:flex items-center p-4 border border-bbuilds-black rounded w-full h-full transition duration-300 ease-in-out">
					<picture class="md:p-8">
						<img src={service.image} alt={`${service.title} Illustration`} class="w-1/4 md:w-100" />
					</picture>
					<div class="py-8">
						
						<h6 class="text-xl font-semibold leading-none mb-4">
							{service.title}
						</h6>
						<p class="mt-2">
							{service.tagline}
						</p>
						{#if service.specialities}
							<ul class="mt-4 disc">
								{#each service.specialities as item}
									<li>{item}</li>
								{/each}
							</ul>
						{/if}
					</div>
				</a>
				</li>
			{/each}
		</ul>
	</div>
</section>
<Process title={false} />

<style>
	.service:hover {
		transform: scale(1.05);
	}
</style>
