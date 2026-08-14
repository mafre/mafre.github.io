import Clock from './game/components/Clock';
import Container from './time/Container';

export default function Game() {
	//const [, setCreatedValue] = useState<number | null>(null);
	//const [clockwork] = useState(new Clockwork());

	/*
	const handleCreate = (v: number) => {
		setCreatedValue(v);
		// Try to attach the new coaxial gear to the last-added gear in the clockwork.
		const gears = clockwork.getGears();
		const last = gears.length ? gears[gears.length - 1] : undefined;
		const newId = `gear${gears.length + 1}`;

		if (last) {
			const masterId = last.id;
			console.log('Creating coaxial gear', newId, 'on master', masterId);
			GearFactory.createExplicitCoaxial(
				clockwork,
				`gear${gears.length + 1}`,
				`gear${gears.length + 2}`,
				20,
				v,
				{ layer: last.layer + 1 }
			);
		} else {
			// No existing gear: create a standalone coaxial pair with a default master.
			GearFactory.createExplicitCoaxial(clockwork, 'gear1', newId, 20, v, { layer: 1 });
		}
	};
	*/

	return (
		<div className="game">
				<div className="flex justify-center flex-col">
					<Container svgWidth={200} svgHeight={200}>
						<Clock />
					</Container>
				</div>
			</div>
	);
}
