"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import institutionsCoordinates from "@/lib/data/institutionsCoordinates.json";
import { ExternalLink, Navigation, Home, MapPin, Building2 } from "lucide-react";
import Link from "next/link";

const coordsMap = institutionsCoordinates as unknown as Record<string, [number, number]>;

interface CompareMapViewProps {
  institutions: any[];
  homeLocation?: { name: string; lat: number; lng: number } | null;
  onRemoveInstitution?: (id: string) => void;
  distances?: Record<string, { straightKm: number; roadKm: number }>;
}

export default function CompareMapView({
  institutions,
  homeLocation,
  onRemoveInstitution,
  distances,
}: CompareMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [22.5937, 78.9629],
      zoom: 5,
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: true,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
        subdomains: "abcd",
      }
    ).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers and Lines
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    const validPoints: [number, number][] = [];

    // 1. Plot Home Location if present
    if (homeLocation && typeof homeLocation.lat === "number" && typeof homeLocation.lng === "number") {
      const homeCoords: [number, number] = [homeLocation.lat, homeLocation.lng];
      validPoints.push(homeCoords);

      const homeIcon = L.divIcon({
        className: "custom-home-pin",
        html: `
          <div style="background-color: #2563eb; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(37,99,235,0.4); border: 3px solid white; cursor: pointer;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
      });

      const homeMarker = L.marker(homeCoords, { icon: homeIcon }).addTo(layer);
      homeMarker.bindPopup(`
        <div style="font-family: inherit; padding: 4px; font-size: 13px;">
          <div style="font-weight: 800; color: #1e3a8a; margin-bottom: 2px;">🏠 Home Location</div>
          <div style="color: #475569; font-weight: 600;">${homeLocation.name}</div>
        </div>
      `);
    }

    // Colors for colleges 1, 2, 3, 4
    const pinColors = ["#000000", "#d97706", "#2563eb", "#059669"];

    // 2. Plot Institutions
    institutions.forEach((inst, index) => {
      const coa = inst.coa_code || "";
      const coords = coordsMap[coa] || coordsMap[inst.id];
      if (!coords) return;

      validPoints.push(coords);
      const color = pinColors[index % pinColors.length];
      const distInfo = distances?.[inst.id];

      // Draw dashed line from Home to College if home exists
      if (homeLocation) {
        L.polyline([[homeLocation.lat, homeLocation.lng], coords], {
          color: color,
          weight: 2,
          dashArray: "6, 6",
          opacity: 0.65,
        }).addTo(layer);
      }

      const collegeIcon = L.divIcon({
        className: "custom-college-pin",
        html: `
          <div style="background-color: ${color}; color: white; width: 34px; height: 34px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.3); border: 2.5px solid white; cursor: pointer; transition: transform 0.2s;">
            <span style="font-size: 11px; font-weight: 900; line-height: 1;">#${index + 1}</span>
            <span style="font-size: 8px; font-weight: 700; opacity: 0.85; line-height: 1; margin-top: 1px;">${coa.slice(0, 4)}</span>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -17],
      });

      const marker = L.marker(coords, { icon: collegeIcon }).addTo(layer);

      const locationStr = [inst.locality, inst.city || inst.district, inst.state].filter(Boolean).join(", ");
      const popupHtml = `
        <div style="font-family: inherit; padding: 6px; min-width: 200px; max-width: 260px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="background: ${color}; color: white; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 800; font-family: monospace;">
              ${coa || "COA"}
            </span>
            <span style="font-size: 10px; font-weight: 700; color: #64748b;">Option #${index + 1}</span>
          </div>
          <div style="font-weight: 800; font-size: 13px; color: #0f172a; line-height: 1.3; margin-bottom: 4px;">
            ${inst.institution_name}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
            📍 ${locationStr}
          </div>
          ${
            distInfo
              ? `<div style="font-size: 11px; font-weight: 700; color: #047857; background: #ecfdf5; padding: 4px 8px; border-radius: 6px; margin-bottom: 8px;">
                  🚗 ~${distInfo.roadKm} km travel (${distInfo.straightKm} km direct)
                </div>`
              : ""
          }
          <div style="display: flex; gap: 6px; margin-top: 6px;">
            <a href="/institutions/${inst.slug}" target="_blank" style="flex: 1; text-align: center; background: #000; color: #fff; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-decoration: none;">
              View Profile &rarr;
            </a>
          </div>
        </div>
      `;
      marker.bindPopup(popupHtml);
    });

    // Fit map bounds
    if (validPoints.length === 1) {
      map.setView(validPoints[0], 12);
    } else if (validPoints.length > 1) {
      const bounds = L.latLngBounds(validPoints);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [institutions, homeLocation, distances]);

  return (
    <div className="relative w-full h-[550px] sm:h-[620px] rounded-3xl overflow-hidden border border-gray-200 shadow-xs bg-gray-50">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Legend / Quick Overview Overlay */}
      <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl p-3 shadow-lg max-w-[240px] hidden sm:block">
        <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
          <MapPin size={12} className="text-black" />
          <span>Plotted Colleges ({institutions.length})</span>
        </div>
        <div className="space-y-1.5">
          {homeLocation && (
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg">
              <Home size={12} className="shrink-0" />
              <span className="truncate">Home: {homeLocation.name}</span>
            </div>
          )}
          {institutions.map((inst, idx) => {
            const pinColors = ["#000000", "#d97706", "#2563eb", "#059669"];
            const color = pinColors[idx % pinColors.length];
            const distInfo = distances?.[inst.id];
            return (
              <div key={inst.id} className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate font-semibold text-gray-800" title={inst.institution_name}>
                    {inst.coa_code || inst.institution_name}
                  </span>
                </div>
                {distInfo && (
                  <span className="font-mono text-[10px] font-bold text-emerald-700 shrink-0">
                    ~{distInfo.roadKm}km
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
