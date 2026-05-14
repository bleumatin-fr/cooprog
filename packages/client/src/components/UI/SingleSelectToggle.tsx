import {
  FormControl,
  FormHelperText,
  FormLabel,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

type SingleSelectToggleProps = {
  label?: string;
  value: string;
  onChange: (value: string | null) => void;
  options: Record<string, string>;
  error?: boolean;
  helperText?: string;
};

const SingleSelectToggle = ({
  label,
  value,
  onChange,
  options,
  error,
  helperText,
}: SingleSelectToggleProps) => {
  return (
    <FormControl error={error} fullWidth sx={{ gap: 1 }}>
      <FormLabel>{label}</FormLabel>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_, newValue) => {
          onChange(newValue);
        }}
        size="small"
      >
        {Object.entries(options).map(([key, label]) => (
          <ToggleButton
            key={key}
            value={key}
            sx={{
              "&.Mui-selected": {
                backgroundColor: "var(--color-orange)",
                color: "white",
                "&:hover": {
                  backgroundColor: "var(--color-light-orange)",
                },
              },
            }}
          >
            {label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <FormHelperText>{helperText}</FormHelperText>
    </FormControl>
  );
};

export default SingleSelectToggle;
