import { DEFAULT_OPACITY } from '../../config';
import { CLOCK_HAND_COLORS } from '../utils/clockHandColors';
import { useGameData } from '../GameData';
import { TIME_UNIT_ORDER, getSecondFraction } from '../utils/timeLogic';

/**
 * Clock renders either real wall-clock time (if now provided) or derives a virtual
 * time from the game state's elapsedTime (in ms). The virtual clock maps elapsedTime
 * modulo one 12-hour cycle for hour/minute and modulo 60s for seconds.
 */
export default function Clock() {
	const { data } = useGameData();
	const clockRadius = 45;

	// Extract resource remainders (no millisecond resource anymore)
	// Fractional second derived from timeLogic's internal accumulator
	const fractionalSecond = getSecondFraction(data);
	const sec = data.resources['second'] ?? 0; // 0-59 accumulated whole seconds remainder
	const min = data.resources['minute'] ?? 0; // 0-59
	const hr = data.resources['hour'] ?? 0; // 0-23 (remainder before day conversion)

	// Smooth fractional parts
	const secondTotal = sec + fractionalSecond; // 0..60
	const minuteTotal = min + secondTotal / 60; // 0..60
	const hourTotal = (hr % 12) + minuteTotal / 60; // 0..12

	// Angles (0 at 12 o'clock, increasing clockwise)
	const secondAngle = (secondTotal / 60) * 360;
	const minuteAngle = (minuteTotal / 60) * 360;
	const hourAngle = (hourTotal / 12) * 360;

	// Base hour length still used to proportion extra higher-tier hands (image hands replace core ones)
	const hourLen = clockRadius * 0.6;

	// Extra higher-tier unit hands (day, week, month, year ...)
	const EXTRA_UNITS = ['day', 'week', 'month', 'year'];
	const extraHands: React.ReactNode[] = [];
	EXTRA_UNITS.forEach((unit, idx) => {
		const value = data.resources[unit] ?? 0;
		const unitIndex = TIME_UNIT_ORDER.indexOf(unit);
		if (unitIndex === -1) return;
		// Use level (highest unlocked tier) so the hand persists even if remainder resets to 0 after conversion.
		if (data.level < unitIndex) return; // not yet unlocked
		// Determine cycle length based on conversion cost to next unit (mirrors timeLogic ladder assumptions)
		let cycle: number;
		let lowerFraction = 0;
		switch (unit) {
			case 'day':
				cycle = 7;
				lowerFraction = hr / 24;
				break; // show progress through current day set within a week
			case 'week':
				cycle = 4;
				lowerFraction = (data.resources['day'] ?? 0) / 7;
				break; // approx month (4 weeks)
			case 'month':
				cycle = 12;
				lowerFraction = (data.resources['week'] ?? 0) / 4;
				break; // months toward year
			case 'year':
				cycle = 12;
				lowerFraction = (data.resources['month'] ?? 0) / 12;
				break; // (simplified)
			default:
				cycle = 60;
				break;
		}
		const angle = (((value % cycle) + lowerFraction) / cycle) * 360;
		const length = hourLen * (0.85 - idx * 0.12); // strictly decreasing positive
		if (length <= 0) return; // safety
		extraHands.push(
			<line
				key={unit}
				x1={0}
				y1={0}
				x2={length * Math.cos((angle - 90) * (Math.PI / 180))}
				y2={length * Math.sin((angle - 90) * (Math.PI / 180))}
				stroke={CLOCK_HAND_COLORS[unit] || CLOCK_HAND_COLORS.second}
				strokeWidth={4 - idx * 0.5}
				strokeLinecap="round"
				opacity={0.85}
			/>
		);
	});

	return (
		<>
			<image
				href="/clock_bg.png"
				width={256}
				height={256}
				x={-128}
				y={-128}
				preserveAspectRatio="xMidYMid meet"
				style={{ pointerEvents: 'none' }}
			/>
			{/* Tick marks */}
			{[...Array(12)].map((_, i) => {
				const angle = i * 30 * (Math.PI / 180);
				const x1 = clockRadius * Math.cos(angle);
				const y1 = clockRadius * Math.sin(angle);
				const x2 = (clockRadius + 5) * Math.cos(angle);
				const y2 = (clockRadius + 5) * Math.sin(angle);
				return (
					<line
						key={i}
						x1={x1}
						y1={y1}
						x2={x2}
						y2={y2}
						stroke="#fff"
						strokeWidth="3"
						opacity={DEFAULT_OPACITY}
					/>
				);
			})}

			{[...Array(60)].map((_, i) => {
				if (i % 5 === 0) return null; // skip hour marks
				const angle = i * 6 * (Math.PI / 180);
				const x1 = clockRadius * Math.cos(angle);
				const y1 = clockRadius * Math.sin(angle);
				const x2 = (clockRadius + 3) * Math.cos(angle);
				const y2 = (clockRadius + 3) * Math.sin(angle);
				return (
					<line
						key={i}
						x1={x1}
						y1={y1}
						x2={x2}
						y2={y2}
						stroke="#fff"
						strokeWidth="1"
						opacity={DEFAULT_OPACITY * 0.6}
					/>
				);
			})}

			{/* Image-based hour, minute, second hands. Assumes images are oriented pointing up (12 o'clock). */}
			<image
				href="/hour.png"
				width={clockRadius * 2}
				height={clockRadius * 2}
				x={-clockRadius}
				y={-clockRadius}
				preserveAspectRatio="xMidYMid meet"
				transform={`rotate(${hourAngle})`}
				style={{ pointerEvents: 'none' }}
			/>
			<image
				href="/minute.png"
				width={clockRadius * 2}
				height={clockRadius * 2}
				x={-clockRadius}
				y={-clockRadius}
				preserveAspectRatio="xMidYMid meet"
				transform={`rotate(${minuteAngle})`}
				style={{ pointerEvents: 'none' }}
			/>
			<image
				href="/second.png"
				width={clockRadius * 2}
				height={clockRadius * 2}
				x={-clockRadius}
				y={-clockRadius}
				preserveAspectRatio="xMidYMid meet"
				transform={`rotate(${secondAngle})`}
				style={{ pointerEvents: 'none' }}
			/>
			{extraHands}
			{/* Center cap image */}
			<image
				href="/center.png"
				width={10}
				height={10}
				x={-5}
				y={-5}
				preserveAspectRatio="xMidYMid meet"
				style={{ pointerEvents: 'none' }}
			/>
		</>
	);
}
