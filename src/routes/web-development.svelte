<script context="module">
	export const load = async ({ fetch }) => {
		const res = await fetch('/api/skillset');
		const skillsData = await res.json();

		return {
			props: {
				skillsData
			}
		};
	};
</script>

<script>
	import MetaTags from '$lib/MetaTags.svelte';

	import BrandCube from '$lib/svgs/brandcube.svelte';
	import '../content-styles.css';
    export let skillsData;
    const skills = skillsData.skills

    const backendSkills = skills.filter((skill) => {
        return skill.type === 'backend' 
    })

    const frontendSkills = skills.filter((skill) => {
        return skill.type === 'frontend'
    })

    
</script>

<MetaTags
	title="Website and Web App Development Services | Branden Builds"
	description="Website and Web App Development by Branden Builds"
	openGraph={{
		url: 'https://brandenbuilds.com',
		title: 'Website and Web App Development Services | Branden Builds',
		description: 'Website and Web App Development by Branden Builds',
		images: [
			{
				url: 'images/brandenbuilds-opengraph.jpg',
				width: 800,
				height: 600,
				alt: 'Branden Builds Website Development Services'
			},
		],
		site_name: 'Branden Builds'
	}},
	jsonLd={{
		"@context": "http://schema.org",
		"@type": "WebPage",
		"name": "Website and Web App Development Services | Branden Builds",
		"description": "Website and Web App Development by Branden Builds",
		"publisher": {
			"@type": "ProfilePage",
			"name": "Branden Build's Website Services"
		}
	}}
/>

<article>
	<header
		id="hero"
		class="py-16 bg-bbuilds-black text-bbuilds-gray flex flex-wrap items-center relative"
	>
		<div class="container mx-auto px-4 pb-20 relative z-10">
			<h1 class="text-xl md:text-3xl lg:max-w-2/3 mb-8">Website and Web App Development</h1>
			<p class="md:w-1/2">
				I like creating sexy user interfaces && lean and scalable backend systems.
			</p>
			<a sveltekit:prefetch rel="external" href="/contact" class="button mt-8 inline-block">Talk nerdy to me</a>
		</div>
		<div class="hero-brand-cube absolute right-0 bottom-0 max-w-1/2 md:max-w-1/4">
			<BrandCube />
		</div>
	</header>
	<section class="pt-10 pb-20 post-content">
		<div class="px-4 max-w-3xl mx-auto">
			<p>
				There is no one size fits all or cooking cutter process when it comes to creating digital
				experiences on the web. I am able to build custom websites and apps from the group up or
				jump in any part of the process to aide a currently development team. Transform ideas and
				inspirations into engaging digital experiences.
			</p>
			<p>
				I use a tried true process to build web solutions from the ground up.
			</p>
			<ol>
				<li>Discovery - What are the business goals and problem we would like to solve?</li>						
				<li>Research - Who are we solving this for?</li>						
				<li>Create - How will we build this solution?</li>						
				<li>QA - Test Our Solution</li>
				<li>Launch - Time to market our solution?</li>
			</ol>
			<p>
				Repeat steps 2, 3, and 4 are necessary. This is not a waterfall approach process.
			</p>
			<h2>Frontend Development</h2>
			<p>
				First impressions are vital to your reputation and business. I enjoy creating frontend web
				development solutions using latest JS frameworks like Vue, React, and Svelte, specially
				consuming decoupled backend CMS solutions. I can take designs and craft them into sexy user
				interfaces that are remarkably fast. I enjoy using animation as tool for intuitive client
				interactions.
			</p>
            <ul class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-6" style="padding-left:0;">
				{#each frontendSkills as skill}
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
			<h2>Backend Development</h2>
			<p>
				Need a scalable and secure API built? I enjoy using the backend languages PHP and Node.js
				mostly
			</p>
            <ul class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-6" style="padding-left:0;">
				{#each backendSkills as skill}
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
	</section>
</article>