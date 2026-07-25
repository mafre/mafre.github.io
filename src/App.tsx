import './App.css';
import { applyTheme, getPreferredTheme } from './theme';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const NamnsdagarPage = lazy(() => import('./pages/NamnsdagarPage'));

export default function App() {
	applyTheme(getPreferredTheme());

	return (
		<BrowserRouter>
			<div className="text-base inter-base">
				<nav className="page-nav mb-6">
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
					</div>
				</nav>

				<main className="page-content">
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
