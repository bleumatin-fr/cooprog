import { useState, useEffect, useMemo } from "react";
import {
  Autocomplete,
  TextField,
  InputAdornment,
  CircularProgress,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
} from "@mui/material";
import useGeocode from "@/components/useGeocode";
import { Location, Place } from "@cooprog/core";
import { useTranslation } from "next-i18next";
import SearchIcon from "@mui/icons-material/TravelExplore";

export const removeDiacritics = (value: string) => {
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

const getPlace = (location: Location): Place => {
  return {
    id: location._id || "",
    country: location.data.country || "",
    region: location.data.state || location.data.county || "",
    city:
      location.data.city ||
      location.data.town ||
      location.data.village ||
      location.data.municipality ||
      "",
    geolocation: {
      coordinates: location.geolocation.coordinates as [number, number],
    },
  };
};

interface AddressAutocompleteProps {
  id?: string;
  name?: string;
  onChange: (value: Place | Place[] | null) => void;
  value?: Place | Place[];
  error: boolean;
  multiple?: boolean;
  label?: string;
  helperText?: string;
  required?: boolean;
}

const AddressAutocomplete = ({
  id,
  name,
  onChange,
  value = [],
  error,
  multiple = true,
  label,
  helperText,
  required = false,
}: AddressAutocompleteProps) => {
  const [placeOptions, setPlaceOptions] = useState<Place[]>([]);
  const [inputValue, setInputValue] = useState("");
  const { t } = useTranslation();
  const { options: geocodeOptions, loading } = useGeocode(inputValue, "city");

  // Convert value to array format for internal use
  const selectedPlaces = useMemo(() => {
    return Array.isArray(value) ? value : value ? [value] : [];

    // we want compare by value and not by reference,
    // so if the value is the same, we should return the same array and avoid re-rendering
  }, [JSON.stringify(value)]);

  useEffect(() => {
    setPlaceOptions(
      geocodeOptions.map((location: Location) => getPlace(location))
    );
  }, [geocodeOptions, inputValue]);

  const getOptionLabel = (option: Place) => {
    return [option.city, option.region, option.country]
      .filter(Boolean)
      .join(", ");
  };

  return (
    <Autocomplete
      id={id}
      multiple={multiple}
      isOptionEqualToValue={(option, selected) =>
        String(option.id) === String(selected.id)
      }
      options={placeOptions}
      filterOptions={(options) => options}
      value={multiple ? selectedPlaces : selectedPlaces[0] || null}
      getOptionLabel={(option) => getOptionLabel(option)}
      // filterOptions removed for now
      onInputChange={(event, value) => {
        setInputValue(value);
      }}
      onChange={(event, value) => {
        const newValue = multiple
          ? Array.isArray(value)
            ? value
            : []
          : value || null;
        onChange(newValue);
      }}
      PaperComponent={({ children, ...props }) => (
        <Paper
          {...props}
          sx={{ maxHeight: 300, overflowY: "auto", width: "100%" }}
        >
          {children}
        </Paper>
      )}
      renderOption={(props, option, { selected }) => {
        const region = option.region;
        const mainLabel = option.city;
        const secondaryLabel = option.country;

        return (
          <ListItem {...props} key={option.id} disablePadding>
            <ListItemText
              primary={region ? `${mainLabel}, ${region}` : mainLabel}
              secondary={secondaryLabel}
            />
          </ListItem>
        );
      }}
      renderInput={(params) => (
        <TextField
          name={name}
          {...params}
          error={error}
          label={label}
          helperText={helperText}
          required={required}
          InputProps={{
            ...params.InputProps,
            startAdornment: [
              <InputAdornment position="start">
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  style={{ pointerEvents: "none" }}
                >
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : (
                    <SearchIcon />
                  )}
                </Box>
              </InputAdornment>,
              params.InputProps.startAdornment,
            ],
            endAdornment: undefined,
          }}
        />
      )}
    />
  );
};

export default AddressAutocomplete;
