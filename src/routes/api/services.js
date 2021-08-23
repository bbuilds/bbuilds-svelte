export async function get() {
	return {
		body: {
			title: 'Services && Skills',
			services: [
				{
					title: 'Frontend Development',
					copy: 'JS Frameworks, SPAs, static sites, speed optimization.',
					url: '/web-development'
				},
				{
					title: 'Backend Development',
					copy: 'APIs and dabbling in DevOps',
					url: '/web-development'
				},
				{
					title: 'WordPress Solutions',
					copy: 'Headless, Block Editor, Plugin, Themes',
					url: '/wordpress-development'
				},
				{
					title: 'UI/UX Design',
					copy: 'Website Design, Target Users, Behavorial Psychology',
					url: '/branding'
				},
				{
					title: 'Branding Development',
					copy: 'Market Research, Strategy, Identity',
					url: '/branding'
				},
				{
					title: 'Search Engine Optimization',
					copy: 'Onpage, Local, Analytics Analysis',
					url: '/seo'
				}
			]
		}
	};
}
