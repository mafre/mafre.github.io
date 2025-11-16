import React, { useMemo } from 'react';
import type { OrnamentCSSVars } from '../types/ornament';

export interface OrnamentProps {
	columns?: number; // default matches CSS --columns (2)
	rows?: number; // default matches CSS --rows (7)
	random?: boolean; // when true pick a random tile each mount
	x?: number; // explicit column index overrides random
	y?: number; // explicit row index overrides random
	className?: string;
}

/**
 * Ornament sprite tile component. Provides random tile selection by setting
 * CSS custom properties --ornament-x / --ornament-y which the base .ornament
 * class consumes to position the background.
 */
export const Ornament: React.FC<OrnamentProps> = ({
	columns = 2,
	rows = 7,
	random = true,
	x,
	y,
	className = '',
}) => {
	const { col, row } = useMemo(() => {
		if (x != null && y != null) return { col: x, row: y };
		if (!random) return { col: x ?? 0, row: y ?? 0 };
		return {
			col: x ?? Math.floor(Math.random() * columns),
			row: y ?? Math.floor(Math.random() * rows),
		};
	}, [columns, rows, random, x, y]);

	return (
		<span
			className={'ornament ' + className}
			style={{ '--ornament-x': col, '--ornament-y': row } as OrnamentCSSVars}
			aria-hidden="true"
		/>
	);
};

export default Ornament;
