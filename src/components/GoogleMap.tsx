
import { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { Location } from '@/types/solar';

// Global flag to ensure setOptions is only called once
let isGoogleMapsConfigured = false;

interface GoogleMapProps {
  onLocationSelect: (location: Location) => void;
  /**
   * Called when the user finishes drawing a polygon on the map. The area is
   * computed via google.maps.geometry.spherical.computeArea() and reported
   * in m². Realises the FR-2.1 "Available Area" input through direct
   * roof-tracing instead of manual typing.
   */
  onAreaDrawn?: (areaM2: number) => void;
  selectedLocation?: Location | null;
  height?: string;
}

export default function GoogleMap({ 
  onLocationSelect, 
  onAreaDrawn,
  selectedLocation,
  height = '400px' 
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep the latest onLocationSelect in a ref so the init effect below
  // doesn't depend on it. Without this, every parent re-render (e.g. the
  // user typing in the system-specs form) re-ran the effect and rebuilt
  // the entire map, causing a visible flicker.
  const onLocationSelectRef = useRef(onLocationSelect);
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  // Same pattern for the area-drawn callback.
  const onAreaDrawnRef = useRef(onAreaDrawn);
  useEffect(() => {
    onAreaDrawnRef.current = onAreaDrawn;
  }, [onAreaDrawn]);

  // Drawing-related state (set once init completes).
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const currentPolygonRef = useRef<google.maps.Polygon | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnAreaM2, setDrawnAreaM2] = useState<number | null>(null);

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
        // Set Google Maps API key (only once globally)
        if (!isGoogleMapsConfigured) {
          setOptions({ key: apiKey });
          isGoogleMapsConfigured = true;
        }

        // Load the maps library + drawing + geometry for roof tracing
        await importLibrary('maps');
        await importLibrary('places');
        await importLibrary('drawing');
        await importLibrary('geometry');

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
                onLocationSelectRef.current({
                  lat,
                  lng,
                  address: results[0].formatted_address,
                });
              } else {
                onLocationSelectRef.current({ lat, lng });
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

            onLocationSelectRef.current({
              lat,
              lng,
              address: place.formatted_address || place.name,
            });
          });
        }

        // -- Drawing manager -----------------------------------------
        // Allows the user to outline a roof or plot on the satellite map.
        // Idle by default; toggled on by the "Draw roof" button below.
        const drawingManager = new google.maps.drawing.DrawingManager({
          drawingMode: null,
          drawingControl: false, // we render our own button
          polygonOptions: {
            fillColor: '#2563EB',
            fillOpacity: 0.25,
            strokeColor: '#1F4E79',
            strokeWeight: 2,
            editable: true,
            draggable: false,
          },
        });
        drawingManager.setMap(mapInstance);
        drawingManagerRef.current = drawingManager;

        // Helper — recompute area + tell the parent
        const reportPolygonArea = (polygon: google.maps.Polygon) => {
          const path = polygon.getPath();
          const area = google.maps.geometry.spherical.computeArea(path);
          // Round to whole m² for clean UI display
          const rounded = Math.round(area);
          setDrawnAreaM2(rounded);
          if (onAreaDrawnRef.current) onAreaDrawnRef.current(rounded);
        };

        drawingManager.addListener(
          'polygoncomplete',
          (polygon: google.maps.Polygon) => {
            // Replace any prior polygon so we only ever track one roof outline.
            if (currentPolygonRef.current) {
              currentPolygonRef.current.setMap(null);
            }
            currentPolygonRef.current = polygon;
            // Exit drawing mode immediately after the user closes the polygon.
            drawingManager.setDrawingMode(null);
            setIsDrawing(false);
            reportPolygonArea(polygon);

            // Live-update when the user drags a vertex.
            const path = polygon.getPath();
            path.addListener('set_at',    () => reportPolygonArea(polygon));
            path.addListener('insert_at', () => reportPolygonArea(polygon));
            path.addListener('remove_at', () => reportPolygonArea(polygon));
          },
        );

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
    // Init runs once on mount — both callbacks are read through refs.
  }, []);

  // Sync the marker when selectedLocation actually changes (e.g. quick
  // presets). Only re-center; don't force a zoom level, so the user's
  // manual zoom isn't clobbered every time the parent re-renders.
  useEffect(() => {
    if (!map || !marker || !selectedLocation) return;
    const current = marker.getPosition();
    if (
      current &&
      Math.abs(current.lat() - selectedLocation.lat) < 1e-6 &&
      Math.abs(current.lng() - selectedLocation.lng) < 1e-6
    ) {
      return; // already at this position — skip
    }
    const position = new google.maps.LatLng(selectedLocation.lat, selectedLocation.lng);
    marker.setPosition(position);
    map.panTo(position);
    if ((map.getZoom() ?? 0) < 10) map.setZoom(13);
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


  // -- Drawing toolbar handlers -------------------------------------
  const startDrawing = () => {
    if (!drawingManagerRef.current) return;
    if (currentPolygonRef.current) {
      currentPolygonRef.current.setMap(null);
      currentPolygonRef.current = null;
      setDrawnAreaM2(null);
    }
    drawingManagerRef.current.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    setIsDrawing(true);
  };
  const clearDrawing = () => {
    if (currentPolygonRef.current) {
      currentPolygonRef.current.setMap(null);
      currentPolygonRef.current = null;
    }
    if (drawingManagerRef.current) drawingManagerRef.current.setDrawingMode(null);
    setIsDrawing(false);
    setDrawnAreaM2(null);
    if (onAreaDrawnRef.current) onAreaDrawnRef.current(0);
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="absolute top-3 left-3 z-10 w-80 max-w-[calc(100%-24px)]">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search for an address..."
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-500"
        />
      </div>

      {/* Drawing toolbar — top right */}
      <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={startDrawing}
            className={
              "px-3 py-2 rounded-lg shadow-md text-sm font-medium transition-colors " +
              (isDrawing
                ? "bg-blue-700 text-white"
                : "bg-white text-gray-800 hover:bg-gray-50 border border-gray-300")
            }
            title="Click points around your roof on the map, then close the shape."
          >
            {isDrawing ? "Drawing… click to add points" : "Draw roof outline"}
          </button>
          {drawnAreaM2 !== null && (
            <button
              type="button"
              onClick={clearDrawing}
              className="px-3 py-2 rounded-lg shadow-md text-sm font-medium bg-white text-gray-800 hover:bg-gray-50 border border-gray-300"
            >
              Clear
            </button>
          )}
        </div>
        {drawnAreaM2 !== null && (
          <div className="bg-white px-3 py-1.5 rounded-lg shadow-md text-xs text-gray-800 border border-gray-200">
            Roof area: <span className="font-semibold">{drawnAreaM2.toLocaleString()} m²</span>
          </div>
        )}
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
