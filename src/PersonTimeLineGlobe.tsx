import { useRef, useEffect, useState } from 'react';
import './App.css'
import Globe, { type GlobeMethods } from 'react-globe.gl';
import myGlobe8kTexture from './assets/blue_mable_21600x10800.jpg'; 
import { MarkerPopup } from './markerPopup';
import { markerSvg, faceSvg } from './svgHelper';
import { type markerType, type eventPopupType, type GeoJsonData, type CountryFeature } from './types';

function PersonTimelineGlobe() {

const globeRef = useRef<GlobeMethods | undefined>(undefined);

const [eventPopup, setEventPopup] = useState<eventPopupType|null>(null);
const [markerData, setMarkerData] = useState<Array<markerType>>([{label:'Socrates', lat: 37.9500,lng: 23.7500,type:'person',size:40,color:'red',id:0}]);
const [currentMarkerId, setCurrentMarkerId] = useState<number>(0);
const [countries,setCountries] = useState<GeoJsonData | null>(null);

  // Sample connections (Arcs) between points
const arcOrMarkerData : Array<markerType> = [
    {
    id:1,
    lat: 37.9500,
    lng: 23.7500,
    label: 'Birth in Alopece Deme',
    story: 'Socrates was born to sculptor and a midwife in the suburban deme of Alopece, now Athens.',
    size: 25,
    year: '470 BCE',
    color: 'green',
    type:'event'
  },
  {
    id:2,
    lat: 40.1937,
    lng: 23.3278,
    label: 'Military Service: Battle of Potidaea',
    size: 25,
    year: '430 BCE',
    color: 'green',
    type:'event'
  },
  {
    id:3,
    lat: 38.3491,
    lng: 23.6533,
    label: 'Military Service: Battle of Delium',
    size: 25,
    year: '424 BCE',
    color: 'green',
    type:'event'
  }
     ]

useEffect(() => {
    
  if (globeRef.current) {
    // 1. Access the underlying Three.js OrbitControls instance
      const controls = globeRef.current.controls();
      if (controls) {
         // Get the underlying Three.js Camera
      const camera = globeRef.current.camera();
       // Reduce the near clipping threshold from default (~10) to 0.1
      // This lets the camera get incredibly close to the surface without clipping inside it
      camera.near = 0.1;
       // 3. Inform Three.js that the camera properties changed
      camera.updateProjectionMatrix();
      }
  }
  fetch('/datasets/world_bc400.geojson')
    .then(resp => resp.json())
    .then((data : GeoJsonData) => {setCountries(data); })
    .catch(e => console.error(e));
}, []);

  const handleGlobeReady = () => {
    if (globeRef.current) {
      globeRef.current.pointOfView({altitude : 1.4});
    }
  }

  const handleZoom = ()=>{
    if(globeRef.current){ 
    const camera = globeRef.current.camera();
          const distance = camera.position.length(); // Camera distance from globe center
          
          // Base scale math: 
          // At max distance (e.g. 250px away), scale = 1
          // As you zoom closer (e.g. 140px away), scale drops to match perspective
          const baseDistance = 220; 
          let scaleFactor = (distance / baseDistance);
        
          // Clamp the scale so markers don't get infinitely tiny or gigantically massive
          scaleFactor = Math.max(0.6, Math.min(scaleFactor, 1.4));
    
          // Set the global CSS variable for all markers to read
          document.documentElement.style.setProperty('--globe-zoom-scale', scaleFactor.toString()) ;
        };
      }

  const handleMarkerClick = (e: PointerEvent, d : any) => 
  {
    if(d.type == 'person')
    {
      setMarkerData(arcOrMarkerData.filter(e=>e.id == 1));
      setCurrentMarkerId(d.id);
      globeRef.current?.pointOfView({lat:d.lat,lng:d.lng,altitude:0.2},2000);
    }
    else
    {
      setEventPopup({d: d,x:e.clientX,y:e.clientY});
    }
  }

  function showNextEvent(d: any)
  {
    if(d.id > currentMarkerId)
      {
        const oldMarkers = markerData.map(m => {m.color = "grey"; return m});
        const y = arcOrMarkerData.findLast(e => e.id == d.id+1);
        
        if(y)
        {
          const newMarker = [...oldMarkers, y];
          setMarkerData(newMarker);
        }
        setCurrentMarkerId(d.id);
      }
  }

  function onPopupClose(e : eventPopupType)
  {
    setEventPopup(null); 
    showNextEvent(e.d);
  }

  function getCountryLabel(c : CountryFeature | null)
  {
    return c?.properties.NAME ?? c?.properties.SUBJECTO ?? c?.properties.PARTOF;
  }

  return (
    <div>
      {countries && (<Globe
        ref={globeRef}
        backgroundImageUrl="https://cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
        globeImageUrl={myGlobe8kTexture}
        backgroundColor="#ffffff" 
        showAtmosphere={false}     
        onGlobeReady={handleGlobeReady}
        onZoom={handleZoom}
        // Arcs Configuration
        //arcsData={arcOrMarkerData}
        //arcStartLat="startLat"
        //arcStartLng="startLng"
        //arcEndLat="endLat"
        //arcEndLng="endLng"
        //arcColor="color"
        //arcLabel="label"
        //arcStroke={0.5} 
        //arcAltitude={0}

        // Marker configuration 
        htmlElementsData={markerData}       
        htmlLat="lat"
        htmlLng="lng"
        htmlAltitude={0.00}
        htmlElement = {(p => {
          const d = p as any;
          const el = document.createElement('div');
          el.innerHTML = d.type == 'person' ? faceSvg : markerSvg;
          el.title = d.label;   
          el.style.color = d.color;
          el.style.width = `${d.size}px`;
          el.style.transform = 'translate(-50%, -50%) scale(var(--globe-zoom-scale, 1))';
          //el.style.transformOrigin = 'center center'; 
          el.style.transition = 'opacity 250ms';       
          el.style['pointer-events' as any] = 'auto';
          el.style.cursor = 'pointer';
          el.onclick = (e) => handleMarkerClick(e,d);
          return el;
        })}           
        htmlElementVisibilityModifier={((el, isVisible) => 
          el.style.opacity = isVisible ? "1" : "0")}

        // polygons 
         polygonsData={countries.features}//.filter(d => getCountryLabel(d) !== null)}
         polygonLabel={d => {
         const feat = d as CountryFeature;
         const name = getCountryLabel(feat);
         if(name){
          return `
            <div style="  
          color: #fff;
          padding: 6px 10px;
          border-radius: 4px;
          font-family: sans-serif;
          border: 1px solid #11f3ff;   
        ">
          <b>${name}</b>
        </div>
      ` } else {return `<div></div>`}}}
        polygonCapColor={(d) => {const feat = d as CountryFeature; return getCountryLabel(feat) !== null ?  '#c35f628e' : '#000000'}}
        polygonSideColor={(d) => {const feat = d as CountryFeature; return getCountryLabel(feat) !== null ?  '#508553' : '#000000'}} 
        polygonStrokeColor={(d) => {const feat = d as CountryFeature; return getCountryLabel(feat) !== null ?  '#111' : '#000000'}}
       
        polygonAltitude={(d) => {const feat = d as CountryFeature; return getCountryLabel(feat) !== null 
          ? 0.002  
          : 0.004}}
       // onPolygonHover={(polygon) => {const feat = polygon as CountryFeature;}}
        polygonsTransitionDuration={1000}
      //  onHexPolygonClick={(polygon) => console.log(polygon)}        
      />)}
      {eventPopup && (<MarkerPopup d={eventPopup} onClose={() => onPopupClose(eventPopup)} /> )}
     
      </div>
  )
}

export default PersonTimelineGlobe
