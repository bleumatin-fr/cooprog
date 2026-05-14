import { MapContainer, MapContainerProps, TileLayer } from "react-leaflet";
import { useEffect, useRef, useState } from "react";

interface MapProps extends MapContainerProps {
  children: React.ReactNode;
}

const MAP_WORLD_BOUNDS: [[number, number], [number, number]] = [
  [-90, -180],
  [90, 180],
];

export const Map = ({
  children,
  center = [46.8182, 8.2275],
  zoom = 5,
  ...props
}: MapProps) => {
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure DOM is ready and container has dimensions
    const checkReady = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setIsReady(true);
        } else {
          // Retry if container doesn't have size yet
          setTimeout(checkReady, 50);
        }
      }
    };

    const timer = setTimeout(checkReady, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", backgroundColor: "#f0f0f0" }}
      />
    );
  }

  return (
    <MapContainer
      style={{ width: "100%", height: "100%" }}
      center={center}
      zoom={zoom}
      preferCanvas={true}
      maxBounds={MAP_WORLD_BOUNDS}
      maxBoundsViscosity={1}
      {...props}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        noWrap
      />
      {children}
    </MapContainer>
  );
};

export default Map;
