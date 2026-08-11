import { useEffect, useRef } from 'react';
import { VILLAGES, DEFICIENCY_RECORDS } from '../data/mockData';

const SEVERITY_COLORS = {
  severe:   '#c0392b',
  moderate: '#e06c2e',
  mild:     '#f0ab3f',
};

function getVillageSeverityColor(villageId) {
  const defs = DEFICIENCY_RECORDS.filter(d => d.village_id === villageId);
  if (defs.some(d => d.severity === 'severe'))   return SEVERITY_COLORS.severe;
  if (defs.some(d => d.severity === 'moderate')) return SEVERITY_COLORS.moderate;
  return SEVERITY_COLORS.mild;
}

function getMaxPrevalence(villageId) {
  const defs = DEFICIENCY_RECORDS.filter(d => d.village_id === villageId);
  return defs.reduce((max, d) => Math.max(max, d.prevalence_pct), 0);
}

export default function MapView({ selectedVillageId, onVillageSelect, filterState }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then(L => {
      if (mapInstanceRef.current) return; // already initialized

      const map = L.map(mapRef.current, {
        center: [22.5, 78.5],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add village markers
      const filtered = filterState
        ? VILLAGES.filter(v => v.state === filterState)
        : VILLAGES;

      filtered.forEach(village => {
        const color = getVillageSeverityColor(village.id);
        const maxPrev = getMaxPrevalence(village.id);
        const radius = Math.max(12, Math.min(28, maxPrev / 3));

        const circle = L.circleMarker([village.lat, village.lng], {
          radius,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.82,
        });

        const defs = DEFICIENCY_RECORDS.filter(d => d.village_id === village.id);
        const defList = defs
          .map(d => `<li>${d.deficiency_type}: <b>${d.prevalence_pct}%</b> (${d.severity})</li>`)
          .join('');

        circle.bindPopup(`
          <div style="font-family: Inter, sans-serif; min-width: 200px;">
            <h4 style="margin:0 0 4px; font-size:15px; font-weight:600; color:#3c3b2c">${village.name}</h4>
            <p style="margin:0 0 8px; font-size:12px; color:#706f5c">${village.district}, ${village.state}</p>
            <ul style="margin:0; padding-left:16px; font-size:12px; color:#4a4938; line-height:1.8">${defList}</ul>
          </div>
        `, { maxWidth: 240 });

        circle.on('click', () => {
          if (onVillageSelect) onVillageSelect(village.id);
        });

        circle.addTo(map);
        markersRef.current.push({ id: village.id, marker: circle });
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = [];
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-2xl" style={{ minHeight: 320 }} />
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-warm-900/95 backdrop-blur rounded-xl p-3 shadow-card border border-warm-200 dark:border-warm-700 text-xs space-y-1.5">
        <p className="font-semibold text-warm-600 dark:text-warm-400 text-xs uppercase tracking-wider mb-2">Severity</p>
        {[
          { color: '#c0392b', label: 'Severe' },
          { color: '#e06c2e', label: 'Moderate' },
          { color: '#f0ab3f', label: 'Mild' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: color }} />
            <span className="text-warm-700 dark:text-warm-300">{label}</span>
          </div>
        ))}
        <p className="text-warm-400 dark:text-warm-500 text-xs mt-1">Circle size = prevalence</p>
      </div>
    </div>
  );
}
