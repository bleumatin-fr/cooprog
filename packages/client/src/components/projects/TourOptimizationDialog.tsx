import React from "react";
import { useTranslation } from "next-i18next";
import { Project, Tour } from "@cooprog/core";
import { Typography } from "@mui/material";
import Dialog, { DialogContent, DialogActions } from "@/components/UI/Dialog";
import styled from "@emotion/styled";
import CO2StepCard from "./CO2StepCard";
import { formatCO2, getEmissionFactor } from "./co2Utils";
import HomeIcon from "@mui/icons-material/Home";
import UserAvatar from "@/components/structures/UserAvatar";
import Button from "@/components/UI/Button";
import { useTourAvoidedCO2 } from "./useAvoidedCO2";

interface TourOptimizationDialogProps {
  open: boolean;
  tour: Tour;
  onClose: () => void;
}

const DialogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
`;

const TabPanel = styled.div`
  padding: 24px;
`;

const ComparisonContainer = styled.div`
  display: flex;
  gap: 32px;
  margin-top: 24px;
`;

const TourColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
`;

const ColumnTitle = styled.div`
  font-weight: 600;
  font-size: 18px;
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  position: sticky;
  top: 0;
  z-index: 10;
  background: inherit;
`;

const CurrentTourTitle = styled(ColumnTitle)`
  background: #e3f2fd;
  color: #1976d2;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const OptimizedTourTitle = styled(ColumnTitle)`
  background: #e8f5e8;
  color: #4caf50;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const StepperContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin-left: 32px;
`;

const StepRow = styled.div<{ isChanged?: boolean; isOptimized?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  position: relative;
  flex-wrap: wrap;
  margin-bottom: 16px;
  padding: 8px;
  border-radius: 8px;
  border: 2px solid transparent;
  background: ${(props) => {
    if (props.isChanged) {
      return props.isOptimized ? "#e8f5e8" : "#fff3e0";
    }
    return "transparent";
  }};
  border-color: ${(props) => {
    if (props.isChanged) {
      return props.isOptimized ? "#4caf50" : "#ff9800";
    }
    return "transparent";
  }};
  transition: all 0.2s ease;
`;

const StepLine = styled.div`
  position: absolute;
  left: -22px;
  top: 48px;
  width: 2px;
  height: calc(100% - 24px);
  background: #ccc;
  z-index: 1;
`;

const StepInfo = styled.div<{ hideDate?: boolean }>`
  min-width: 180px;
  margin-right: 32px;
  font-size: 15px;
  color: #222;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  padding-left: 16px;
  justify-content: center;
  padding-top: ${(props) => (props.hideDate ? "12px" : "0")};

  > div {
    max-width: 180px;
    width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  > div:first-child {
    font-style: italic;
    font-size: 13px;
    color: #888;
  }

  > div:nth-child(2) {
    font-weight: 600;
    margin-bottom: 4px;
  }
`;

const PositionIndicator = styled.div<{
  isChanged?: boolean;
  isOptimized?: boolean;
}>`
  position: absolute;
  top: -4px;
  left: -4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: white;
  background: ${(props) => {
    if (props.isChanged) {
      return props.isOptimized ? "#4caf50" : "#ff9800";
    }
    return "#666";
  }};
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const CO2CardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 16px;
  min-height: 80px;

  @media (min-width: 800px) {
    flex-direction: row;
    gap: 16px;
  }
`;

const SavingsHighlight = styled.div`
  background: #4caf50;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  margin: 16px 0;
`;

const TourOptimizationDialog = ({
  open,
  tour,
  onClose,
}: TourOptimizationDialogProps) => {
  const { t } = useTranslation();
  const { steps, optimizedSteps, optimizationSavings } =
    useTourAvoidedCO2(tour);

  // Get emission factors from translations
  const peopleTransportModeOptions = t(
    "common:dialogs.new-project.tour-information.people-transport-mode",
    { returnObjects: true }
  ) as {
    [key: string]: {
      label: string;
      icon: string;
      emissionFactor: number;
      source: { label: string; link: string };
    };
  };
  const decorationsTransportModeOptions = t(
    "common:dialogs.new-project.tour-information.decorations-transport-mode",
    { returnObjects: true }
  ) as {
    [key: string]: {
      label: string;
      icon: string;
      emissionFactor: number;
      source: { label: string; link: string };
    };
  };

  const peopleEmissionFactor = getEmissionFactor(
    peopleTransportModeOptions,
    tour.peopleTransportMode || ""
  );
  const decorationsEmissionFactor = getEmissionFactor(
    decorationsTransportModeOptions,
    tour.decorationsTransportMode || ""
  );
  const decorationsWeight = tour.decorationsWeight || 0;

  // Helper function to check if a program changed position
  const getProgramPosition = (programs: any[], programId: string) => {
    return programs.findIndex((p) => p._id === programId);
  };

  const hasProgramChanged = (programId: string) => {
    const currentPos = getProgramPosition(steps, programId);
    const optimizedPos = getProgramPosition(optimizedSteps, programId);
    return (
      currentPos !== -1 && optimizedPos !== -1 && currentPos !== optimizedPos
    );
  };

  const renderTourSteps = (
    programs: any[],
    title: string,
    titleStyle: any,
    isOptimized: boolean = false
  ) => (
    <TourColumn>
      <div style={titleStyle}>{title}</div>
      <StepperContainer>
        {programs.map((program, idx) => {
          const fromLoc = program.location;
          const toLoc = programs[idx + 1]?.location;
          const isChanged = hasProgramChanged(program._id);

          return (
            <StepRow
              key={program._id || idx}
              isChanged={isChanged}
              isOptimized={isOptimized}
            >
              <PositionIndicator
                isChanged={isChanged}
                isOptimized={isOptimized}
              >
                {idx + 1}
              </PositionIndicator>
              <div
                style={{ position: "absolute", left: -40, top: 0, zIndex: 2 }}
              >
                {program.user ? (
                  <UserAvatar
                    user={program.user || {}}
                    size="medium"
                    showLink
                    showTooltip
                  />
                ) : (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      background: "#eee",
                      border: "2px solid #ccc",
                    }}
                  >
                    <HomeIcon style={{ width: 30, height: 30 }} />
                  </div>
                )}
              </div>
              {idx < programs.length - 1 && <StepLine />}
              <StepInfo hideDate={isOptimized && isChanged}>
                <div>
                  {!isOptimized || !isChanged
                    ? program.date
                      ? new Date(program.date).toLocaleDateString()
                      : ""
                    : ""}
                </div>
                <div>{program.user ? program.user.company : ""}</div>
                <div>
                  {program.location?.data?.city &&
                  program.location?.data?.country
                    ? `${program.location.data.city}, ${program.location.data.country}`
                    : program.location?.address || ""}
                </div>
              </StepInfo>
              {idx < programs.length - 1 && (
                <CO2CardsContainer>
                  {program.co2 && program.co2?.total?.avoidedCo2Kg > 0 && (
                    <CO2StepCard route={program.route} co2={program.co2} />
                  )}
                </CO2CardsContainer>
              )}
            </StepRow>
          );
        })}
      </StepperContainer>
    </TourColumn>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      showCloseButton={true}
      sx={{
        "& .MuiDialog-paper": {
          maxWidth: "90vw !important",
          width: "1200px !important",
          maxHeight: "90vh !important",
        },
      }}
    >
      <DialogHeader>
        <Typography variant="h6">
          {t("projects:avoided-co2-simulator.optimization-modal-title")}
        </Typography>
      </DialogHeader>
      <DialogContent>
        <Typography variant="body1" style={{ marginBottom: 16 }}>
          {t("projects:avoided-co2-simulator.optimization-modal-description")}
        </Typography>

        {optimizationSavings > 0 && (
          <SavingsHighlight>
            {t("projects:avoided-co2-simulator.optimization-savings")}{" "}
            {formatCO2(optimizationSavings)}
          </SavingsHighlight>
        )}

        <ComparisonContainer>
          {renderTourSteps(
            steps,
            t("projects:avoided-co2-simulator.current-tour"),
            {
              background: "#e3f2fd",
              color: "#1976d2",
              fontWeight: 600,
              fontSize: "18px",
              textAlign: "center",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "16px",
              position: "sticky",
              top: 0,
              zIndex: 10,
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e0e0e0",
            },
            false
          )}
          {renderTourSteps(
            optimizedSteps,
            t("projects:avoided-co2-simulator.optimized-tour"),
            {
              background: "#e8f5e8",
              color: "#4caf50",
              fontWeight: 600,
              fontSize: "18px",
              textAlign: "center",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "16px",
              position: "sticky",
              top: 0,
              zIndex: 10,
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e0e0e0",
            },
            true
          )}
        </ComparisonContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          {t("common:close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TourOptimizationDialog;
