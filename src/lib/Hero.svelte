<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import LogoIcon from '$lib/logo/Icon.svelte';
	import LogoName from '$lib/logo/Name.svelte';

	let activeIndex = 0;

	onMount(() => {
		const interval = setInterval(() => {
			if (serviceslist[activeIndex + 1]) {
				activeIndex += 1;
				return;
			}
			activeIndex = 0;
		}, 2000);
		return () => {
			clearInterval(interval);
		};
	});

	export let title;
	export let subtitle;
	export let serviceslist;
</script>

<section id="home-banner" class="hero-home bg-bbuilds-gray">
	<div class="flex flex-col justify-center items-center h-full px-4">
		<header class="header-text text-center px-15">
			<h1 class="text-xl">{title}</h1>
			<div class="flex items-center justify-center mb-4 text-bbuilds-black hero-logo max-w-100">
				<LogoIcon />
				<LogoName />
			</div>
		</header>
		<div class="w-full text-center transform pt-24 lg:pt-16">
			<p class="mb-20 md:mb-10">{subtitle}</p>
			<ul
				id="expierence-list"
				class="relative animated-list flex flex-col items-center justify-center w-full"
			>
				{#each serviceslist as service, i}
					{#if activeIndex === i}
						<li
							class="absolute text-3xl leading-tight expierence-list-item"
							in:fly={{ y: 10, duration: 300, delay: 300 }}
							out:fade
						>
							{service}
						</li>
					{/if}
				{/each}
			</ul>
		</div>
	</div>
</section>

<style>
	:global(.hero-logo .logo-icon) {
		min-width: 18px;
		@apply mr-1;
	}

	.hero-home {
		height: calc(75vh);
	}

	.expierence-list-item {
		word-spacing: 100vw;
	}

	@media (min-width: 768px) {
		:global(.hero-logo .logo-icon) {
			max-width: 30px;
		}
		.expierence-list-item {
			word-spacing: normal;
		}
	}

	@media (min-width: 1024px) {
		.hero-home {
			height: calc(65vh);
		}
	}
</style>
