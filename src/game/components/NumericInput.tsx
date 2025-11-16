import { useRef } from 'react';
import { Frame } from './Frame';

export const NumericInput: React.FC<{
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
	styles?: {
		input?: React.CSSProperties;
	};
}> = ({ value, onChange, min, max, step = 1, styles = {} }) => {
	const inputRef = useRef<HTMLInputElement>(null);
	return (
		<Frame
			body={
				<input
					ref={inputRef}
					type="number"
					value={value}
					min={min}
					max={max}
					step={step}
					onChange={(e) => setValue(e.target.value === '' ? NaN : parseFloat(e.target.value))}
					style={styles.input}
				/>
			}
		/>
	);

	function setValue(v: number) {
		if (min !== undefined && v < min) v = min;
		if (max !== undefined && v > max) v = max;
		onChange(v);
	}
};
