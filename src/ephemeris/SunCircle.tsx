import { DEFAULT_OPACITY, DEFAULT_RADIUS } from "../config";
import type { IntervalRenderInfo } from "../time/IntervalRender";

export default function SunCircle(props: IntervalRenderInfo) {
	const { now } = props;

	function daytimeNormalized(d: Date) {
		const h = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
		return Math.min(1, Math.max(0, (h - 6) / 12));
	}

	function nighttimeNormalized(d: Date) {
		let h = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
		if (h < 18) h += 24;
		return Math.min(1, Math.max(0, (h - 18) / 12));
	}

	function posOnArcUpper(t: number) {
		const angle = Math.PI * (1 - t);
		return { x: DEFAULT_RADIUS * Math.cos(angle), y: -DEFAULT_RADIUS * Math.sin(angle) };
	}

	function posOnArcLower(t: number) {
		const angle = Math.PI * (-t);
		return { x: DEFAULT_RADIUS * Math.cos(angle), y: -DEFAULT_RADIUS * Math.sin(angle) };
	}

	function getSunPosition(d: Date) {
	return posOnArcUpper(daytimeNormalized(d));
	}

	function getMoonPosition(d: Date) {
		return posOnArcLower(nighttimeNormalized(d));
	}

	const isDay = now.getHours() >= 6 && now.getHours() < 18;
	const pos = isDay ? getSunPosition(now) : getMoonPosition(now);

	function SunPath():React.ReactNode {
		return <path
			d={`M -${DEFAULT_RADIUS} 0 A ${DEFAULT_RADIUS} ${DEFAULT_RADIUS} 0 0 1 ${DEFAULT_RADIUS} 0`}
			stroke="white"
			strokeWidth="1"
			fill="none"
			opacity={DEFAULT_OPACITY}
		/>
	}

	function MoonPath():React.ReactNode {
		return <path
			d={`M -${DEFAULT_RADIUS} 0 A ${DEFAULT_RADIUS} ${DEFAULT_RADIUS} 0 0 0 ${DEFAULT_RADIUS} 0`}
			stroke="white"
			strokeWidth="1"
			fill="none"
			opacity={DEFAULT_OPACITY}
		/>
	}

	return <g>
		<SunPath />
		<MoonPath />
		<circle cx={pos.x} cy={pos.y} r="3" fill="#e64a19" />
	</g>
}