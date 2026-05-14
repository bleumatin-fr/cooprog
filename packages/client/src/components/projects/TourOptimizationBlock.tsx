import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import { Project, Tour } from "@cooprog/core";
import Button from "../UI/Button";
import OptimizationIcon from "@mui/icons-material/Tune";
import styled from "@emotion/styled";
import TourOptimizationDialog from "./TourOptimizationDialog";
import { formatCO2 } from "./co2Utils";
import { ProgramWithCO2Information, useTourAvoidedCO2 } from "./useAvoidedCO2";

interface TourOptimizationBlockProps {
  tour: Tour;
  style?: React.CSSProperties;
}

const Block = styled.div`
  background: #f0f8f0;
  border-radius: 16px;
  border: 1.5px solid #4caf50;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  padding: 24px 24px 16px 24px;
  margin: 16px 0 16px 0;
  display: flex;
  align-items: flex-start;
  gap: 20px;
`;

const Illustration = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  margin-top: 2px;
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.div`
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
  color: #123036;
`;

const Description = styled.div`
  font-size: 15px;
  color: #666;
  margin-bottom: 12px;
`;

const SavingsHighlight = styled.span`
  color: #4caf50;
  font-weight: 600;
`;

const TourOptimizationBlock = ({ tour, style }: TourOptimizationBlockProps) => {
  const { t } = useTranslation();
  const [openOptimizationDialog, setOpenOptimizationDialog] = useState(false);
  const { optimizationSavings } = useTourAvoidedCO2(tour);
  if (optimizationSavings < 1) return null;

  return (
    <Block style={style}>
      <Illustration>
        <OptimizationIcon
          sx={{ fontSize: 44, color: "#4caf50" }}
          aria-label="optimization"
        />
      </Illustration>
      <Content>
        <Title>
          {t("projects:avoided-co2-simulator.tour-optimization-title")}
        </Title>
        <Description>
          {t("projects:avoided-co2-simulator.tour-optimization-description")}{" "}
          <SavingsHighlight>{formatCO2(optimizationSavings)}</SavingsHighlight>
          {t(
            "projects:avoided-co2-simulator.tour-optimization-description-end"
          )}
        </Description>
        <Button
          variant="contained"
          style={{
            margin: "8px 0 0 0",
            backgroundColor: "#4caf50",
            color: "white",
          }}
          onClick={() => setOpenOptimizationDialog(true)}
          startIcon={<OptimizationIcon />}
        >
          {t("projects:avoided-co2-simulator.cta-view-optimization")}
        </Button>
        <TourOptimizationDialog
          open={openOptimizationDialog}
          tour={tour}
          onClose={() => setOpenOptimizationDialog(false)}
        />
      </Content>
    </Block>
  );
};

export default TourOptimizationBlock;
