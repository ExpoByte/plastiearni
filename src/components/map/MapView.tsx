import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// Fix for default marker icons in React-Leaflet
const defaultIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const activeIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const closedIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export interface CollectionPoint {
  id: number;
  name: string;
  address: string;
  distance: string;
  rating: number;
  hours: string;
  phone: string;
  isOpen: boolean;
  lat: number;
  lng: number;
}

interface MapViewProps {
  collectionPoints: CollectionPoint[];
  selectedPoint: CollectionPoint | null;
  onSelectPoint: (point: CollectionPoint) => void;
  userLocation: LatLngExpression;
  useSatellite?: boolean;
}

// Component to handle map centering when selection changes
const MapController = ({ center }: { center: LatLngExpression }) => {
  const map = useMap();
  
  useEffect(() => {
    map.flyTo(center, 15, { duration: 0.5 });
  }, [center, map]);
  
  return null;
};

export const MapView = ({
  collectionPoints,
  selectedPoint,
  onSelectPoint,
  userLocation,
  useSatellite = false,
}: MapViewProps) => {
  const tileUrl = useSatellite
    ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const attribution = useSatellite
    ? "Tiles &copy; Esri"
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const mapCenter = selectedPoint 
    ? [selectedPoint.lat, selectedPoint.lng] as LatLngExpression
    : userLocation;

  return (
    <MapContainer
      center={userLocation}
      zoom={13}
      className="h-full w-full z-0"
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url={tileUrl} attribution={attribution} />
      
      {selectedPoint && <MapController center={mapCenter} />}
      
      {/* User location marker */}
      <Marker position={userLocation} icon={userIcon}>
        <Popup>
          <div className="text-center">
            <strong>Your Location</strong>
            <p className="text-sm text-muted-foreground">Nairobi, Kenya</p>
          </div>
        </Popup>
      </Marker>

      {/* Collection point markers */}
      {collectionPoints.map((point) => (
        <Marker
          key={point.id}
          position={[point.lat, point.lng]}
          icon={point.isOpen ? activeIcon : closedIcon}
          eventHandlers={{
            click: () => onSelectPoint(point),
          }}
        >
          <Popup>
            <div className="min-w-[200px]">
              <strong className="text-foreground">{point.name}</strong>
              <p className="text-sm text-muted-foreground">{point.address}</p>
              <p className="text-sm">
                <span className={point.isOpen ? "text-primary" : "text-destructive"}>
                  {point.isOpen ? "Open" : "Closed"}
                </span>
                {" • "}
                <span>⭐ {point.rating}</span>
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
