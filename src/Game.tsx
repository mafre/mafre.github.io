import { useMemo, useState } from 'react';
import { GameButton } from './game/components/GameButton';
import CreateGearDialog from './game/dialogs/CreateGear';
import EditGearDialog from './game/dialogs/EditGear';
import GameClockwork from './game/clockwork/GameClockwork';
import Container from './components/Container';
import GameClockworkModel from './game/clockwork/GameClockworkModel';

export default function Game() {
	const [modalOpen, setModalOpen] = useState(false);
	const [editingGearId, setEditingGearId] = useState<string | null>(null);
	const [escapementOn, setEscapementOn] = useState(true);
	const gameClockworkModel = useMemo(() => new GameClockworkModel(), []);

	const handleCreate = (v: number) => {
		gameClockworkModel.createGear(v);
	};

	return (
		<div className="game">
			<div className="header">
				<GameButton onClick={() => setModalOpen(true)}>Add gear</GameButton>
				<GameButton
					onClick={() => {
						setEscapementOn((v) => {
							const next = !v;
							gameClockworkModel.setEscapementEnabled(next);
							return next;
						});
					}}
				>
					Escapement: {escapementOn ? 'On' : 'Off'}
				</GameButton>
			</div>
			<div className="content">
				<CreateGearDialog
					open={modalOpen}
					title="Gear properties"
					min={8}
					max={20}
					initialValue={12}
					onCreate={handleCreate}
					onClose={() => setModalOpen(false)}
				/>
				<EditGearDialog
					open={editingGearId != null}
					gear={editingGearId ? (gameClockworkModel.model.getGear(editingGearId) ?? null) : null}
					onSave={(updates) => {
						if (!editingGearId) return;
						gameClockworkModel.updateGear(editingGearId, updates);
					}}
					onClose={() => setEditingGearId(null)}
				/>
				<Container svgWidth={150} svgHeight={150}>
					<GameClockwork
						model={gameClockworkModel}
						selectedGearId={editingGearId}
						onSelectGear={(gearId) => setEditingGearId(gearId)}
					/>
				</Container>
			</div>
			<div className="footer" />
		</div>
	);
}
