import { eachSecond } from '../time/format';
import DateInfo from './DateInfo';
import IntervalRender from './IntervalRender';

export default function Time() {
	return (
		<div className="time">
			<IntervalRender interval={eachSecond} immediate={true}>
				{(info) => (
					<>
						<DateInfo now={info.now} />
					</>
				)}
			</IntervalRender>
		</div>
	);
}
