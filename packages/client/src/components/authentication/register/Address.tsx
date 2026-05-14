import styled from "@emotion/styled";
import { useState } from "react";

import {
  TextFieldProps,
  Popper,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Divider,
  FormHelperText,
} from "@mui/material";

import { GeocodeAddress, Location } from "@cooprog/core";

import TextField from "@/components/TextField";

import Map from "./Map";

import { useTranslation } from "next-i18next";
import { useRef, useEffect } from "react";
import useGeocode from "@/components/useGeocode";
import { FormikErrors, FormikTouched } from "formik";
import Markdown from "@/components/UI/Markdown";

const TextContainer = styled.div`
  max-width: 80%;
  margin: 20px auto;

  p {
    text-align: center !important;
  }
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
`;

const ResultsContainer = styled.div`
  display: flex;
  width: 100%;
  gap: 16px;
  > * {
    flex: 1;
  }
`;

const RadioGroupWrapper = styled.div`
  overflow-y: auto;
`;

const RequiredFieldsNote = styled.div`
  font-size: 12px;
  position: absolute;
  right: 16px;
  bottom: 4px;
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 1000;
  padding: 16px;
  padding-bottom: 22px;
`;

// Redefine Place for UI needs
export interface Place {
  id: number;
  country: string;
  region: string;
  city: string;
  lat: number;
  lon: number;
  place_id: number;
  display_name: string | undefined;
  address: GeocodeAddress | undefined;
}

export type Places = Place[];

// Function to convert Location to Place
export const convertLocationToPlace = (location?: Location) => {
  const [lon, lat] = location?.geolocation?.coordinates || [];
  const address = location?.data || {};
  return {
    id: parseInt(location?._id || "0"),
    country: address.country || "",
    region: address.state || address.county || "",
    city:
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      "",
    lat,
    lon,
    postcode: address.postcode || "",
    place_id: parseInt(location?._id || "0"),
    display_name: location?.address,
    address: location?.data,
  };
};

export interface AddressValues {
  place: Place | undefined;
  address: string;
}

interface AddressProps {
  value: AddressValues;
  onChange: (values: AddressValues) => void;
  touched: FormikTouched<AddressValues>;
  errors: FormikErrors<AddressValues>;
  loading: boolean;
  textFieldProps?: TextFieldProps;
}

const Address = ({
  value,
  onChange,
  touched,
  errors,
  loading,
  textFieldProps,
}: AddressProps) => {
  const { t } = useTranslation();
  const [suggestedPlaces, setSuggestedPlaces] = useState<Place[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const textFieldRef = useRef<HTMLDivElement>(null);
  const { options: geocodeOptions, loading: isLoading } = useGeocode(
    value.address,
    "address",
  );

  // ADDRESS
  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, address: event.target.value });
    setDropdownOpen(true);
  };

  // Update suggestions when geocodeOptions change
  useEffect(() => {
    if (value.address && geocodeOptions.length > 0) {
      const convertedPlaces = geocodeOptions.map(convertLocationToPlace);
      setSuggestedPlaces(convertedPlaces);
      setDropdownOpen(true);
      setHighlightedIndex(0);
    } else {
      setSuggestedPlaces([]);
      setDropdownOpen(false);
    }
  }, [geocodeOptions, value.address]);

  // DIFFERENT PLACES
  const handleChangeSelectedPlace = (index: number) => {
    const selectedPlaceTemp = suggestedPlaces[index];
    onChange({
      ...value,
      place: selectedPlaceTemp,
      address: selectedPlaceTemp.display_name || "",
    });
    setDropdownOpen(false);
  };

  const handleEnterKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      event.key === "Enter" &&
      dropdownOpen &&
      suggestedPlaces.length > 0 &&
      highlightedIndex >= 0
    ) {
      handleChangeSelectedPlace(highlightedIndex);
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (event.key === "ArrowDown") {
      setDropdownOpen(true);
      setHighlightedIndex((prev) =>
        Math.min(prev + 1, suggestedPlaces.length - 1),
      );
    }
    if (event.key === "ArrowUp") {
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  return (
    <FormContainer>
      <TextContainer>
        <Markdown>{t("authentication:address.information")}</Markdown>
      </TextContainer>
      <Divider />
      <div style={{ position: "relative" }}>
        <TextField
          {...textFieldProps}
          label={textFieldProps?.label || t("authentication:address")}
          error={touched.place && Boolean(errors.place)}
          fullWidth
          value={value.address}
          onChange={handleAddressChange}
          onKeyDown={handleEnterKey}
          ref={textFieldRef}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          InputProps={{
            ...textFieldProps?.InputProps,
            endAdornment: isLoading ? <CircularProgress size={20} /> : null,
          }}
        />
        <FormHelperText>
          <Markdown>
            {t("authentication:address.information-helper-text")}
          </Markdown>
        </FormHelperText>
        <Popper
          open={dropdownOpen && suggestedPlaces.length > 0}
          anchorEl={textFieldRef.current}
          placement="bottom-start"
          style={{
            zIndex: 10001,
            width: textFieldRef.current?.offsetWidth || "100%",
          }}
        >
          <Paper
            elevation={3}
            sx={{
              maxHeight: 300,
              overflowY: "auto",
              width: "100%",
            }}
          >
            <List>
              {suggestedPlaces.map((suggestion, idx) => {
                // Try to show city, state, country, or fallback to a short display_name
                const address = suggestion.address || {};
                const region = address.state || address.county || "";
                const mainLabel =
                  suggestion.display_name ||
                  address.city ||
                  address.town ||
                  address.village ||
                  address.municipality ||
                  address.state ||
                  address.county ||
                  address.country;
                const secondaryLabel = !suggestion.display_name
                  ? address.country && mainLabel !== address.country
                    ? address.country
                    : undefined
                  : undefined;
                return (
                  <ListItem
                    key={suggestion.place_id}
                    disablePadding
                    onMouseDown={() => handleChangeSelectedPlace(idx)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                  >
                    <ListItemButton
                      selected={
                        idx === highlightedIndex ||
                        suggestion.place_id === value.place?.place_id
                      }
                    >
                      <ListItemText
                        primary={region ? `${mainLabel}, ${region}` : mainLabel}
                        secondary={secondaryLabel}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Popper>
      </div>
      <Map
        places={suggestedPlaces}
        selected={value.place}
        setSelected={(place) => onChange({ ...value, place: place as Place })}
        defaultZoom={1}
      />
    </FormContainer>
  );
};

export default Address;
