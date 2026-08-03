import './App.css';
import { applyTheme, getPreferredTheme } from './theme';
import type { Theme } from './theme';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';

const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const NamnsdagarPage = lazy(() => import('./pages/NamnsdagarPage'));

export default function App() {
	const [theme, setTheme] = useState<Theme>(getPreferredTheme);

	useEffect(() => {
		applyTheme(theme);
	}, [theme]);

	function toggleTheme() {
		setTheme(t => (t === 'light' ? 'dark' : 'light'));
	}

	return (
		<BrowserRouter>
			<div className="text-base inter-base">
				<nav className="page-nav">
					<div className="page-nav-links">
						<NavLink
							to="/"
							end
							className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
						>
							Calendar
						</NavLink>
						<NavLink
							to="/namnsdagar"
							className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
						>
							Namnsdagar
						</NavLink>
						<button
							onClick={toggleTheme}
							className="nav-link ml-auto"
							aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
						>
							{theme === 'light' ? '🌙' : '☀️'}
						</button>
					</div>
				</nav>

				<main className="page-content p-4">
					<Suspense fallback={<div className="p-4">Loading page...</div>}>
						<Routes>
							<Route path="/" element={<CalendarPage />} />
							<Route path="/namnsdagar" element={<NamnsdagarPage />} />
						</Routes>
					</Suspense>
				</main>
			</div>
		</BrowserRouter>
	);
}
