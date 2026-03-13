import './App.css';
import Calendar from './Calendar';
import { applyTheme, getPreferredTheme } from './theme';

export default function App() {
	applyTheme(getPreferredTheme());

	return (
		<div className="text-base inter-base">
			<Calendar />
		</div>
	);
}
