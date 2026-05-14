import { Autocomplete, TextField } from "@mui/material";
import { FC } from "react";

interface MultipleAutocompleteProps {
  id?: string;
  name?: string;
  label?: string;
  options: Record<string, string>;
  value: string[]; // array of selected keys
  onChange: (value: string[]) => void;
  error?: boolean;
  helperText?: string;
}

const MultipleAutocomplete: FC<MultipleAutocompleteProps> = ({
  id,
  name,
  label,
  options,
  value,
  onChange,
  error = false,
  helperText = "",
}) => {
  const optionEntries = Object.entries(options);

  const selectedOptions = value.map(
    (key) => [key, options[key]] as [string, string]
  );

  return (
    <Autocomplete
      id={id}
      multiple
      options={optionEntries}
      getOptionLabel={([, optionValue]) => optionValue}
      value={selectedOptions}
      onChange={(_, newValue) => onChange(newValue.map(([key]) => key))}
      isOptionEqualToValue={(option, selected) => {
        return option[0] === selected[0];
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          name={name}
          label={label}
          error={error}
          helperText={helperText}
        />
      )}
    />
  );
};

export default MultipleAutocomplete;
