import React, { useEffect, useMemo, useState } from 'react';
import { GameButton } from '../components/GameButton';
import { NumericInput } from '../../components/NumericInput';
import { Dialog } from '../../components/Dialog';
import { TextInput } from '../../components/TextInput';
import type Gear from '../clockwork/Gear';

export interface EditGearProps {
	open: boolean;
	gear: Gear | null;
	onSave: (updates: {
		teeth?: number;
		radius?: number;
		layer?: number;
		axleId?: string;
		toothDepth?: number;
		toothTopRatio?: number;
		toothRootRatio?: number;
	}) => void;
	onClose: () => void;
}

const EditGear: React.FC<EditGearProps> = ({ open, gear, onSave, onClose }) => {
	const seed = useMemo(
		() => ({
			teeth: gear?.teeth ?? NaN,
			radius: gear?.radius ?? NaN,
			layer: gear?.layer ?? NaN,
			axleId: gear?.axleId ?? '',
			toothDepth: gear?.toothDepth ?? NaN,
			toothTopRatio: gear?.toothTopRatio ?? NaN,
			toothRootRatio: gear?.toothRootRatio ?? NaN,
		}),
		[gear]
	);

	const [teeth, setTeeth] = useState<number>(seed.teeth);
	const [radius, setRadius] = useState<number>(seed.radius);
	const [layer, setLayer] = useState<number>(seed.layer);
	const [axleId, setAxleId] = useState<string>(seed.axleId);
	const [toothDepth, setToothDepth] = useState<number>(seed.toothDepth);
	const [toothTopRatio, setToothTopRatio] = useState<number>(seed.toothTopRatio);
	const [toothRootRatio, setToothRootRatio] = useState<number>(seed.toothRootRatio);
	const [keepProportions, setKeepProportions] = useState<boolean>(true);

	useEffect(() => {
		if (!open) return;
		setTeeth(seed.teeth);
		setRadius(seed.radius);
		setLayer(seed.layer);
		setAxleId(seed.axleId);
		setToothDepth(seed.toothDepth);
		setToothTopRatio(seed.toothTopRatio);
		setToothRootRatio(seed.toothRootRatio);
	}, [open, seed]);

	if (!open || !gear) return null;

	const handleTeethChange = (v: number) => {
		const nextTeeth = Number.isNaN(v) ? NaN : Math.max(4, Math.round(v));

		if (keepProportions && Number.isFinite(nextTeeth)) {
			const prevTeeth = Number.isFinite(teeth) ? teeth : (gear.teeth ?? NaN);
			const prevRadius = Number.isFinite(radius) ? radius : gear.radius;
			if (
				Number.isFinite(prevTeeth) &&
				prevTeeth > 0 &&
				Number.isFinite(prevRadius) &&
				prevRadius > 0
			) {
				const scale = nextTeeth / prevTeeth;
				setRadius(Math.max(1, prevRadius * scale));
				if (Number.isFinite(toothDepth)) {
					setToothDepth(Math.max(0, toothDepth * scale));
				}
			}
		}

		setTeeth(nextTeeth);
	};

	const numberOk = (v: number, min?: number, max?: number) => {
		if (Number.isNaN(v)) return false;
		if (min != null && v < min) return false;
		if (max != null && v > max) return false;
		return true;
	};

	const canSave =
		numberOk(teeth, 4) &&
		numberOk(radius, 1) &&
		numberOk(layer, 0) &&
		(Number.isNaN(toothTopRatio) || numberOk(toothTopRatio, 0, 1)) &&
		(Number.isNaN(toothRootRatio) || numberOk(toothRootRatio, 0, 1)) &&
		(Number.isNaN(toothDepth) || numberOk(toothDepth, 0));

	const handleSave = () => {
		if (!canSave) return;
		onSave({
			teeth,
			radius,
			layer,
			axleId,
			toothDepth,
			toothTopRatio,
			toothRootRatio,
		});
		onClose();
	};

	const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
		if (e.key !== 'Enter') return;
		if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return;
		// Avoid submitting when the user is just toggling the checkbox.
		if ((e.target as HTMLElement | null)?.tagName === 'INPUT') {
			const input = e.target as HTMLInputElement;
			if (input.type === 'checkbox') return;
		}
		e.preventDefault();
		handleSave();
	};

	return (
		<Dialog
			open={open}
			title={`Edit ${gear.id}`}
			onClose={onClose}
			footer={<GameButton onClick={handleSave}>Save</GameButton>}
		>
			<div className="frame-content" style={{ display: 'grid', gap: 10 }} onKeyDown={handleKeyDown}>
				<div style={{ display: 'grid', gap: 6 }}>
					<div style={{ fontSize: 11, color: '#555' }}>Teeth</div>
					<NumericInput
						value={teeth}
						min={4}
						step={1}
						onChange={handleTeethChange}
						styles={{ input: { width: 120 } }}
					/>
					<label
						style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, color: '#555' }}
					>
						<input
							type="checkbox"
							checked={keepProportions}
							onChange={(e) => setKeepProportions(e.target.checked)}
						/>
						Keep size proportional when editing teeth
					</label>
				</div>

				<div style={{ display: 'grid', gap: 6 }}>
					<div style={{ fontSize: 11, color: '#555' }}>Radius</div>
					<NumericInput
						value={radius}
						min={1}
						step={1}
						onChange={(v) => setRadius(Number(v))}
						styles={{ input: { width: 120 } }}
					/>
				</div>

				<div style={{ display: 'grid', gap: 6 }}>
					<div style={{ fontSize: 11, color: '#555' }}>Layer</div>
					<NumericInput
						value={layer}
						min={0}
						step={1}
						onChange={(v) => setLayer(Number(v))}
						styles={{ input: { width: 120 } }}
					/>
				</div>

				<div style={{ display: 'grid', gap: 6 }}>
					<div style={{ fontSize: 11, color: '#555' }}>Axle Id (optional)</div>
					<TextInput
						value={axleId}
						onChange={setAxleId}
						placeholder="(blank = none)"
						className=""
					/>
				</div>

				<div style={{ display: 'grid', gap: 6 }}>
					<div style={{ fontSize: 11, color: '#555' }}>Tooth depth (optional)</div>
					<NumericInput
						value={toothDepth}
						min={0}
						step={1}
						onChange={(v) => setToothDepth(Number(v))}
						styles={{ input: { width: 120 } }}
					/>
				</div>

				<div style={{ display: 'grid', gap: 6 }}>
					<div style={{ fontSize: 11, color: '#555' }}>Tooth top ratio (0..1, optional)</div>
					<NumericInput
						value={toothTopRatio}
						min={0}
						max={1}
						step={0.05}
						onChange={(v) => setToothTopRatio(Number(v))}
						styles={{ input: { width: 120 } }}
					/>
				</div>

				<div style={{ display: 'grid', gap: 6 }}>
					<div style={{ fontSize: 11, color: '#555' }}>Tooth root ratio (0..1, optional)</div>
					<NumericInput
						value={toothRootRatio}
						min={0}
						max={1}
						step={0.05}
						onChange={(v) => setToothRootRatio(Number(v))}
						styles={{ input: { width: 120 } }}
					/>
				</div>

				{!canSave && (
					<div style={{ fontSize: 11, color: '#c0392b' }}>Fix invalid values before saving.</div>
				)}
			</div>
		</Dialog>
	);
};

export default EditGear;
