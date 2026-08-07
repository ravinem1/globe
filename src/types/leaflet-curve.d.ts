// `leaflet-curve` is a plain Leaflet plugin (no bundled types, no npm @types
// package). It attaches itself to the global Leaflet namespace, so we augment
// the `leaflet` module's types here instead of typing an export from it.
import 'leaflet';

declare module 'leaflet' {
  /**
   * SVG-path-like command list: 'M' | 'L' | 'C' | 'S' | 'Q' | 'T' | 'V' | 'H' | 'Z'
   * followed by the [lat, lng] points that command needs.
   * See https://github.com/elfalem/Leaflet.curve#api
   */
  type CurvePathData = Array<string | LatLngTuple>;

  class Curve extends Path {
    constructor(path: CurvePathData, options?: PolylineOptions);
    getPath(): CurvePathData;
    setPath(path: CurvePathData): this;
    getBounds(): LatLngBounds;
  }

  function curve(path: CurvePathData, options?: PolylineOptions): Curve;
}

// Side-effect-only import target; it has no exports of its own.
declare module 'leaflet-curve';
