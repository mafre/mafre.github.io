import { DEFAULT_SVG_HEIGHT, DEFAULT_SVG_WIDTH } from "../config";

export default function Container(props: {children: React.ReactNode, svgWidth?: number, svgHeight?: number, overlay?: boolean}) {
	const { children, svgWidth=DEFAULT_SVG_WIDTH, svgHeight=DEFAULT_SVG_HEIGHT, overlay } = props;
	const defaultStyle:React.CSSProperties = { display: 'block', margin: '0 auto' };
	const style:React.CSSProperties = overlay ? { ...defaultStyle, position: 'absolute', left: 0, top: 0, pointerEvents: 'none', overflow: 'visible' }: { ...defaultStyle, overflow: 'visible' };

	return <svg viewBox={`-${svgWidth/2} -${svgHeight/2} ${svgWidth} ${svgHeight}`} width={svgWidth} height={svgHeight} style={style} imageRendering='optimizeQuality' preserveAspectRatio='xMidYMid meet'>
		{children}
	</svg>
}