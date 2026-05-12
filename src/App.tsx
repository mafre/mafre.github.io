import './App.css';
import { HiraganaSpeaker } from './components/HiraganaSpeaker';
import { applyTheme, getPreferredTheme } from './theme';

export default function App() {
	applyTheme(getPreferredTheme());

	const kana = ['あ', 'い', 'う', 'え', 'お'];

	return (
		<div className="text-base inter-base">
			<div className="app">
				<div className="game">
					<div className="flex justify-center flex-col">
						{kana.map((text) => (
							<HiraganaSpeaker key={text} text={text} />
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
