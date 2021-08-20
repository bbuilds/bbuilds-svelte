<script>
	import NavItem from './NavItem.svelte';
	import MobileMenu from './MobileMenu.svelte';
	import MobileMenuToggle from './Toggle.svelte';
	import SocialMedia from './SocialMedia.svelte';
	import LogoIcon from '$lib/logo/Icon.svelte';
	import LogoName from '$lib/logo/Name.svelte';
	import { showHideOverflowY } from '$lib/utils/overflowY';
	import { mobileMenuState } from './state';

	const navItems = [
		{
			title: 'Services',
			href: '/services',
			children: [
				{
					title: 'Web Development',
					href: '/web-development'
				},
				{
					title: 'Headless WordPress Development',
					href: '/headless-wordpress-development'
				},
				{
					title: 'WordPress Development',
					href: '/wordpress-development'
				},
				{
					title: 'Search Engine Optimization',
					href: '/seo'
				},
				{
					title: 'Storytelling / Branding',
					href: '/branding'
				}
			]
		},
		{
			title: 'Blog',
			href: '/blog'
		},
		{
			title: 'Contact',
			href: '/contact'
		}
	];
	
</script>

<header class="bg-bbuilds-black w-full py-2 relative z-50" role="banner">
	<nav id="choose-project-observer-target-top" class="mx-auto w-full">
		<div class="flex items-center h-12 px-4 sm:px-8">

			<a
				href="/"
				aria-label="Branden Builds"
				on:click={() => {
					$mobileMenuState = false;
					showHideOverflowY(false);
				}}

				class="flex items-center logo"
			>
				<LogoIcon />
				<LogoName />
			</a>
			<ul
				class="nav-items hidden px-2 space-x-6 items-center md:flex md:space-x-12 ml-auto mr-auto"
			>
				{#each navItems as navItem}
					<li class="menu-item relative group"><NavItem {navItem} on:click={() => ($mobileMenuState = !$mobileMenuState)} /></li>
				{/each}
			</ul>
			<div class="hidden md:flex">
				<SocialMedia />
			</div>
			<MobileMenuToggle />
		</div>
		<MobileMenu {navItems} />
	</nav>
</header>

<style>
	:global(.logo .logo-name) {
		@apply hidden;
		@apply text-bbuilds-gray;
		@apply h-auto;
	}

	:global(.logo .logo-icon) {
		@apply h-auto;
		max-width: 25px;
		min-width: 18px;
	}

	:global(.logo .logo-icon-left-bar) {
		@apply text-bbuilds-gray;
	}

	:global(.logo .logo-icon-square) {
		@apply text-bbuilds-yellow;
	}

	:global(.logo .logo-icon-box) {
		@apply text-bbuilds-teal;
	}

	.logo {
		max-width: 25%;
	}

	@media (min-width: 768px) {
		:global(.logo .logo-name) {
			@apply block;
			@apply max-w-100;
		}
		:global(.logo .logo-icon) {
			@apply mr-2;
		}

		:global(.menu-item:hover .dropdown-menu, .menu-item:focus-within .dropdown-menu) {
			visibility: visible;
      		opacity: 1;
		}
	}

	@media (min-width: 1024px) {
		.logo {
			max-width: 15%;
		}
	}
</style>
