import React, { FC, useState, useEffect, useRef } from "react";
import { Box, Button, Text, Input } from "zmp-ui";
import { createPortal } from "react-dom";
declare global {
  interface Window {
    trackasiagl: any;
  }
}
import { MapPin, X, LocateFixed, Search, ChevronLeft } from "lucide-react";
import { getCurrentLocation } from "../services/location";
import { reverseGeocode, forwardGeocode, autocomplete, getTrackAsiaToken } from "../services/trackasia";

interface MapPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (lat: number, long: number, address: string) => void;
  initialLat?: number;
  initialLong?: number;
}

export const MapPicker: FC<MapPickerProps> = ({ visible, onClose, onSelect, initialLat, initialLong }) => {
  const safeInitialLat = initialLat && !isNaN(Number(initialLat)) && Number(initialLat) !== 0 ? Number(initialLat) : 10.762622;
  const safeInitialLng = initialLong && !isNaN(Number(initialLong)) && Number(initialLong) !== 0 ? Number(initialLong) : 106.660172;

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const isProgrammaticMoveRef = useRef<boolean>(false);

  const [viewState, setViewState] = useState({
    latitude: safeInitialLat,
    longitude: safeInitialLng,
    zoom: 16
  });

  const [currentAddress, setCurrentAddress] = useState("Đang tải địa chỉ...");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mapRendered, setMapRendered] = useState(false);
  const [cdnLoaded, setCdnLoaded] = useState(false);
  const [trackAsiaToken, setTrackAsiaToken] = useState<string | null>(null);

  // Initialize Token
  useEffect(() => {
    const fetchToken = async () => {
      const token = await getTrackAsiaToken();
      setTrackAsiaToken(token);
    };
    fetchToken();
  }, []);

  // Autocomplete debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim() && showSuggestions) {
        const results = await autocomplete(searchQuery);
        setSuggestions(results);
      } else {
        setSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, showSuggestions]);

  // Initialize Map
  useEffect(() => {
    // Load CDN scripts dynamically
    const loadCDN = async () => {
      if (window.trackasiagl) {
        setCdnLoaded(true);
        return;
      }
      
      const loadScript = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/trackasia-gl@latest/dist/trackasia-gl.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      const loadCss = new Promise((resolve, reject) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/trackasia-gl@latest/dist/trackasia-gl.css";
        link.onload = resolve;
        link.onerror = reject;
        document.head.appendChild(link);
      });

      try {
        await Promise.all([loadScript, loadCss]);
        setCdnLoaded(true);
      } catch (err) {
        console.error("Failed to load TrackAsia CDN", err);
      }
    };

    loadCDN();

    let timer: NodeJS.Timeout;
    if (visible && cdnLoaded) {
      timer = setTimeout(() => {
        setMapRendered(true);

        const hasValidInitial = initialLat && initialLong && !isNaN(Number(initialLat)) && Number(initialLat) !== 0;
        if (hasValidInitial) {
          setViewState(prev => ({ ...prev, latitude: Number(initialLat), longitude: Number(initialLong) }));
          fetchAddress(Number(initialLat), Number(initialLong));
        } else {
          handleLocateMe();
        }
      }, 100);
    } else if (!visible) {
      setMapRendered(false);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [visible, initialLat, initialLong, cdnLoaded]);

  // Handle map instance creation
  useEffect(() => {
    if (!mapRendered || !mapContainerRef.current || mapInstanceRef.current || !trackAsiaToken) return;
    
    if (!window.trackasiagl) {
      console.error("TrackAsia GL JS is not loaded from CDN.");
      return;
    }

    const map = new window.trackasiagl.Map({
      container: mapContainerRef.current,
      style: `https://maps.track-asia.com/styles/v2/streets.json?key=${trackAsiaToken}`,
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    map.on('move', () => {
      const center = map.getCenter();
      setViewState({
        latitude: center.lat,
        longitude: center.lng,
        zoom: map.getZoom()
      });
    });

    map.on('moveend', () => {
      if (isProgrammaticMoveRef.current) {
        isProgrammaticMoveRef.current = false;
        return;
      }
      const center = map.getCenter();
      fetchAddress(center.lat, center.lng);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapRendered, trackAsiaToken]);

  const fetchAddress = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const address = await reverseGeocode(lat, lng);
      const text = address || "Không tìm thấy địa chỉ";
      setCurrentAddress(text);
      setSearchQuery(text);
      setShowSuggestions(false);
    } catch (error) {
      setCurrentAddress("Không thể tải địa chỉ");
      setSearchQuery("Không thể tải địa chỉ");
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (queryToSearch?: string) => {
    const q = typeof queryToSearch === 'string' ? queryToSearch : searchQuery;
    if (!q.trim()) return;
    setLoading(true);
    setShowSuggestions(false);
    try {
      const coords = await forwardGeocode(q);

      if (coords) {
        if (mapInstanceRef.current) {
          isProgrammaticMoveRef.current = true;
          mapInstanceRef.current.flyTo({ center: [coords.long, coords.lat], zoom: 16, duration: 800 });
        }
        setViewState(prev => ({ ...prev, latitude: coords.lat, longitude: coords.long }));
        setCurrentAddress(q);
        setSearchQuery(q);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLocateMe = async () => {
    try {
      setLoading(true);
      const coords = await getCurrentLocation();
      if (coords && coords.latitude && coords.longitude && !isNaN(Number(coords.latitude))) {
        const lat = Number(coords.latitude);
        const lng = Number(coords.longitude);
        if (mapInstanceRef.current) {
          isProgrammaticMoveRef.current = true;
          mapInstanceRef.current.flyTo({ center: [lng, lat], zoom: 16, duration: 800 });
        }
        setViewState(prev => ({ ...prev, latitude: lat, longitude: lng }));
        fetchAddress(lat, lng);
      } else {
        fetchAddress(viewState.latitude, viewState.longitude);
      }
    } catch (error) {
      console.error("Locate error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    onSelect(viewState.latitude, viewState.longitude, searchQuery || currentAddress);
    onClose();
  };

  if (!visible) return null;

  return createPortal(
    <Box className="fixed inset-0 z-[9999] flex flex-col bg-surface overflow-hidden w-full h-[100dvh]">
      <Box className="flex-1 relative bg-gray-50">
        {/* Floating Back Button */}
        <div 
          className="absolute left-4 bg-white/90 backdrop-blur-md w-10 h-10 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.15)] z-[400] cursor-pointer active:bg-gray-100 flex items-center justify-center transition-transform active:scale-95"
          style={{ top: 'calc(env(safe-area-inset-top, 20px) + 16px)' }}
          onClick={onClose}
        >
          <ChevronLeft size={24} className="text-gray-700 pr-0.5" />
        </div>

        {mapRendered && (
          <div 
            ref={mapContainerRef} 
            style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} 
          />
        )}

        {/* Fixed center marker */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[400] pointer-events-none pb-8">
          <MapPin size={40} className="text-primary drop-shadow-lg filter drop-shadow-md" fill="#FFC900" />
        </div>

        {/* Locate me button */}
        <div 
          className="absolute bottom-6 right-4 bg-white p-3 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.15)] z-[400] cursor-pointer active:bg-gray-100 flex items-center justify-center"
          onClick={handleLocateMe}
        >
          <LocateFixed size={24} className="text-blue-600" />
        </div>
      </Box>

      <Box className="p-4 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-10 flex-shrink-0">
        <Box className="mb-4 bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center gap-2 relative">
          <Box className="flex-1 min-w-0">
            <Text size="xSmall" className="text-gray-500 mb-0.5 flex items-center gap-1">
              <MapPin size={12} /> Địa chỉ đang ghim
            </Text>
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                if (searchQuery.trim()) setShowSuggestions(true);
              }}
              placeholder="Nhập địa chỉ để tìm..."
              className="border-none px-0 bg-transparent text-gray-900 text-sm focus:outline-none p-0 h-auto w-full"
              clearable
            />
          </Box>
          <Box 
            className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center cursor-pointer active:opacity-70 flex-shrink-0"
            onClick={() => handleSearch()}
          >
            <Search size={18} className="text-primary" />
          </Box>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-[-10px] left-0 right-0 transform -translate-y-full bg-white border border-gray-200 rounded-xl shadow-[0_-4px_12px_rgba(0,0,0,0.1)] z-50 overflow-hidden max-h-[40vh] overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  className="px-4 py-3 border-b border-gray-50 last:border-b-0 text-sm text-gray-700 active:bg-gray-100 cursor-pointer flex items-start gap-2"
                  onClick={() => {
                    setSearchQuery(suggestion);
                    setShowSuggestions(false);
                    setSuggestions([]);
                    handleSearch(suggestion);
                  }}
                >
                  <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="leading-tight">{suggestion}</span>
                </div>
              ))}
            </div>
          )}
        </Box>
        <Button 
          fullWidth 
          onClick={handleConfirm}
          disabled={loading}
          className="rounded-full h-12 font-bold shadow-md"
        >
          Xác nhận vị trí này
        </Button>
      </Box>
    </Box>,
    document.body
  );
};
