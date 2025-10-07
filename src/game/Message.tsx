export default function Message({ text }: { text: string }) {
	return (
		<div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[92%] md:w-[720px] p-2 text-vga-ink font-sierra">
			{text}
		</div>
	);
}