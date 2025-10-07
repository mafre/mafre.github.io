
export function Modal({ children }: { children: React.ReactNode }) {

	return (
		<div className="modal p-2">
			{children}
		</div>
	);
}