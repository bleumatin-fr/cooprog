import { Location } from "@cooprog/core";
import { useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";

const removeDiacritics = (value: string) => {
  return value
    .replace(/[a,á,à,ä,â]/g, "a")
    .replace(/[A,Á,À,Ä,Â]/g, "A")
    .replace(/[e,é,ë,è]/g, "e")
    .replace(/[E,É,Ë,È]/g, "E")
    .replace(/[i,í,ï,ì]/g, "i")
    .replace(/[I,Í,Ï,Ì]/g, "I")
    .replace(/[o,ó,ö,ò]/g, "o")
    .replace(/[O,Ó,Ö,Ò]/g, "O")
    .replace(/[u,ü,ú,ù]/g, "u")
    .replace(/[U,Ü,Ú,Ù]/g, "U");
};

interface GeocodeOptions {
  countrycodes?: string;
  searchKey?: string;
  exclude_place_ids?: string;
}

interface NominatimPlace {
  place_id: number;
  id?: number;
  addresstype?: string;
  address: any;
  lon: string;
  lat: string;
  display_name?: string;
  importance?: number;
  [key: string]: any;
}

// Accept all location types
const geocode = async (
  q: string,
  type: "city" | "region" | "country" | "address" = "address",
  geocodingOptions: GeocodeOptions = {},
  iterations: number = 0
): Promise<NominatimPlace[]> => {
  if (iterations > 1) {
    return [];
  }
  const { searchKey, ...otherOptions } = geocodingOptions;
  const queryString = {
    format: "json",
    [searchKey ?? "q"]: removeDiacritics(q),
    addressdetails: "1",
    namedetails: "1",
    layer: "address",
    "accept-language": "en",
    ...otherOptions,
  } as Record<string, string>;
  const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(
    queryString
  )}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(response.statusText);

  const result = (await response.json()) as NominatimPlace[];

  switch (type) {
    case "city": {
      const newResults = result.filter((place: any) =>
        ["city", "town", "village", "municipality"].includes(place.addresstype)
      );
      if (newResults.length > 0) {
        return newResults.filter((place: any) => place.importance > 0.5);
      } else {
        return geocode(
          q,
          "address",
          {
            ...geocodingOptions,
            exclude_place_ids: result
              .map((place: any) => place.place_id)
              .join(","),
          },
          iterations + 1
        );
      }
    }
    case "region": {
      const newResults = result.filter((place: any) =>
        ["state", "region", "county"].includes(place.addresstype)
      );
      if (newResults.length > 0) {
        return newResults.filter((place: any) => place.importance > 0.5);
      } else {
        return geocode(
          q,
          "address",
          {
            ...geocodingOptions,
            exclude_place_ids: result
              .map((place: any) => place.place_id)
              .join(","),
          },
          iterations + 1
        );
      }
    }
    case "country": {
      const newResults = result.filter(
        (place: any) => place.addresstype === "country"
      );
      if (newResults.length > 0) {
        return newResults.filter((place: any) => place.importance > 0.5);
      } else {
        return geocode(
          q,
          "address",
          {
            ...geocodingOptions,
            exclude_place_ids: result
              .map((place: any) => place.place_id)
              .join(","),
          },
          iterations + 1
        );
      }
    }
    case "address":
    default:
      return result;
  }
};

// Compose a simple address label from Nominatim address fields
function getSimpleAddressLabel(address: any): string {
  const city =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    "";
  const region = address.state || address.county || "";
  const country = address.country || "";
  return [city, region, country].filter(Boolean).join(", ");
}

const mapNominatimToLocation =
  (type: "city" | "region" | "country" | "address" = "address") =>
  (place: any): Location => {
    return {
      _id: place.place_id.toString(),
      geolocation: {
        type: "Point",
        coordinates: [parseFloat(place.lon), parseFloat(place.lat)],
      },
      address:
        type === "address"
          ? place.display_name
          : getSimpleAddressLabel(place.address),
      data: place.address,
    };
  };

const useGeocode = (
  inputValue: string,
  type: "city" | "region" | "country" | "address" = "address",
  geocodingOptions: any = {}
) => {
  const [debouncedInputValue] = useDebounceValue(inputValue, 500);
  const [options, setOptions] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!debouncedInputValue) {
      setOptions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const fetch = async () => {
      const data = await geocode(debouncedInputValue, type, geocodingOptions);
      const dedupedData = data.filter(
        (place: any, index: number, self: any) =>
          index === self.findIndex((t: any) => t.place_id === place.place_id)
      );
      const mappedData = dedupedData.map(mapNominatimToLocation(type));
      setOptions(mappedData);
      setLoading(false);
    };
    fetch();
  }, [debouncedInputValue, type]);

  return { options, loading };
};

export default useGeocode;
