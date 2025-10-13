import { Clockwork } from "./Clockwork";

export interface MeshingOptions {
  pitch?: number; // px per tooth
  layerA?: number;
  layerB?: number;
  axleA?: string;
  axleB?: string;
  toothRootRatio?: number;
  toothTopRatio?: number;
  toothDepthA?: number;
  toothDepthB?: number;
  backlash?: number;
}

export interface CoaxialOptions {
  layer?: number;
  axleId?: string;
  toothRootRatio?: number;
  toothTopRatio?: number;
  toothDepth?: number;
}

/**
 * Small helper to create matching gears and wire them into a Clockwork instance.
 *
 * Notes / assumptions:
 * - Radii are computed with a simple linear pitch (radius = teeth * pitch).
 *   This is intentionally simple and can be replaced with a more physical formula later.
 * - generateGear requires a `ratio`; for mesh pairs we set both to 1 and rely on
 *   teeth-counts for propagation (Clockwork uses teeth when present). For coaxial
 *   gears the caller should provide an `axleId` so they share the same axle.
 */
export default class GearFactory {
  static createMeshingPair(
    cw: Clockwork,
    masterId: string,
    newId: string,
    ratio: number,
    opts: MeshingOptions = {}
  ) {
    // Find master gear to derive teeth/pitch
    const master = cw.getGear(masterId);
    if (!master) throw new Error(`master gear '${masterId}' not found`);

    const pitch = opts.pitch ?? 6;
    // Decide master teeth from master.gear if present, otherwise estimate from radius
    const masterTeeth = master.teeth ?? Math.max(4, Math.round(master.radius / pitch));
    // For desired ratio new/master = ratio => newTeeth = masterTeeth / ratio
    const newTeeth = Math.max(3, Math.round(masterTeeth / ratio));
  const radiusNew = Math.max(8, newTeeth * pitch);

  // Derive tooth geometry from master where possible
  const masterTop = master.toothTopRatio ?? opts.toothTopRatio ?? 0.5;
  const masterRoot = master.toothRootRatio ?? opts.toothRootRatio ?? 0.8;
  const masterToothDepth = master.toothDepth ?? (master.radius * 0.18);
  const newToothDepth = opts.toothDepthB ?? Math.max(1, Math.round((masterToothDepth / master.radius) * radiusNew));

    // Ensure master exists in clockwork (no-op if already present)
    // (caller likely already created master)

    cw.generateGear({
      id: newId,
      ratio: 1,
      radius: radiusNew,
      teeth: newTeeth,
      axleId: opts.axleB,
      layer: master.layer,
      toothRootRatio: opts.toothRootRatio ?? masterRoot,
      toothTopRatio: opts.toothTopRatio ?? masterTop,
      toothDepth: newToothDepth,
    });

    
    //const backlash = Math.min(masterTeeth, newTeeth);

    cw.connect(masterId, newId, "mesh", 0);

    return { masterId, newId, newTeeth };
  }

  static createCoaxialPair(
    cw: Clockwork,
    idMaster: string,
    idCoax: string,
    teethCoax: number,
    opts: CoaxialOptions = {},
    pitch: number = 6,
  ) {
    // Caller should have created idMaster (or pass desired options). We simply create the coaxial companion.
    const axle = opts.axleId ?? idMaster;
    const radius = Math.max(8, teethCoax * pitch);

    cw.generateGear({
      id: idCoax,
      ratio: 1, // will be coerced to master if needed by Clockwork
      radius,
      teeth: teethCoax,
      axleId: axle,
      layer: opts.layer ?? 1,
      toothRootRatio: opts.toothRootRatio,
      toothTopRatio: opts.toothTopRatio,
      toothDepth: opts.toothDepth,
    });

    cw.connect(idMaster, idCoax, "coaxial");
    return { idMaster, idCoax };
  }
}
