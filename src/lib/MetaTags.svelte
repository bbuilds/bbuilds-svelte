<script>
    import { page } from '$app/stores';
    export let title = undefined;
    export let noindex = false;
    export let nofollow = false;
    export let robotsProps = undefined;
    export let description = undefined;
    export let keywords = undefined;
    export let canonical = undefined;
    export let url = `https://${$page.host}${$page.path}`;
    export let image = `https://${$page.host}/images/brandenbuilds-opengraph.jpg`;
    export let type = 'article';
    export let jsonLd = undefined;

  
    let robotsParams = '';
    if (robotsProps) {
      const {
        nosnippet,
        maxSnippet,
        maxImagePreview,
        maxVideoPreview,
        noarchive,
        noimageindex,
        notranslate,
        unavailableAfter
      } = robotsProps;
  
      robotsParams = `${nosnippet ? ',nosnippet' : ''}${
        maxSnippet ? `,max-snippet:${maxSnippet}` : ''
      }${maxImagePreview ? `,max-image-preview:${maxImagePreview}` : ''}${
        noarchive ? ',noarchive' : ''
      }${unavailableAfter ? `,unavailable_after:${unavailableAfter}` : ''}${
        noimageindex ? ',noimageindex' : ''
      }${maxVideoPreview ? `,max-video-preview:${maxVideoPreview}` : ''}${
        notranslate ? ',notranslate' : ''
      }`;
    }
  </script>
  <svelte:head>
    {#if title}
      <title>{title}</title>
    {/if}
  
    <meta
      name="robots"
      content={`${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}${robotsParams}`}
    />
    <meta
      name="googlebot"
      content={`${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}${robotsParams}`}
    />
  
    {#if description}
      <meta name="description" content={description} />
    {/if}

    {#if keywords}
      <meta name="keywords" content={keywords} />
    {/if}
  
    {#if canonical}
      <link rel="canonical" href={canonical} />
    {/if}
  
   	<!-- https://ogp.me -->
    <meta property="og:image" content={`${image}`} />
    <meta property="og:description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:type" content={type} />
    <meta property="og:url" content={url} />

    <!-- https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup -->
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="@brandenbuilds" />
    <meta name="twitter:creator" content="@brandenbuilds" />
    <meta name="twitter:image" content={`${$page.host}/${image}`} />

    {#if jsonLd}
      {@html `<script type="application/ld+json">${
        JSON.stringify({ '@context': 'https://schema.org', ...jsonLd }) + '<'
      }/script>`}
    {/if}
  </svelte:head>
  