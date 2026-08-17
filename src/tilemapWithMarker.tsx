import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'

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
      <Marker position={[latitude, longitude]} />
      <RecenterMap center={[latitude, longitude]}></RecenterMap>
    </MapContainer>
  )
}
