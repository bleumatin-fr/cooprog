import TextField from "@/components/TextField";
import styled from "@emotion/styled";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputAdornment,
  Slider,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Dialog, {
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@/components/UI/Dialog";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TFunction, useTranslation } from "next-i18next";
import { ChangeEvent, useEffect, useState } from "react";
import useUser from "@/components/authentication/useUser";
import LocationAutocomplete from "@/components/UI/LocationAutocomplete";
import MultipleAutocomplete from "@/components/UI/MultipleAutocomplete";
import SelectableChipGroup from "@/components/UI/SelectableChipGroup";
import { Discipline, Role } from "@cooprog/core";
import DisciplineSelector from "./DisciplineSelector";
import ShowMapSwitcher from "./ShowMapSwitcher";
import EmergingArtistSwitch from "@/components/UI/EmergingArtistSwitch";
import CulturalActionSwitch from "@/components/UI/CulturalActionSwitch";
import useConfiguration from "@/components/useConfiguration";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import HearingDisabledOutlinedIcon from "@mui/icons-material/HearingDisabledOutlined";
import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import useDiscipline from "@/components/layout/useDiscipline";
import useTargetAudiences from "./useTargetAudiences";
import useGenres from "./useGenres";

// Création des switchs personnalisés avec icônes

const Container = styled.div`
  display: flex;
  width: auto;
  flex-direction: column;
`;

const TopRow = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
`;

const RightControls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BottomRow = styled.div`
  display: flex;
  width: 100%;
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

const DisciplineGroup = styled.div`
  display: flex;
  gap: 8px;
  background: #f5f5f5;
  padding: 0;
  position: relative;
  overflow: visible;
`;

interface SearchBarProps {
  searchText?: string;
  onTextChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  artist: string;
  setArtist: (artist: string) => void;
  work: string;
  setWork: (work: string) => void;
  countries: string[];
  setCountries: (countries: string[]) => void;
  regions: string[];
  setRegions: (regions: string[]) => void;
  cities: string[];
  setCities: (cities: string[]) => void;
  selectedGenres: string[];
  setSelectedGenres: (genres: string[]) => void;
  selectedTargetAudiences: string[];
  setSelectedTargetAudiences: (targetAudiences: string[]) => void;
  selectedGauge: string[];
  setSelectedGauge: (gauge: string[]) => void;
  selectedMinimumStageSize: string[];
  setSelectedMinimumStageSize: (size: string[]) => void;
  selectedAveragePerformanceFee: string[];
  setSelectedAveragePerformanceFee: (fee: string[]) => void;
  selectedVenueConfigurationType: string[];
  setSelectedVenueConfigurationType: (type: string[]) => void;
  selectedVenueConfigurationSpace: string[];
  setSelectedVenueConfigurationSpace: (space: string[]) => void;
  selectedVenueConfigurationAudience: string[];
  setSelectedVenueConfigurationAudience: (audience: string[]) => void;
  selectedPerformanceLanguages: string[];
  setSelectedPerformanceLanguages: (languages: string[]) => void;
  minimumPeopleOnTour: number | undefined;
  setMinimumPeopleOnTour: (number: number | undefined) => void;
  maximumPeopleOnTour: number | undefined;
  setMaximumPeopleOnTour: (number: number | undefined) => void;
  minimumArtistOnStage: number | undefined;
  setMinimumArtistOnStage: (number: number | undefined) => void;
  maximumArtistOnStage: number | undefined;
  setMaximumArtistOnStage: (number: number | undefined) => void;
  minGenderPercentage: number | undefined;
  setMinGenderPercentage: (percentage: number | undefined) => void;
  maxGenderPercentage: number | undefined;
  setMaxGenderPercentage: (percentage: number | undefined) => void;
  minGenderType: string | undefined;
  setMinGenderType: (type: string | undefined) => void;
  maxGenderType: string | undefined;
  setMaxGenderType: (type: string | undefined) => void;
  favorite: boolean;
  setFavorite: (favorite: boolean) => void;
  dateMin?: Date | null;
  dateMax?: Date | null;
  distanceMax?: number | null;
  setDateMin: (date: Date | null) => void;
  setDateMax: (date: Date | null) => void;
  setDistanceMax: (distance: number | null) => void;
  showMap: boolean;
  setShowMap: (showMap: boolean) => void;
  projectCount: number;
  selectedPublished: boolean | undefined;
  setSelectedPublished: (published: boolean | undefined) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  emergingArtist: boolean;
  setEmergingArtist: (emergingArtist: boolean) => void;
  culturalActionInterest: boolean;
  setCulturalActionInterest: (culturalActionInterest: boolean) => void;
  accessibilityVisual: boolean;
  setAccessibilityVisual: (accessibilityVisual: boolean) => void;
  accessibilityAudio: boolean;
  setAccessibilityAudio: (accessibilityAudio: boolean) => void;
  filtersDisabled: boolean;
}

const getProperties = (labelKey: string, t: TFunction) => {
  const items = t(labelKey, { returnObjects: true }) as Record<string, string>;
  return items;
};

const getNameProperties = (labelKey: string, t: TFunction) => {
  const items = t(labelKey, { returnObjects: true }) as Record<
    string,
    { name: string }
  >;
  return Object.fromEntries(Object.keys(items).map((k) => [k, items[k].name]));
};

const SearchBar = ({
  searchText,
  onTextChange,
  artist,
  setArtist,
  work,
  setWork,
  countries,
  setCountries,
  regions,
  setRegions,
  cities,
  setCities,
  selectedGenres,
  setSelectedGenres,
  selectedTargetAudiences,
  setSelectedTargetAudiences,
  selectedGauge,
  setSelectedGauge,
  selectedMinimumStageSize,
  setSelectedMinimumStageSize,
  selectedAveragePerformanceFee,
  setSelectedAveragePerformanceFee,
  selectedVenueConfigurationType,
  setSelectedVenueConfigurationType,
  selectedVenueConfigurationSpace,
  setSelectedVenueConfigurationSpace,
  selectedVenueConfigurationAudience,
  setSelectedVenueConfigurationAudience,
  selectedPerformanceLanguages,
  setSelectedPerformanceLanguages,
  minimumPeopleOnTour,
  setMinimumPeopleOnTour,
  maximumPeopleOnTour,
  setMaximumPeopleOnTour,
  minimumArtistOnStage,
  setMinimumArtistOnStage,
  maximumArtistOnStage,
  setMaximumArtistOnStage,
  minGenderPercentage,
  setMinGenderPercentage,
  maxGenderPercentage,
  setMaxGenderPercentage,
  minGenderType,
  setMinGenderType,
  maxGenderType,
  setMaxGenderType,
  favorite,
  setFavorite,
  dateMin,
  dateMax,
  distanceMax,
  setDateMin,
  setDateMax,
  setDistanceMax,
  showMap,
  setShowMap,
  projectCount,
  selectedPublished,
  setSelectedPublished,
  showFilters,
  setShowFilters,
  emergingArtist,
  setEmergingArtist,
  culturalActionInterest,
  setCulturalActionInterest,
  accessibilityVisual,
  setAccessibilityVisual,
  accessibilityAudio,
  setAccessibilityAudio,
  filtersDisabled,
}: SearchBarProps) => {
  const { t } = useTranslation();
  const { configuration } = useConfiguration();
  const { user } = useUser();
  const [sliderKey, setSliderKey] = useState(0);
  const [open, setOpen] = useState(false);
  const [filtersCount, setFiltersCount] = useState(0);
  const { selectedDiscipline, setSelectedDiscipline } = useDiscipline();
  const isMusicSelected = selectedDiscipline === Discipline.MUSIC;

  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));
  const tablet = useMediaQuery(theme.breakpoints.down("md"));
  const laptop = useMediaQuery(theme.breakpoints.down("lg"));

  useEffect(() => {
    // Réinitialiser les filtres qui dépendent de la discipline lorsqu'elle change
    if (selectedDiscipline) {
      setSelectedGauge([]);
      setSelectedMinimumStageSize([]);
      setSelectedAveragePerformanceFee([]);
    }
  }, [
    selectedDiscipline,
    setSelectedGauge,
    setSelectedMinimumStageSize,
    setSelectedAveragePerformanceFee,
  ]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const maxRange = 500;

  const filtersCountArray = [
    artist.length > 0,
    work.length > 0,
    countries.length > 0,
    regions.length > 0,
    cities.length > 0,
    selectedGenres.length > 0,
    selectedTargetAudiences.length > 0,
    selectedGauge.length > 0,
    selectedMinimumStageSize.length > 0,
    selectedAveragePerformanceFee.length > 0,
    selectedVenueConfigurationType.length > 0,
    selectedVenueConfigurationSpace.length > 0,
    selectedVenueConfigurationAudience.length > 0,
    selectedPerformanceLanguages.length > 0,
    minimumPeopleOnTour !== undefined,
    maximumPeopleOnTour !== undefined,
    minimumArtistOnStage !== undefined,
    maximumArtistOnStage !== undefined,
    minGenderPercentage !== undefined && minGenderType !== undefined,
    maxGenderPercentage !== undefined && maxGenderType !== undefined,
    false,
    selectedPublished !==
      (user?.role === Role.ARTISTIC_TEAM ? undefined : true),
    dateMin !== null,
    dateMax !== null,
    distanceMax !== null,
    favorite,
    emergingArtist,
    culturalActionInterest,
    accessibilityVisual,
    accessibilityAudio,
  ];

  useEffect(() => {
    setFiltersCount(filtersCountArray.filter((filter) => filter).length);
  }, [filtersCountArray]);

  const genres = useGenres();
  const targetAudiences = useTargetAudiences();
  const gaugeItems = getProperties("projects:gauges", t);
  const minimumStageSizeItems = getProperties("projects:minimumStageSizes", t);
  const averagePerformanceFeeItems = getProperties(
    "projects:averagePerformanceFees",
    t
  );
  const venueConfigurationTypeItems = getProperties(
    "projects:venueConfigurationTypes",
    t
  );
  const venueConfigurationSpaceItems = getProperties(
    "projects:venueConfigurationSpaces",
    t
  );
  const venueConfigurationAudienceItems = getProperties(
    "projects:venueConfigurationAudiences",
    t
  );
  const performanceLanguagesItems = getProperties(
    "projects:performanceLanguages",
    t
  );

  const handleClear = () => {
    setArtist("");
    setWork("");
    setCountries([]);
    setRegions([]);
    setCities([]);
    setSelectedGenres([]);
    setSelectedTargetAudiences([]);
    setSelectedGauge([]);
    setSelectedMinimumStageSize([]);
    setSelectedAveragePerformanceFee([]);
    setSelectedVenueConfigurationType([]);
    setSelectedVenueConfigurationSpace([]);
    setSelectedVenueConfigurationAudience([]);
    setSelectedPerformanceLanguages([]);
    setMinimumPeopleOnTour(undefined);
    setMaximumPeopleOnTour(undefined);
    setMinimumArtistOnStage(undefined);
    setMaximumArtistOnStage(undefined);
    setMinGenderPercentage(undefined);
    setMaxGenderPercentage(undefined);
    setMinGenderType("men");
    setMaxGenderType("men");
    setFavorite(false);
    setDateMin(null);
    setDateMax(null);
    setDistanceMax(null);
    setEmergingArtist(false);
    setCulturalActionInterest(false);
    setAccessibilityVisual(false);
    setAccessibilityAudio(false);
    // For artistic teams, "Effacer tout" should reset to "all projects" (no published filter)
    setSelectedPublished(
      user?.role === Role.ARTISTIC_TEAM ? undefined : true,
    );
  };

  const handleArtistChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setArtist(event.target.value as string);
  };

  const handleWorkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWork(event.target.value as string);
  };

  const handleDistanceUnlimitedChanged = (
    event: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setDistanceMax(checked ? null : maxRange);
  };

  return (
    <Container>
      <TopRow>
        <DisciplineSelector
          value={selectedDiscipline}
          setValue={setSelectedDiscipline}
        />
        <RightControls>
          <Badge
            badgeContent={filtersCount}
            color="primary"
            hidden={filtersDisabled}
          >
            <Tooltip
              title={
                filtersDisabled
                  ? t("projects:filters.filters-disabled")
                  : undefined
              }
            >
              <Button
                onClick={handleOpen}
                color={filtersCount > 0 ? "primary" : "secondary"}
                variant="outlined"
                size="large"
                startIcon={<TuneIcon />}
                disabled={filtersDisabled}
                sx={{
                  height: 56,
                  backgroundColor: "white",
                  "& .MuiButton-startIcon": {
                    margin: mobile || tablet ? 0 : undefined,
                  },
                }}
              >
                {mobile || tablet ? null : t("projects:filters.filters")}
              </Button>
            </Tooltip>
          </Badge>
          <ShowMapSwitcher
            value={showMap}
            onChange={setShowMap}
          ></ShowMapSwitcher>
        </RightControls>
      </TopRow>
      <BottomRow>
        <FormControl fullWidth sx={{ flexGrow: 1 }} color="primary">
          <TextField
            placeholder={t("projects:filters.search")}
            size="medium"
            onChange={onTextChange}
            value={searchText}
            sx={{ backgroundColor: "white" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchText ? (
                <InputAdornment position="end">
                  <CloseIcon
                    onClick={() => {
                      onTextChange({
                        target: { value: "" },
                      } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        opacity: 0.7,
                      },
                    }}
                  />
                </InputAdornment>
              ) : null,
            }}
            data-testid="search-bar"
          />
        </FormControl>
      </BottomRow>
      <Dialog open={open} onClose={handleClose} showCloseButton={true}>
        <DialogTitle>{t("projects:filters.filters")}</DialogTitle>
        <DialogContent>
          <FilterTitle>{t("projects:filters.artist")}</FilterTitle>
          <FilterDescription>
            {t("projects:filters.artist-helper")}
          </FilterDescription>
          <TextField fullWidth value={artist} onChange={handleArtistChange} />

          <Divider sx={{ my: 2 }} />

          <FilterTitle>{t("projects:filters.work")}</FilterTitle>
          <FilterDescription>
            {t("projects:filters.work-helper")}
          </FilterDescription>
          <TextField fullWidth value={work} onChange={handleWorkChange} />

          <Divider sx={{ my: 2 }} />

          <FilterTitle>{t("projects:filters.place")}</FilterTitle>
          <FilterDescription style={{ marginBottom: "12px" }}>
            {t("projects:filters.place-helper")}
          </FilterDescription>

          <Box sx={{ display: "flex", flexDirection: "column", rowGap: 1 }}>
            <LocationAutocomplete
              onChange={setCountries}
              initialPlaces={countries}
              locationType="country"
              label={t("projects:filters.place-country-label")}
            />

            <LocationAutocomplete
              onChange={setRegions}
              initialPlaces={regions}
              geocodingOptions={{
                searchKey: "state",
                country: countries,
              }}
              locationType="region"
              label={t("projects:filters.place-region-label")}
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
              label={t("projects:filters.place-city-label")}
            />
          </Box>
          <Divider sx={{ my: 2 }} />

          <FilterTitle>{t("projects:filters.genre")}</FilterTitle>
          <FilterDescription>
            {t("projects:filters.genre-helper")}
          </FilterDescription>
          <SelectableChipGroup
            label=""
            items={genres
              .filter((genre) => genre.discipline === selectedDiscipline)
              .reduce((acc, genre) => {
                acc[genre.id] = genre.name;
                return acc;
              }, {} as Record<string, string>)}
            selectedItems={selectedGenres}
            onChange={setSelectedGenres}
          />

          <Divider sx={{ my: 2 }} />

          <FilterTitle>{t("projects:filters.target-audience")}</FilterTitle>
          <FilterDescription>
            {t("projects:filters.target-audience-helper")}
          </FilterDescription>
          <SelectableChipGroup
            label=""
            items={targetAudiences.reduce((acc, targetAudience) => {
              acc[targetAudience.id] = targetAudience.name;
              return acc;
            }, {} as Record<string, string>)}
            selectedItems={selectedTargetAudiences}
            onChange={setSelectedTargetAudiences}
          />

          <Divider sx={{ my: 2 }} />

          <FilterTitle>{t("projects:filters.gauge")}</FilterTitle>
          <FilterDescription>
            {t("projects:filters.gauge-helper")}
          </FilterDescription>
          <SelectableChipGroup
            label={t("projects:filters.gauge")}
            items={
              t(isMusicSelected ? "projects:gaugesMusic" : "projects:gauges", {
                returnObjects: true,
              }) as Record<string, string>
            }
            selectedItems={selectedGauge}
            onChange={setSelectedGauge}
          />

          <Divider sx={{ my: 2 }} />

          <FilterTitle>{t("projects:filters.minimumStageSize")}</FilterTitle>
          <FilterDescription>
            {t("projects:filters.minimumStageSize-helper")}
          </FilterDescription>
          <SelectableChipGroup
            label={t("projects:filters.minimumStageSize")}
            items={
              t(
                isMusicSelected
                  ? "projects:minimumStageSizesMusic"
                  : "projects:minimumStageSizes",
                {
                  returnObjects: true,
                }
              ) as Record<string, string>
            }
            selectedItems={selectedMinimumStageSize}
            onChange={setSelectedMinimumStageSize}
          />

          <Divider sx={{ my: 2 }} />

          <FilterTitle>
            {t("projects:filters.averagePerformanceFee")}
          </FilterTitle>
          <FilterDescription>
            {t("projects:filters.averagePerformanceFee-helper")}
          </FilterDescription>
          <SelectableChipGroup
            label={t("projects:filters.averagePerformanceFee")}
            items={
              t(
                isMusicSelected
                  ? "projects:averagePerformanceFeesMusic"
                  : "projects:averagePerformanceFees",
                {
                  returnObjects: true,
                }
              ) as Record<string, string>
            }
            selectedItems={selectedAveragePerformanceFee}
            onChange={setSelectedAveragePerformanceFee}
          />

          <Divider sx={{ my: 2 }} />

          <FilterTitle>{t("projects:filters.venueConfiguration")}</FilterTitle>
          <FilterDescription>
            {t("projects:filters.venueConfiguration-helper")}
          </FilterDescription>
          <SelectableChipGroup
            label=""
            items={venueConfigurationTypeItems}
            selectedItems={selectedVenueConfigurationType}
            onChange={setSelectedVenueConfigurationType}
          />

          <SelectableChipGroup
            label=""
            items={venueConfigurationSpaceItems}
            selectedItems={selectedVenueConfigurationSpace}
            onChange={setSelectedVenueConfigurationSpace}
          />
          <SelectableChipGroup
            label=""
            items={venueConfigurationAudienceItems}
            selectedItems={selectedVenueConfigurationAudience}
            onChange={setSelectedVenueConfigurationAudience}
          />

          <Divider sx={{ my: 2 }} />

          {!isMusicSelected && (
            <>
              <FilterTitle>
                {t("projects:filters.performanceLanguages")}
              </FilterTitle>
              <FilterDescription>
                {t("projects:filters.performanceLanguages-helper")}
              </FilterDescription>

              <MultipleAutocomplete
                id="performance-languages"
                name="performance-languages"
                label={t("projects:filters.performanceLanguages")}
                options={performanceLanguagesItems}
                value={selectedPerformanceLanguages}
                onChange={setSelectedPerformanceLanguages}
              />

              <Divider sx={{ my: 2 }} />
            </>
          )}

          <FilterTitle>{t("projects:filters.accessibility")}</FilterTitle>
          <FilterDescription>
            {t("projects:filters.accessibility-helper")}
          </FilterDescription>
          <FormControl fullWidth>
            <FormControlLabel
              control={
                <Checkbox
                  checked={accessibilityVisual}
                  onChange={(e) => setAccessibilityVisual(e.target.checked)}
                />
              }
              label={
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <VisibilityOffOutlinedIcon fontSize="small" />
                  {t("projects:filters.accessibility-visual")}
                </div>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={accessibilityAudio}
                  onChange={(e) => setAccessibilityAudio(e.target.checked)}
                />
              }
              label={
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <HearingDisabledOutlinedIcon fontSize="small" />
                  {t("projects:filters.accessibility-audio")}
                </div>
              }
            />
          </FormControl>

          <Divider sx={{ my: 2 }} />

          <FilterTitle>{t("projects:filters.nbPeopleOnTour")}</FilterTitle>
          <FilterDescription>
            {t("projects:filters.nbPeopleOnTour-helper")}
          </FilterDescription>

          <FormControl fullWidth sx={{ marginTop: "6px" }}>
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                id="minimumPeopleOnTour"
                name="minimumPeopleOnTour"
                label="Minimum"
                value={minimumPeopleOnTour}
                onChange={(e) => {
                  const value = e.target.value;
                  setMinimumPeopleOnTour(
                    value === "" ? undefined : Number(value)
                  );
                }}
                type="number"
              />

              <TextField
                fullWidth
                id="maximumPeopleOnTour"
                name="maximumPeopleOnTour"
                label="Maximum"
                value={maximumPeopleOnTour}
                onChange={(e) => {
                  const value = e.target.value;
                  setMaximumPeopleOnTour(
                    value === "" ? undefined : Number(value)
                  );
                }}
                type="number"
              />
            </Box>
          </FormControl>

          <Divider sx={{ my: 2 }} />

          <FilterTitle>{t("projects:filters.nbArtistOnStage")}</FilterTitle>
          <FilterDescription>
            {t("projects:filters.nbArtistOnStage-helper")}
          </FilterDescription>

          <FormControl fullWidth sx={{ marginTop: "6px" }}>
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                id="minimumArtistOnStage"
                name="minimumArtistOnStage"
                label="Minimum"
                value={minimumArtistOnStage}
                onChange={(e) => {
                  const value = e.target.value;
                  setMinimumArtistOnStage(
                    value === "" ? undefined : Number(value)
                  );
                }}
                type="number"
              />

              <TextField
                fullWidth
                id="maximumArtistOnStage"
                name="maximumArtistOnStage"
                label="Maximum"
                value={maximumArtistOnStage}
                onChange={(e) => {
                  const value = e.target.value;
                  setMaximumArtistOnStage(
                    value === "" ? undefined : Number(value)
                  );
                }}
                type="number"
              />
            </Box>
          </FormControl>
          <Divider sx={{ my: 2 }} />

          <FilterTitle>{t("projects:filters.dates")}</FilterTitle>
          <FilterDescription>
            {t("projects:filters.dates-helper")}
          </FilterDescription>
          <FormControl sx={{ m: 1 }} size="small" color="primary">
            <DatePicker
              label={t("projects:filters.date-min")}
              slotProps={{ textField: { size: "small" } }}
              value={!!dateMin ? new Date(dateMin) : null}
              onChange={(date) => setDateMin(date || null)}
            />
          </FormControl>
          <FormControl
            sx={{ m: 1 }}
            size="small"
            color="primary"
            required={false}
          >
            <DatePicker
              label={t("projects:filters.date-max")}
              slotProps={{ textField: { size: "small" } }}
              value={!!dateMax ? new Date(dateMax) : null}
              onChange={(date) => setDateMax(date || null)}
            />
          </FormControl>

          <Divider sx={{ my: 2 }} />

          <FilterTitle>{t("projects:filters.distance")}</FilterTitle>
          <FilterDescription>
            {t("projects:filters.distance-helper")}
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
              aria-label={t("projects:filters.distance")}
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
              label={t("projects:filters.distance-unlimited")}
            />
          </FormControl>

          <Divider sx={{ my: 2 }} />

          <FilterTitle>{t("projects:filters.favorites")}</FilterTitle>
          <FilterDescription>
            {t("projects:filters.favorites-helper")}
          </FilterDescription>

          <FormControl sx={{ m: 1 }} size="small" color="primary">
            <Button
              variant="outlined"
              color={favorite ? "primary" : "secondary"}
              onClick={() => setFavorite(!favorite)}
              startIcon={favorite ? <StarIcon /> : <StarOutlineIcon />}
              size="small"
            >
              {t("projects:filters.favorites")}
            </Button>
          </FormControl>

          <Divider sx={{ my: 2 }} />

          <FormControl fullWidth>
            <FormControlLabel
              control={
                <EmergingArtistSwitch
                  checked={emergingArtist}
                  onChange={(e) => setEmergingArtist(e.target.checked)}
                  name="emergingArtist"
                  color="primary"
                />
              }
              label={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {t("projects:filters.emergingArtist")}
                </div>
              }
            />
          </FormControl>

          <Divider sx={{ my: 2 }} />

          <FormControl fullWidth>
            <FormControlLabel
              control={
                <CulturalActionSwitch
                  checked={culturalActionInterest}
                  onChange={(e) => setCulturalActionInterest(e.target.checked)}
                  name="culturalActionInterest"
                  color="primary"
                />
              }
              label={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {t("projects:filters.culturalActionInterest")}
                </div>
              }
            />
          </FormControl>

          <Divider sx={{ my: 2 }} />

          <FilterTitle>{t("projects:filters.published")}</FilterTitle>
          <FilterDescription>
            {t("projects:filters.published-helper")}
          </FilterDescription>
          <SelectableChipGroup
            label=""
            items={{
              true: t("projects:filters.published-true"),
              false: t("projects:filters.published-false"),
              undefined: t("projects:filters.published-undefined"),
            }}
            selectedItems={[selectedPublished?.toString() || "undefined"]}
            onChange={(updatedItems) => {
              const lastItem = updatedItems[updatedItems.length - 1];
              setSelectedPublished(
                lastItem === "true"
                  ? true
                  : lastItem === "false"
                  ? false
                  : undefined
              );
            }}
          />
          <Divider sx={{ my: 2 }} />

          <FormControl fullWidth>
            <FormLabel>{t("projects:filters.genderDistribution")}</FormLabel>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                marginTop: "8px",
              }}
            >
              {[
                {
                  label: t("projects:filters.minPercentage"),
                  value: minGenderPercentage,
                  setValue: setMinGenderPercentage,
                  type: minGenderType,
                  setType: setMinGenderType,
                },
                {
                  label: t("projects:filters.maxPercentage"),
                  value: maxGenderPercentage,
                  setValue: setMaxGenderPercentage,
                  type: maxGenderType,
                  setType: setMaxGenderType,
                },
              ].map((item, index) => (
                <div
                  key={index}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <TextField
                    label={item.label}
                    type="number"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                    value={item.value || ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value);
                      item.setValue(value);
                    }}
                    inputProps={{ min: 0, max: 100 }}
                    sx={{ width: "120px" }}
                  />
                  <span style={{ margin: "0 4px" }}>
                    {t("projects:filters.of")}
                  </span>
                  <FormControl sx={{ minWidth: 120 }}>
                    <select
                      value={item.type}
                      onChange={(e) => item.setType(e.target.value)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                        fontSize: "14px",
                        backgroundColor: "#fff",
                        color: "#333",
                        height: "40px",
                        boxShadow: "none",
                        appearance: "menulist-button",
                      }}
                    >
                      <option value="men">{t("projects:filters.men")}</option>
                      <option value="women">
                        {t("projects:filters.women")}
                      </option>
                      <option value="nonBinary">
                        {t("projects:filters.nonBinary")}
                      </option>
                    </select>
                  </FormControl>
                </div>
              ))}
            </div>
          </FormControl>
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Button onClick={handleClear}>{t("projects:filters.clear")}</Button>
          <Button color="primary" variant="contained" onClick={handleClose}>
            {t("projects:filters.submit", { count: projectCount })}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SearchBar;
