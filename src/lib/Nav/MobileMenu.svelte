<script>
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	import { showHideOverflowY } from '$lib/utils/overflowY';

	import NavItem from './NavItem.svelte';
	import { mobileMenuState } from './state';
	import SocialMedia from './SocialMedia.svelte';

	export let navItems = [];

	onMount(() => {
		const handleTabletChange = (e) => {
			if (e.matches) {
				$mobileMenuState = false;
				showHideOverflowY(false);
			}
		};
		let query = window.matchMedia('(min-width: 768px)');
		query.addEventListener('change', handleTabletChange);
	});
</script>

{#if $mobileMenuState}
	<ul
		class="nav-items absolute flex flex-col px-4 pt-8 pb-20 overflow-y-scroll w-screen h-screen space-y-xx-small bg-bbuilds-black z-10 border-t border-bbuilds-yellow"
		transition:fly={{ duration: 200, y: 20, opacity: 0.5 }}
	>
		{#each navItems as navItem}
			<li
				class="menu-item group mb-4"
				on:click={() => {
					$mobileMenuState = !$mobileMenuState;
					showHideOverflowY(false);
				}}
			>
				<NavItem {navItem} />
			</li>
		{/each}
		<div class="mt-4"><SocialMedia /></div>
	</ul>
{/if}

<style>
	/* Always make sure to keep the media query intact with one specified above in the matchMedia call. */
	@media (min-width: 768px) {
		.nav-items {
			@apply hidden;
		}
	}
</style>
