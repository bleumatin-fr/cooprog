import { AutocompleteInputChangeReason } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { get } from "lodash";
import { useEffect, useState } from "react";
import { useRecordContext, useSimpleFormIteratorItem } from "react-admin";
import { useFormContext } from "react-hook-form";
import useGeocode from "../useGeocode";

export const geocode = async (q: string) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    q,
  )}&addressdetails=1&namedetails=1`;

  const response = await fetch(url);
  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.statusText);
  }
  return await response.json();
};

interface AddressAutoCompleteProps {
  label: string;
  source: string;
}

type Option = {
  id: string;
  label: string;
  [key: string]: any;
};

const AddressAutoComplete = ({ label, source }: AddressAutoCompleteProps) => {
  const [options, setOptions] = useState<Option[]>([]);
  const record = useRecordContext();
  const [value, setValue] = useState<Option | null>(null);
  const [inputValue, setInputValue] = useState("");
  const { setValue: setFormValue } = useFormContext();
  const { index } = useSimpleFormIteratorItem();
  const prefix = index !== undefined ? `locations.${index}.` : "";
  const { options: geocodeOptions } = useGeocode(inputValue, "address");

  useEffect(() => {
    if (value && value.address) {
      setFormValue(`${prefix}location.address`, value.label);
      setFormValue(`${prefix}location.data.city`, value.data.city);
      setFormValue(`${prefix}location.data.country`, value.data.country);
      setFormValue(
        `${prefix}location.data.country_code`,
        value.data.country_code,
      );
      setFormValue(`${prefix}location.data.postcode`, value.data.postcode);
      setFormValue(
        `${prefix}location.geolocation.coordinates[0]`,
        value.geolocation.coordinates[0],
      );
      console.log(
        "value.geolocation.coordinates[0]",
        value.geolocation.coordinates[0],
      );
      console.log(
        "value.geolocation.coordinates[1]",
        value.geolocation.coordinates[1],
      );
      setFormValue(
        `${prefix}location.geolocation.coordinates[1]`,
        value.geolocation.coordinates[1],
      );
    }
  }, [value]);

  useEffect(() => {
    if (!inputValue) {
      setOptions([]);
      return;
    }
    setOptions(
      geocodeOptions.map((d: any) => ({
        ...d,
        label: d.address,
        id: `${d.osm_id}`,
      })),
    );
  }, [geocodeOptions, inputValue]);

  useEffect(() => {
    const address = get(record, source);
    setInputValue(address);
    setOptions([{ id: "original", label: address }]);
    setValue({ id: "original", label: address });
  }, [record, source]);

  const handleInputChange = async (
    event: React.SyntheticEvent<Element, Event>,
    value: string,
    reason: AutocompleteInputChangeReason,
  ) => {
    setInputValue(value);
  };

  const handleChange = (
    event: React.SyntheticEvent<Element, Event>,
    value:
      | string
      | {
          id: string;
          label: string;
        }
      | null,
  ) => {
    if (typeof value === "string") return;
    setValue(value);
  };

  return (
    <Autocomplete
      options={options}
      sx={{ width: 300 }}
      filterOptions={(options) => options}
      isOptionEqualToValue={(option, value) => {
        return option.id === value.id;
      }}
      renderOption={(props, option) => {
        return (
          <li {...props} key={option.id}>
            {option.label}
          </li>
        );
      }}
      getOptionLabel={(option) =>
        typeof option === "string" ? "TEST" : option.label
      }
      inputValue={inputValue}
      value={value}
      onInputChange={handleInputChange}
      onChange={handleChange}
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
};

export default AddressAutoComplete;
