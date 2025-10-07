import { DEFAULT_SVG_HEIGHT, DEFAULT_SVG_WIDTH } from "../config";

export default function Container(props: {children: React.ReactNode, svgWidth?: number, svgHeight?: number}) {
	const { children, svgWidth=DEFAULT_SVG_WIDTH, svgHeight=DEFAULT_SVG_HEIGHT } = props;

	return <svg viewBox={`-${svgWidth/2} -${svgHeight/2} ${svgWidth} ${svgHeight}`} width={svgWidth} height={svgHeight}>
		{children}
	</svg>
}