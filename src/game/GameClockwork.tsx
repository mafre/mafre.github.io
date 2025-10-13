import { useEffect, useMemo, useRef } from "react";
import { Clockwork } from "../Clockwork";
import GearFactory from "../GearFactory";

const GameClockwork = () => {
  // Create the clockwork once and retain the instance across renders
  const cw = useMemo(() => {
    const c = new Clockwork();
    c.generateGear({ id: "A", ratio: 1, radius: 20, teeth: 8, axleId: "ax1", layer: 0, toothRootRatio: 0.6, toothTopRatio: 0.2, toothDepth: 5 });
    GearFactory.createMeshingPair(c, "A", "B", 0.7, { axleB: "ax2", pitch: 3, toothRootRatio: 0.6, toothTopRatio: 0.2 });
    GearFactory.createMeshingPair(c, "B", "C", 1.2, { axleB: "ax3", pitch: 3, toothRootRatio: 0.6, toothTopRatio: 0.2 });
    GearFactory.createCoaxialPair(c, "B", "D", 8, { toothRootRatio: 0.6, toothTopRatio: 0.2 }, 2);
    c.positionConnected("A", 0, 0);
    return c;
  }, []);

  // Reference to the parent SVG element so we can mutate transforms directly
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Drive rotations with requestAnimationFrame and update DOM transforms only
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let angle = 0;

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      // Increase angle based on elapsed time to keep smooth regardless of frame rate
      angle += (dt * 0.06); // ~0.06 deg/ms => ~60 deg/sec; tune as needed

      // Solve rotations in model space
      cw.solveRotations("A", angle);

      // Apply transforms directly to <g> elements for each gear to avoid re-creating DOM
      const svg = svgRef.current;
      if (svg) {
        const gears = cw.getGears();
        for (const g of gears) {
          // Expect gear groups to have class `gear-<id>` from renderSVG
          const sel = svg.querySelector<SVGGElement>(`.gear-${g.id}`);
          if (sel) {
            const cx = 0 + (g.x ?? 0);
            const cy = 100 + (g.y ?? 0);
            sel.setAttribute("transform", `rotate(${g.rotation} ${cx} ${cy})`);
          }
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cw]);

  // Render static SVG once; runtime updates mutate transforms on the <g> nodes
  const svg = cw.renderSVG({ centerX: 0, centerY: 100, drawAxles: false, fill: "#000", strokeWidth: 0 }) as any;

  // Clone the rendered SVG and attach ref — renderSVG returns a React node tree
  return (
    <svg ref={svgRef} viewBox={"-200 -200 400 400"} width={400} height={400} xmlns="http://www.w3.org/2000/svg">
      {svg}
    </svg>
  );
};

export default GameClockwork;