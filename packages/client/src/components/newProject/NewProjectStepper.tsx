import { Stepper, Step, StepLabel } from "@mui/material";
import React from "react";

interface NewProjectStepperProps {
  activeStep: number;
  steps: string[];
}

const NewProjectStepper: React.FC<NewProjectStepperProps> = ({
  activeStep,
  steps,
}) => (
  <Stepper
    activeStep={activeStep}
    alternativeLabel
    sx={{
      flexGrow: 1,
      "& .MuiStepLabel-root": {
        padding: "4px 0",
      },
      "& .MuiStepLabel-label": {
        fontSize: "0.875rem",
        marginTop: "4px !important",
      },
      "& .MuiStepIcon-root": {
        width: "24px",
        height: "24px",
      },
    }}
  >
    {steps.map((label) => (
      <Step key={label}>
        <StepLabel
          sx={{
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </StepLabel>
      </Step>
    ))}
  </Stepper>
);

export default NewProjectStepper;
