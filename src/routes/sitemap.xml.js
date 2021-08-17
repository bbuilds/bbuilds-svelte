//currently using a generator after build because Svelkit has been a PIA to make one

const get = async () => {
	const body = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://bbuilds-website.netlify.app/</loc>
      <lastmod>2021-08-11T23:55:54+00:00</lastmod>
      <priority>1.00</priority>
    </url>
    <url>
      <loc>https://bbuilds-website.netlify.app/services</loc>
      <lastmod>2021-08-11T23:55:54+00:00</lastmod>
      <priority>0.80</priority>
    </url>
    <url>
      <loc>https://bbuilds-website.netlify.app/blog</loc>
      <lastmod>2021-08-11T23:55:54+00:00</lastmod>
      <priority>0.80</priority>
    </url>
    <url>
      <loc>https://bbuilds-website.netlify.app/contact</loc>
      <lastmod>2021-08-11T23:55:54+00:00</lastmod>
      <priority>0.80</priority>
    </url>
    <url>
      <loc>https://bbuilds-website.netlify.app/blog/branden-builds-launches</loc>
      <lastmod>2021-08-11T23:55:54+00:00</lastmod>
      <priority>0.80</priority>
    </url>
    <url>
      <loc>https://bbuilds-website.netlify.app/tags/svelte</loc>
      <lastmod>2021-08-11T23:55:54+00:00</lastmod>
      <priority>0.80</priority>
    </url>
    <url>
      <loc>https://bbuilds-website.netlify.app/tags/blog</loc>
      <lastmod>2021-08-11T23:55:54+00:00</lastmod>
      <priority>0.80</priority>
    </url>
    <url>
      <loc>https://bbuilds-website.netlify.app/blog/byoungz-headlesswp-gatsby</loc>
      <lastmod>2021-08-11T23:55:54+00:00</lastmod>
      <priority>0.80</priority>
    </url>
    <url>
      <loc>https://bbuilds-website.netlify.app/tags/gatsbyjs</loc>
      <lastmod>2021-08-11T23:55:54+00:00</lastmod>
      <priority>0.80</priority>
    </url>
    <url>
      <loc>https://bbuilds-website.netlify.app/tags/headlesswp</loc>
      <lastmod>2021-08-11T23:55:54+00:00</lastmod>
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
