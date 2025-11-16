import React from 'react';

export interface ButtonBarProps {
	children: React.ReactNode;
}

export function ButtonBar({ children }: ButtonBarProps) {
	return <div className="button-bar">{children}</div>;
}
