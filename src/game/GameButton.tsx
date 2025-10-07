
export function GameButton({ children, onClick = () => {} }: { children: React.ReactNode, onClick: () => void }) {

	return (
		<div className="rounded ui-button button" onClick={onClick}>
			{children}
		</div>
	);
}

