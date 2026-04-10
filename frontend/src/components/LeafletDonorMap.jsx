import { useEffect, useRef } from 'react';

const BLOOD_TYPE_COLORS = {
  'A+':  '#e53935',
  'A-':  '#c62828',
  'B+':  '#1e88e5',
  'B-':  '#1565c0',
  'AB+': '#8e24aa',
  'AB-': '#6a1b9a',
  'O+':  '#2e7d32',
  'O-':  '#1b5e20',
};

const createBloodIcon = (leaflet, bloodType, isSelected) => {
  const color = BLOOD_TYPE_COLORS[bloodType] || '#b21f2d';
  const size = isSelected ? 52 : 44;
  const ring = isSelected ? `box-shadow:0 0 0 3px #fff,0 0 0 5px ${color};` : '';

  return leaflet.divIcon({
    className: '',
    html: `
      <div style="
        display:flex;
        flex-direction:column;
        align-items:center;
        cursor:pointer;
      ">
        <div style="
          width:${size}px;
          height:${size}px;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          background:${color};
          display:flex;
          align-items:center;
          justify-content:center;
          ${ring}
          box-shadow:0 4px 12px rgba(0,0,0,0.35);
          transition:all 0.2s;
        ">
          <span style="
            transform:rotate(45deg);
            color:#fff;
            font-weight:800;
            font-size:${bloodType.length > 2 ? '10px' : '12px'};
            letter-spacing:-0.5px;
            text-shadow:0 1px 2px rgba(0,0,0,0.3);
            font-family:system-ui,sans-serif;
          ">${bloodType}</span>
        </div>
      </div>
    `,
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 10)],
  });
};

const LeafletDonorMap = ({ donors = [], center, zoom = 13, onDonorSelect, selectedDonorId }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});

  // Init map once
  useEffect(() => {
    const L = window.L;
    if (!L || !containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, { zoomControl: true }).setView(
      [center.lat, center.lng],
      zoom
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = {};
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fly to new city when center changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([center.lat, center.lng], zoom, { duration: 0.8 });
  }, [center.lat, center.lng, zoom]);

  // Render donor markers
  useEffect(() => {
    const L = window.L;
    if (!L || !mapRef.current) return;

    // Remove old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    donors.forEach((donor) => {
      const lat = Number(donor.latitude);
      const lng = Number(donor.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return;

      const isSelected = donor.id === selectedDonorId;
      const icon = createBloodIcon(L, donor.bloodType || '?', isSelected);

      const marker = L.marker([lat, lng], { icon })
        .addTo(mapRef.current)
        .bindTooltip(
          `<b>${donor.user?.fullName || 'Donor'}</b><br/>${donor.bloodType} · ${donor.distanceKm} km`,
          { direction: 'top', offset: [0, -8] }
        );

      marker.on('click', () => {
        if (onDonorSelect) onDonorSelect(donor);
        mapRef.current.panTo([lat, lng], { animate: true, duration: 0.5 });
      });

      markersRef.current[donor.id] = marker;
    });
  }, [donors, selectedDonorId, onDonorSelect]);

  // Update selected marker icon without re-rendering all
  useEffect(() => {
    const L = window.L;
    if (!L) return;

    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const donor = donors.find((d) => d.id === id);
      if (!donor) return;
      const isSelected = id === selectedDonorId;
      marker.setIcon(createBloodIcon(L, donor.bloodType || '?', isSelected));
    });
  }, [selectedDonorId, donors]);

  if (!window.L) {
    return (
      <div className="leaflet-map" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Map is loading...
      </div>
    );
  }

  return <div ref={containerRef} id="donor-map" className="leaflet-map" />;
};

export default LeafletDonorMap;
