import Container from "../components/Container";
import Clock from "./Clock";
import DateInfo from "./DateInfo";
import IntervalRender from "./IntervalRender";
import { eachSecond } from "../time/format";

export default function Time() {

	return <div className="time">
		<IntervalRender interval={eachSecond} immediate={true}>
			{(info) => <>
				<DateInfo now={info.now} />
				<Container>
					<Clock now={info.now} />
				</Container>
			</>}
		</IntervalRender>
	</div>

}