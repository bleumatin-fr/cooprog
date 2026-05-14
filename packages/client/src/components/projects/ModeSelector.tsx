import GridViewIcon from "@mui/icons-material/GridView";
import TableRowsIcon from "@mui/icons-material/TableRows";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { MouseEvent } from "react";
interface ModeSelectorProps {
  mode: string;
  setMode: (mode: "grid" | "list") => void;
}

const ModeSelector = ({ mode, setMode }: ModeSelectorProps) => {
  const handleChanged = (event: MouseEvent, mode: "grid" | "list") => {
    if(!mode) return;
    setMode(mode);
  };
  return (
    <ToggleButtonGroup
      value={mode}
      exclusive
      onChange={handleChanged}
      size="small"
      sx={{ backgroundColor: "white" }}
    >
      <ToggleButton value="grid" size="small">
        <GridViewIcon />
      </ToggleButton>
      <ToggleButton value="list" size="small">
        <TableRowsIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default ModeSelector;
