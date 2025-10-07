import Analemma from './Analemma';
import SunCircle from './SunCircle';
import Container from '../../time/Container';
import SunCurve from './SunCurve';
import IntervalRender from '../../time/IntervalRender';
import MoonPhase from './MoonPhase';
import { eachTwoMinutes } from '../../time/format';

export default function Ephemeris() {
	return <div className="ephemeris">
		<IntervalRender interval={eachTwoMinutes} immediate={true}>
			{(info) => <>
				<Container>
					<SunCircle {...info} />
				</Container>
				<Container>
					<SunCurve {...info} />
				</Container>
				<Container >
					<Analemma />
				</Container>
				<Container >
					<MoonPhase {...info} />
				</Container>
			</>}
		</IntervalRender>
	</div>
}