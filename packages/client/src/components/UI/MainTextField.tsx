import React from "react";
import TextField from "@mui/material/TextField";

interface MainTextFieldProps extends React.ComponentProps<typeof TextField> {}

const mainTextFieldSx = {
  "& .MuiInputBase-root": {
    fontSize: "1rem",
    padding: "6px 12px",
    height: "56px",
    alignItems: "center",
  },
  "& .MuiFormLabel-root": {
    fontSize: "1.3rem",
    top: "30px",
    left: 12,
    transform: "translateY(-50%) scale(1)",
    transition: "all 0.2s",
    pointerEvents: "none",
  },
  "& .MuiInputLabel-shrink": {
    fontSize: "0.85rem",
    top: "-6px",
    left: 8,
    transform: "translateY(0) scale(0.75)",
    pointerEvents: "auto",
    padding: "0 4px",
  },
  "& .MuiFormHelperText-root": {
    fontSize: "0.8rem",
    marginLeft: 0,
    marginRight: 0,
    marginTop: "4px",
  },
};

const MainTextField = React.forwardRef<HTMLInputElement, MainTextFieldProps>(
  ({ sx, ...props }, ref) => (
    <TextField ref={ref} sx={{ ...mainTextFieldSx, ...sx }} {...props} />
  )
);

export default MainTextField;
