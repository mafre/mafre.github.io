import { useEffect, useRef, useMemo } from 'react';
import { Clockwork } from '../Clockwork';
import GearFactory from '../GearFactory';

// Minimal WebGPU prototype: draw instanced circles for each gear.
// Falls back to SVG output if WebGPU isn't available.
export default function GameClockworkWebGPU() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gw = useMemo(() => {
    const c = new Clockwork();
    c.generateGear({ id: 'A', ratio: 1, radius: 20, teeth: 8, axleId: 'ax1', layer: 0, toothRootRatio: 0.6, toothTopRatio: 0.2, toothDepth: 5 });
    GearFactory.createMeshingPair(c, 'A', 'B', 0.7, { axleB: 'ax2', pitch: 3, toothRootRatio: 0.6, toothTopRatio: 0.2 });
    GearFactory.createMeshingPair(c, 'B', 'C', 1.2, { axleB: 'ax3', pitch: 3, toothRootRatio: 0.6, toothTopRatio: 0.2 });
    GearFactory.createCoaxialPair(c, 'B', 'D', 8, { toothRootRatio: 0.6, toothTopRatio: 0.2 }, 2);
    c.positionConnected('A', 0, 0);
    return c;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Feature-detect WebGPU
    if (!('gpu' in navigator)) {
      // Leave fallback SVG to be used by parent if desired; nothing to do here
      return;
    }

    let mounted = true;
    let raf = 0;

    // Use any types for WebGPU objects to avoid TS library issues
    (async () => {
      // @ts-ignore
      const adapter: any = await (navigator as any).gpu.requestAdapter();
      if (!adapter) return;
      const device: any = await adapter.requestDevice();

      // Defensive: some environments (SSR, test runners, or mocked DOM) may provide
      // a `canvas` ref object that doesn't implement getContext. Guard against that.

      const getCtx = (canvas as any)?.getContext;
      if (typeof getCtx !== 'function') {
        console.warn('WebGPU init aborted: canvas.getContext is not a function in this environment');
        return;
      }

      const context: any = getCtx.call(canvas, 'webgpu');

      const devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  // compute pixel dimensions for resizing when needed
  Math.max(1, Math.floor(canvas.clientWidth * devicePixelRatio));
  Math.max(1, Math.floor(canvas.clientHeight * devicePixelRatio));

  const format = (navigator as any)['gpu']?.getPreferredCanvasFormat?.() ?? 'bgra8unorm';
      context.configure({ device, format, alphaMode: 'premultiplied' });

      // Vertex data: two triangles forming a quad in clip space for a unit circle region
      const vertexData = new Float32Array([
        -1, -1,  1, -1, -1, 1,
         1, -1,  1,  1, -1, 1,
      ]);
      const bufferUsage = (device as any).GPUBufferUsage ?? { VERTEX: 0x20, COPY_DST: 0x08 };
      const vertexBuffer = device.createBuffer({
        size: vertexData.byteLength,
        usage: bufferUsage.VERTEX | bufferUsage.COPY_DST,
        mappedAtCreation: true,
      });
      new Float32Array(vertexBuffer.getMappedRange()).set(vertexData);
      vertexBuffer.unmap();

      // Instance buffer: offsetX, offsetY, scale, rotation, r,g,b,a
      const maxInstances = 64;
      const instanceStride = 8 * 4; // 8 floats * 4 bytes
      const instanceData = new Float32Array(maxInstances * 8);
      const instanceBuffer = device.createBuffer({
        size: instanceData.byteLength,
        usage: bufferUsage.VERTEX | bufferUsage.COPY_DST,
      });

      // WGSL shaders
      const shaderModule = device.createShaderModule({ code: `
        struct VSOut {
          @builtin(position) position : vec4<f32>;
          @location(0) localPos : vec2<f32>;
          @location(1) color : vec4<f32>;
        };

        @vertex
        fn vs_main(@location(0) inPos : vec2<f32>,
                   @location(1) inOffset : vec2<f32>,
                   @location(2) inScale : f32,
                   @location(3) inRotation : f32,
                   @location(4) inColor : vec4<f32>) -> VSOut {
          var out : VSOut;
          let s = sin(inRotation);
          let c = cos(inRotation);
          let x = inPos.x * inScale;
          let y = inPos.y * inScale;
          let rx = x * c - y * s;
          let ry = x * s + y * c;
          out.position = vec4<f32>(inOffset + vec2<f32>(rx, ry), 0.0, 1.0);
          out.localPos = inPos;
          out.color = inColor;
          return out;
        }

        @fragment
        fn fs_main(@location(0) localPos : vec2<f32>, @location(1) color : vec4<f32>) -> @location(0) vec4<f32> {
          // localPos is in [-1,1]; draw a circle of radius 1.0 inscribed in the quad
          let d = length(localPos);
          if (d > 1.0) {
            discard;
          }
          // smooth edge
          let alpha = smoothstep(1.0, 0.98, d);
          return vec4<f32>(color.rgb, color.a * alpha);
        }
      `});

      const pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
          module: shaderModule,
          entryPoint: 'vs_main',
          buffers: [
            { // vertex buffer
              arrayStride: 2 * 4,
              stepMode: 'vertex',
              attributes: [ { shaderLocation: 0, offset: 0, format: 'float32x2' } ]
            },
            { // instance buffer
              arrayStride: instanceStride,
              stepMode: 'instance',
              attributes: [
                { shaderLocation: 1, offset: 0, format: 'float32x2' },
                { shaderLocation: 2, offset: 8, format: 'float32' },
                { shaderLocation: 3, offset: 12, format: 'float32' },
                { shaderLocation: 4, offset: 16, format: 'float32x4' },
              ]
            }
          ]
        },
        fragment: {
          module: shaderModule,
          entryPoint: 'fs_main',
          targets: [{ format }]
        },
        primitive: { topology: 'triangle-list' },
        depthStencil: undefined,
      });

      // Animation loop: update instance buffer every frame with gear positions
      const resize = () => {
        const dpr = window.devicePixelRatio || 1;
        const cssWidth = canvas.clientWidth;
        const cssHeight = canvas.clientHeight;
        canvas.width = Math.floor(cssWidth * dpr);
        canvas.height = Math.floor(cssHeight * dpr);
      };

      resize();

      let angle = 0;

      const render = () => {
        if (!mounted) return;
        angle += 0.6; // degrees per frame; tune as needed
        gw.solveRotations('A', angle);

        // Populate instanceData based on gears
        const gears = gw.getGears();
        const canvasW = canvas.width;
        const canvasH = canvas.height;
        const instanceCount = Math.min(gears.length, maxInstances);
        for (let i = 0; i < instanceCount; i++) {
          const g = gears[i];
          // Convert gear center (g.x, g.y) which are centered at (0,100) in the model
          const cx = 200 + g.x; // offset like the SVG center used previously
          const cy = 200 + g.y;
          // Convert to NDC clip-space coordinates in range [-1,1]
          const nx = (cx / canvasW) * 2 - 1;
          const ny = -((cy / canvasH) * 2 - 1);
          const radiusPixels = g.radius ?? 20;
          // Scale so that a unit quad (-1..1) becomes radius in clip space
          const sx = (radiusPixels / canvasW) * 2;
          const sy = (radiusPixels / canvasH) * 2;

          const baseIndex = i * 8;
          instanceData[baseIndex + 0] = nx;
          instanceData[baseIndex + 1] = ny;
          // Use uniform scale (approx average)
          instanceData[baseIndex + 2] = (sx + sy) * 0.5;
          // rotation in radians
          instanceData[baseIndex + 3] = (g.rotation ?? 0) * Math.PI / 180;
          // color RGBA
          instanceData[baseIndex + 4] = 0.1 + ((i * 37) % 255) / 255.0;
          instanceData[baseIndex + 5] = 0.2 + ((i * 83) % 255) / 255.0;
          instanceData[baseIndex + 6] = 0.6 + ((i * 191) % 255) / 255.0;
          instanceData[baseIndex + 7] = 1.0;
        }

        // Upload instance data
        device.queue.writeBuffer(instanceBuffer, 0, instanceData.buffer, 0, instanceCount * instanceStride);

        const commandEncoder = device.createCommandEncoder();
        const textureView = context.getCurrentTexture().createView();
        const renderPass = commandEncoder.beginRenderPass({
          colorAttachments: [{ view: textureView, clearValue: { r: 1, g: 1, b: 1, a: 1 }, loadOp: 'clear', storeOp: 'store' }]
        });
        renderPass.setPipeline(pipeline);
        renderPass.setVertexBuffer(0, vertexBuffer);
        renderPass.setVertexBuffer(1, instanceBuffer);
        renderPass.draw(6, instanceCount, 0, 0);
        renderPass.end();
        device.queue.submit([commandEncoder.finish()]);

        raf = requestAnimationFrame(render);
      };

      raf = requestAnimationFrame(render);

      // Handle resize
      const onResize = () => {
        resize();
      };
      window.addEventListener('resize', onResize);

      // Cleanup
      const cleanup = () => {
        mounted = false;
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', onResize);
        try { vertexBuffer.destroy?.(); instanceBuffer.destroy?.(); } catch (e) {}
      };

      (canvas as any).__wgpu_cleanup = cleanup;
    })();

    return () => {
      const canvasAny = canvas as any;
      if (canvasAny && canvasAny.__wgpu_cleanup) canvasAny.__wgpu_cleanup();
    };
  }, [gw]);

  // If WebGPU not available, fall back to the SVG renderer
  if (!('gpu' in navigator)) {
    // Render the existing SVG as a fallback
    const svg = gw.renderSVG({ centerX: 0, centerY: 100, drawAxles: false, fill: '#000', strokeWidth: 0 }) as any;
    return (
      <svg viewBox={'-200 -200 400 400'} width={400} height={400} xmlns="http://www.w3.org/2000/svg">
        {svg}
      </svg>
    );
  }

  // WebGPU canvas
  return (
    <canvas ref={canvasRef} style={{ width: 400, height: 400, display: 'block', borderRadius: '1rem' }} aria-label="WebGPU clockwork" />
  );
}
