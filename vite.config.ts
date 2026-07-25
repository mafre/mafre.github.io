import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';

const isAnalyze = process.env.ANALYZE === 'true';

// https://vite.dev/config/
export default defineConfig({
	base: './',
	plugins: [
		react(),
		tailwind(),
		isAnalyze &&
			visualizer({
				filename: 'dist/bundle-analysis.html',
				open: true,
				gzipSize: true,
				brotliSize: true,
			}),
	].filter(Boolean),
	build: {
		target: 'es2020',
		polyfillModulePreload: false,
		sourcemap: false,
	},
});
