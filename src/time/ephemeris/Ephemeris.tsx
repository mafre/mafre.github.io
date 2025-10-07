import Analemma from "../../geo/ephemeris/Analemma";
import SunCircle from "../../geo/ephemeris/SunCircle";
import SunCurve from "../../geo/ephemeris/SunCurve";
import Container from "../Container";
import { eachTwoMinutes } from "../format";
import IntervalRender from "../IntervalRender";
import MoonPhase from "./MoonPhase";

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