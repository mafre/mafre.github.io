import ProgressBar from "../components/ProgressBar";
import IntervalRender from "../time/IntervalRender";
import { HOURS_INTERVAL, MINUTES_INTERVAL, SECONDS_INTERVAL } from "./gameConfig";
import { useGameData } from './GameData';

export default function Progress() {

	const { update } = useGameData();

	return <div className="progress">
		<IntervalRender interval={HOURS_INTERVAL} immediate={true}>
			{(info) => <>
				Day
				<ProgressBar value={info.now.getHours() / 24 * 100} />
				<br />
				Hour
				<ProgressBar value={info.now.getMinutes() / 60 * 100} />
			</>}
		</IntervalRender>
		<IntervalRender interval={MINUTES_INTERVAL} immediate={true}>
			{(info) => <>
				<br />
				Minute
				<ProgressBar value={info.now.getSeconds() / 60 * 100} />
			</>}
		</IntervalRender>
		<IntervalRender interval={SECONDS_INTERVAL} onTick={() => {update(d => d.addResource('wood', 1))}}>
			{(info) => <>
				<br />
				Second
				<ProgressBar value={info.now.getMilliseconds()} />
			</>}
		</IntervalRender>
	</div>
}