import CanvasSurface from '../../time/CanvasSurface';
import type { SunPoint } from './projectSunToView';

export default function Sun(sunPoint: SunPoint) {

const w = 500;
const h = 500;

const onDraw = (ctx: CanvasRenderingContext2D, { width, height }: { width: number; height: number }) => {
	ctx.clearRect(0, 0, width, height);
	ctx.beginPath();
	ctx.arc(sunPoint.x, sunPoint.y, 3, 0, Math.PI * 2);
	ctx.fillStyle = sunPoint.inView ? "#ffa500" : "#888"; // optional styling
	ctx.fill();
};

  return (
	<CanvasSurface
		width={w}
		height={h}
		background="#fff"
		onDraw={onDraw}
		className="shadow-xl"
	/>
  )
}