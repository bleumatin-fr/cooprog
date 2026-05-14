import {
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  InputAdornment,
  Slider,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Dialog, {
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@/components/UI/Dialog";

import SearchIcon from "@mui/icons-material/Search";

import styled from "@emotion/styled";
import TuneIcon from "@mui/icons-material/Tune";
import { useTranslation } from "next-i18next";
import { ChangeEvent, useState, useMemo, useEffect } from "react";
import ShowMapSwitcher from "@/components/projects/ShowMapSwitcher";

import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import DisciplineSelector from "@/components/projects/DisciplineSelector";
import SelectableChipGroup, {
  ChipStyle,
} from "@/components/UI/SelectableChipGroup";
import LocationAutocomplete from "@/components/UI/LocationAutocomplete";
import { Discipline, Role, StructureType } from "@cooprog/core";
import useDiscipline from "@/components/layout/useDiscipline";
import useGenres from "@/components/projects/useGenres";
import useUser from "../authentication/useUser";

const Container = styled.div`
  display: flex;
  width: auto;
  flex-direction: column;
  flex-grow: 1;
  gap: 16px;
`;

const TopRow = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const BottomRow = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 16px;
`;

const Left = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

const FilterTitle = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  margin-right: 16px;
  color: #333;
  margin-bottom: 16px;
`;

const FilterDescription = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 8px;
`;

const MapSwitcherContainer = styled.div`
  display: flex;
  justify-self: flex-end;
  gap: 8px;
`;

interface UsersSearchBarProps {
  searchText: string;
  onSearchTextChange: (searchText: string) => void;
  following: boolean | null;
  setFollowing: (following: boolean | null) => void;
  followers: boolean | null;
  setFollowers: (followers: boolean | null) => void;
  distanceMax: number | null;
  setDistanceMax: (distance: number | null) => void;
  showMap: boolean;
  setShowMap: (showMap: boolean) => void;
  usersCount: number;
  genres?: string[];
  setGenres: (genres: string[]) => void;
  structureTypes?: string[];
  setStructureTypes: (structureTypes: string[]) => void;
  role: Role;
  countries: string[];
  setCountries: (countries: string[]) => void;
  regions: string[];
  setRegions: (regions: string[]) => void;
  cities: string[];
  setCities: (cities: string[]) => void;
}

const UsersSearchBar = ({
  searchText,
  onSearchTextChange,
  following,
  setFollowing,
  followers,
  setFollowers,
  distanceMax,
  setDistanceMax,
  showMap,
  setShowMap,
  usersCount,
  genres,
  setGenres,
  structureTypes,
  setStructureTypes,
  role,
  countries,
  setCountries,
  regions,
  setRegions,
  cities,
  setCities,
}: UsersSearchBarProps) => {
  const { t } = useTranslation(["common", "users"]);
  const [sliderKey, setSliderKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { selectedDiscipline, setSelectedDiscipline } = useDiscipline();
  const { user } = useUser();
  const userRole = user?.role;

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));
  const tablet = useMediaQuery(theme.breakpoints.down("md"));

  // Récupérer les genres directement depuis les traductions
  const availableGenres = useGenres();

  // Récupérer les types de structure depuis les traductions
  const STRUCTURE_TYPES = useMemo(() => {
    return {
      [StructureType.VENUE]: t("users:structureTypes.venue"),
      [StructureType.FESTIVAL]: t("users:structureTypes.festival"),
      [StructureType.ITINERANT]: t("users:structureTypes.itinerant"),
    };
  }, [t]);

  // Styles pour les types de structure
  const structureTypesStyles = useMemo(() => {
    const styles: Record<string, ChipStyle> = {
      [StructureType.VENUE]: {
        backgroundColor: "#F2EDFF",
        color: "#555555",
        icon: "venue",
        usePrimaryColor: false,
      },
      [StructureType.FESTIVAL]: {
        backgroundColor: "#F2EDFF",
        color: "#555555",
        icon: "festival",
        usePrimaryColor: false,
      },
      [StructureType.ITINERANT]: {
        backgroundColor: "#F2EDFF",
        color: "#555555",
        icon: "itinerant",
        usePrimaryColor: false,
      },
    };
    return styles;
  }, []);

  // Création des styles pour les genres basés sur les propriétés complètes
  const genresStyles = useMemo(() => {
    const styles: Record<string, ChipStyle> = {};

    Object.keys(availableGenres).forEach((key) => {
      const props = availableGenres.find((genre) => genre.id === key);
      styles[key] = {
        backgroundColor: props?.backgroundColor || "#F2EDFF",
        color: props?.color || "#555555",
        icon: props?.icon || "music",
        usePrimaryColor: false,
      };
    });

    return styles;
  }, [availableGenres]);

  const maxRange = 500;

  const filtersCount = [
    distanceMax !== null,
    following,
    followers,
    (genres || []).length > 0,
    (structureTypes || []).length > 0,
    countries.length > 0,
    regions.length > 0,
    cities.length > 0,
  ].filter((filter) => filter).length;

  const handleClear = () => {
    setFollowers(null);
    setFollowing(null);
    setDistanceMax(null);
    setSliderKey(sliderKey + 1);
    setGenres([]);
    setStructureTypes([]);
    setCountries([]);
    setRegions([]);
    setCities([]);
  };

  const handleDistanceUnlimitedChanged = (
    event: ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    setDistanceMax(checked ? null : maxRange);
  };

  useEffect(() => {
    // onSearchTextChange("");
  }, [role]);

  return (
    <Container>
      <TopRow>
        <Left>
          <DisciplineSelector
            value={selectedDiscipline}
            setValue={setSelectedDiscipline}
          />
        </Left>
        <MapSwitcherContainer>
          {userRole !== Role.ARTISTIC_TEAM && (
            <Badge badgeContent={filtersCount} color="primary">
              <Button
                onClick={() => setDialogOpen(true)}
                color={filtersCount > 0 ? "primary" : "secondary"}
                variant="outlined"
                size="large"
                startIcon={<TuneIcon />}
                sx={{
                  height: 56,
                  backgroundColor: "white",
                  "& .MuiButton-startIcon": {
                    margin: mobile || tablet ? 0 : undefined,
                  },
                }}
              >
                {mobile || tablet ? null : t("users:filters.filters")}
              </Button>
            </Badge>
          )}
          <ShowMapSwitcher value={showMap} onChange={setShowMap} />
        </MapSwitcherContainer>
      </TopRow>
      <BottomRow>
        <FormControl fullWidth color="primary" sx={{ flexGrow: 1 }}>
          <TextField
            name={`users-search-${role}`}
            placeholder={t("users:filters.search")}
            size="medium"
            sx={{ backgroundColor: "white" }}
            value={searchText}
            onChange={(event) => {
              onSearchTextChange(event.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </FormControl>
      </BottomRow>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        showCloseButton={true}
      >
        <DialogTitle>{t("users:filters.filters")}</DialogTitle>
        <DialogContent sx={{ minWidth: 500 }}>
          <FilterTitle>{t("users:filters.distance")}</FilterTitle>
          <FilterDescription>
            {t("users:filters.distance-helper")}
          </FilterDescription>

          <FormControl
            sx={{
              marginTop: 4,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
            size="small"
            color="primary"
            fullWidth
          >
            <Slider
              min={0}
              key={sliderKey}
              max={maxRange}
              value={distanceMax || maxRange}
              aria-label={t("users:filters.distance")}
              valueLabelFormat={(value) => `${value} km`}
              valueLabelDisplay="on"
              onChange={(event, value) => setDistanceMax(value as number)}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={distanceMax === null}
                  onChange={handleDistanceUnlimitedChanged}
                />
              }
              label={t("users:filters.distance-unlimited")}
            />
          </FormControl>

          <Divider sx={{ my: 2 }} />

          <FilterTitle>{t("users:filters.place")}</FilterTitle>
          <FilterDescription style={{ marginBottom: "12px" }}>
            {t("users:filters.place-helper")}
          </FilterDescription>

          <Box sx={{ display: "flex", flexDirection: "column", rowGap: 1 }}>
            <LocationAutocomplete
              onChange={setCountries}
              initialPlaces={countries}
              locationType="country"
              label={t("users:filters.place-country-label")}
            />

            <LocationAutocomplete
              onChange={setRegions}
              initialPlaces={regions}
              geocodingOptions={{
                searchKey: "state",
                country: countries,
              }}
              locationType="region"
              label={t("users:filters.place-region-label")}
            />

            <LocationAutocomplete
              onChange={setCities}
              initialPlaces={cities}
              locationType="city"
              geocodingOptions={{
                searchKey: "city",
                country: countries,
                state: regions,
              }}
              label={t("users:filters.place-city-label")}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <FilterTitle>{t("users:filters.followers")}</FilterTitle>
          <FilterDescription>
            {t("users:filters.followers-helper")}
          </FilterDescription>

          <FormControl sx={{ m: 1 }} size="small" color="primary">
            <Button
              variant="outlined"
              color={followers ? "primary" : "secondary"}
              onClick={() => setFollowers(!followers)}
              startIcon={followers ? <StarIcon /> : <StarOutlineIcon />}
              size="small"
            >
              {t("users:filters.followers")}
            </Button>
          </FormControl>

          <Divider sx={{ my: 2 }} />

          <FilterTitle>{t("users:filters.following")}</FilterTitle>
          <FilterDescription>
            {t("users:filters.following-helper")}
          </FilterDescription>

          <FormControl sx={{ m: 1 }} size="small" color="primary">
            <Button
              variant="outlined"
              color={following ? "primary" : "secondary"}
              onClick={() => setFollowing(!following)}
              startIcon={following ? <StarIcon /> : <StarOutlineIcon />}
              size="small"
            >
              {t("users:filters.following")}
            </Button>
          </FormControl>

          {role === Role.DIFFUSION_STRUCTURE && (
            <>
              <Divider sx={{ my: 2 }} />

              <FilterTitle>{t("users:filters.programmedGenres")}</FilterTitle>
              <FilterDescription>
                {t("users:filters.programmedGenresHelper")}
              </FilterDescription>

              <FormControl sx={{ m: 1 }} size="small" color="primary">
                <SelectableChipGroup
                  id="genres"
                  name="genres"
                  label=""
                  items={availableGenres
                    .filter((genre) => genre.discipline === selectedDiscipline)
                    .reduce(
                      (acc, genre) => {
                        acc[genre.id] = genre.name;
                        return acc;
                      },
                      {} as Record<string, string>,
                    )}
                  selectedItems={genres || []}
                  onChange={(selected) => setGenres(selected)}
                  chipStyles={genresStyles}
                  showIcons={true}
                />
              </FormControl>
            </>
          )}

          {selectedDiscipline === Discipline.MUSIC &&
            role === Role.DIFFUSION_STRUCTURE && (
              <>
                <Divider sx={{ my: 2 }} />

                <FilterTitle>{t("users:filters.structureTypes")}</FilterTitle>
                <FilterDescription>
                  {t("users:filters.structureTypesHelper")}
                </FilterDescription>

                <FormControl sx={{ m: 1 }} size="small" color="primary">
                  <SelectableChipGroup
                    id="structureTypes"
                    name="structureTypes"
                    label=""
                    items={STRUCTURE_TYPES}
                    selectedItems={structureTypes || []}
                    onChange={(selected) => setStructureTypes(selected)}
                    chipStyles={structureTypesStyles}
                    showIcons={true}
                  />
                </FormControl>
              </>
            )}

          {selectedDiscipline === Discipline.PERFORMING_ARTS && <></>}
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <Button onClick={handleClear}>{t("users:filters.clear")}</Button>
          <Button
            color="primary"
            variant="contained"
            onClick={() => setDialogOpen(false)}
          >
            {t("users:filters.submit", { count: usersCount })}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UsersSearchBar;
