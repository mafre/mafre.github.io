import { Frame, type FrameProps } from '../components/Frame';
import { Title } from '../components/Title';

export interface ModalProps extends FrameProps {
	title?: string;
	header?: React.ReactNode;
	children: React.ReactNode;
	footer?: React.ReactNode;
}

export function Modal({ title, children, footer }: ModalProps) {
	return <Frame header={<Title>{title}</Title>} body={children} footer={footer} />;
}

export function SimpleModal({ title, children }: Omit<ModalProps, 'footer'>) {
	return <Frame header={<Title>{title}</Title>} body={children} />;
}
