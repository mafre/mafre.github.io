import React, { useMemo } from 'react';
import type { OrnamentCSSVars } from '../types/ornament';
import { Frame } from './Frame';

export interface TitleProps {
	children: React.ReactNode;
}

export function Title({ children }: TitleProps) {
	let ornamentY = useMemo(() => Math.floor(Math.random() * 4), []);
	return (
		<div className="p-2">
			<Frame
				mode="dark"
				body={
					<div style={{ '--ornament-y': ornamentY } as OrnamentCSSVars} className="modal-header">
						{children}
					</div>
				}
			/>
		</div>
	);
}
