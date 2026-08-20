import type maplibregl from "maplibre-gl";

export const postalMapStyle = {
  version: 8,
  name: "DUIF Postal Preview",
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    { id: "postal-paper", type: "background", paint: { "background-color": "#eadfca" } },
    {
      id: "osm-raster",
      type: "raster",
      source: "osm",
      paint: {
        "raster-opacity": 0.62,
        "raster-saturation": -0.72,
        "raster-contrast": -0.18,
        "raster-brightness-min": 0.12,
        "raster-brightness-max": 0.9,
      },
    },
  ],
} satisfies maplibregl.StyleSpecification;
