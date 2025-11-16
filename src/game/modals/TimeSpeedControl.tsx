import { ButtonBar } from '../components/ButtonBar';
import { GameButton } from '../components/GameButton';
import { Text } from '../components/Text';
import { useGameData } from '../GameData';
import { Modal } from './Modal';

export default function TimeSpeedControl() {
	const { data, update } = useGameData();

	const adjust = (mult: number) => {
		if (!Number.isFinite(mult) || mult <= 0) return;
		const newSpeed = data.timeSpeed * mult;
		if (newSpeed <= 0) return;
		update((gd) => gd.setTimeSpeed(newSpeed));
	};

	const toScientific = (value: number) => {
		if (!Number.isFinite(value) || value === 0) return { mantissa: '0', exp: 0 };
		const exp = Math.floor(Math.log10(Math.abs(value)));
		const mant = value / Math.pow(10, exp);
		// Use up to 3 significant digits, trim trailing zeros & decimal point
		let mantissa = mant.toPrecision(3);
		mantissa = mantissa.replace(/\.0+$/, '').replace(/(\.[0-9]*?)0+$/, '$1');
		return { mantissa, exp };
	};

	const { mantissa, exp } = toScientific(data.timeSpeed);

	return (
		<Modal title="Time Speed Control">
			<div className="flex flex-1 items-center flex-col gap-4">
				<Text>
					x{mantissa}
					<span>*10</span>
					<sup>{exp}</sup>
				</Text>
				<ButtonBar>
					<GameButton
						onClick={() => {
							if (!confirm('Reset game progress?')) return;
							update(() => new (data.constructor as any)());
						}}
					>
						Reset
					</GameButton>
					<GameButton onClick={() => adjust(0.1)}>÷10</GameButton>
					<GameButton onClick={() => adjust(10)}>×10</GameButton>
				</ButtonBar>
			</div>
		</Modal>
	);
}
