// draco3dgltf ships no types. This covers the one call build-points makes.
declare module 'draco3dgltf' {
  const draco3d: { createDecoderModule(): Promise<unknown> };
  export default draco3d;
}
