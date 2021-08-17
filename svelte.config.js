/** @type {import('@sveltejs/kit').Config} */
import WindiCSS from 'vite-plugin-windicss';
import { mdsvex } from 'mdsvex';
import mdsvexConfig from './mdsvex.config.js';
import { imagetools } from 'vite-imagetools';
import adapter from '@sveltejs/adapter-netlify';

const config = {
	extensions: ['.svelte', ...mdsvexConfig.extensions],
	preprocess: [mdsvex(mdsvexConfig)],
	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		adapter: adapter(),
		vite: () => ({
			plugins: [WindiCSS.default(), imagetools({ force: true })]
		})
	}
};

export default config;
