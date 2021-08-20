<script>
	import { page } from '$app/stores';

	export let navItem;

	const { href, title, children } = navItem;
</script>

<a
	class:active={$page.path === href}
	{href}

	on:click
	class="text-bbuilds-teal hover:text-bbuilds-yellow"
>
	{title}
</a>
{#if children}
	<div
		class="dropdown-menu md:absolute md:z-50 md:rounded  md:shadow-lg md:bg-bbuilds-black md:text-white md:border-bbuilds-yellow md:border transition duration-200"
	>
		<ul class="list-none overflow-hidden w-full">
			{#each children as item}
				<li class="menu-item">
					<a
						
						class:active={$page.path === item.href}
						
						href={item.href}
						class="flex text-bbuilds-teal py-2 px-4 transition duration-300 hover:bg-bbuilds-yellow hover:text-bbuilds-black"
						>{item.title}</a
					>
				</li>
			{/each}
		</ul>
	</div>
{/if}

<style>
	a {
		@apply text-lg;
	}

	@media (min-width: 768px) {
		a {
			@apply text-base;
		}
		.dropdown-menu {
			min-width: 22.5rem;
			visibility: hidden;
			opacity: 0;
		}
	}

	a.active {
		@apply text-bbuilds-yellow;
	}
</style>
