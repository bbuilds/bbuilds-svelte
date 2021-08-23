/** @type {import('@sveltejs/kit').Config} */
import WindiCSS from 'vite-plugin-windicss';
import { mdsvex } from 'mdsvex';
import mdsvexConfig from './mdsvex.config.js';
import { imagetools } from 'vite-imagetools';
import image from 'svelte-image';
import adapter from '@sveltejs/adapter-netlify';

const config = {
	extensions: ['.svelte', ...mdsvexConfig.extensions],
	preprocess: [mdsvex(mdsvexConfig), image()],
	kit: {
		target: '#bbuilds-app',
		adapter: adapter(),
		vite: () => ({
			optimizeDeps: {
				include: ['blurhash']
			},
			plugins: [WindiCSS.default(), imagetools()],
			ssr: {
				noExternal: ['svelte-image']
			}
		})
	}
};

export default config;
