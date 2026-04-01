import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useMemo } from 'react';
import './MapView.css';

const containerStyle = {
  width: '100%',
  height: '360px',
};

const fallbackCenter = { lat: 27.7172, lng: 85.324 };

const MapView = ({ bloodBanks = [], center = fallbackCenter }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
  });

  const mapCenter = useMemo(() => {
    if (bloodBanks.length > 0) {
      return { lat: Number(bloodBanks[0].latitude), lng: Number(bloodBanks[0].longitude) };
    }
    return center;
  }, [bloodBanks, center]);

  if (!apiKey) {
    return <div className="map-panel">Google Maps key missing in VITE_GOOGLE_MAPS_API_KEY.</div>;
  }

  if (loadError) {
    return <div className="map-panel">Could not load Google Maps.</div>;
  }

  if (!isLoaded) {
    return <div className="map-panel">Loading map...</div>;
  }

  return (
    <div className="map-panel">
      <GoogleMap mapContainerStyle={containerStyle} center={mapCenter} zoom={11}>
        {bloodBanks.map((bank) => (
          <Marker
            key={bank.id}
            position={{ lat: Number(bank.latitude), lng: Number(bank.longitude) }}
            title={`${bank.name} (${bank.distanceKm || '?'} km)`}
          />
        ))}
      </GoogleMap>
    </div>
  );
};

export default MapView;
