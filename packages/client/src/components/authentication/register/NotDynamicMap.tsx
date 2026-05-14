import L, { latLngBounds, LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import {
  GeoJSON,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
} from "react-leaflet";
import { Feature, FeatureCollection, Geometry } from "geojson";
import { Place } from "./Address";

import countriesGeoJsonData from "./countries.json";

const countriesGeoJson = countriesGeoJsonData as FeatureCollection<Geometry>;

const DefaultIcon = L.icon({
  iconUrl: "/images/leaflet/marker-icon.png",
  shadowUrl: "/images/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const greenIcon = new L.Icon({
  iconUrl: "/images/leaflet/marker-icon-2x-green.png",
  shadowUrl: "/images/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const MAP_WORLD_BOUNDS: [[number, number], [number, number]] = [
  [-90, -180],
  [90, 180],
];

const ChangeView = ({
  places,
  selected,
}: {
  places: Place[];
  selected: Place | undefined;
}) => {
  const map = useMap();

  useEffect(() => {
    if (places && places.length > 0) {
      let markerBounds = latLngBounds([]);
      places?.forEach((place) => {
        markerBounds.extend([place.lat, place.lon]);
      });
      map.fitBounds(markerBounds, { padding: [50, 50], maxZoom: 6 });
    } else {
      map.setView([48.5, 7.7], 4);
    }
  }, [map, places, selected]);

  return null;
};

interface HighlightedCountriesProps {
  isoCodes: string[];
}

const HighlightedCountries = ({ isoCodes }: HighlightedCountriesProps) => {
  const featureCollection: FeatureCollection<Geometry> = useMemo(() => {
    const features = countriesGeoJson.features.filter(
      (feature: Feature<Geometry>) =>
        isoCodes.includes(feature.properties?.iso_a2 as string)
    );
    return {
      type: "FeatureCollection",
      features: features,
    };
  }, [isoCodes]);

  return (
    <GeoJSON
      data={featureCollection}
      style={(feature) => {
        return {
          fillColor: "#2E7D32",
          fillOpacity: 0.2,
          weight: 0,
        };
      }}
    />
  );
};

interface MapProps {
  places?: Place[];
  selected: Place | undefined;
  setSelected: (place: Place) => void;
  defaultZoom?: number;
}

const highlightedCountries = [
  "AL", // Albanie
  "DE", // Allemagne
  "AD", // Andorre
  "AM", // Arménie
  "AT", // Autriche
  "AZ", // Azerbaidjan
  "BE", // Belgique
  "BA", // Bosnie-Herzégovine
  "BG", // Bulgarie
  "CY", // Chypre
  "HR", // Croatie
  "DK", // Danemark
  "ES", // Espagne
  "EE", // Estonie
  "FI", // Finlande
  "FR", // France
  "GE", // Géorgie
  "GR", // Grèce
  "HU", // Hongrie
  "IE", // Irlande
  "IS", // Islande
  "IT", // Italie
  "XK", // Kosovo
  "LV", // Lettonie
  "LI", // Liechtenstein
  "LT", // Lituanie
  "LU", // Luxembourg
  "MT", // Malte
  "MD", // Moldavie
  "MC", // Monaco
  "ME", // Monténégro
  "NO", // Norvège
  "NL", // Pays-Bas
  "PL", // Pologne
  "PT", // Portugal
  "CZ", // République tchèque
  "RO", // Roumanie
  "GB", // Royaume-Uni
  "SM", // Saint-Marin
  "RS", // Serbie
  "SK", // Slovaquie
  "SI", // Slovénie
  "SE", // Suède
  "CH", // Suisse
  "TR", // Turquie
];

const Map = ({ places, selected, setSelected, defaultZoom = 4 }: MapProps) => {
  const displayedPlaces = selected ? [selected, ...places!] : [...places!];

  return (
    <MapContainer
      style={{ height: "100%", width: "100%", minHeight: "550px" }}
      key={places!.length > 0 ? "withRadioButton" : "fullWidth"}
      zoom={defaultZoom}
      maxBounds={MAP_WORLD_BOUNDS}
      maxBoundsViscosity={1}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        noWrap
      />
      <HighlightedCountries isoCodes={highlightedCountries} />
      {places!.length > 0 &&
        places!.map((place) => (
          <Marker
            position={[place.lat, place.lon] as LatLngTuple}
            key={place.place_id.toString()}
            icon={DefaultIcon}
            eventHandlers={{
              click: () => {
                setSelected(place);
              },
            }}
          />
        ))}
      {selected &&
        selected.lat != null &&
        selected.lon != null &&
        !isNaN(selected.lat) &&
        !isNaN(selected.lon) && (
          <Marker
            position={[selected.lat, selected.lon] as LatLngTuple}
            icon={greenIcon}
          />
        )}
      <ChangeView places={displayedPlaces} selected={selected} />
    </MapContainer>
  );
};

export default Map;
