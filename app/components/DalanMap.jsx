"use client";
import { useEffect, useRef, useState } from "react";

export default function DalanMap({ position, follow = true, label = "Device position" }) {
 const container = useRef(null), mapRef = useRef(null), markerRef = useRef(null), first = useRef(true);
 const [error,setError]=useState("");
 useEffect(()=>{
  let disposed=false;
  (async()=>{
   try{
    const lib=await import("maplibre-gl");
    if(disposed||!container.current)return;
    lib.setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs",import.meta.url).toString());
    const map=new lib.Map({container:container.current,style:"https://tiles.openfreemap.org/styles/liberty",center:[122.7511,11.5853],zoom:12,attributionControl:true});
    map.addControl(new lib.NavigationControl({showCompass:false}),"top-right");
    map.on("error",e=>{if(e?.error?.message)setError("Map tiles may be temporarily unavailable. Check your connection.");});
    mapRef.current=map;
    if(position){
      markerRef.current=new lib.Marker({color:"#0b8496"}).setLngLat([position.lng,position.lat]).addTo(map);
      map.flyTo({center:[position.lng,position.lat],zoom:15,essential:true});
      first.current=false;
    }
   }catch{if(!disposed)setError("The interactive map cannot load on this device. Please try a modern browser with WebGL.");}
  })();
  return()=>{disposed=true;markerRef.current?.remove();markerRef.current=null;mapRef.current?.remove();mapRef.current=null;first.current=true;};
 },[]);
 useEffect(()=>{
  if(!position||!mapRef.current)return;
  (async()=>{
   try{
    const lib=await import("maplibre-gl");
    const map=mapRef.current;
    if(!map)return;
    if(!markerRef.current)markerRef.current=new lib.Marker({color:"#0b8496"}).setLngLat([position.lng,position.lat]).addTo(map);
    else markerRef.current.setLngLat([position.lng,position.lat]);
    if(first.current){map.flyTo({center:[position.lng,position.lat],zoom:15});first.current=false;}
    else if(follow) map.easeTo({center:[position.lng,position.lat],duration:800});
   }catch{}
  })();
 },[position?.lat,position?.lng,follow]);
 return <div className="dalanMapWrap">
  <div className="dalanMap" ref={container} aria-label={"Interactive map. "+label} role="application"/>
  <div className="mapDisclaimer">Map: OpenFreeMap / OpenStreetMap · No verified transit line overlay</div>
  {error&&<div role="status" className="mapError">{error}</div>}
 </div>;
}
