export type Theme = 'light' | 'dark';

export function getPreferredTheme(): Theme {
	const saved = localStorage.getItem('theme') as Theme | null;
	if (saved) return saved;

	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: Theme) {
	document.documentElement.setAttribute('data-theme', theme);
	localStorage.setItem('theme', theme);
}
