import { computeMoonPhase } from '../ephemeris/getMoonPhase';
import type { IntervalRenderInfo } from '../time/IntervalRender';

export default function MoonPhase(props: IntervalRenderInfo) {
  const { now } = props;
	const moonPhaseInfo = computeMoonPhase(now);
	const { phaseFraction } = moonPhaseInfo;
	const R = 22;
	const p = phaseFraction;
	const waxing = p <= 0.5;
	const k = (p <= 0.5 ? p * 2 : (1 - p) * 2);
	const innerRx = Math.max(0.0001, k) * R;

	function litPath(): string {
		if (k >= 0.999) {
			return `M 0 ${-R} A ${R} ${R} 0 0 1 0 ${R} A ${R} ${R} 0 0 1 0 ${-R} Z`;
		}
		if (k <= 0.001) {
			return '';
		}
		if (waxing) {
			return `M 0 ${-R} A ${R} ${R} 0 0 1 0 ${R} A ${innerRx} ${R} 0 0 1 0 ${-R} Z`;
		} else {
			return `M 0 ${-R} A ${innerRx} ${R} 0 0 1 0 ${R} A ${R} ${R} 0 0 1 0 ${-R} Z`;
		}
	}

	const pathD = litPath();

	return (
		<g>
			{pathD && (
				<path d={pathD} fill="#e64a19" />
			)}
				</g>
		);
}
