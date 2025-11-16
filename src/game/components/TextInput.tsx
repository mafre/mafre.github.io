import React, { useEffect, useRef, useState } from 'react';

export interface TextInputProps {
	label?: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	debounce?: number; // milliseconds for debounced onChange, 0/undefined = immediate
	className?: string;
	type?: string;
	autoFocus?: boolean;
	disabled?: boolean;
	name?: string;
}

/**
 * Accessible text input component with optional label & debounced change events.
 * Keeps an internal mirror state when debounce > 0 so that typing is still responsive
 * while outward updates are delayed.
 */
export const TextInput: React.FC<TextInputProps> = ({
	label,
	value,
	onChange,
	placeholder,
	debounce = 0,
	className = '',
	type = 'text',
	autoFocus,
	disabled,
	name,
}) => {
	const [inner, setInner] = useState(value);
	const timeoutRef = useRef<number | null>(null);

	// Keep inner state in sync if value prop changes externally
	useEffect(() => {
		if (value !== inner) setInner(value);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value]);

	useEffect(() => {
		if (debounce > 0) {
			if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
			timeoutRef.current = window.setTimeout(() => {
				if (inner !== value) onChange(inner);
			}, debounce);
			return () => {
				if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
			};
		} else {
			// immediate mode
			if (inner !== value) onChange(inner);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [inner, debounce]);

	const id = useRef(`ti-${Math.random().toString(36).slice(2, 9)}`).current;

	return (
		<div className={`rounded ui-button input-bg ${disabled ? 'opacity-60' : ''}`.trim()}>
			{label && <label htmlFor={id}>{label}</label>}
			<input
				id={id}
				name={name}
				type={type}
				value={inner}
				placeholder={placeholder}
				disabled={disabled}
				autoFocus={autoFocus}
				onChange={(e) => setInner(e.target.value)}
				className={`${className} time-input`}
			/>
		</div>
	);
};

export default TextInput;
