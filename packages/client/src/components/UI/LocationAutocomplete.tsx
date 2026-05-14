import { useState, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  InputAdornment,
  CircularProgress,
  Box,
  IconButton,
} from "@mui/material";
import useGeocode from "@/components/useGeocode";
import { useTranslation } from "next-i18next";
import { Location } from "@cooprog/core";
import SearchIcon from "@mui/icons-material/TravelExplore";
import CloseIcon from "@mui/icons-material/Close";

const extractLocation = (
  location: Location,
  locationType: "city" | "region" | "country"
): string => {
  switch (locationType) {
    case "city":
      return (
        location.data.city ||
        location.data.town ||
        location.data.village ||
        location.data.municipality ||
        ""
      );
    case "region":
      return location.data.county || location.data.state || "";
    case "country":
      return location.data.country || "";
    default:
      return "";
  }
};

interface LocationAutocompleteProps {
  onChange: (value: string[]) => void;
  initialPlaces?: string[];
  label?: string;
  locationType: "city" | "region" | "country";
  geocodingOptions?: any;
}

const LocationAutocomplete = ({
  onChange,
  initialPlaces = [],
  locationType,
  label,
  geocodingOptions,
}: LocationAutocompleteProps) => {
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string | null>(
    initialPlaces[0] ?? null
  );
  const [inputValue, setInputValue] = useState("");
  const { t } = useTranslation();
  const { options: geocodeOptions, loading } = useGeocode(
    inputValue,
    locationType,
    geocodingOptions
  );

  useEffect(() => {
    if (!inputValue) {
      setLocationOptions([]);
      return;
    }
    setLocationOptions(
      geocodeOptions
        .map((location: Location) => extractLocation(location, locationType))
        .filter(Boolean)
    );
  }, [geocodeOptions, inputValue, locationType]);

  return (
    <Autocomplete
      // multiple
      options={locationOptions}
      value={selectedLocations}
      getOptionLabel={(option) => option}
      filterOptions={(x) => x}
      onInputChange={(event, value) => setInputValue(value)}
      onChange={(event, value) => {
        setSelectedLocations(value);
        onChange(value ? [value] : []);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          sx={{
            "& .MuiInputBase-root": {
              paddingRight: "22px !important",
            },
          }}
          InputProps={{
            ...params.InputProps,
            startAdornment: [
              <InputAdornment position="start">
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : (
                  <SearchIcon fontSize="small" />
                )}
              </InputAdornment>,
              params.InputProps.startAdornment,
            ],
            endAdornment: (
              <>
                {selectedLocations || inputValue ? (
                  <IconButton
                    aria-label="clear"
                    size="medium"
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLocations(null);
                      setInputValue("");
                      onChange([]);
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                ) : null}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default LocationAutocomplete;
