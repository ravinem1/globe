import { useRef, useEffect, useState } from 'react';
import './App.css'
import Globe, { type GlobeMethods } from 'react-globe.gl';
import myGlobe8kTexture from './assets/blue_mable_21600x10800.jpg'; 
import { MarkerPopup } from './markerPopup';
import { markerSvg, faceSvg } from './svgHelper';
import { type markerType, type eventPopupType, type GeoJsonData, type CountryFeature, type Arc } from './types';
import allPhilosphers from './data/philosphers.json';
import fullData from './data/socrates.json';

const arcColor = "green";
const polygonAltitude = 0.03;
const eventPopuptimeout = 2000;
const arcShowtimeout = 2000;
const globePovChangeTimeout = 2000;

function PersonTimelineGlobe() {

const globeRef = useRef<GlobeMethods | undefined>(undefined);
const stateTimerRef = useRef<number | null>(null);
const popupTimerRef = useRef<number | null>(null);
const [eventPopup, setEventPopup] = useState<eventPopupType|null>(null);
const [markerData, setMarkerData] = useState<Array<markerType>>([{label:'Socrates', lat: 37.9500,lng: 23.7500,type:'person',size:40,color:'red',id:0}]);
const [arcData, setArcData] = useState<Array<Arc>>([]);
const [currentMarkerId, setCurrentMarkerId] = useState<number>(0);
const [countries,setCountries] = useState<GeoJsonData | null>(null);

const setPopupAfterSometime = (args : eventPopupType, timeout : number) => {
    if(popupTimerRef.current)
    {
      console.log('clearing already running timer!!');
      clearTimeout(popupTimerRef.current);
    }
    popupTimerRef.current = setTimeout(() => {setEventPopup(args);}, timeout);
}

const updateStateAfterSometime = ({markers,arcs} : {markers : markerType[],arcs:Arc[]}, timeout : number) => {
    if(stateTimerRef.current)
    {
      console.log('clearing1 already running timer!!');
      clearTimeout(stateTimerRef.current);
    }
    stateTimerRef.current = setTimeout(() => {setMarkerData(markers);setArcData(arcs);}, timeout);
}

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

  setMarkerData(allPhilosphers.k);

  return () => {
    if(popupTimerRef.current){
    clearInterval(popupTimerRef.current);
    }
    if(stateTimerRef.current){
    clearInterval(stateTimerRef.current);
    }
  }

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
      globeRef.current?.pointOfView({lat:d.lat,lng:d.lng,altitude:0.3},2000);
      setCurrentMarkerId(d.id);
      setPopupAfterSometime({d: d,x:e.clientX,y:e.clientY},eventPopuptimeout);
   
    }
    else
    {
      setPopupAfterSometime({d: d,x:e.clientX,y:e.clientY},eventPopuptimeout);
      globeRef.current?.pointOfView({lat:d.lat,lng:d.lng,altitude:0.2},globePovChangeTimeout);
    }
  }

  function showNextEvent(d: any)
  {
   
    if( d && (d.id >= currentMarkerId))
      {
         
        const oldMarkers = markerData.filter(m => m.type !== 'person').map(m => {m.color = "grey"; return m});
        const y = fullData.timeline.findLast(e => e.id == d.id+1);

        if(y)
        {
          globeRef.current?.pointOfView({lat:y.lat,lng:y.lng,altitude:0.3},globePovChangeTimeout);
          const newMarker = [...oldMarkers, y];
          const newArc : Arc = {startLat : d.lat,startLng:d.lng,endLat : y.lat,endLng:y.lng,color:arcColor,label:'g'};
          const fnToRun = (arcs : Arc[], markers : markerType[]) =>
          {
            setArcData(arcs);
            setMarkerData(markers);
          }
          const newArcs = [...arcData, newArc];
          updateStateAfterSometime({markers: newMarker,arcs: newArcs}, arcShowtimeout);

          setEventPopup(null);
          setPopupAfterSometime({d: y,x:0,y:0}, eventPopuptimeout);
          setCurrentMarkerId(y.id);
        }
        else{
          setEventPopup(null);
          setCurrentMarkerId(99);
        }
        
      }
  }

  function onPopupClose(e : eventPopupType)
  {
    if(e.d.type == 'person')
    {
      const g = fullData.timeline.filter(e => e.id == 1)
      //runAfterSometime(setMarkerData,g,arcShowtimeout);
      updateStateAfterSometime({markers:g,arcs:arcData},arcShowtimeout);
      //setMarkerData(g);
      setEventPopup(null);
      setPopupAfterSometime({d: g[0],x:0,y:0},eventPopuptimeout);
      setCurrentMarkerId(g[0].id);
    }
    else{
      if(currentMarkerId == 99)
      {
        setEventPopup(null);
        return;
      }
      showNextEvent(markerData.findLast(g => g.id == currentMarkerId)); // doubtful
    }
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
        arcsData={arcData}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcLabel="label"
        arcStroke={0.1} 
        arcAltitude={polygonAltitude}
        arcsTransitionDuration={2000}
        arcDashAnimateTime={4000}
        arcStartAltitude={polygonAltitude}
        arcEndAltitude={polygonAltitude}
        arcDashLength={0.2}
        arcDashGap={0.1}

        // Marker configuration 
        htmlElementsData={markerData}       
        htmlLat="lat"
        htmlLng="lng"
        htmlAltitude={polygonAltitude}
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
         polygonsData={countries.features}
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
      ` } 
        else {
          return `<div></div>`}}
        }
        polygonCapColor={(d) => {const feat = d as CountryFeature; 
          return getCountryLabel(feat) !== null ?  'rgba(138, 118, 118, 0.79)' : '#0f0e0e'
        }}
        polygonSideColor={(d) => {const feat = d as CountryFeature; 
          return getCountryLabel(feat) !== null ?  'rgba(218, 136, 129, 0.71)' : '#000000'
        }} 
        polygonStrokeColor={() =>  '#000000'}       
        polygonAltitude={polygonAltitude}      
      />)}
      {eventPopup && (<MarkerPopup d={eventPopup} onClose={() => onPopupClose(eventPopup)} /> )}
     
      </div>
  )
}

export default PersonTimelineGlobe
