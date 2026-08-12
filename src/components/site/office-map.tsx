"use client";

import { useEffect, useRef } from "react";
import { Map, Marker, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Props = {
  lat: number;
  lng: number;
  label?: string;
  className?: string;
};

/** Point map for the departmental head office. */
export function OfficeMap({ lat, lng, label = "Head office", className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center: [lng, lat],
      zoom: 14,
    });

    map.addControl(new NavigationControl({ showCompass: false }), "top-right");

    const marker = new Marker({ color: "#1F4D36" }).setLngLat([lng, lat]).addTo(map);
    mapRef.current = map;

    return () => {
      marker.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      className={className}
      role="img"
      aria-label={`Map showing ${label}`}
    />
  );
}
