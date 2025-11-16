export function GameButton({
	children,
	onClick = () => {},
}: {
	children: React.ReactNode;
	onClick: () => void;
}) {
	return (
		<div className="button-9slice-wrapper">
			<div className="button-9slice" onClick={onClick}>
				<div className="button-9slice-content">{children}</div>
			</div>
		</div>
	);
}
