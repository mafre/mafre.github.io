import React, { useState } from 'react';
import { GameButton } from '../components/GameButton';
import { NumericInput } from '../components/NumericInput';
import { Dialog } from './Dialog';

export interface NumericCreateModalProps {
	open: boolean;
	title?: string;
	min?: number;
	max?: number;
	step?: number;
	initialValue?: number;
	onCreate: (value: number) => void;
	onClose: () => void;
}

/**
 * Simple modal with a numeric input and a Create button.
 * Renders inline (no portal) with a backdrop. Accessible focus trap for first input.
 */
const NumericCreateDialog: React.FC<NumericCreateModalProps> = ({
	open,
	title = 'Create',
	min,
	max,
	step = 1,
	initialValue = 0,
	onCreate,
	onClose,
}) => {
	const [value, setValue] = useState<number>(initialValue);

	if (!open) return null;

	const valid =
		!Number.isNaN(value) && (min == null || value >= min) && (max == null || value <= max);

	const handleCreate = () => {
		if (!valid) return;
		onCreate(value);
		onClose();
	};

	return (
		<Dialog
			open={open}
			title={title}
			onClose={onClose}
			footer={<GameButton onClick={handleCreate}>Create</GameButton>}
		>
			<div className="frame-content">
				<NumericInput
					onChange={(value) => setValue(Number(value))}
					value={value}
					min={min}
					max={max}
					step={step}
				/>
				{(min != null || max != null) && (
					<div style={{ fontSize: 11, color: '#555' }}>
						{min != null && <span>Min: {min} </span>}
						{max != null && <span>Max: {max}</span>}
					</div>
				)}
				{!valid && <div style={{ fontSize: 11, color: '#c0392b' }}>Value out of range.</div>}
			</div>
		</Dialog>
	);
};

// Old inline styles removed; layout handled by generic Modal component.

export default NumericCreateDialog;
