<script>
    export let citation;
</script>

<blockquote>
    <slot/>
    <cite class="text-small block">{citation}</cite>
</blockquote>

<style>
    blockquote {
	font-size: 1.25em;
	margin: 1em 0;
	padding-left: 1em;
	border-left: 3px solid rgb(55, 53, 47);
}
</style>