<script>
	import { onMount } from 'svelte';

	import AOS from 'aos';
	import 'virtual:windi.css';
	import '../app.css';
	import Nav from '$lib/Nav/Index.svelte';
	import Footer from '$lib/Footer.svelte';
	import 'aos/dist/aos.css';

	onMount(() => {
		AOS.init({
			once: true
		});
	});
</script>

<Nav />
<main class="flex-grow">
	<slot />
</main>
<Footer />
