"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  Building2,
  Award,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Compass,
  GraduationCap,
  Layers,
  Sparkles,
} from "lucide-react";
import institutionsCoordinates from "@/lib/data/institutionsCoordinates.json";
import "leaflet/dist/leaflet.css";

const coordsMap = institutionsCoordinates as Record<string, [number, number]>;

// Famous Architectural Hubs for quick one-click camera pan
const ARCHITECTURE_HUBS = [
  { name: "All India", coords: [22.5937, 78.9629], zoom: 5 },
  { name: "Delhi-NCR", coords: [28.6139, 77.2090], zoom: 10 },
  { name: "Bengaluru", coords: [12.9716, 77.5946], zoom: 11 },
  { name: "Chennai", coords: [13.0827, 80.2707], zoom: 11 },
  { name: "Mumbai-Pune", coords: [18.7800, 73.3500], zoom: 9 },
  { name: "Ahmedabad", coords: [23.0225, 72.5714], zoom: 11 },
  { name: "Hyderabad", coords: [17.3850, 78.4867], zoom: 11 },
  { name: "Kolkata", coords: [22.5726, 88.3639], zoom: 11 },
  { name: "Kerala Hub", coords: [10.2000, 76.3500], zoom: 8 },
];

interface InstitutionsMapViewProps {
  institutions: any[];
  selectedProgram?: string;
  onSelectInstitution?: (inst: any) => void;
}

export default function InstitutionsMapView({
  institutions,
  selectedProgram = "all",
  onSelectInstitution,
}: InstitutionsMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [selectedInst, setSelectedInst] = useState<any | null>(null);
  const [activeHub, setActiveHub] = useState<string>("All India");
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Filter institutions that have valid coordinates
  const mappedInstitutions = useMemo(() => {
    return institutions
      .map((inst) => {
        const coords = coordsMap[inst.id];
        if (!coords) return null;
        return {
          ...inst,
          lat: coords[0],
          lng: coords[1],
        };
      })
      .filter(Boolean) as any[];
  }, [institutions]);

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;

      // Fix default Leaflet icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Create map
      const map = L.map(mapContainerRef.current, {
        center: [22.5937, 78.9629],
        zoom: 5,
        minZoom: 4,
        maxZoom: 18,
        zoomControl: false,
        scrollWheelZoom: true,
      });

      // Add Zoom control at top right
      L.control.zoom({ position: "topright" }).addTo(map);

      // CartoDB Voyager tiles (crisp, modern architectural map styling)
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = markersGroup;

      if (isMounted) {
        setIsMapLoaded(true);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Render Markers whenever mappedInstitutions changes or map loads
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !isMapLoaded) return;

    let isMounted = true;

    async function updateMarkers() {
      const L = (await import("leaflet")).default;
      const markersGroup = markersLayerRef.current;
      markersGroup.clearLayers();

      mappedInstitutions.forEach((inst) => {
        const isNirf = !!inst.best_rank;
        const isMultiYear = inst.annual_records?.some(
          (r: any) =>
            r.academic_year &&
            r.academic_year >= "2027-2028" &&
            r.approved_intake > 0 &&
            !/closure|discontinued/i.test(r.approval_status || "")
        );
        const isPoly = inst.institution_type === "Polytechnic / Diploma Institution";

        // Determine marker icon appearance
        let markerHtml = "";
        let iconSize: [number, number] = [28, 28];
        let iconAnchor: [number, number] = [14, 14];

        if (isNirf) {
          // Gold NIRF Icon
          markerHtml = `
            <div style="
              width: 30px;
              height: 30px;
              background: linear-gradient(135deg, #f59e0b, #d97706);
              color: white;
              border-radius: 50%;
              border: 2px solid #ffffff;
              box-shadow: 0 4px 12px rgba(217, 119, 6, 0.45);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              font-weight: 800;
              font-family: ui-sans-serif, system-ui, sans-serif;
              cursor: pointer;
              transition: transform 0.15s ease;
            " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
              #${inst.best_rank.rank_number}
            </div>
          `;
          iconSize = [30, 30];
          iconAnchor = [15, 15];
        } else if (isMultiYear) {
          // Emerald Multi-Year Icon
          markerHtml = `
            <div style="
              width: 26px;
              height: 26px;
              background: #059669;
              color: white;
              border-radius: 50%;
              border: 2px solid #ffffff;
              box-shadow: 0 3px 8px rgba(5, 150, 105, 0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              font-weight: bold;
              cursor: pointer;
            ">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          `;
          iconSize = [26, 26];
          iconAnchor = [13, 13];
        } else if (isPoly) {
          // Teal Polytechnic Icon
          markerHtml = `
            <div style="
              width: 22px;
              height: 22px;
              background: #0d9488;
              color: white;
              border-radius: 6px;
              border: 2px solid #ffffff;
              box-shadow: 0 2px 6px rgba(13, 148, 136, 0.35);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 9px;
              font-weight: bold;
              cursor: pointer;
            ">
              DIP
            </div>
          `;
          iconSize = [22, 22];
          iconAnchor = [11, 11];
        } else {
          // Standard Architecture College (Black & White sleek dot)
          markerHtml = `
            <div style="
              width: 22px;
              height: 22px;
              background: #18181b;
              color: white;
              border-radius: 50%;
              border: 2px solid #ffffff;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              font-weight: 800;
              font-family: monospace;
              cursor: pointer;
            ">
              🏛️
            </div>
          `;
          iconSize = [22, 22];
          iconAnchor = [11, 11];
        }

        const customIcon = L.divIcon({
          html: markerHtml,
          className: "custom-inst-marker",
          iconSize: iconSize,
          iconAnchor: iconAnchor,
        });

        const marker = L.marker([inst.lat, inst.lng], { icon: customIcon });

        // Click handler: Set selected institution and notify parent
        marker.on("click", () => {
          setSelectedInst(inst);
          if (onSelectInstitution) onSelectInstitution(inst);
          mapInstanceRef.current.setView([inst.lat, inst.lng], Math.max(mapInstanceRef.current.getZoom(), 12), {
            animate: true,
          });
        });

        // Popup tooltip
        marker.bindTooltip(
          `<strong>${inst.coa_code || ""}</strong> ${inst.institution_name} (${inst.city})`,
          {
            direction: "top",
            offset: [0, -10],
            opacity: 0.95,
            className: "text-xs font-sans",
          }
        );

        markersGroup.addLayer(marker);
      });
    }

    updateMarkers();
  }, [mappedInstitutions, isMapLoaded]);

  // Handle Hub Jump
  const handleHubClick = (hub: (typeof ARCHITECTURE_HUBS)[0]) => {
    setActiveHub(hub.name);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(hub.coords, hub.zoom, { animate: true, duration: 1.2 });
    }
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5 min-h-[750px]">
      {/* LEFT COLUMN: SCROLLABLE COLLEGE CARDS (5 COLS ON DESKTOP) */}
      <div className="lg:col-span-5 flex flex-col h-[750px] bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        {/* Hubs Selector Header */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/80">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
              <Compass size={14} className="text-black" />
              <span>Architectural Hubs</span>
            </div>
            <span className="text-xs font-bold text-gray-700 bg-white px-2 py-0.5 rounded-full border border-gray-200">
              {mappedInstitutions.length} Mapped
            </span>
          </div>

          {/* Hub Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {ARCHITECTURE_HUBS.map((hub) => (
              <button
                key={hub.name}
                onClick={() => handleHubClick(hub)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap transition border ${
                  activeHub === hub.name
                    ? "bg-black text-white border-black shadow-2xs"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                }`}
              >
                {hub.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Institution Banner if active */}
        {selectedInst && (
          <div className="p-4 bg-amber-50/60 border-b border-amber-200/80 flex items-start justify-between gap-3 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {selectedInst.coa_code && (
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-black text-white rounded">
                    {selectedInst.coa_code}
                  </span>
                )}
                {selectedInst.best_rank && (
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-500 text-white rounded">
                    NIRF #{selectedInst.best_rank.rank_number}
                  </span>
                )}
                <span className="text-xs text-gray-600 font-semibold">{selectedInst.city}, {selectedInst.state}</span>
              </div>
              <h4 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
                {selectedInst.institution_name}
              </h4>
              <div className="mt-2 flex items-center gap-2">
                <Link
                  href={`/institutions/${selectedInst.slug}`}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition shadow-2xs"
                >
                  View Profile & History <ExternalLink size={12} />
                </Link>
                <button
                  onClick={() => setSelectedInst(null)}
                  className="text-xs text-gray-500 hover:text-gray-800 font-medium px-2 py-1"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable list of matched colleges */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2 space-y-1">
          {mappedInstitutions.map((inst) => {
            const isSelected = selectedInst?.id === inst.id;
            const latest = inst.latest_record;
            return (
              <div
                key={inst.id}
                onClick={() => {
                  setSelectedInst(inst);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([inst.lat, inst.lng], 13, { animate: true });
                  }
                }}
                className={`p-3.5 rounded-2xl transition cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? "bg-amber-50/80 border border-amber-300 shadow-xs"
                    : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {inst.coa_code && (
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-black text-white rounded">
                          {inst.coa_code}
                        </span>
                      )}
                      {inst.best_rank && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded">
                          <Award size={10} className="text-amber-600" />
                          NIRF #{inst.best_rank.rank_number}
                        </span>
                      )}
                      <span className="text-[11px] font-semibold text-gray-500">{inst.state}</span>
                    </div>
                    {latest && (
                      <span className="text-[11px] font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                        {latest.approved_intake} seats
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
                    {inst.institution_name}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <MapPin size={12} className="text-gray-400 shrink-0" />
                    <span className="truncate">{inst.city || inst.district || inst.state}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px]">
                  <span className="text-gray-400 font-mono">
                    {inst.lat.toFixed(2)}° N, {inst.lng.toFixed(2)}° E
                  </span>
                  <Link
                    href={`/institutions/${inst.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 font-bold text-black hover:underline"
                  >
                    Profile <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: INTERACTIVE LEAFLET MAP (7 COLS ON DESKTOP) */}
      <div className="lg:col-span-7 h-[500px] lg:h-[750px] relative rounded-3xl border border-gray-200 overflow-hidden shadow-xs bg-gray-100">
        {/* Map Container */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-xs border border-gray-200/90 rounded-2xl p-3 shadow-lg max-w-xs text-xs space-y-1.5 hidden sm:block">
          <div className="font-bold text-gray-900 text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Layers size={13} /> Map Markers
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-white shadow-2xs inline-block shrink-0"></span>
            <span>NIRF Top 40 Architecture Institute</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 border border-white shadow-2xs inline-block shrink-0"></span>
            <span>Multi-Year Advance Sanction</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <span className="w-3.5 h-3.5 rounded-full bg-zinc-900 border border-white shadow-2xs inline-block shrink-0"></span>
            <span>Accredited B.Arch / M.Arch College</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <span className="w-3.5 h-3.5 rounded-md bg-teal-600 border border-white shadow-2xs inline-block shrink-0"></span>
            <span>Polytechnic / Diploma Institution</span>
          </div>
        </div>

        {/* Reset View Button */}
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([22.5937, 78.9629], 5, { animate: true });
              setActiveHub("All India");
            }
          }}
          className="absolute top-4 left-4 z-10 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 shadow-md flex items-center gap-1.5 transition"
          title="Reset View to Entire India"
        >
          <Maximize2 size={13} />
          <span>Reset India View</span>
        </button>
      </div>
    </div>
  );
}
