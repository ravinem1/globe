import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// leaflet-curve is a classic Leaflet plugin: it expects a global `L` to exist
// at import time and attaches `L.Curve` / `L.curve` to it. Expose the Leaflet
// module as `window.L` before importing the plugin so that side effect works
// under a bundler (there's no UMD global here like a <script> tag would give).
(window as typeof window & { L?: typeof L }).L = L;
import 'leaflet-curve';

// Fix for default Leaflet marker icons not showing properly in React builds
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

const customIcon = new L.Icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Renders a Leaflet.curve path on the map. react-leaflet has no built-in
// curve component, so this drives the vanilla Leaflet layer imperatively via
// the map instance from useMap(), the same pattern react-leaflet itself uses
// internally for custom layers.
function CurvePath({ path, options }: { path: L.CurvePathData; options?: L.PolylineOptions }) {
  const map = useMap();

  useEffect(() => {
    const curve = L.curve(path, options).addTo(map);
    return () => {
      curve.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return null;
}

export default function FlightMap() {
  // Define positions: [latitude, longitude]
  const newYork: L.LatLngTuple = [40.7128, -74.006];
  const london: L.LatLngTuple = [51.5074, -0.1278];

  // SVG-style Path definition for the arc: M (Move to Start) -> Q (Quadratic Bezier Control Point) -> End Point
  // The control point [49, -35] pulls the line upward to form the visual arc
  const arcPath: L.CurvePathData = ['M', newYork, 'Q', [49.0, -35.0], london];

  return (
    <MapContainer center={[45.0, -40.0]} zoom={3} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={newYork} icon={customIcon}>
        <Popup>
          <strong>New York City</strong> <br /> Departure Hub.
        </Popup>
      </Marker>

      <Marker position={london} icon={customIcon}>
        <Popup>
          <strong>London</strong> <br /> Arrival Destination.
        </Popup>
      </Marker>

      <CurvePath path={arcPath} options={{ color: '#ff4d4d', weight: 3, dashArray: '5, 5' }} />
    </MapContainer>
  );
}
