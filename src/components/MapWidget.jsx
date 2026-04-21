"use client";
import { useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl/mapbox';
import Link from 'next/link';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapWidget({ clinics, centerLat, centerLng }) {
  const [popupInfo, setPopupInfo] = useState(null);

  // default to center of the city or fallback
  const initialViewState = {
    longitude: centerLng || -81.6556,
    latitude: centerLat || 30.3322,
    zoom: 11
  };

  return (
    <div className="w-full h-full min-h-[600px] lg:min-h-[100vh] sticky top-0 bg-gray-100 overflow-hidden shadow-sm">
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={initialViewState}
        mapStyle="mapbox://styles/mapbox/light-v11"
      >
        {clinics.map((clinic, index) => {
          if (!clinic.latitude || !clinic.longitude) return null;
          return (
            <Marker key={index} longitude={clinic.longitude} latitude={clinic.latitude} anchor="bottom">
              <button 
                onClick={(e) => { e.stopPropagation(); setPopupInfo(clinic); }}
                className={`w-5 h-5 rounded-full hover:scale-125 transition-transform shadow-lg border-2 border-white ${clinic.low_cost ? 'bg-brand-500' : 'bg-gray-800'}`}
              />
            </Marker>
          );
        })}

        {popupInfo && (
          <Popup
            anchor="top"
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            onClose={() => setPopupInfo(null)}
            closeButton={true}
            closeOnClick={false}
            className="z-50 text-gray-900"
          >
            <div className="p-2 text-center w-[180px]">
              <h4 className="font-bold text-sm mb-1 leading-tight">{popupInfo.name}</h4>
              <p className="text-xs text-gray-500 mb-3">{popupInfo.address}</p>
              <Link href={`/vets/clinic/${popupInfo.slug}`} className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-lg block">
                View Profile
              </Link>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
