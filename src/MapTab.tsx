import React from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  Polyline,
  useMap
} from 'react-leaflet';
import { MapPin, Heart, DollarSign, Users, Home, Globe, Map } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-polylinedecorator'; 
import ErrorBoundary from './ErrorBoundary';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

interface DonationLocation {
  id: number;
  name: string;
  lat: number;
  lng: number;
  amount: number;
  charity: string;
  date: string;
  peopleHelped: number;
  category: string;
}

interface MapTabProps {
  userStats: {
    totalDonated: number;
    charitiesSupported: number;
    peopleHelped: number;
  };
}

// Custom component to draw arrows with PolylineDecorator
const ArrowLine: React.FC<{
  from: [number, number];
  to: [number, number];
  color: string;
}> = ({ from, to, color }) => {
  const map = useMap();

  React.useEffect(() => {
    const line = L.polyline([from, to], {
      color,
      weight: 4,
      opacity: 0.6
    }).addTo(map);

    const decorator = (L as any).polylineDecorator(line, {
      patterns: [
        {
          offset: '100%',
          repeat: 0,
          symbol: (L as any).Symbol.arrowHead({
            pixelSize: 12,
            polygon: true,
            pathOptions: {
              fillOpacity: 1,
              weight: 0,
              color
            }
          })
        }
      ]
    }).addTo(map);

    return () => {
      map.removeLayer(line);
      map.removeLayer(decorator);
    };
  }, [from, to, color, map]);

  return null;
};

const MapTab: React.FC<MapTabProps> = ({ userStats }) => {
  const [userLocation, setUserLocation] = React.useState({
    lat: 40.7128, // New York City
    lng: -74.006,
    name: 'Your Location'
  });

  const [showLocationInput, setShowLocationInput] = React.useState(false);
  const [newLocation, setNewLocation] = React.useState({
    lat: userLocation.lat,
    lng: userLocation.lng,
    name: userLocation.name
  });
  const [viewMode, setViewMode] = React.useState<'2d' | '3d'>('2d');

  const handleLocationUpdate = () => {
    setUserLocation(newLocation);
    setShowLocationInput(false);
  };

  // Mock donation locations
  const donationLocations: DonationLocation[] = [
    {
      id: 1,
      name: 'Red Cross - New York',
      lat: 40.7128,
      lng: -74.006,
      amount: 45.5,
      charity: 'Red Cross',
      date: '2024-01-15',
      peopleHelped: 12,
      category: 'Disaster Relief'
    },
    {
      id: 2,
      name: 'UNICEF - Los Angeles',
      lat: 34.0522,
      lng: -118.2437,
      amount: 32.75,
      charity: 'UNICEF',
      date: '2024-01-14',
      peopleHelped: 8,
      category: 'Children'
    },
    {
      id: 3,
      name: 'Doctors Without Borders - Chicago',
      lat: 41.8781,
      lng: -87.6298,
      amount: 28.9,
      charity: 'Doctors Without Borders',
      date: '2024-01-13',
      peopleHelped: 15,
      category: 'Medical'
    },
    {
      id: 4,
      name: 'World Wildlife Fund - Seattle',
      lat: 47.6062,
      lng: -122.3321,
      amount: 19.25,
      charity: 'World Wildlife Fund',
      date: '2024-01-12',
      peopleHelped: 5,
      category: 'Environment'
    },
    {
      id: 5,
      name: 'Feeding America - Miami',
      lat: 25.7617,
      lng: -80.1918,
      amount: 15.6,
      charity: 'Feeding America',
      date: '2024-01-11',
      peopleHelped: 20,
      category: 'Hunger Relief'
    },
    {
      id: 6,
      name: 'Habitat for Humanity - Austin',
      lat: 30.2672,
      lng: -97.7431,
      amount: 22.3,
      charity: 'Habitat for Humanity',
      date: '2024-01-10',
      peopleHelped: 3,
      category: 'Housing'
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Disaster Relief': '#ef4444',
      Children: '#3b82f6',
      Medical: '#10b981',
      Environment: '#22c55e',
      'Hunger Relief': '#f59e0b',
      Housing: '#8b5cf6'
    };
    return colors[category] || '#6b7280';
  };

  const getMarkerSize = (amount: number) => {
    if (amount >= 40) return 12;
    if (amount >= 25) return 10;
    if (amount >= 15) return 8;
    return 6;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Global Impact Map
          </h3>
          <p className="text-gray-600">
            See where your donations are making a difference around the world
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('2d')}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === '2d'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Map className="w-4 h-4" />
              2D Map
            </button>

          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="h-96 w-full">
            <MapContainer
              center={[userLocation.lat, userLocation.lng]}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* User marker */}
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>
                  <div className="p-2 min-w-[150px]">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-gray-900">
                        {userLocation.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Your donation headquarters
                    </p>
                  </div>
                </Popup>
              </Marker>

              {/* Donation lines + arrows */}
              {donationLocations.map((location) => {
                const color = getCategoryColor(location.category);
                return (
                  <ArrowLine
                    key={`arrow-${location.id}`}
                    from={[userLocation.lat, userLocation.lng]}
                    to={[location.lat, location.lng]}
                    color={color}
                  />
                );
              })}

              {/* Donation markers */}
              {donationLocations.map((location) => (
                <CircleMarker
                  key={location.id}
                  center={[location.lat, location.lng]}
                  radius={getMarkerSize(location.amount)}
                  pathOptions={{
                    color: getCategoryColor(location.category),
                    fillColor: getCategoryColor(location.category),
                    fillOpacity: 0.6,
                    weight: 2
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="font-semibold text-gray-900">
                          {location.name}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-semibold text-green-600">
                            ${location.amount}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span>{location.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">People Helped:</span>
                          <span className="font-semibold text-blue-600">
                            {location.peopleHelped}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {location.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
        </div>
        
      </div>
    </div>
  );
};

export default MapTab;
