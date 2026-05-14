import { LabeledLocation } from "@cooprog/core";
import { Box, Button, InputAdornment, Stack, TextField } from "@mui/material";
import Dialog, {
  DialogContent,
  DialogTitle,
  DialogActions,
} from "@/components/UI/Dialog";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import Address, { Place } from "./register/Address";
import { v4 as uuidv4 } from "uuid";
import SearchIcon from "@mui/icons-material/TravelExplore";

interface LocationFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (location: LabeledLocation) => void;
  editingLocation: LabeledLocation | null;
}

const LocationFormDialog = ({
  open,
  onClose,
  onSubmit,
  editingLocation,
}: LocationFormDialogProps) => {
  const { t } = useTranslation();
  const [selectedPlace, setSelectedPlace] = useState<Place | undefined>();
  const [locationLabel, setLocationLabel] = useState("");
  const [address, setAddress] = useState("");
  const [isMain, setIsMain] = useState(false);

  // Reset form fields
  const resetForm = () => {
    setLocationLabel("");
    setAddress("");
    setSelectedPlace(undefined);
    setIsMain(false);
  };

  useEffect(() => {
    if (editingLocation) {
      setLocationLabel(editingLocation.label);
      setAddress(editingLocation.location.address);
      setIsMain(editingLocation.isMain);
      setSelectedPlace({
        id: 0,
        country: editingLocation.location.data.country || "",
        region: editingLocation.location.data.state || "",
        city: editingLocation.location.data.city || "",
        display_name: editingLocation.location.address,
        lat: editingLocation.location.geolocation.coordinates[1],
        lon: editingLocation.location.geolocation.coordinates[0],
        place_id: 0,
        address: editingLocation.location.data,
      });
    } else if (!open) {
      // Reset when modal is closed and not editing
      resetForm();
    }
  }, [editingLocation, open]);

  const handleSubmit = () => {
    if (!selectedPlace || !locationLabel) return;

    const location: LabeledLocation = {
      _id: editingLocation?._id || uuidv4(),
      label: locationLabel,
      isMain: isMain,
      location: {
        address: selectedPlace.display_name || "",
        geolocation: {
          type: "Point",
          coordinates: [selectedPlace.lon, selectedPlace.lat],
        },
        data: selectedPlace.address || {},
      },
    };

    onSubmit(location);
    onClose();
    resetForm();
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
        resetForm();
      }}
      fullWidth
    >
      <DialogTitle>
        {editingLocation
          ? t("common:dialogs.user-edition.edit-location")
          : t("common:dialogs.user-edition.add-location")}
      </DialogTitle>
      <DialogContent sx={{ minWidth: 550 }}>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            label={t("common:dialogs.user-edition.location-label")}
            placeholder={t(
              "common:dialogs.user-edition.location-label-placeholder",
            )}
            value={locationLabel}
            onChange={(e) => setLocationLabel(e.target.value)}
            fullWidth
            required
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Address
              onChange={(values) => {
                setSelectedPlace(values.place);
                setAddress(values.address);
              }}
              value={{
                place: selectedPlace,
                address: address,
              }}
              touched={{}}
              errors={{}}
              loading={false}
              textFieldProps={{
                label: t("common:dialogs.user-edition.location"),
                placeholder: t(
                  "common:dialogs.user-edition.location-placeholder",
                ),
                InputLabelProps: { shrink: true },
                InputProps: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
                required: true,
              }}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Button
          onClick={() => {
            onClose();
            resetForm();
          }}
        >
          {t("common:cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!selectedPlace || !locationLabel}
        >
          {editingLocation ? t("common:save") : t("common:add")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationFormDialog;
