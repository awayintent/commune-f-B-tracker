import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Closure } from '@/app/data/types';
import { postalCodeToCoordinates, SINGAPORE_CENTER, getSingaporeBounds, type Coordinates } from '@/app/utils/geocoding';
import { formatDate } from '@/app/data/closures';

interface MapViewProps {
  closures: Closure[];
}

interface ClosureWithCoords extends Closure {
  coordinates: Coordinates;
}

// Fix Leaflet default icon issue with Vite
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map centering when marker is clicked
function MapController({ center }: { center: Coordinates | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], 15, {
        animate: true,
        duration: 0.5
      });
    }
  }, [center, map]);
  
  return null;
}

export function MapView({ closures }: MapViewProps) {
  const [closuresWithCoords, setClosuresWithCoords] = useState<ClosureWithCoords[]>([]);
  const [loading, setLoading] = useState(true);
  const [geocodingProgress, setGeocodingProgress] = useState(0);
  const [mapCenter, setMapCenter] = useState<Coordinates | null>(null);

  useEffect(() => {
    async function geocodeClosures() {
      setLoading(true);
      const results: ClosureWithCoords[] = [];
      
      // Filter closures with postal codes
      const closuresWithPostalCode = closures.filter(c => c.postal_code && c.postal_code.trim().length === 6);
      
      if (closuresWithPostalCode.length === 0) {
        setLoading(false);
        return;
      }

      // Geocode each closure
      for (let i = 0; i < closuresWithPostalCode.length; i++) {
        const closure = closuresWithPostalCode[i];
        const coords = await postalCodeToCoordinates(closure.postal_code);
        
        if (coords) {
          results.push({
            ...closure,
            coordinates: coords
          });
        }

        setGeocodingProgress(Math.round(((i + 1) / closuresWithPostalCode.length) * 100));
        
        // Small delay to avoid rate limiting
        if (i < closuresWithPostalCode.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 150));
        }
      }

      setClosuresWithCoords(results);
      setLoading(false);
    }

    geocodeClosures();
  }, [closures]);

  if (loading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-50 rounded-lg border">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5903e] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
          {geocodingProgress > 0 && (
            <p className="text-sm text-gray-500 mt-2">Geocoding: {geocodingProgress}%</p>
          )}
        </div>
      </div>
    );
  }

  if (closuresWithCoords.length === 0) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-50 rounded-lg border">
        <div className="text-center">
          <p className="text-gray-600 mb-2">No closures with postal codes available for mapping.</p>
          <p className="text-sm text-gray-500">Add postal codes to closure records to see them on the map.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border shadow-sm">
      <MapContainer
        center={SINGAPORE_CENTER}
        zoom={12}
        maxBounds={getSingaporeBounds()}
        minZoom={11}
        maxZoom={18}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={mapCenter} />
        
        {closuresWithCoords.map((closure) => (
          <Marker
            key={closure.closure_id}
            position={[closure.coordinates.lat, closure.coordinates.lng]}
            icon={customIcon}
            eventHandlers={{
              click: () => {
                setMapCenter(closure.coordinates);
              }
            }}
          >
            <Popup>
              <div className="min-w-[200px] max-w-[300px]">
                <h3 className="font-bold text-[#0b3860] mb-2 text-base">
                  {closure.business_name}
                </h3>
                
                {closure.outlet_name && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Outlet:</span> {closure.outlet_name}
                  </p>
                )}
                
                {closure.category && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Type:</span> {closure.category}
                  </p>
                )}
                
                {closure.address && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Address:</span> {closure.address}
                  </p>
                )}
                
                {closure.last_day && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold">Last Day:</span> {formatDate(closure.last_day)}
                  </p>
                )}
                
                {closure.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Reason:</span> {closure.description}
                  </p>
                )}
                
                {closure.source_urls && (
                  <a
                    href={closure.source_urls.split(',')[0].trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#f5903e] hover:text-[#e07d2a] underline"
                  >
                    View Source →
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <div className="bg-white px-4 py-2 border-t text-sm text-gray-600">
        Showing {closuresWithCoords.length} of {closures.length} closures with postal codes
      </div>
    </div>
  );
}
