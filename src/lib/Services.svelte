<script>
	export let servicesTitle;
	export let services;
	export let skillsTitle;
	export let skillsCopy;
	export let skills;

</script>

<section id="services" class="py-10 lg:py-20 bg-bbuilds-yellow text-bbuilds-black">
	<div class="container mx-auto px-4">
		<h2 class="text-center mb-10">{servicesTitle}</h2>
		<ul class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each services as service}
				<li class="flex items-center">
					<a
						sveltekit:prefetch
						href={service.url}
						class="p-4 border border-bbuilds-black rounded w-full h-full transition duration-300 ease-in-out transform hover:-translate-y-2 hover:bg-bbuilds-black hover:text-bbuilds-yellow"
					>
						<h6 class="text-xs font-semibold leading-none">
							{service.title}
						</h6>
						<p class="mt-2 leading-none">
							{service.copy}
						</p>
					</a>
				</li>
			{/each}
		</ul>
		<div class="skillset hidden md:block pt-10">
			<h3 class="text-center mb-4">{skillsTitle}</h3>
			<p class="text-center max-w-4xl mx-auto mb-6">
				{skillsCopy}
			</p>
			<ul class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{#each skills as skill, index}
					<li class="flex items-center bg-bbuilds-gray text-center shadow-sm">
						<img
							src={skill.logo}
							alt={`${skill.title} Logo`}
							width="40"
							height="40"
							class="p-1.5 bg-white h-12 w-12"
						/>
						<span class="ml-auto mr-auto">{skill.title}</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>
	<!--end container-->
</section>
