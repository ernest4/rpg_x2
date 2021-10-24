// NOTE: these __var__ vars are compile time injected by webpack
// refer to DefinePlugin in webpack.config.ts
// @ts-ignore
export const DEVELOPMENT = __RPG_X2_DEVELOPMENT__;
// @ts-ignore
export const PRODUCTION = __RPG_X2_PRODUCTION__;
// @ts-ignore
export const VERSION = __RPG_X2_VERSION__;

export const assetsPath = (path: string) => {
  const prefix = DEVELOPMENT ? "/" : "/statics/";
  return `${prefix}assets/${path}`;
};

// TODO: imagesPath, soundsPath, etc...
