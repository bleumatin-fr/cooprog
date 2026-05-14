import { Discipline, Role, StructureType } from "@cooprog/core";
import styled from "@emotion/styled";
import HelpIcon from "@mui/icons-material/Help";
import {
  Divider,
  FormControl,
  FormLabel,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { TFunction, useTranslation } from "next-i18next";
import { useCallback, useMemo } from "react";
import SelectableChipGroup, { ChipStyle } from "../UI/SelectableChipGroup";
import useUser from "../authentication/useUser";
import useGenres from "../projects/useGenres";

interface ProgrammingDisciplineSectionProps {
  role: Role;
  values: {
    programmingDisciplines?: Discipline[];
    structureTypes?: StructureType[];
    programmingPeriods?: string;
    programmingGenres?: string[];
  };
  labels: {
    programmingDisciplines?: string;
    structureTypes?: string;
    programmingPeriods?: string;
    programmingPeriodsHelper?: string;
    genres?: string;
  };
  onChange: (field: string, value: any) => void;
}

// Style pour aligner les labels à gauche
const LeftAlignedFormLabel = styled(FormLabel)`
  text-align: left;
  display: flex;
  width: 100%;
  margin-bottom: 12px;
  font-weight: 600;
  font-size: 1.05rem;
  color: rgba(0, 0, 0, 0.8);
`;

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px; /* Augmenter l'espace entre les sections */
  width: 100%;
  margin: 16px 0; /* Augmenter les marges */
`;

const SectionTitle = styled.label`
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 12px;
  color: #333;
`;

// Fonction pour récupérer les noms depuis les traductions (comme dans SearchBar.tsx)
const getNameProperties = (labelKey: string, t: TFunction) => {
  const items = t(labelKey, { returnObjects: true }) as Record<
    string,
    { name: string }
  >;
  return Object.fromEntries(Object.keys(items).map((k) => [k, items[k].name]));
};

// Fonction pour récupérer les propriétés complètes depuis les traductions
const getFullProperties = (labelKey: string, t: TFunction) => {
  return t(labelKey, { returnObjects: true }) as Record<
    string,
    { name: string; backgroundColor: string; color: string; icon?: string }
  >;
};

const ProgrammingDisciplineSection = ({
  values,
  role,
  labels,
  onChange,
}: ProgrammingDisciplineSectionProps) => {
  const { t } = useTranslation();

  const genres = useGenres();
  // Vérifier si les Musiques Actuelles sont sélectionnées
  const hasMA = values.programmingDisciplines?.includes(Discipline.MUSIC);
  const hasSV = values.programmingDisciplines?.includes(
    Discipline.PERFORMING_ARTS,
  );

  const structureItems = useMemo(
    () => ({
      [StructureType.VENUE]: t("users:structureTypes.venue"),
      [StructureType.FESTIVAL]: t("users:structureTypes.festival"),
      [StructureType.ITINERANT]: t("users:structureTypes.itinerant"),
    }),
    [t],
  );

  // Couleurs pour les types de structure
  const genericColor = "#FFFFFF";
  const genericBgColor = "#FF7A2F";

  const structureStyles = useMemo(
    () => ({
      [StructureType.VENUE]: {
        backgroundColor: genericBgColor,
        color: genericColor,
        usePrimaryColor: false,
      },
      [StructureType.FESTIVAL]: {
        backgroundColor: genericBgColor,
        color: genericColor,
        usePrimaryColor: false,
      },
      [StructureType.ITINERANT]: {
        backgroundColor: genericBgColor,
        color: genericColor,
        usePrimaryColor: false,
      },
    }),
    [genericBgColor, genericColor],
  );

  const genresStyles = useMemo(() => {
    const styles: Record<string, ChipStyle> = {};

    Object.keys(genres).forEach((key) => {
      const props = genres.find((g) => g.id === key);
      styles[key] = {
        backgroundColor: props?.backgroundColor || "#F2EDFF",
        color: props?.color || "#555555",
        icon: props?.icon || "music",
        usePrimaryColor: false,
      };
    });

    return styles;
  }, [genres]);

  // Gestionnaires d'événements
  const handleProgrammingPeriodsChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      // Envoyer uniquement la modification de la période sans toucher aux autres propriétés
      onChange("programmingPeriods", event.target.value);
    },
    [onChange],
  );

  const handleDisciplineChange = useCallback(
    (newValues: string[]) => {
      // Vérifier si les changements de discipline devraient réinitialiser les genres associés
      const isMARemoved =
        values.programmingDisciplines?.includes(Discipline.MUSIC) &&
        !newValues.includes(Discipline.MUSIC);

      const isSVRemoved =
        values.programmingDisciplines?.includes(Discipline.PERFORMING_ARTS) &&
        !newValues.includes(Discipline.PERFORMING_ARTS);

      onChange("programmingDisciplines", newValues);

      if (isMARemoved || isSVRemoved) {
        onChange("genres", []);
      }
    },
    [onChange, values.programmingDisciplines],
  );

  const handleStructureTypesChange = useCallback(
    (newValues: string[]) => {
      // S'assurer que nous transmettons une nouvelle copie du tableau
      const newStructureTypesCopy = [...newValues];
      onChange("structureTypes", newStructureTypesCopy);
    },
    [onChange, values.structureTypes],
  );

  const handleGenresChanged = useCallback(
    (newValues: string[]) => {
      onChange("programmingGenres", newValues);
    },
    [onChange],
  );

  const genreSortFunction = useCallback(
    (a: [string, string], b: [string, string]) => {
      const getDiscipline = (key: string) => {
        const index = Number(key);
        const byIndex =
          Number.isInteger(index) && index >= 0 ? genres[index] : undefined;
        if (byIndex?.discipline) return byIndex.discipline;
        const byId = genres.find((genre) => genre.id === key);
        return byId?.discipline || "";
      };

      const getDisciplineRank = (discipline: string) => {
        if (discipline === Discipline.PERFORMING_ARTS) return 0;
        if (discipline === Discipline.MUSIC) return 1;
        return 2;
      };

      const disciplineComparison =
        getDisciplineRank(getDiscipline(a[0])) -
        getDisciplineRank(getDiscipline(b[0]));

      if (disciplineComparison !== 0) {
        return disciplineComparison;
      }

      return a[1].localeCompare(b[1], undefined, {
        sensitivity: "base",
      });
    },
    [genres],
  );

  return (
    <>
      <SectionContainer>
        {/* Type de structure - Visible seulement si MA est sélectionné */}
        {hasMA && role !== Role.ARTISTIC_TEAM && (
          <FormControl fullWidth>
            <FormLabel htmlFor="structureTypes">
              {labels.structureTypes}
            </FormLabel>
            <SelectableChipGroup
              id="structureTypes"
              name="structureTypes"
              label=""
              items={structureItems}
              selectedItems={values.structureTypes || []}
              onChange={handleStructureTypesChange}
              chipStyles={structureStyles}
            />
          </FormControl>
        )}

        {/* Genres programmés pour Spectacle Vivant */}
        <FormControl fullWidth>
          <FormLabel htmlFor="programmingGenres">{labels.genres}</FormLabel>
          <SelectableChipGroup
            id="programmingGenres"
            name="programmingGenres"
            label=""
            items={Object.fromEntries(
              Object.entries(genres)
                .filter(([key, value]) =>
                  values.programmingDisciplines?.includes(value.discipline),
                )
                .map(([key, value]) => [key, value.name]),
            )}
            selectedItems={values.programmingGenres || []}
            onChange={handleGenresChanged}
            chipStyles={genresStyles}
            showIcons={true}
            sortFunction={genreSortFunction}
          />
        </FormControl>

        {/* Périodes de programmation */}
        {role !== Role.ARTISTIC_TEAM && (
          <FormControl fullWidth>
            <FormLabel htmlFor="programmingPeriods">
              {labels.programmingPeriods}
            </FormLabel>
            <TextField
              id="programmingPeriods"
              name="programmingPeriods"
              value={values.programmingPeriods || ""}
              onChange={handleProgrammingPeriodsChange}
              fullWidth
              placeholder={t("authentication:programmingPeriods-placeholder")}
              InputProps={{
                endAdornment: labels.programmingPeriodsHelper && (
                  <InputAdornment position="end">
                    <Tooltip title={labels.programmingPeriodsHelper}>
                      <HelpIcon />
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
        )}
      </SectionContainer>
    </>
  );
};

export default ProgrammingDisciplineSection;
