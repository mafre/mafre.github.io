import React from 'react';

export interface TextProps {
	children: React.ReactNode;
}

export function Text({ children }: TextProps) {
	return <div className="text-bg">{children}</div>;
}
