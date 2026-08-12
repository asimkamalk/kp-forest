"use client";

import { useEffect, useRef } from "react";
import {
  Map,
  NavigationControl,
  LngLatBounds,
  type GeoJSONSource,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Props = {
  geojson: unknown;
  className?: string;
};

function asFeatureCollection(geojson: unknown) {
  if (
    geojson &&
    typeof geojson === "object" &&
    "type" in geojson &&
    (geojson as { type: string }).type === "FeatureCollection"
  ) {
    return geojson;
  }
  if (
    geojson &&
    typeof geojson === "object" &&
    "type" in geojson &&
    (geojson as { type: string }).type === "Feature"
  ) {
    return {
      type: "FeatureCollection",
      features: [geojson],
    };
  }
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: geojson,
      },
    ],
  };
}

export function RegionMap({ geojson, className }: Props) {
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
      center: [72.0, 34.5],
      zoom: 6,
    });

    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    map.on("load", () => {
      const data = asFeatureCollection(geojson);
      map.addSource("boundary", {
        type: "geojson",
        // MapLibre accepts FeatureCollection; Prisma Json is untyped at the boundary.
        data: data as never,
      });
      map.addLayer({
        id: "boundary-fill",
        type: "fill",
        source: "boundary",
        paint: { "fill-color": "#1F4D36", "fill-opacity": 0.25 },
      });
      map.addLayer({
        id: "boundary-line",
        type: "line",
        source: "boundary",
        paint: { "line-color": "#B8891C", "line-width": 2 },
      });

      const bounds = new LngLatBounds();
      const extendCoords = (coords: unknown): void => {
        if (!Array.isArray(coords)) return;
        if (typeof coords[0] === "number" && typeof coords[1] === "number") {
          bounds.extend([coords[0], coords[1]]);
          return;
        }
        for (const c of coords) extendCoords(c);
      };

      const features =
        data &&
        typeof data === "object" &&
        "features" in data &&
        Array.isArray((data as { features: unknown }).features)
          ? (
              data as {
                features: Array<{ geometry?: { coordinates?: unknown } }>;
              }
            ).features
          : [];

      for (const feature of features) {
        if (feature.geometry?.coordinates) {
          extendCoords(feature.geometry.coordinates);
        }
      }
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 40, maxZoom: 9, duration: 0 });
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [geojson]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getSource("boundary")) return;
    (map.getSource("boundary") as GeoJSONSource).setData(
      asFeatureCollection(geojson) as never
    );
  }, [geojson]);

  return (
    <div
      ref={containerRef}
      className={className}
      role="img"
      aria-label="Region boundary map"
    />
  );
}
