export type Vector3Hash = { x: number; y: number; z: number };
export const nullVector = (): Vector3Hash => ({ x: 0, y: 0, z: 0 });
export const unitVector = (): Vector3Hash => ({ x: 1, y: 1, z: 1 });
