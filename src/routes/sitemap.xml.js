//currently using a generator after build because Svelkit has been a PIA to make one

const get = async () => {
	const body = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
  <loc>https://brandenbuilds.com/</loc>
  <lastmod>2021-08-17T16:36:07+00:00</lastmod>
  <priority>1.00</priority>
</url>
<url>
  <loc>https://brandenbuilds.com/services</loc>
  <lastmod>2021-08-17T16:36:07+00:00</lastmod>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://brandenbuilds.com/web-development</loc>
  <lastmod>2021-08-17T16:36:07+00:00</lastmod>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://brandenbuilds.com/headless-wordpress-development</loc>
  <lastmod>2021-08-17T16:36:07+00:00</lastmod>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://brandenbuilds.com/wordpress-development</loc>
  <lastmod>2021-08-17T16:36:07+00:00</lastmod>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://brandenbuilds.com/seo</loc>
  <lastmod>2021-08-17T16:36:07+00:00</lastmod>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://brandenbuilds.com/branding</loc>
  <lastmod>2021-08-17T16:36:07+00:00</lastmod>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://brandenbuilds.com/blog</loc>
  <lastmod>2021-08-17T16:36:07+00:00</lastmod>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://brandenbuilds.com/contact</loc>
  <lastmod>2021-08-17T16:36:07+00:00</lastmod>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://brandenbuilds.com/blog/branden-builds-launches</loc>
  <lastmod>2021-08-17T16:36:07+00:00</lastmod>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://brandenbuilds.com/tags/svelte</loc>
  <lastmod>2021-08-17T16:36:07+00:00</lastmod>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://brandenbuilds.com/tags/blog</loc>
  <lastmod>2021-08-17T16:36:07+00:00</lastmod>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://brandenbuilds.com/blog/byoungz-headlesswp-gatsby</loc>
  <lastmod>2021-08-17T16:36:07+00:00</lastmod>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://brandenbuilds.com/tags/gatsbyjs</loc>
  <lastmod>2021-08-17T16:36:07+00:00</lastmod>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://brandenbuilds.com/tags/headlesswp</loc>
  <lastmod>2021-08-17T16:36:07+00:00</lastmod>
  <priority>0.80</priority>
</url>

    
    
    </urlset>
  `;
	return {
		headers: {
			'Content-Type': 'application/xml'
		},
		status: 200,
		body
	};
};
export { get };
