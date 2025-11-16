import React, { useMemo } from 'react';

export type FrameMode = 'light' | 'dark';

export interface FrameProps {
	type?: number;
	mode?: FrameMode;
	header?: React.ReactNode;
	body?: React.ReactNode;
	footer?: React.ReactNode;
}

export function Frame({ type, mode, header, body, footer }: FrameProps) {
	const className = useMemo(
		() => `frame frame-${mode ?? 'light'} frame_${type ?? Math.floor(Math.random() * 4 + 1)}`,
		[mode, type]
	);
	return (
		<div className="frame-wrapper">
			<div className={className}></div>
			<div className={`frame-content frame-bg-${mode ?? 'light'}`}>
				{header && <div className="frame-header">{header}</div>}
				{body && <div className="frame-body">{body}</div>}
				{footer && <div className="frame-footer">{footer}</div>}
			</div>
		</div>
	);
}
