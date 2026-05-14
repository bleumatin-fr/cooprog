// Updated SelectableChipGroup.tsx

import styled from "@emotion/styled";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";
import {
  Chip,
  FormControl,
  FormHelperText,
  FormLabel,
  Tooltip,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import { ReactElement } from "react";

export const GenreChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

export interface ChipStyle {
  backgroundColor?: string;
  color?: string;
  icon?: string;
  usePrimaryColor?: boolean;
}

interface StyleOptions {
  backgroundColor?: string;
  color?: string;
  icon?: string;
  usePrimaryColor?: boolean;
}

export const SelectableChipGroup = ({
  id,
  name,
  label,
  items,
  selectedItems,
  onChange,
  error,
  helperText,
  exclusiveLastOption = false,
  required = false,
  styleOptions,
  chipStyles,
  showIcons = false,
  sortFunction = (a, b) => {
    return parseInt(a[0]) - parseInt(b[0]);
  },
  disabled = false,
}: {
  id?: string;
  name?: string;
  label: string;
  items: Record<string, string>;
  selectedItems: string[];
  onChange: (updatedItems: string[]) => void;
  error?: boolean;
  helperText?: string | string[];
  exclusiveLastOption?: boolean;
  required?: boolean;
  styleOptions?: Record<string, StyleOptions>;
  chipStyles?: Record<string, ChipStyle>;
  showIcons?: boolean;
  sortFunction?: (a: [string, string], b: [string, string]) => number;
  disabled?: boolean;
}) => {
  const { t } = useTranslation();

  const effectiveStyleOptions = chipStyles || styleOptions;

  const handleToggle = (key: string) => {
    const lastOptionKey = Object.keys(items)[Object.keys(items).length - 1];
    const isLastOption = key === lastOptionKey;
    const isCurrentlySelected = selectedItems.includes(key);

    let updatedItems: string[];

    if (exclusiveLastOption && isLastOption) {
      // If last option is selected, clear all other selections
      updatedItems = isCurrentlySelected ? [] : [key];
    } else if (exclusiveLastOption && selectedItems.includes(lastOptionKey)) {
      // If last option is already selected, unselect it when selecting another option
      updatedItems = isCurrentlySelected
        ? selectedItems.filter((i) => i !== key)
        : [...selectedItems.filter((i) => i !== lastOptionKey), key];
    } else {
      // Normal toggle behavior
      updatedItems = isCurrentlySelected
        ? selectedItems.filter((i) => i !== key)
        : [...selectedItems, key];
    }

    onChange(updatedItems);
  };

  const getIconComponent = (iconName?: string): ReactElement | undefined => {
    if (!iconName || !showIcons) return undefined;

    switch (iconName) {
      case "music":
        return <MusicNoteIcon fontSize="small" />;
      case "theater":
        return <TheaterComedyIcon fontSize="small" />;
      case "spectacle":
        return <TheaterComedyIcon fontSize="small" />;
      default:
        return undefined;
    }
  };

  return (
    <FormControl fullWidth error={error} required={required}>
      <FormLabel>{label}</FormLabel>
      <GenreChipContainer id={id}>
        {Object.entries(items)
          .sort((a, b) => sortFunction?.(a, b) || 0)
          .map(([key, value]) => {
            const isSelected = selectedItems.includes(key);
            const style = effectiveStyleOptions?.[key] || {};
            const chipStyle = isSelected
              ? {
                  backgroundColor: style.backgroundColor || undefined,
                  color: style.color || undefined,
                }
              : {};

            const iconComponent = getIconComponent(style.icon);
            const usePrimaryColor =
              !style.backgroundColor && style.usePrimaryColor !== false;

            return (
              <Tooltip key={key} title={value}>
                <Chip
                  label={value}
                  onClick={() => handleToggle(key)}
                  variant={isSelected ? "filled" : "outlined"}
                  clickable
                  size="small"
                  color={isSelected && usePrimaryColor ? "primary" : "default"}
                  style={chipStyle}
                  icon={iconComponent}
                  disabled={disabled}
                />
              </Tooltip>
            );
          })}
      </GenreChipContainer>
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  );
};

export default SelectableChipGroup;
