import { MONTH_NAMES } from './format';

const calculateTimeString = (d: Date) => {
	const h = d.getHours().toString().padStart(2, '0');
	const m = d.getMinutes().toString().padStart(2, '0');
	const s = d.getSeconds().toString().padStart(2, '0');
	return `${h}:${m}:${s}`;
};

const calculateDateString = (d: Date) => {
	const y = d.getFullYear();
	const monthName = MONTH_NAMES[d.getMonth()] || '';
	const day = d.getDate().toString().padStart(2, '0');
	return `${day} ${monthName} ${y}`;
};

/*
const calculateWeekInfo = (d: Date) => {
	const startOfYear = new Date(d.getFullYear(), 0, 1);
	const pastDaysOfYear = (d.valueOf() - startOfYear.valueOf()) / 86400000;
	const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
	const weekDay = (d.getDay() + 6) % 7; // Adjust so Monday=0, Sunday=6
	const dayName = DAY_NAMES[weekDay];
	return `${dayName} w.${weekNumber}`;
}
*/

export default function DateInfo(props: { now: Date }) {
	const { now } = props;

	return (
		<div className="date-info">
			<div>{calculateTimeString(now)}</div>
			<div>{calculateDateString(now)}</div>
		</div>
	);
}
