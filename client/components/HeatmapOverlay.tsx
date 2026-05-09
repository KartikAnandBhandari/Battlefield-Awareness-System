import { useEffect, useRef } from "react";
import L from "leaflet";
import { RiskIndicator } from "@/lib/simulationEngine";

interface HeatmapProps {
  map: L.Map | null;
  riskIndicators: RiskIndicator[];
  enabled: boolean;
}

export default function HeatmapOverlay({
  map,
  riskIndicators,
  enabled,
}: HeatmapProps) {
  const heatmapLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!map || !enabled) {
      if (heatmapLayerRef.current) {
        map?.removeLayer(heatmapLayerRef.current);
        heatmapLayerRef.current = null;
      }
      return;
    }

    // Remove previous heatmap
    if (heatmapLayerRef.current) {
      map.removeLayer(heatmapLayerRef.current);
    }

    heatmapLayerRef.current = L.layerGroup();

    // Create heatmap circles based on risk indicators
    riskIndicators.forEach((risk) => {
      // Find unit location from risk data
      const color =
        risk.riskScore > 70
          ? "#ef4444" // red
          : risk.riskScore > 40
          ? "#fbbf24" // amber
          : "#4ade80"; // green

      const circle = L.circle(
        [31.634 + Math.random() * 0.05, 74.872 + Math.random() * 0.05],
        {
          color,
          weight: 1,
          opacity: 0.4,
          fill: true,
          fillColor: color,
          fillOpacity: 0.3,
          radius: 500 + risk.riskScore * 10,
        }
      );

      circle.bindPopup(
        `<div style="font-size: 12px;">
          <strong>${risk.unitId}</strong><br/>
          Risk Score: ${Math.round(risk.riskScore)}%<br/>
          Threat: ${risk.threatLevel}
        </div>`
      );

      heatmapLayerRef.current?.addLayer(circle);
    });

    map.addLayer(heatmapLayerRef.current);

    return () => {
      if (heatmapLayerRef.current && map) {
        map.removeLayer(heatmapLayerRef.current);
      }
    };
  }, [map, riskIndicators, enabled]);

  return null;
}
