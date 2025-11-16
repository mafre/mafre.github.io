import React from 'react';
import { Frame } from './Frame';

export interface TitleProps {
	children: React.ReactNode;
}

export function Title({ children }: TitleProps) {
	return (
		<div className="p-2">
			<Frame
				mode="dark"
				body={
					<div className="modal-header">
						{children}
					</div>
				}
			/>
		</div>
	);
}
