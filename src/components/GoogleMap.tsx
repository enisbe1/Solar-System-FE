
import { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { Location } from '@/types/solar';

interface GoogleMapProps {
  onLocationSelect: (location: Location) => void;
  selectedLocation?: Location | null;
  height?: string;
}

export default function GoogleMap({ 
  onLocationSelect, 
  selectedLocation,
  height = '400px' 
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        setError('Google Maps API key is not configured');
        setIsLoading(false);
        return;
      }

      if (!mapRef.current) return;

      try {
        // Set Google Maps API key (only once)
        setOptions({ key: apiKey });

        // Load the maps library
        await importLibrary('maps');
        await importLibrary('places');

        // Create the map (centered on Europe)
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 50.8503, lng: 4.3517 }, // Brussels, center of Europe
          zoom: 5,
          mapTypeId: google.maps.MapTypeId.HYBRID,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          restriction: {
            latLngBounds: {
              north: 71.0,  // Northern Norway
              south: 34.0,  // Southern Cyprus/Crete
              west: -25.0,  // Western Iceland
              east: 45.0,   // Eastern Russia (European part)
            },
            strictBounds: false,
          },
        });

        // Create the marker
        const markerInstance = new google.maps.Marker({
          map: mapInstance,
          draggable: true,
          title: 'Solar Installation Location',
        });

        // Create geocoder
        const geocoder = new google.maps.Geocoder();

        // Helper function for geocoding
        const geocodeLocation = (lat: number, lng: number) => {
          geocoder.geocode(
            { location: { lat, lng } },
            (results, status) => {
              if (status === 'OK' && results?.[0]) {
                onLocationSelect({
                  lat,
                  lng,
                  address: results[0].formatted_address,
                });
              } else {
                onLocationSelect({ lat, lng });
              }
            }
          );
        };

        // Handle map clicks
        mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            
            console.log('lat', lat);
            console.log('lng', lng);
            markerInstance.setPosition(event.latLng);
            geocodeLocation(lat, lng);
          }
        });

        // Handle marker drag
        markerInstance.addListener('dragend', () => {
          const position = markerInstance.getPosition();
          if (position) {
            const lat = position.lat();
            const lng = position.lng();
            geocodeLocation(lat, lng);
          }
        });

        // Set up autocomplete (restricted to Europe)
        if (searchInputRef.current) {
          const autocompleteInstance = new google.maps.places.Autocomplete(searchInputRef.current, {
            fields: ['formatted_address', 'geometry', 'name'],
            types: ['address'],
          });

          // Bind autocomplete to map bounds
          autocompleteInstance.bindTo('bounds', mapInstance);

          // Handle place selection
          autocompleteInstance.addListener('place_changed', () => {
            const place = autocompleteInstance.getPlace();

            if (!place.geometry || !place.geometry.location) {
              console.log('No geometry for place:', place.name);
              return;
            }

            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            // Update map and marker
            if (place.geometry.viewport) {
              mapInstance.fitBounds(place.geometry.viewport);
            } else {
              mapInstance.setCenter(place.geometry.location);
              mapInstance.setZoom(17);
            }

            markerInstance.setPosition(place.geometry.location);

            onLocationSelect({
              lat,
              lng,
              address: place.formatted_address || place.name,
            });
          });
        }

        setMap(mapInstance);
        setMarker(markerInstance);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load Google Maps:', err);
        setError('Failed to load Google Maps');
        setIsLoading(false);
      }
    };

    initMap();
  }, [onLocationSelect]);

  // Update marker position when selectedLocation changes
  useEffect(() => {
    if (map && marker && selectedLocation) {
      const position = new google.maps.LatLng(selectedLocation.lat, selectedLocation.lng);
      marker.setPosition(position);
      map.setCenter(position);
      map.setZoom(15);
    }
  }, [selectedLocation, map, marker]);

  if (error) {
    return (
      <div 
        style={{ height }} 
        className="flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300"
      >
        <div className="text-center p-4">
          <p className="text-red-600 font-medium">{error}</p>
          <p className="text-sm text-gray-600 mt-2">
            Please add your Google Maps API key to .env.local
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="relative">
      {/* Search Input */}
      <div className="absolute top-3 left-3 z-10 w-80 max-w-[calc(100%-24px)]">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search for an address..."
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        style={{ height }}
        className="w-full rounded-lg overflow-hidden border shadow-md"
      />

      {/* Instructions */}
      <div className="absolute bottom-3 left-3 bg-white p-2 rounded shadow-md text-xs z-10 max-w-[calc(100%-24px)]">
        <p className="font-medium">Search, click, or drag marker to select location</p>
        <p className="text-gray-600">Use satellite view for solar assessment</p>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg z-20"
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}
