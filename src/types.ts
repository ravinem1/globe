export interface StoryElement
{
  storyHeading : string;
  storyImage?: string;
  storyParas : string[];
}
export interface markerType 
{
  label:string;
  lat:number;
  lng:number;
  story?:StoryElement;
  size:number;
  year?:string;
  color:string;
  id:number;
  type:string;
  mapName?:string;
  kingdomName?:string;
}

export interface eventPopupType 
{
d: markerType,x:number,y:number
}

export interface GeoJsonData {
  type: 'FeatureCollection';
  features: CountryFeature[];
}

export interface CountryFeature {
  type: 'Feature';
  properties: CountryProperties;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface CountryProperties {
  NAME: string | null;
  SUBJECTO: string | null;
  PARTOF: string | null;
  BORDERPRECISION : number; // 1 (approximate), 2 (moderately precise) and 3. Ideal for handling approximate border with blur intensity or other visual effect.
}

export interface Arc
{
  startLng :number;
  endLng :number;
  startLat :number;
  endLat :number;
  color:string;
  label:string
}
