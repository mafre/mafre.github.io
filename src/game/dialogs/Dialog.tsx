import React, { useEffect, useRef } from 'react';
import { Modal } from '../modals/Modal';

export interface DialogProps {
	open?: boolean; // default true if omitted for legacy use
	title?: string;
	onClose?: () => void;
	children: React.ReactNode;
	footer?: React.ReactNode;
	closeOnBackdrop?: boolean;
	closeOnEsc?: boolean;
	initialFocusRef?: React.RefObject<HTMLElement>;
}

export function Dialog({
	open = true,
	title,
	onClose,
	children,
	footer,
	closeOnBackdrop = true,
	closeOnEsc = true,
	initialFocusRef,
}: DialogProps) {
	const backdropRef = useRef<HTMLDivElement | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);

	// Focus management
	useEffect(() => {
		if (!open) return;
		const target =
			initialFocusRef?.current ||
			containerRef.current?.querySelector<HTMLElement>(
				'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
		target?.focus();
	}, [open, initialFocusRef]);

	// ESC to close
	useEffect(() => {
		if (!open || !closeOnEsc) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose?.();
			}
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [open, closeOnEsc, onClose]);

	if (!open) return null;

	const handleBackdrop = (e: React.MouseEvent) => {
		if (!closeOnBackdrop) return;
		if (e.target === backdropRef.current) {
			onClose?.();
		}
	};

	return (
		<div ref={backdropRef} className="overlay" onMouseDown={handleBackdrop}>
			<Modal title={title} footer={footer}>
				{children}
			</Modal>
		</div>
	);
}
