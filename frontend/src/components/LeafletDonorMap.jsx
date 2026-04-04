import { useEffect, useRef } from 'react';

const LeafletDonorMap = ({ donors = [], center, radiusKm = 10, userLocation = null }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const donorLayerRef = useRef(null);
  const searchCircleRef = useRef(null);
  const userMarkerRef = useRef(null);

  useEffect(() => {
    const leaflet = window.L;
    if (!leaflet || !containerRef.current || mapRef.current) {
      return;
    }

    const map = leaflet.map(containerRef.current).setView([center.lat, center.lng], 12);

    leaflet
      .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      })
      .addTo(map);

    donorLayerRef.current = leaflet.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center.lat, center.lng]);

  useEffect(() => {
    const leaflet = window.L;
    if (!leaflet || !mapRef.current) {
      return;
    }

    const map = mapRef.current;

    map.setView([center.lat, center.lng], 12);

    if (searchCircleRef.current) {
      searchCircleRef.current.remove();
    }

    searchCircleRef.current = leaflet
      .circle([center.lat, center.lng], {
        radius: Number(radiusKm || 10) * 1000,
        color: '#b21f2d',
        fillColor: '#e85a4f',
        fillOpacity: 0.08,
        weight: 2,
      })
      .addTo(map);

    donorLayerRef.current.clearLayers();

    donors.forEach((donor) => {
      const lat = Number(donor.latitude);
      const lng = Number(donor.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        return;
      }

      const marker = leaflet.marker([lat, lng]).bindPopup(`
        <b>${donor.user?.fullName || 'Unknown donor'}</b><br/>
        Blood: ${donor.bloodType || 'N/A'}<br/>
        Distance: ${donor.distanceKm ?? 'N/A'} km<br/>
        Phone: ${donor.user?.phone || 'N/A'}<br/>
        Email: ${donor.user?.email || 'N/A'}
      `);

      donorLayerRef.current.addLayer(marker);
    });
  }, [donors, center.lat, center.lng, radiusKm]);

  useEffect(() => {
    const leaflet = window.L;
    if (!leaflet || !mapRef.current || !userLocation) {
      return;
    }

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    userMarkerRef.current = leaflet
      .marker([userLocation.lat, userLocation.lng])
      .addTo(mapRef.current)
      .bindPopup('You are here')
      .openPopup();

    mapRef.current.setView([userLocation.lat, userLocation.lng], 13);
  }, [userLocation]);

  if (!window.L) {
    return <div className="leaflet-map">Leaflet is not loaded. Please refresh the page.</div>;
  }

  return <div ref={containerRef} id="donor-map" className="leaflet-map" />;
};

export default LeafletDonorMap;
