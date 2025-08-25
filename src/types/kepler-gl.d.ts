/* Minimal ambient types to satisfy imports when using module form.
   These are only used during type checking; runtime uses UMD. */
declare module 'kepler.gl' {
  // Using unknown to avoid no-explicit-any rule; components typed as unknown
  const KeplerGl: unknown
  export default KeplerGl
}
declare module 'kepler.gl/reducers' {
  const reducers: unknown
  export default reducers
}
declare module 'kepler.gl/actions' {
  export const addDataToMap: (...args: unknown[]) => unknown
}
