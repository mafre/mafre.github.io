import { DEFAULT_SVG_WIDTH, DEFAULT_OPACITY } from "../config";

export default function Clock(props: {now: Date}){
	const { now } = props;
	const hours = now.getHours();
	const minutes = now.getMinutes();
	const seconds = now.getSeconds();
	const hourAngle = (hours % 12) * 30 + (minutes / 60) * 30;
	const minuteAngle = minutes * 6 + (seconds / 60) * 6;
	const secondAngle = seconds * 6;
	const clockRadius = DEFAULT_SVG_WIDTH * 0.3;
	const hourHandLength = clockRadius * 0.5;
	const minuteHandLength = clockRadius * 0.7;
	const secondHandLength = clockRadius * 0.9;

	return (
		<>
			{[...Array(12)].map((_, i) => {
				const angle = (i * 30) * (Math.PI / 180);
				const x1 = clockRadius * Math.cos(angle);
				const y1 = clockRadius * Math.sin(angle);
				const x2 = (clockRadius + 5) * Math.cos(angle);
				const y2 = (clockRadius + 5) * Math.sin(angle);
				return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth="1" opacity={DEFAULT_OPACITY}/>;
			})}
			<line x1="0" y1="0" x2={hourHandLength * Math.cos((hourAngle - 90) * (Math.PI / 180))} y2={hourHandLength * Math.sin((hourAngle - 90) * (Math.PI / 180))} stroke="#e64a19" opacity={1} strokeWidth="2"/>
			<line x1="0" y1="0" x2={minuteHandLength * Math.cos((minuteAngle - 90) * (Math.PI / 180))} y2={minuteHandLength * Math.sin((minuteAngle - 90) * (Math.PI / 180))} stroke="#fff" opacity={DEFAULT_OPACITY} strokeWidth="1.5"/>
			<line x1="0" y1="0" x2={secondHandLength * Math.cos((secondAngle - 90) * (Math.PI / 180))} y2={secondHandLength * Math.sin((secondAngle - 90) * (Math.PI / 180))} stroke="#fff" strokeWidth="0.5"/>
		</>
	);
}