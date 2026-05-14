import styled from "@emotion/styled";
import React, { useState } from "react";
import Chip from "@mui/material/Chip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { darken } from "@mui/material";
import Collapse from "@mui/material/Collapse";
import { formatCO2 } from "./co2Utils";

const InfoIcon = styled(InfoOutlinedIcon)<{ alternative?: boolean }>`
  color: ${({ alternative }) => (alternative ? "#4caf50" : "#fff")};
  fill: ${({ alternative }) => (alternative ? "#4caf50" : "#fff")};
  cursor: pointer;
  margin-left: 8px;
`;

interface EmissionFactor {
  icon: string;
  label: string;
  emissionFactor: number;
  source?: { label: string; link: string };
}

interface CO2FormulaDetailsProps {
  km: number;
  peopleCount: number;
  peopleEmissionFactor: EmissionFactor;
  decorationsEmissionFactor: EmissionFactor;
  decoWeight: number;
  showDecorations: boolean;
  background?: string;
  result: number;
  resultLabel?: string;
  onToggleDetails?: (open: boolean) => void;
  alternative?: boolean;
}

const DetailsContainer = styled.div`
  width: 100%;
`;

const Row = styled.div`
  font-size: 15px;
  margin: 8px 0;
  width: 100%;
  padding-left: 24px;
`;

const IconSpan = styled.span<{ marginLeft?: string }>`
  margin-left: ${({ marginLeft }) => marginLeft || "-24px"};
  margin-right: 8px;
`;

const CO2FormulaDetails: React.FC<CO2FormulaDetailsProps> = ({
  km,
  peopleCount,
  peopleEmissionFactor,
  decorationsEmissionFactor,
  decoWeight,
  showDecorations,
  background = "#4caf50",
  result,
  resultLabel = "kg eq. CO₂",
  onToggleDetails,
  alternative = false,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const handleToggle = () => {
    setShowDetails((v) => {
      const newVal = !v;
      if (onToggleDetails) onToggleDetails(newVal);
      return newVal;
    });
  };
  const peopleEFDisplay = `${peopleEmissionFactor.emissionFactor.toLocaleString(
    undefined,
    { maximumFractionDigits: 3 }
  )} kg eq. CO₂`;
  const decoEFDisplay = `${decorationsEmissionFactor.emissionFactor.toLocaleString(
    undefined,
    { maximumFractionDigits: 3 }
  )} kg eq. CO₂`;
  const peopleCO2 = km * peopleEmissionFactor.emissionFactor * peopleCount;
  const decoCO2 =
    km * (decoWeight / 1000) * decorationsEmissionFactor.emissionFactor;

  return (
    <>
      <Chip
        label={formatCO2(result)}
        sx={{
          background: alternative ? "#fff" : background,
          color: alternative ? "#81c784" : "#fff",
          fontWeight: alternative ? 500 : "bold",
          fontSize: alternative ? 18 : 20,
          padding: "8px 24px",
          marginTop: "12px",
          width: "100%",
          justifyContent: "center",
          border: alternative ? "2px dashed #4caf50" : undefined,
          boxShadow: alternative ? "none" : undefined,
          "&:hover": {
            background: alternative ? "#f8f8f8" : darken(background, 0.1),
          },
        }}
        onClick={handleToggle}
        deleteIcon={
          <InfoIcon
            titleAccess="Afficher le détail"
            alternative={alternative}
          />
        }
        clickable
        onDelete={handleToggle}
      />
      <Collapse in={showDetails} timeout="auto" unmountOnExit>
        <DetailsContainer>
          <Row>
            <IconSpan role="img" aria-label="passager">
              {peopleEmissionFactor.icon}
            </IconSpan>
            {`${km} km x ${peopleCount} ${
              peopleCount === 1 ? "passager" : "passagers"
            } x ${peopleEFDisplay}`}{" "}
            = <b style={{ marginLeft: 4 }}>{formatCO2(peopleCO2)}</b>
          </Row>
          {showDecorations && (
            <Row>
              <IconSpan role="img" aria-label="decorations">
                {decorationsEmissionFactor.icon}
              </IconSpan>
              {`${km.toLocaleString(undefined, {
                maximumFractionDigits: 1,
              })} km x ${(decoWeight / 1000).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })} t x ${decoEFDisplay}`}{" "}
              = <b style={{ marginLeft: 4 }}>{formatCO2(decoCO2)}</b>
            </Row>
          )}
        </DetailsContainer>
      </Collapse>
    </>
  );
};

export default CO2FormulaDetails;
