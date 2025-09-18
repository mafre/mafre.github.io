import './App.css';
import Calendar from './calendar/Calendar';
import Game from './game/Game';
import DateInfo from './time/DateInfo';
import { eachSecond } from './time/format';
import IntervalRender from './time/IntervalRender';

export default function App(){
	const pathname = window.location.pathname;
	if (pathname === '/game') {
		return (
			<div className="App bg-cover-bottom" style={{'--bg-url': "url('/bg.png')"} as React.CSSProperties}>
				<div className="content">
					<Game />
				</div>
			</div>
		);
	}

	return (
		<div className="App bg-cover-bottom" style={{'--bg-url': "url('/bg.png')"} as React.CSSProperties}>
			<div className="content">
				<IntervalRender interval={eachSecond} immediate={true}>
					{(info) => <>
						<DateInfo now={info.now} />
					</>}
				</IntervalRender>
				<Calendar />
			</div>
		</div>
	);
}
