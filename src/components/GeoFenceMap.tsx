import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Circle, Marker, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Target from 'lucide-react/dist/esm/icons/target';
import Building from 'lucide-react/dist/esm/icons/building';

// Fix for default marker icons in Leaflet + Next.js
const icon = L.icon({
    iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
    iconSize: [48, 48],
    iconAnchor: [24, 48],
});

const userIcon = L.divIcon({
    className: 'user-location-marker',
    html: `<div class="relative flex items-center justify-center w-full h-full" role="img" aria-label="Your Current Location">
    <div class="absolute w-6 h-6 bg-secondary rounded-full animate-ping opacity-75"></div>
    <div class="relative w-4 h-4 bg-secondary border-2 border-white rounded-full"></div>
  </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
});

interface GeoFenceMapProps {
    userLocation: { lat: number; lng: number } | null;
    officeLocation: { latitude: number; longitude: number };
    radius: number;
}

// Effect to only set view once on load and provide controls
function MapLoader({ center, userLocation }: { center: [number, number], userLocation: { lat: number, lng: number } | null }) {
    const map = useMap();
    const [hasSetView, setHasSetView] = useState(false);

    useEffect(() => {
        if (!hasSetView) {
            map.setView(center, 17);
            setHasSetView(true);
        }
    }, [center, map, hasSetView]);

    const handleRecenterOffice = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        map.flyTo(center, 17, { duration: 1.5 });
    };

    const handleRecenterUser = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (userLocation) {
            map.flyTo([userLocation.lat, userLocation.lng], 17, { duration: 1.5 });
        }
    };

    return (
        <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
            <button
                type="button"
                onClick={handleRecenterOffice}
                className="w-12 h-12 flex items-center justify-center bg-background border border-border rounded-lg shadow-lg hover:bg-muted transition-colors text-secondary"
                title="Focus Office"
                aria-label="Focus Office Location"
            >
                <Building className="w-6 h-6" />
            </button>
            <button
                type="button"
                onClick={handleRecenterUser}
                disabled={!userLocation}
                className="w-12 h-12 flex items-center justify-center bg-background border border-border rounded-lg shadow-lg hover:bg-muted transition-colors text-secondary disabled:opacity-50"
                title="Locate Me"
                aria-label="Focus Your Current Location"
            >
                <Target className="w-6 h-6" />
            </button>
        </div>
    );
}

// Memoized to prevent re-renders when parent's unrelated state (like clock) changes
const GeoFenceMap = React.memo(({ userLocation, officeLocation, radius }: GeoFenceMapProps) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const center = useMemo<[number, number]>(() =>
        [officeLocation.latitude, officeLocation.longitude],
        [officeLocation.latitude, officeLocation.longitude]
    );

    if (!isMounted) return <div className="h-[300px] w-full bg-muted animate-pulse rounded-xl" />;

    return (
        <div className="h-[300px] w-full rounded-xl overflow-hidden border border-border" style={{ isolation: 'isolate', zIndex: 0 }}>
            <MapContainer
                center={center}
                zoom={17}
                scrollWheelZoom={true}
                className="h-full w-full"
                attributionControl={false}
                zoomControl={true}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    detectRetina={true}
                />
                <Circle
                    center={center}
                    radius={radius}
                    pathOptions={{
                        color: 'text-secondary',
                        fillColor: 'text-secondary',
                        fillOpacity: 0.15,
                        weight: 2,
                        dashArray: '5, 10'
                    }}
                />
                <Marker position={center} icon={icon} title="Office Location" alt="Office Location" interactive={false}>
                    <Tooltip direction="top" offset={[0, -24]} opacity={1} permanent={true}>Office Location</Tooltip>
                </Marker>
                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} title="Your Location" alt="Your Location" interactive={false}>
                        <Tooltip direction="top" offset={[0, -8]} opacity={1}>You are here</Tooltip>
                    </Marker>
                )}
                <MapLoader center={center} userLocation={userLocation} />
            </MapContainer>
        </div>
    );
});

GeoFenceMap.displayName = 'GeoFenceMap';
export default GeoFenceMap;
