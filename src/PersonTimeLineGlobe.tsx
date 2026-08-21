import { useRef, useEffect, useState } from 'react';
import './App.css'
import Globe, { type GlobeMethods } from 'react-globe.gl';
import myGlobe8kTexture from './assets/blue_mable_21600x10800.jpg'; 
import { MarkerPopup } from './markerPopup';
import { markerSvg, faceSvg } from './svgHelper';
import { type markerType, type eventPopupType, type GeoJsonData, type CountryFeature, type Arc } from './types';
import { TilemapWithMarker } from './tilemapWithMarker';

const arcColor = ["green","red"];
const polygonAltitude = 0.01;
const eventPopuptimeout = 2000;
const arcShowtimeout = 2000;
const globePovChangeTimeout = 2000;

function PersonTimelineGlobe({philospherName}:{philospherName:string}) {

const globeRef = useRef<GlobeMethods | undefined>(undefined);
const globeSectionRef = useRef<HTMLDivElement | null>(null);
const markerStateTimerRef = useRef<number | null>(null);
const arcStateTimerRef = useRef<number | null>(null);
const popupTimerRef = useRef<number | null>(null);
const checkboxInputRef = useRef<HTMLInputElement>(null);

const [showTilemap, setShowTilemap] = useState<boolean>(false);
const [globeSize, setGlobeSize] = useState({ width: 0, height: 0 });
const [globeLoaded,setGlobeLoaded] = useState(false);
const [eventPopup, setEventPopup] = useState<eventPopupType|null>(null);
const [markerData, setMarkerData] = useState<Array<markerType> | null>(null);
const [arcData, setArcData] = useState<Array<Arc>>([]);
const [currentMarker, setCurrentMarker] = useState<{id:number,lat:number,lng:number}>({id:0,lat:0,lng:0});
const [countries,setCountries] = useState<GeoJsonData | null>(null);
const [fullData, setFullData] = useState<Array<markerType> | null>(null);

const setPopupAfterSometime = (args : eventPopupType, timeout : number) => {
    if(popupTimerRef.current)
    {
      console.log('clearing already running timer!! ' + timeout);
      clearTimeout(popupTimerRef.current);
    }
    popupTimerRef.current = setTimeout(() => {
      setEventPopup(args);      
    }, 1000);
}

const updateMarkerStateAfterSometime = (markers : markerType[], timeout : number) => {
    if(markerStateTimerRef.current)
    {
      console.log('clearing1 already running timer!!' + timeout);
      clearTimeout(markerStateTimerRef.current);
    }
    markerStateTimerRef.current = setTimeout(() => {
      console.log('setting markers');
      setMarkerData(markers);
    }, 3000);
}

const updateArcStateAfterSometime = (arcs : Arc[], timeout : number) => {
    if(arcStateTimerRef.current)
    {
      console.log('clearing1 already running timer!!' + timeout);
      clearTimeout(arcStateTimerRef.current);
    }
    arcStateTimerRef.current = setTimeout(() => {
      console.log('setting arcs');
      setArcData(arcs);
    }, 1000);
}


useEffect(() => {
  const el = globeSectionRef.current;
  if (!el) return;

  const updateSize = () => {
    setGlobeSize({ width: el.clientWidth, height: el.clientHeight });
  };

  updateSize();
  const observer = new ResizeObserver(updateSize);
  observer.observe(el);
  return () => observer.disconnect();
}, []);

useEffect(() => {

  if (globeRef.current) {
    console.log('globe attached');
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

  fetch(`/datasets/${philospherName}.json`)
    .then(resp =>resp.json())
    .then((data : any) => {
      setFullData(data.timeline);
      setMarkerData([data.timeline[0]]);

      fetch(`/datasets/${data.timeline[0].mapName}.geojson`)
      .then(resp => resp.json())
      .then((data : GeoJsonData) => {
        setCountries(data); 
        return new Promise((resolve) => resolve(true));
      })
      .then((arg : unknown) => {
          console.log(arg);
          globeRef.current?.pointOfView({lat:data.timeline[0].lat,lng:data.timeline[0].lng,
            altitude:0.3},2000);
          setCurrentMarker({id:data.timeline[0].id, lat:data.timeline[0].lat,lng:data.timeline[0].lng});
          setPopupAfterSometime({d: data.timeline[0],x:1,y:1},eventPopuptimeout);
      })
      .catch(e => console.error(e));

    })
    .catch(e => console.error(e));


  return () => {
    if(popupTimerRef.current){
      clearTimeout(popupTimerRef.current);
    }
    if(markerStateTimerRef.current){
      clearTimeout(markerStateTimerRef.current);
    }
    if(arcStateTimerRef.current){
      clearTimeout(arcStateTimerRef.current);
    }
  }
}, []);

  const handleGlobeReady = () => {
    if (globeRef.current) {
      globeRef.current.pointOfView({altitude : 1.4});
      setGlobeLoaded(true);
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
   
    }
    else
    {
      setPopupAfterSometime({d: d,x:e.clientX,y:e.clientY},eventPopuptimeout);
      globeRef.current?.pointOfView({lat:d.lat,lng:d.lng,altitude:0.2},globePovChangeTimeout);
    }
  }

  function showNextEvent(d: any)
  {
   
    if(markerData && d && (d.id >= currentMarker.id))
      {
         
        const oldMarkers = markerData.filter(m => m.type !== 'person').map(m => {m.color = "grey"; return m});
        const y = fullData?.findLast(e => e.id == d.id+1);

        if(y)
        {
          globeRef.current?.pointOfView({lat:y.lat,lng:y.lng,altitude:0.3},globePovChangeTimeout);
          const newMarker = [...oldMarkers, y];
          const newArc : Arc = {startLat : d.lat,startLng:d.lng,endLat : y.lat,endLng:y.lng,color:"",label:'g'};

          const newArcs = [...arcData, newArc];
          updateMarkerStateAfterSometime(newMarker, arcShowtimeout);
          updateArcStateAfterSometime(newArcs, arcShowtimeout);
          setEventPopup(null);
          setPopupAfterSometime({d: y,x:0,y:0}, eventPopuptimeout);
          setCurrentMarker({id:y.id,lat:y.lat,lng:y.lng});
        }
        else{
          setEventPopup(null);
          setCurrentMarker({id:99,lat:0,lng:0});
          if(fullData)
          setPopupAfterSometime({d: fullData[0],x:1,y:1},eventPopuptimeout);
        }
        
      }
  }

  function onPopupClose(e : eventPopupType | null)
  {
    if(!e){
      return;
    }
    if(e.d.type == 'person')
    {
      if(fullData){
      const g = fullData.filter(e => e.id == 1)
  
      updateMarkerStateAfterSometime(g, arcShowtimeout);
      updateArcStateAfterSometime(arcData, arcShowtimeout);
      setEventPopup(null);
      setPopupAfterSometime({d: g[0],x:0,y:0},eventPopuptimeout);
      setCurrentMarker({id: g[0].id, lat: g[0].lat, lng: g[0].lng});
      globeRef.current?.pointOfView({lat:g[0].lat,lng:g[0].lng,altitude:0.2},globePovChangeTimeout);
    }
    }
    else{
      if(currentMarker.id == 99 && fullData)
      {
        setPopupAfterSometime({d: fullData[0],x:1,y:1},eventPopuptimeout);
        return;
      }
      if(markerData)
      {
        showNextEvent(markerData.findLast(g => g.id == currentMarker.id)); // doubtful
      }
    }
  }

  function getCountryLabel(c : CountryFeature | null)
  {
    return c?.properties.NAME ?? c?.properties.SUBJECTO ?? c?.properties.PARTOF;
  }

  function handleTilemapVisibility()
  {
      if(checkboxInputRef.current)
      {
        if(checkboxInputRef.current.checked)
        {
            setShowTilemap(true);
        }
        else{
           setShowTilemap(false);
        }
      }
  }

  return (
    <div className='globeAndInfoContainer'>
      <section id="globeSection" ref={globeSectionRef}>
      {countries && markerData && (<Globe
        ref={globeRef}
        width={globeSize.width}
        height={globeSize.height}
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
        arcColor={arcColor}
        arcLabel="label"
        arcStroke={0.1} 
        arcAltitude={polygonAltitude}
        //arcsTransitionDuration={2000}
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
          return getCountryLabel(feat) !== null && fullData ?
            getCountryLabel(feat) == fullData[0].kingdomName ?
              'rgba(233, 225, 10, 0.91)' :
              'rgba(204, 0, 0, 0.91)' :
            '#0d0d0d'
        }}
        polygonSideColor={(d) => {const feat = d as CountryFeature; 
          return getCountryLabel(feat) !== null ?  'rgba(218, 136, 129, 0.71)' : '#000000'
        }} 
        polygonStrokeColor={() =>  '#000000'}       
        polygonAltitude={polygonAltitude}      
      />)}
      </section>
      <section id="infoSection">
        <MarkerPopup d={eventPopup} onClose={() => onPopupClose(eventPopup)} globeLoaded={globeLoaded} />
      </section>
      {globeLoaded && currentMarker && currentMarker.lat > 0 && (<section id='tilemapSection'>
        <label style={{color:"darkgray"}}>
        <input ref={checkboxInputRef} type="checkbox" 
        onClick={handleTilemapVisibility} />
        Location in today's world
        </label>
        {showTilemap && (<TilemapWithMarker latitude={currentMarker.lat} longitude={currentMarker.lng} />)}
      </section>)}
      {(!globeLoaded) && (
        <div className='globeLoadingDiv'>
            Loading map with {philospherName} timeline borders
        </div>)}
     
    </div>
  )
}

export default PersonTimelineGlobe;
