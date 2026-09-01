"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { NearbyDog } from "@/types/database";

type NearbyMapProps = {
  center: [number, number];
  dogs: NearbyDog[];
  selectedDogId?: string | null;
  onSelectDog?: (dog: NearbyDog) => void;
};

export function NearbyMap({
  center,
  dogs,
  selectedDogId,
  onSelectDog,
}: NearbyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(center);
    }

    return () => {
      // Keep map alive or cleanup on unmount
    };
  }, [center]);

  // Update markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    for (const marker of markersRef.current) {
      marker.remove();
    }
    markersRef.current = [];

    // User center marker (Approximate)
    const userIcon = L.divIcon({
      className: "user-location-marker",
      html: `
        <div style="
          background: #3B82F6;
          width: 24px;
          height: 24px;
          border-radius: 9999px;
          border: 3px solid #111827;
          box-shadow: 2px 2px 0 #111827;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          font-weight: bold;
        ">
          📍
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const userMarker = L.marker(center, { icon: userIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: inherit; font-size: 12px; font-weight: bold; color: #111827;">
          📍 Tu ubicación aproximada
        </div>
      `);
    markersRef.current.push(userMarker);

    // Nearby dogs markers
    for (const dog of dogs) {
      const isSelected = selectedDogId === dog.dog_id;
      const dogIcon = L.divIcon({
        className: "dog-location-marker",
        html: `
          <div style="
            background: ${isSelected ? "#F59E0B" : "#FFFFFF"};
            border: 2px solid #111827;
            padding: 3px 6px;
            box-shadow: 3px 3px 0 #111827;
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            font-family: sans-serif;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #111827;
            white-space: nowrap;
          ">
            <span>🐾</span>
            <span>${dog.name}</span>
            <span style="font-size: 9px; opacity: 0.7;">~${dog.distance_km}km</span>
          </div>
        `,
        iconSize: [80, 28],
        iconAnchor: [40, 14],
      });

      const marker = L.marker([dog.approx_lat, dog.approx_lng], { icon: dogIcon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 170px; font-family: sans-serif; color: #111827;">
            ${
              dog.photo_url
                ? `<div style="height: 100px; width: 100%; overflow: hidden; border: 1.5px solid #111827; margin-bottom: 6px;">
                    <img src="${dog.photo_url}" alt="${dog.name}" style="width: 100%; height: 100%; object-fit: cover;" />
                   </div>`
                : ""
            }
            <div style="font-size: 14px; font-weight: 900; text-transform: uppercase;">${dog.name}</div>
            <div style="font-size: 11px; opacity: 0.8; margin-bottom: 4px;">${dog.breed}</div>
            <div style="font-size: 11px; font-weight: 700; color: #2563EB;">Aprox. a ${dog.distance_km} km</div>
            <div style="margin-top: 8px;">
              <a href="/dog/${dog.slug}" style="
                display: block;
                text-align: center;
                background: #F59E0B;
                color: #111827;
                border: 1.5px solid #111827;
                padding: 4px 8px;
                font-size: 10px;
                font-weight: 800;
                text-transform: uppercase;
                text-decoration: none;
                box-shadow: 2px 2px 0 #111827;
              ">Ver Pasaporte</a>
            </div>
          </div>
        `);

      marker.on("click", () => {
        onSelectDog?.(dog);
      });

      markersRef.current.push(marker);
    }
  }, [dogs, center, selectedDogId, onSelectDog]);

  return (
    <div
      ref={mapContainerRef}
      className="relative z-10 size-full min-h-[420px] border-2 border-ink bg-cream-deep shadow-[6px_6px_0_var(--ink)] sm:min-h-[520px]"
    />
  );
}
