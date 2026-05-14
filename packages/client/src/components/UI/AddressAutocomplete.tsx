import { Autocomplete, TextField, TextFieldProps } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import RoomOutlined from "@mui/icons-material/RoomOutlined";
import { Location } from "@cooprog/core";

export interface GeocodeAddress {
  county: string;
  city: string;
  city_district: string;
  construction: string;
  continent: string;
  country: string;
  country_code: string;
  house_number: string;
  neighbourhood: string;
  postcode: string;
  public_building: string;
  state: string;
  suburb: string;
}

export interface NominatimResponse {
  address: GeocodeAddress;
  boundingbox: string[];
  class: string;
  display_name: string;
  importance: number;
  lat: string;
  licence: string;
  lon: string;
  osm_id: string;
  osm_type: string;
  place_id: string;
  svg: string;
  type: string;
  extratags: any;
}

type AddressAutocompleteProps = Omit<TextFieldProps, "value" | "onChange"> & {
  value: Location | null;
  onChange: (value: Location | null) => void;
};

const AddressAutocomplete = ({
  label,
  placeholder,
  value: valueProp,
  onChange,
  disabled,
  ...rest
}: AddressAutocompleteProps) => {
  const [inputValue, setInputValue] = useState(valueProp?.address || "");
  const [value, setValue] = useState<Location | null>(valueProp);
  const [debouncedInputValue] = useDebounceValue(inputValue, 500);
  const defaultOptions = useMemo(
    () => (valueProp ? [valueProp] : []),
    [valueProp]
  );
  const [options, setOptions] = useState<readonly Location[]>(defaultOptions);

  useEffect(() => {
    let active = true;

    if (debouncedInputValue === "") {
      setOptions(value ? [value] : []);
      return undefined;
    }
    (async () => {
      const addressResult = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${debouncedInputValue}}&addressdetails=1&namedetails=1`
      );
      if (active) {
        const data = (await addressResult.json()) as NominatimResponse[];
        setOptions([
          ...defaultOptions,
          ...data.map((d) => ({
            address: d.display_name,
            geolocation: {
              type: "Point" as "Point",
              coordinates: [parseFloat(d.lon), parseFloat(d.lat)],
            },
            data: d.address,
          })),
        ]);
      }
    })();

    return () => {
      active = false;
    };
  }, [value, debouncedInputValue, defaultOptions]);

  return (
    <Autocomplete
      filterOptions={(x) => x}
      autoComplete
      value={value}
      inputValue={inputValue}
      onInputChange={(event, newInputValue, reason) => {
        if (reason === "reset") return;
        setInputValue(newInputValue);
      }}
      getOptionLabel={(option) => {
        if (typeof option === "string") {
          return option;
        }
        return option.address;
      }}
      getOptionKey={(option) => {
        return JSON.stringify(option);
      }}
      onChange={(event: any, newValue: string | Location | null) => {
        if (typeof newValue === "string") {
          return;
        }
        setOptions(newValue ? [newValue, ...options] : options);
        setValue(newValue);
        onChange(newValue);
        setInputValue(newValue?.address || "");
      }}
      options={options}
      filterSelectedOptions
      disabled={disabled}
      renderInput={({ ...params }) => (
        <TextField
          {...params}
          label={label}
          fullWidth
          InputLabelProps={{ shrink: true }}
          placeholder={placeholder}
          hiddenLabel
          InputProps={{
            ...params.InputProps,
            startAdornment: <RoomOutlined />,
            endAdornment: null,
          }}
          disabled={disabled}
          {...rest}
        />
      )}
      fullWidth
    />
  );
};

export default AddressAutocomplete;
