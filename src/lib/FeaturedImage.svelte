<script>
    export let src;
    export let alt;
</script>

<img
    srcset={src}
    alt={`${alt}`}
    type="image/webp"
    class="rounded-t-md"
/>