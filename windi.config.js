import { defineConfig } from 'windicss/helpers';

let bbuildscolors = {
	bbuildsYellow: '#FFCD67',
	bbuildsTeal: '#01FDF6',
	bbuildsGray: '#E6E7E8',
	bbuildsBlack: '#292929'
};

export default defineConfig({
	darkMode: 'class', // or 'media'
	theme: {
		extend: {
			colors: {
				'bbuilds-yellow': bbuildscolors.bbuildsYellow,
				'bbuilds-teal': bbuildscolors.bbuildsTeal,
				'bbuilds-gray': bbuildscolors.bbuildsGray,
				'bbuilds-black': bbuildscolors.bbuildsBlack
			}
		},
		fontFamily: {
			courier: ['courier-std', ' monospace']
		},
		fontSize: {
			small: '0.8rem',
			base: '1rem',
			lg: '1.25rem',
			xl: '1.563rem',
			'2xl': '1.953rem',
			'3xl': '2.441rem',
			'4xl': '3.052rem'
		}
	}
});
