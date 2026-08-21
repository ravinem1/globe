import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import {Marker} from '@adamscybot/react-leaflet-component-marker'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { pinSvg } from './svgHelper'

// Explicitly typing the component as a React Functional Component
const MapPin: React.FC = () => {
  return (
    <div 
      className="pin-container" 
      style={{ display: 'inline-block', padding: '8px' }}
    >
      <svg 
        xmlns="http://w3.org" 
        viewBox="0 0 24 24" 
        width="24" 
        height="24"
      >
        <line 
          x1="12" 
          y1="12" 
          x2="12" 
          y2="23" 
          stroke="#e74c3c" 
          strokeWidth={2} 
          strokeLinecap="round"
        />
        <circle 
          cx="12" 
          cy="7" 
          r="5" 
          fill="#e74c3c" 
        />
      </svg>
    </div>
  );
};

// 1. Create a component that handles updating the view
function RecenterMap({ center } : {center : [number,number,number?]}) {
  const map = useMap(); // Accesses the Leaflet map instance

  useEffect(() => {
   
    if (center) {
      map.flyTo(center, 9, { animate: true }); 
    }
  }, [center, map]);

  return null; // This component doesn't render any visible UI
}
export function TilemapWithMarker({latitude,longitude} : {latitude: number, longitude: number})
{
  return (
    <MapContainer style={{height:'100%', width :'100%'}}
      center={[latitude, longitude]}
      zoom={10} scrollWheelZoom={false}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
      <Marker icon={MapPin} position={[latitude, longitude]} />
      <RecenterMap center={[latitude, longitude]}></RecenterMap>
    </MapContainer>
  )
}
