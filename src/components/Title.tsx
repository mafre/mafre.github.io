import React from 'react';
import { Frame } from './Frame';

export interface TitleProps {
	children: React.ReactNode;
}

export function Title({ children }: TitleProps) {
	return <Frame mode="dark" body={<div className="modal-header">{children}</div>} />;
}
