import { useState } from 'react';
import { GameButton } from './game/components/GameButton';
import NumericCreateModal from './game/dialogs/NumericCreateDialog';

export default function Game() {
	const [modalOpen, setModalOpen] = useState(false);
	const [, setCreatedValue] = useState<number | null>(null);

	const handleCreate = (v: number) => {
		setCreatedValue(v);
		// Placeholder for downstream usage; could dispatch event or update game state.
		console.log('Created numeric value:', v);
	};

	return (
		<div className="game">
			<div className="header"></div>
			<div className="content">
				<GameButton onClick={() => setModalOpen(true)}>Gears</GameButton>
				<NumericCreateModal
					open={modalOpen}
					title="Create gears"
					min={8}
					max={20}
					initialValue={8}
					onCreate={handleCreate}
					onClose={() => setModalOpen(false)}
				/>
			</div>
			<div className="footer" />
		</div>
	);
}
