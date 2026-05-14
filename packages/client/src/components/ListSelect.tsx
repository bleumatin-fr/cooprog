import {
  Checkbox,
  ListItemText,
  MenuItem,
  Select,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";

interface ListSelectProps {
  value: string[];
  onChange: (event: SelectChangeEvent<string[]>) => void;
  label: string;
  name?: string;
  options: string[];
}

const ListSelect = ({
  value,
  onChange,
  label,
  options,
  name,
}: ListSelectProps) => {
  return (
    <>
      <InputLabel id="demo-simple-select-label">{label}</InputLabel>
      <Select
        multiple
        value={value}
        onChange={onChange}
        renderValue={(selected) => selected.join(", ")}
        label={label}
        name={name}
        fullWidth
      >
        {(options || []).map((option) => (
          <MenuItem key={option} value={option}>
            <Checkbox checked={value.includes(option)} />
            <ListItemText primary={option} />
          </MenuItem>
        ))}
      </Select>
    </>
  );
};

export default ListSelect;
