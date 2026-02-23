import Analemma from './Analemma';
import SunCircle from './SunCircle';
import SunCurve from './SunCurve';
import Container from '../../time/Container';
import { eachTwoMinutes } from '../../time/format';
import IntervalRender from '../../time/IntervalRender';
import MoonPhase from '../../time/MoonPhase';

export default function Ephemeris() {
	return (
		<div className="ephemeris">
			<IntervalRender interval={eachTwoMinutes} immediate={true}>
				{(info) => (
					<>
						<Container>
							<SunCircle {...info} />
						</Container>
						<Container>
							<SunCurve />
						</Container>
						<Container>
							<Analemma />
						</Container>
						<Container>
							<MoonPhase {...info} />
						</Container>
					</>
				)}
			</IntervalRender>
		</div>
	);
}
