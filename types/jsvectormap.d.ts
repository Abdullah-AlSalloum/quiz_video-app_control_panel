declare module 'jsvectormap' {
  type JsVectorMapOptions = Record<string, unknown>;

  export default class JsVectorMap {
    constructor(options: JsVectorMapOptions);
    destroy(): void;
  }
}

declare module 'jsvectormap/dist/maps/us-aea-en.js' {
  export const usAea: Record<string, unknown>;
}
