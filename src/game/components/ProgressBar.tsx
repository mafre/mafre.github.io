type ProgressBarProps = {
	value: number; // current progress, 0–100
	height?: number; // px, default 8
	color?: string; // CSS color, default "#fff"
};

export default function ProgressBar({ value, height = 8, color = '#fff' }: ProgressBarProps) {
	const clamped = Math.max(0, Math.min(100, value));

	return (
		<div
			style={{
				width: '100%',
				height,
				backgroundColor: '#333',
				borderRadius: height / 2,
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					width: `${clamped}%`,
					height: '100%',
					backgroundColor: color,
				}}
			/>
		</div>
	);
}
