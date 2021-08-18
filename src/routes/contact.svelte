<script>
	import MetaTags from '$lib/MetaTags.svelte';
	import BrandCube from '$lib/svgs/brandcube.svelte';
</script>


<MetaTags
	title="Contact Branden Builds"
	description="Contact branden builds for all of your web services."
	keywords='branden builds, web developer, frontend developer, backend developer'
	jsonLd={{
		"@type": "WebPage",
		"name": "Contact Branden Builds",
		"description": "Contact branden builds for all of your web services.",
		"publisher": {
			"@type": "ProfilePage",
			"name": "Branden Build's Website Services"
		}
	}}
/>

<article>
	<section
		id="contact-hero"
		class="py-20 bg-bbuilds-black text-bbuilds-gray flex flex-wrap items-center relative"
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
