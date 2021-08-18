<script context="module">
	export async function load({ fetch }) {
		const [resServices, resSkills] = await Promise.all([
			fetch('/api/services'),
			fetch('/api/skillset')
		]);

		const servicesData = await resServices.json();
		const skillsData = await resSkills.json();

		if (resServices.ok && resSkills.ok) {
			return {
				props: {
					servicesData,
					skillsData
				}
			};
		}

		return {
			error: new Error()
		};
	}
</script>

<script>
	import Hero from '$lib/Hero.svelte';
	import Process from '$lib/Process.svelte';
	import Services from '$lib/Services.svelte';
	import RecentPosts from '$lib/RecentPosts.svelte';
	import Reccomendation from '$lib/Recommendations.svelte';
	import MetaTags from '$lib/MetaTags.svelte';
	export let servicesData;
	export let skillsData;
</script>

<MetaTags
	title="Branden Builds Web Developer && Storyteller"
	description="Branden Builds specializes in building custom web development, headless wordpress solutions, and telling bad ass stories"
	keywords={'freelance web developer, frontend developer, backend developer, headless CMS, headless wordpress'}
	type="company"
	jsonLd={{
		"@type": "WebPage",
		"name": "Branden Builds Web Developer && Storyteller",
		"description": "Branden Builds specializes in building custom web development, headless wordpress solutions, and telling bad ass stories.",
		"publisher": {
			"@type": "ProfilePage",
			"name": "Branden Build's Website"
		}
	}}
/>

<article>
	<Hero
		title={`Greetings I'm`}
		subtitle={`I enjoy building...`}
		serviceslist={[
			'Engaging Experiences 🦁',
			'Lean Products ⚡',
			'Accelerated Brands 🌱',
			'Technical SEO 🤓'
		]}
	/>

	<Services
		servicesTitle={servicesData.title}
		services={servicesData.services}
		skillsTitle={skillsData.title}
		skillsCopy={skillsData.copy}
		skills={skillsData.skills}
	/>

	<Process title={'Methods && Madness'} />

	<Reccomendation />

	<RecentPosts />
</article>
