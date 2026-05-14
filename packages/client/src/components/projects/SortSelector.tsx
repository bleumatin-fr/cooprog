import styled from "@emotion/styled";
import SortIcon from "@mui/icons-material/Sort";
import {
  Box,
  MenuItem,
  Select,
  SelectChangeEvent,
  SvgIcon,
  Tooltip,
} from "@mui/material";
import { useTranslation } from "next-i18next";

interface SortSelectorProps {
  sortOrder: string;
  setSortOrder: (sort: string) => void;
  availableSorts: {
    sort: string;
    label: string;
  }[];
  disabled: boolean;
}

const SelectContainer = styled.div`
  display: flex;
  align-items: center;

  > * {
    --mui-palette-text-primary: var(--color-light-orange) !important;
    --mui-palette-common-onBackgroundChannel: 255 116 70 !important;
    --mui-palette-secondary-main: var(--color-orange) !important;
  }
`;

const SortSelector = ({
  sortOrder,
  setSortOrder,
  availableSorts,
  disabled,
}: SortSelectorProps) => {
  const { t } = useTranslation();

  const handleChange = (event: SelectChangeEvent<string>) => {
    if (disabled) return;
    setSortOrder(event.target.value as string);
  };

  return (
    <SelectContainer>
      <Tooltip
        title={disabled ? t("projects:sorts.relevance-tooltip") : undefined}
      >
        <Select
          value={sortOrder}
          onChange={handleChange}
          color="secondary"
          size="small"
          variant="outlined"
          renderValue={(value) => {
            const label = availableSorts.find(
              (sort) => sort.sort === value
            )?.label;
            return (
              <Box sx={{ display: "flex", gap: 1 }}>
                <SvgIcon color={disabled ? "disabled" : "secondary"}>
                  <SortIcon color={disabled ? "disabled" : "secondary"} />
                </SvgIcon>
                {t("common:sorted-by", { sort: label })}
              </Box>
            );
          }}
          disabled={disabled}
        >
          {availableSorts.map(({ sort, label }) => (
            <MenuItem key={sort} value={sort}>
              {t("common:sorted-by", { sort: label })}
            </MenuItem>
          ))}
        </Select>
      </Tooltip>
    </SelectContainer>
  );
};

export default SortSelector;
