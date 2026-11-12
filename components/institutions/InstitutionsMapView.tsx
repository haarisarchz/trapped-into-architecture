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

const coordsMap = (institutionsCoordinates as unknown) as Record<string, [number, number]>;

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
  const markersMapRef = useRef<Record<string, any>>({});
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

      // OpenStreetMap standard tiles (100% free, open-source, zero API key required)
      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
          subdomains: ["a", "b", "c"],
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
      markersMapRef.current = {};

      mappedInstitutions.forEach((inst) => {
        const latest = inst.latest_record;
        const isClosed =
          !latest ||
          latest.approved_intake <= 0 ||
          (inst.institution_type && /closed|closure|discontinued/i.test(inst.institution_type)) ||
          (latest?.approval_status && /closed|closure|discontinued/i.test(latest.approval_status));

        const isNirf = !isClosed && !!inst.best_rank;
        const isMultiYear =
          !isClosed &&
          inst.annual_records?.some(
            (r: any) =>
              r.academic_year &&
              r.academic_year >= "2027-2028" &&
              r.approved_intake > 0 &&
              !/closure|discontinued/i.test(r.approval_status || "")
          );
        const isPoly = !isClosed && inst.institution_type === "Polytechnic / Diploma Institution";

        // Determine marker icon appearance
        let markerHtml = "";
        let iconSize: [number, number] = [28, 28];
        let iconAnchor: [number, number] = [14, 14];

        if (isClosed) {
          // Closed Institution marker (subtle muted gray dot with an x)
          markerHtml = `
            <div style="
              width: 20px;
              height: 20px;
              background: #9ca3af;
              color: white;
              border-radius: 50%;
              border: 2px solid #ffffff;
              box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              font-weight: 800;
              opacity: 0.75;
              cursor: pointer;
            ">
              ✕
            </div>
          `;
          iconSize = [20, 20];
          iconAnchor = [10, 10];
        } else if (isNirf) {
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

        // Sleek horizontal pill tooltip (never vertically crushed or clipped)
        const tooltipHtml = `
          <div style="display: flex; align-items: center; gap: 6px; font-family: ui-sans-serif, system-ui, sans-serif; font-size: 11px; font-weight: 700; color: #111827; white-space: nowrap;">
            ${inst.coa_code ? `<span style="font-family: monospace; font-size: 9px; font-weight: 800; background: #000; color: #fff; padding: 1.5px 5px; border-radius: 4px;">${inst.coa_code}</span>` : ""}
            ${!isClosed && inst.best_rank ? `<span style="font-size: 9px; font-weight: 800; background: #fef3c7; color: #92400e; padding: 1.5px 5px; border-radius: 4px; border: 1px solid #fde68a;">#${inst.best_rank.rank_number}</span>` : ""}
            <span style="max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${inst.institution_name}</span>
            <span style="color: #6b7280; font-weight: 600; font-size: 10px;">(${inst.city || inst.district || inst.state})</span>
          </div>
        `;

        marker.bindTooltip(tooltipHtml, {
          direction: "top",
          offset: [0, -12],
          opacity: 0.98,
          className: "custom-map-pill-tooltip",
        });

        // Click popup with full details and direct profile link (autoPan keeps it neatly visible in frame)
        const popupHtml = `
          <div style="font-family: ui-sans-serif, system-ui, sans-serif; width: 250px; padding: 2px; line-height: 1.35;">
            <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 6px; flex-wrap: wrap;">
              ${inst.coa_code ? `<span style="font-family: monospace; font-size: 10px; font-weight: 800; background: #000; color: #fff; padding: 2px 5px; border-radius: 4px;">${inst.coa_code}</span>` : ""}
              ${!isClosed && inst.best_rank ? `<span style="font-size: 10px; font-weight: 800; background: #fef3c7; color: #92400e; padding: 2px 5px; border-radius: 4px; border: 1px solid #fde68a;">NIRF #${inst.best_rank.rank_number}</span>` : ""}
              <span style="font-size: 11px; font-weight: 600; color: #6b7280;">${inst.state || ""}</span>
              ${isClosed
                ? `<span style="font-size: 9.5px; font-weight: 800; background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; padding: 2px 5px; border-radius: 4px; margin-left: auto;">Closed Institution</span>`
                : (latest?.approved_intake
                  ? `<span style="font-size: 10.5px; font-weight: 700; background: #f3f4f6; color: #111827; padding: 2px 5px; border-radius: 4px; margin-left: auto;">${latest.approved_intake} seats</span>`
                  : "")
              }
            </div>
            <h4 style="font-size: 13.5px; font-weight: 700; color: #111827; line-height: 1.35; margin: 0 0 4px 0; word-break: break-word;">
              ${inst.institution_name}
            </h4>
            <p style="font-size: 11px; color: #4b5563; margin: 0 0 10px 0;">
              📍 ${inst.city || inst.district || ""}${inst.state ? `, ${inst.state}` : ""}
            </p>
            <a href="/institutions/${inst.slug}" style="display: block; width: 100%; text-align: center; background: #000; color: #fff; font-size: 11.5px; font-weight: 700; padding: 7px 10px; border-radius: 8px; text-decoration: none; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              View Profile & History &rarr;
            </a>
          </div>
        `;

        marker.bindPopup(popupHtml, {
          maxWidth: 280,
          minWidth: 250,
          autoPan: true,
          autoPanPadding: [25, 25],
          className: "custom-map-popup",
        });

        // Click handler: Set selected institution, notify parent, pan and open popup
        marker.on("click", () => {
          setSelectedInst(inst);
          if (onSelectInstitution) onSelectInstitution(inst);
          mapInstanceRef.current.setView([inst.lat, inst.lng], Math.max(mapInstanceRef.current.getZoom(), 12), {
            animate: true,
          });
        });

        markersMapRef.current[inst.id] = marker;
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
    <div className="flex flex-col lg:grid lg:grid-cols-5 gap-4 lg:gap-5 min-h-[750px] lg:h-[calc(100vh-210px)] lg:max-h-[850px]">
      {/* LEFT COLUMN ON DESKTOP (60% WIDTH = 3 COLS) / BELOW MAP ON MOBILE (ORDER-2) */}
      <div className="order-2 lg:order-1 lg:col-span-3 flex flex-col h-[560px] lg:h-full bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
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
              <h4 className="font-bold text-gray-900 text-sm leading-snug break-words">
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

        {/* Scrollable list of matched colleges in a clean 2-column grid */}
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 md:grid-cols-2 gap-3 content-start">
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
                    const m = markersMapRef.current[inst.id];
                    if (m) {
                      setTimeout(() => m.openPopup(), 150);
                    }
                  }
                }}
                className={`p-3.5 rounded-2xl transition cursor-pointer flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? "bg-amber-50/90 border-2 border-amber-400 shadow-xs"
                    : isClosed
                    ? "bg-gray-50/70 border border-gray-200 hover:border-gray-300 opacity-80 hover:opacity-100"
                    : "bg-white border border-gray-200/90 hover:border-gray-300 hover:shadow-xs"
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
                      {!isClosed && inst.best_rank && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded">
                          <Award size={10} className="text-amber-600" />
                          NIRF #{inst.best_rank.rank_number}
                        </span>
                      )}
                      <span className="text-[11px] font-semibold text-gray-500">{inst.state}</span>
                    </div>
                    {isClosed ? (
                      <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200/80 px-2 py-0.5 rounded shrink-0">
                        Closed Institution
                      </span>
                    ) : latest && latest.approved_intake > 0 ? (
                      <span className="text-[11px] font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded shrink-0">
                        {latest.approved_intake} seats
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200/80 px-2 py-0.5 rounded shrink-0">
                        Closed Institution
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-gray-900 leading-snug break-words">
                    {inst.institution_name}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1.5">
                    <MapPin size={12} className="text-gray-400 shrink-0" />
                    <span className="truncate">{inst.city || inst.district || inst.state}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px]">
                  <span className="text-gray-400 font-mono text-[10px]">
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

      {/* RIGHT COLUMN ON DESKTOP (40% WIDTH = 2 COLS) / AT THE TOP ON MOBILE (ORDER-1) */}
      <div className="order-1 lg:order-2 lg:col-span-2 h-[340px] sm:h-[400px] lg:h-full relative rounded-3xl border border-gray-200 overflow-hidden shadow-xs bg-gray-100 shrink-0">
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
          <div className="flex items-center gap-2 text-gray-700">
            <span className="w-3.5 h-3.5 rounded-full bg-gray-400 border border-white shadow-2xs inline-block shrink-0"></span>
            <span>Closed Institution (0 seats)</span>
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

        {/* Global Leaflet Tooltip & Popup Styling (sleek horizontal pills + neat modal cards) */}
        <style jsx global>{`
          .leaflet-tooltip.custom-map-pill-tooltip {
            white-space: nowrap !important;
            max-width: none !important;
            width: auto !important;
            padding: 5px 12px !important;
            border-radius: 9999px !important;
            background: #ffffff !important;
            color: #111827 !important;
            border: 1px solid #e5e7eb !important;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12) !important;
            pointer-events: none !important;
          }
          .leaflet-tooltip-top:before {
            border-top-color: #ffffff !important;
          }
          .leaflet-popup-content-wrapper {
            border-radius: 16px !important;
            padding: 4px !important;
            box-shadow: 0 12px 30px -5px rgba(0, 0, 0, 0.22) !important;
            border: 1px solid #e5e7eb !important;
          }
          .leaflet-popup-content {
            margin: 10px 12px !important;
            line-height: 1.4 !important;
          }
          .leaflet-container a.leaflet-popup-close-button {
            top: 8px !important;
            right: 8px !important;
            color: #9ca3af !important;
            padding: 4px !important;
          }
          .leaflet-container a.leaflet-popup-close-button:hover {
            color: #111827 !important;
          }
        `}</style>
      </div>
    </div>
  );
}
