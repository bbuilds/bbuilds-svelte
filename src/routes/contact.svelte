<script>
	import { page } from '$app/stores';
	import OpenGraph from '$lib/OpenGraph.svelte';
	import BrandCube from '$lib/svgs/brandcube.svelte';
	export let url = `https://${$page.host}${$page.path}`;
</script>

<OpenGraph
	title={'Contact Branden Builds'}
	keywords={'branden builds, web developer, frontend developer, backend developer'}
	description="Contact branden builds for all of your web services."
	{url}
	image={`images/brandenbuilds-opengraph.jpg`}
/>

<article>
	<section
		id="contact-hero"
		class="theme-full-height bg-bbuilds-black text-bbuilds-gray flex flex-wrap items-center relative"
	>
		<div class="container mx-auto px-4 relative z-10">
			<h1 class="text-xl md:text-3xl lg:max-w-2/3 mb-8">Contact Branden Builds</h1>
			<form name="bbuilds-contact" class="md:max-w-1/2" action="https://formspree.io/f/xjvjpbqb" method="POST">
				<ul>
					<li class="mb-4">
						<label class="block mb-2" for="name">Name*</label>
						<input
							id="name"
							class="block bg-bbuilds-gray w-full p-2 text-bbuilds-black"
							type="text"
							autocomplete="name"
							name="name"
						/>
					</li>
					<li class="mb-4 mb-2">
						<label for="email" class="block mb-2">E-Mail*</label>
						<input
							id="email"
							type="email"
							autocomplete="email"
							name="email"
							class="block bg-bbuilds-gray w-full p-2 text-bbuilds-black"
						/>
					</li>
					<li class="mb-4">
						<label class="block mb-2" for="message">Your message*</label>
						<textarea
							id="message"
							cols="30"
							rows="10"
							class="block bg-bbuilds-gray w-full p-2 text-bbuilds-black"
							name="message"
						/>
					</li>
					<li>
						<button type="submit" class="btn">Send message</button>
					</li>
				</ul>
			</form>
		</div>
		<div class="hero-brand-cube absolute right-0 bottom-0 max-w-1/2 md:max-w-1/4">
			<BrandCube />
		</div>
	</section>
</article>
