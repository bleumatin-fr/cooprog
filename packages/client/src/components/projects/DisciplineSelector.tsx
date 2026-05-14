import { Discipline } from "@cooprog/core";
import styled from "@emotion/styled";
import MusicIcon from "../UI/icons/music.svg";
import TheaterIcon from "../UI/icons/theater.svg";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useTranslation } from "next-i18next";
import Image from "next/image";

const numberOfDisciplines = 2;

const DisciplineGroup = styled(ToggleButtonGroup)`
  display: flex;
  gap: 8px;
  background: transparent;
  position: relative;
  padding: 0;
  border: none;
  height: 56px;
  width: 100%;
  overflow: hidden;
  max-width: 450px;
`;

const SelectedBackground = styled.div<{ selectedIndex: number }>`
  position: absolute;
  top: 0;
  left: ${({ selectedIndex }) => selectedIndex * (100 / numberOfDisciplines)}%;
  margin-left: ${({ selectedIndex }) => 8 * selectedIndex}px;
  width: calc(${100 / numberOfDisciplines}% - 12px);
  height: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: left 0.3s ease-in-out;
  z-index: 0;
`;

const DisciplineButton = styled(ToggleButton)<{ error?: boolean }>`
  position: relative;
  width: calc(${100 / numberOfDisciplines}% - 6px);
  border: 2px solid
    ${({ error }) => (error ? "var(--mui-palette-error-main)" : "#e0e0e0")} !important;
  border-radius: 8px !important;
  height: 56px !important;
  padding: 6px 14px !important;
  margin: 0 !important;
  color: #666 !important;
  transition: all 0.3s ease-in-out !important;
  overflow: hidden;
  background: transparent !important;
  flex-shrink: 0;

  @media (max-width: 600px) {
    width: calc(50% - 4px);
    font-size: 0.8rem;
  }

  &.Mui-selected {
    border-color: #ff6b6b !important;
    color: #333 !important;
    font-weight: 600;
    background-color: rgba(255, 255, 255, 0.9) !important;
  }

  .icon-background {
    position: absolute;
    top: -20px;
    left: -20px;
    width: 120px;
    height: 120px;
    opacity: 0.1;
    transform: scale(0.6);
    transition: all 0.3s ease-in-out;

    @media (max-width: 600px) {
      transform: scale(0.5);
    }
  }

  &.Mui-selected .icon-background {
    opacity: 0.15;
    transform: scale(1.1);

    @media (max-width: 600px) {
      transform: scale(0.8);
    }
  }

  span {
    position: relative;
    z-index: 1;
  }
`;

// Helper function to determine the selected index for background positioning
const getSelectedIndex = (discipline?: string): number => {
  switch (discipline) {
    case Discipline.PERFORMING_ARTS:
      return 0;
    case Discipline.MUSIC:
      return 1;
    case "livre":
      return 2;
    case "arts":
      return 3;
    default:
      return -1;
  }
};

type DisciplineSelectorProps =
  | {
      value?: Discipline;
      setValue: (value: Discipline) => void;
      multiSelect?: false;
      toggle?: boolean;
      error?: boolean;
      allowEmpty?: boolean;
    }
  | {
      value?: Discipline[];
      setValue: (value: Discipline[]) => void;
      multiSelect: true;
      toggle?: boolean;
      error?: boolean;
      allowEmpty?: boolean;
    };

const DisciplineSelector = ({
  value,
  setValue,
  multiSelect = false,
  toggle = false,
  error = false,
  allowEmpty = false,
}: DisciplineSelectorProps) => {
  const { t } = useTranslation();

  // Clés de traduction pour les disciplines
  const labels = {
    [Discipline.PERFORMING_ARTS]: t("users:disciplines.performingArts"),
    [Discipline.MUSIC]: t("users:disciplines.music"),
    // livre: "Livre et Lecture",
    // arts: "Arts Visuels",
  };

  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
    newValue: Discipline & Discipline[]
  ) => {
    if (toggle && value === newValue) {
      setValue(undefined as any);
      return;
    }
    if (allowEmpty) {
      setValue(newValue);
      return;
    }
    if (Array.isArray(newValue) && newValue.length === 0) {
      return;
    }
    if (!newValue) {
      return;
    }
    setValue(newValue);
  };

  return (
    <DisciplineGroup
      value={value}
      exclusive={!multiSelect}
      onChange={handleChange}
      aria-label="discipline"
    >
      {!multiSelect && (
        <SelectedBackground selectedIndex={getSelectedIndex(value as string)} />
      )}
      <DisciplineButton value={Discipline.PERFORMING_ARTS} error={error}>
        <Box>
          <Image className="icon-background" src={TheaterIcon} alt="" />
          <span>{labels[Discipline.PERFORMING_ARTS]}</span>
        </Box>
      </DisciplineButton>
      <DisciplineButton value={Discipline.MUSIC} error={error}>
        <Box>
          <Image
            className="icon-background"
            src={MusicIcon}
            alt=""
            style={{ width: 120, height: 120 }}
          />
          <span>{labels[Discipline.MUSIC]}</span>
        </Box>
      </DisciplineButton>
      {/* <DisciplineButton value="livre" aria-label="livre">
        <Box>
          <MenuBookIcon
            className="icon-background"
            sx={{ color: "#45B7D1", fontSize: 120 }}
          />
          <span>Livre et Lecture</span>
        </Box>
      </DisciplineButton>
      <DisciplineButton value="arts" aria-label="arts">
        <Box>
          <PaletteIcon
            className="icon-background"
            sx={{ color: "#96CEB4", fontSize: 120 }}
          />
          <span>Arts Visuels</span>
        </Box>
      </DisciplineButton> */}
    </DisciplineGroup>
  );
};

export default DisciplineSelector;
