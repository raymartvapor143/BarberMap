import React, { useState, useEffect, useRef } from 'react';
import axios from '../bootstrap';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Search, Star, MapPin, Scissors, Clock, ArrowRight, 
  ExternalLink, Sparkles, Filter, Navigation, CheckCircle2 
} from 'lucide-react';

// Custom Map Marker Icon Generator
const createBarberIcon = (isSelected = false) => {
  return L.divIcon({
    className: 'custom-barber-marker',
    html: `
      <div style="
        width: 38px;
        height: 38px;
        background: ${isSelected ? '#f59e0b' : '#161a22'};
        border: 2px solid ${isSelected ? '#ffffff' : '#f59e0b'};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10px 20px rgba(0,0,0,0.7), 0 0 15px ${isSelected ? 'rgba(245,158,11,0.8)' : 'rgba(245,158,11,0.3)'};
        cursor: pointer;
        transform: translate(-50%, -50%);
        transition: all 0.2s ease;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${isSelected ? '#0b0e14' : '#f59e0b'}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="6" cy="6" r="3"></circle>
          <path d="M8.12 8.12 12 12"></path>
          <path d="M20 4 8.12 15.88"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <path d="M14.8 14.8 20 20"></path>
        </svg>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -22],
  });
};

export default function HomeMap({ navigate }) {
  const [shops, setShops] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedShop, setSelectedShop] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/public/map-shops', {
        params: {
          search,
          city: selectedCity,
        },
      });
      setShops(res.data.shops || []);
      if (res.data.available_cities) {
        setAvailableCities(res.data.available_cities);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchShops();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedCity]);

  // Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [14.5700, 121.0400],
        zoom: 13,
        zoomControl: true,
      });

      // Free OpenStreetMap Standard Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Invalidate size immediately and at staggered intervals to prevent grey/black gaps
      const triggerResize = () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      };

      triggerResize();
      const t1 = setTimeout(triggerResize, 100);
      const t2 = setTimeout(triggerResize, 300);
      const t3 = setTimeout(triggerResize, 800);

      // Listen for window resize
      window.addEventListener('resize', triggerResize);

      // Observe map container resize dynamically
      let resizeObserver;
      if (window.ResizeObserver && mapContainerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          triggerResize();
        });
        resizeObserver.observe(mapContainerRef.current);
      }

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        window.removeEventListener('resize', triggerResize);
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }
  }, []);

  // Update Markers whenever shops list or selectedShop changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    shops.forEach((shop) => {
      if (!shop.location || !shop.location.latitude || !shop.location.longitude) return;

      const isSelected = selectedShop?.id === shop.id;
      const marker = L.marker([shop.location.latitude, shop.location.longitude], {
        icon: createBarberIcon(isSelected),
      }).addTo(map);

      // Popup template
      const popupHtml = `
        <div style="width: 280px; font-family: inherit; color: #f1f5f9; background: #161a22; border-radius: 12px; overflow: hidden; padding: 0;">
          <div style="height: 110px; width: 100%; position: relative; background: #0f172a;">
            <img src="${shop.cover_url || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=500&q=80'}" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.8); color: #f59e0b; font-weight: 800; font-size: 11px; padding: 2px 8px; border-radius: 6px;">
              ₱${shop.starting_price} starting
            </div>
          </div>
          <div style="padding: 12px; display: flex; flex-direction: column; gap: 6px;">
            <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #ffffff;">${shop.name}</h3>
            <p style="margin: 0; font-size: 11px; color: #94a3b8;">${shop.tagline || shop.address}</p>
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; padding: 6px 0; border-top: 1px solid #28303e; border-bottom: 1px solid #28303e; margin: 4px 0;">
              <span style="color: #f59e0b; font-weight: 700;">★ ${(Number(shop.rating_avg) || 0).toFixed(1)} (${shop.reviews_count || 0} reviews)</span>
              <span style="color: #94a3b8;">${shop.city}</span>
            </div>
            <a href="/shop/${shop.slug}" target="_blank" style="display: block; text-align: center; background: #f59e0b; color: #0b0e14; font-weight: 800; font-size: 12px; padding: 8px 12px; border-radius: 8px; text-decoration: none; margin-top: 4px;">
              View Full Details ↗
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { className: 'barbermap-custom-popup' });

      marker.on('click', () => {
        setSelectedShop(shop);
      });

      markersRef.current.push(marker);
    });

    // Auto-center or fit bounds to existing shops
    if (shops.length > 0) {
      const validLocations = shops
        .filter(s => s.location && s.location.latitude && s.location.longitude)
        .map(s => [s.location.latitude, s.location.longitude]);

      if (validLocations.length === 1) {
        map.setView(validLocations[0], 13);
      } else if (validLocations.length > 1) {
        const bounds = L.latLngBounds(validLocations);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 150);
  }, [shops, selectedShop]);

  const handleSelectShop = (shop) => {
    setSelectedShop(shop);
    const map = mapInstanceRef.current;
    if (map && shop.location && shop.location.latitude && shop.location.longitude) {
      map.flyTo([shop.location.latitude, shop.location.longitude], 15, { duration: 1.2 });
    }
  };

  return (
    <div className="relative flex-1 flex flex-col md:flex-row h-full w-full overflow-hidden bg-[#0a0c10]">
      
      {/* LEFT SIDEBAR: Search, Filters & Active Discovery List */}
      <div className="w-full md:w-[420px] lg:w-[460px] flex-shrink-0 bg-[#0e1117] border-r border-slate-800/80 flex flex-col z-30 shadow-2xl h-[40%] md:h-full overflow-hidden">
        
        {/* Search & Header */}
        <div className="p-4 border-b border-slate-800/80 space-y-3 bg-[#11141c] flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Live Active Shops ({shops.length})
              </span>
            </div>
            <span className="text-[11px] text-amber-400/90 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Verified Listings Only
            </span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shop name, barangay, city..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/70 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all shadow-inner"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick City Filters (Dynamically based on registered & active verified shops) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedCity('all')}
              className={`px-3 py-1 rounded-lg whitespace-nowrap font-medium transition-all ${
                selectedCity === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
              }`}
            >
              All Locations ({shops.length})
            </button>

            {(availableCities.length > 0 ? availableCities : Array.from(new Set(shops.map(s => s.city).filter(Boolean)))).map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1 rounded-lg whitespace-nowrap font-medium transition-all ${
                  selectedCity === city
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Shop Cards Scroll List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Scissors className="w-8 h-8 text-amber-500 animate-spin mb-3" />
              <p className="text-xs">Loading active barber shops on map...</p>
            </div>
          ) : shops.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">No active shops found</h3>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms or filter.</p>
            </div>
          ) : (
            shops.map((shop) => {
              const isSelected = selectedShop?.id === shop.id;
              return (
                <div
                  key={shop.id}
                  onClick={() => handleSelectShop(shop)}
                  className={`group relative rounded-xl p-3.5 border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500 ring-1 ring-amber-500/50 shadow-xl shadow-amber-500/10'
                      : 'bg-[#141822]/80 hover:bg-[#181d2a] border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 relative">
                      <img
                        src={shop.logo_url || shop.cover_url || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=300&q=80'}
                        alt={shop.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-sm px-1 rounded text-[9px] font-bold text-amber-400">
                        ₱{Math.round(shop.starting_price)}
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                          {shop.name}
                        </h4>
                      </div>

                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{shop.tagline || shop.address}</p>

                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded text-[11px] font-semibold text-amber-300">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{(Number(shop.rating_avg) || 0).toFixed(1)}</span>
                          <span className="text-slate-400">({shop.reviews_count || 0})</span>
                        </div>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                          {shop.city}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar inside Card */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Haircuts from <span className="text-amber-400 font-bold">₱{shop.starting_price}</span>
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/shop/${shop.slug}`, '_blank');
                      }}
                      className="px-2.5 py-1 rounded bg-slate-700/60 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <span>View Full Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Promo banner */}
        <div className="p-3 bg-[#0b0e14] border-t border-slate-800/80 flex items-center justify-between text-xs flex-shrink-0">
          <div>
            <p className="font-bold text-white">Are you a Barber Shop Owner?</p>
            <p className="text-[11px] text-slate-400">Get listed on BarberMap for ₱350/mo</p>
          </div>
          <button
            onClick={() => navigate('/register')}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition-transform active:scale-95"
          >
            Register Shop
          </button>
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Fullscreen Leaflet Discovery Map with ref */}
      <div className="flex-1 relative w-full h-[60%] md:h-full z-10 flex flex-col min-h-0">
        <div 
          ref={mapContainerRef} 
          id="leaflet-main-map"
          className="w-full h-full flex-1"
          style={{ width: '100%', height: '100%', minHeight: '100%', backgroundColor: '#11141a' }}
        />

        {/* Floating Quick Action Widget */}
        <div className="absolute top-4 right-4 z-[1000] hidden sm:flex flex-col gap-2">
          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([14.5995, 120.9842], 12, { duration: 1 });
              }
            }}
            className="p-2.5 rounded-xl bg-[#161a22]/90 backdrop-blur-md hover:bg-slate-800 text-slate-200 border border-slate-700/80 shadow-xl transition-all"
            title="Reset Map View to Manila"
          >
            <Navigation className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
