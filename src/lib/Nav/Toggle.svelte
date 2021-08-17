<script>
	import { showHideOverflowY } from '$lib/utils/overflowY';

	import {mobileMenuState} from './state';

	const handleToggle = () => {
		$mobileMenuState = !$mobileMenuState;
		if ($mobileMenuState) {
			showHideOverflowY(true);
		} else {
			showHideOverflowY(false);
		}
	};
</script>

<button
	on:click={handleToggle}
	aria-label="Show / hide nav items"
	class="flex justify-center items-center h-8 w-12 rounded-xl bg-bbuilds-teal ml-auto"
>
	{#if $mobileMenuState}
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" width="12" height="12" viewBox="0 0 12 12">
			<path
				fill="#292929"
				fill-rule="evenodd"
				d="M10.242 11.657a1 1 0 001.414-1.414L7.413 6l4.243-4.243A1 1 0 0010.242.343L5.999 4.586 1.757.343A1 1 0 10.342 1.757L4.585 6 .342 10.243a1 1 0 001.415 1.414l4.242-4.243 4.243 4.243z"
				clip-rule="evenodd"
			/>
		</svg>
	{:else}
		<svg width="16" height="8" viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg">
			<rect width="16" height="2" rx="1" fill="#292929" />
			<rect y="6" width="16" height="2" rx="1" fill="#292929" />
		</svg>
	{/if}
</button>

<style>
	button {
		@media (min-width: 768px) {
			@apply hidden;
		}
	}
</style>
