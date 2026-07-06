"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import maplibregl, { LngLatBounds, VectorTileSource } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { hadSignificantMove } from "@/lib/map";
import { PARANA_BOUNDS } from "shared/utils/parana";

interface Props {
  filters: {
    difficulty: number | null;
    minLength: number;
    maxLength: number;
    minDuration: number;
    maxDuration: number;
    minRating?: number;
  };
  setBbox: (bounds: LngLatBounds) => boolean;
  setSelectedTrail: (publicId: string) => void;
}

export interface MapRef {
  flyTo: (lng: number, lat: number, zoom?: number) => void;
  getBounds: () => LngLatBounds | null;
  getPanZoom: () => { lng: number; lat: number; zoom: number } | null;
}

const INITIAL_MAP_CENTER = new LngLatBounds([...PARANA_BOUNDS]).getCenter();

function buildTilesUrl(filters: Props["filters"]) {
  const params = new URLSearchParams();

  if (filters.difficulty !== null)
    params.append("difficulty", filters.difficulty.toString());

  params.append("min_length", filters.minLength.toString());
  params.append("max_length", filters.maxLength.toString());

  params.append("min_duration", filters.minDuration.toString());
  params.append("max_duration", filters.maxDuration.toString());

  return `http://localhost:8081/tiles/trails_map_layer/{z}/{x}/{y}?${params.toString()}`;
}

// eslint-disable-next-line react/display-name
export const TrailMap = forwardRef<MapRef, Props>(
  ({ filters, setBbox, setSelectedTrail }, ref) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map>(null);

    const lastUpdatedBounds = useRef<LngLatBounds>(null);

    useImperativeHandle(ref, () => ({
      flyTo(lng: number, lat: number, zoom = 14) {
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [lng, lat],
            zoom: zoom,
            essential: true,
            speed: 1.5,
            curve: 1.2,
          });
        }
      },

      getBounds() {
        if (mapRef.current) {
          return mapRef.current.getBounds();
        }
        return null;
      },

      getPanZoom() {
        if (mapRef.current) {
          return {
            lng: mapRef.current.getCenter().lng,
            lat: mapRef.current.getCenter().lat,
            zoom: mapRef.current.getZoom(),
          };
        }
        return null;
      },

      setTrailHoverStatus(id: number, hovered: boolean) {
        if (mapRef.current) {
          mapRef.current.setFeatureState(
            {
              source: "trails",
              sourceLayer: "trails_map_layer",
              id: id,
            },
            { hover: hovered },
          );
        }
      },
    }));

    useEffect(() => {
      if (!mapRef.current) {
        return;
      }

      const source = mapRef.current.getSource<VectorTileSource>("trails");

      if (source) {
        source.setTiles([buildTilesUrl(filters)]);
      }
    }, [filters]);

    useEffect(() => {
      if (!mapContainer.current) {
        return;
      }

      const map = new maplibregl.Map({
        container: mapContainer.current,

        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: [
                "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
              ],
              tileSize: 256,
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | &copy; <a href="https://carto.com/attributions">CARTO</a>',
            },
          },
          layers: [
            {
              id: "osm",
              type: "raster",
              source: "osm",
            },
          ],
        },

        center: INITIAL_MAP_CENTER,
        zoom: 6.5,
        minZoom: 1,
        maxZoom: 20,
      });

      mapRef.current = map;

      map.addControl(new maplibregl.NavigationControl());

      map.on("load", () => {
        lastUpdatedBounds.current = map.getBounds();
        setBbox(map.getBounds());

        // Adiciona a fonte de dados de trilhas
        map.addSource("trails", {
          type: "vector",
          tiles: [buildTilesUrl(filters)],
          promoteId: "id",
          minzoom: 0,
          maxzoom: 18,
        });

        // Adiciona a fonte da máscara invertida do Paraná
        map.addSource("parana-mask", {
          type: "geojson",
          data: "/parana-mask.geojson",
        });

        // Adiciona uma camada que escurece todo o mapa exceto o Paraná
        // Usa a máscara adicionada acima
        map.addLayer({
          id: "parana-mask",
          type: "fill",
          source: "parana-mask",
          paint: {
            "fill-color": "#000000",
            "fill-opacity": 0.2,
          },
        });

        // Camada dos círculos dos clusters
        map.addLayer({
          id: "clusters-circles",
          source: "trails",
          "source-layer": "trails_map_layer",
          type: "circle",
          filter: [">", ["get", "trail_count"], 1],
          paint: {
            "circle-color": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              "#00998a",
              "#005C53",
            ],
            "circle-stroke-color": "#ffffff",
            "circle-radius": [
              "*",
              ["case", ["boolean", ["feature-state", "hover"], false], 1.25, 1],
              ["step", ["get", "trail_count"], 18, 10, 24, 50, 32, 100, 40],
            ],
            "circle-stroke-width": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              3,
              2,
            ],
          },
        });

        // Camada dos contadores dos clusters
        map.addLayer({
          id: "clusters-counters",
          source: "trails",
          "source-layer": "trails_map_layer",
          type: "symbol",
          filter: [">", ["get", "trail_count"], 1],
          layout: {
            "text-field": ["to-string", ["get", "trail_count"]],
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-size": 14,
            "text-justify": "auto",
          },
          paint: {
            "text-color": "#ffffff",
          },
        });

        // Camada dos círculos das trilhas
        map.addLayer({
          id: "trails-circles",
          source: "trails",
          "source-layer": "trails_map_layer",
          type: "circle",
          filter: ["==", ["get", "trail_count"], 1],
          paint: {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              5,
              [
                "*",
                5,
                ["case", ["boolean", ["feature-state", "hover"], false], 2, 1],
              ],
              16,
              [
                "*",
                20,
                ["case", ["boolean", ["feature-state", "hover"], false], 2, 1],
              ],
            ],
            "circle-stroke-width": [
              "*",
              1.5,
              ["case", ["boolean", ["feature-state", "hover"], false], 2, 1],
            ],
            "circle-stroke-color": "#bb763e",
            "circle-color": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              "#eb9b59",
              "#D99C6A",
            ],
          },
        });

        // Camada dos nomes das trilhas
        map.addLayer({
          id: "trails-names",
          source: "trails",
          "source-layer": "trails_map_layer",
          type: "symbol",
          filter: ["==", ["get", "trail_count"], 1],
          layout: {
            "text-field": ["get", "name"],
            "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
            "text-size": 11,
            "text-offset": [0, 1.2],
            "text-anchor": "top",
            "text-variable-anchor": ["top", "bottom", "left", "right"],
            "text-max-width": 10,
          },
          paint: {
            "text-color": "#222222",
            "text-halo-color": "#ffffff",
            "text-halo-width": 1.5,
          },
        });
      });

      map.on("click", "clusters-circles", (e) => {
        const feature = e.features?.[0];
        if (!feature) return;

        map.flyTo({
          center: feature.geometry.coordinates,
          zoom: map.getZoom() + 2.5,
          essential: true,
          speed: 1.2,
          curve: 1.4,
        });
      });

      let hoveredTrailId: number | null = null;

      function onMouseEnter(
        e: maplibregl.MapMouseEvent & {
          features?: maplibregl.MapGeoJSONFeature[];
        },
      ) {
        const feature = e.features?.[0];
        if (!feature) return;

        if (hoveredTrailId !== null) {
          map.setFeatureState(
            {
              source: "trails",
              sourceLayer: "trails_map_layer",
              id: hoveredTrailId,
            },
            { hover: false },
          );
        }

        hoveredTrailId = feature.id as number;
        map.setFeatureState(
          {
            source: "trails",
            sourceLayer: "trails_map_layer",
            id: hoveredTrailId,
          },
          { hover: true },
        );

        map.getCanvas().style.cursor = "pointer";
      }

      function onMouseLeave() {
        if (hoveredTrailId !== null) {
          map.setFeatureState(
            {
              source: "trails",
              sourceLayer: "trails_map_layer",
              id: hoveredTrailId,
            },
            { hover: false },
          );
        }
        hoveredTrailId = null;
        map.getCanvas().style.cursor = "";
      }

      map.on("mouseenter", "trails-circles", onMouseEnter);
      map.on("mouseenter", "clusters-circles", onMouseEnter);

      map.on("mouseleave", "trails-circles", onMouseLeave);
      map.on("mouseleave", "clusters-circles", onMouseLeave);

      return () => {
        map.remove();
        mapRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const mapLoaded = mapRef.current?.loaded() ?? false;

    useEffect(() => {
      if (!mapRef.current || !mapLoaded) return () => {};

      const onMoveEnd = () => {
        if (lastUpdatedBounds.current === null) {
          return;
        }

        const newBounds = mapRef.current!.getBounds();

        if (hadSignificantMove(lastUpdatedBounds.current, newBounds)) {
          if (setBbox(newBounds)) {
            lastUpdatedBounds.current = newBounds;
          }
        }
      };

      mapRef.current.on("moveend", onMoveEnd);

      return () => mapRef.current?.off("moveend", onMoveEnd);
    }, [mapRef, mapLoaded, setBbox]);

    useEffect(() => {
      if (!mapRef.current || !mapLoaded) return () => {};

      const onClick = (
        e: maplibregl.MapMouseEvent & {
          features?: maplibregl.MapGeoJSONFeature[];
        },
      ) => {
        const feature = e.features?.[0];

        if (!feature) {
          return;
        }

        setSelectedTrail(feature.properties.publicId);
      };

      mapRef.current.on("click", "trails-circles", onClick);

      return () => mapRef.current?.off("click", "trails-circles", onClick);
    });

    return (
      <div
        ref={mapContainer}
        className="h-full w-full focus:outline-none cursor:none"
      />
    );
  },
);
