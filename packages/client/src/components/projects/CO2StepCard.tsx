import styled from "@emotion/styled";
import React, { useState } from "react";
import leafIcon from "../UI/icons/leaf.svg";
import Image from "next/image";
import { Chip, Collapse, darken } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { ProgramWithCO2Information } from "./useAvoidedCO2";
import EmissionFactorCard from "./EmissionFactorCard";
import TextWithTooltip from "@/components/UI/TextWithTooltip";
import { formatCO2 } from "./co2Utils";
import { useTranslation } from "next-i18next";

const CO2Card = styled.div<{ expanded: boolean; alternative?: boolean }>`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  padding: 18px 32px;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: 1.5px solid #e0e0e0;
  border-style: ${({ alternative }) => (alternative ? "dashed" : "solid")};
  margin-top: 32px;
  margin-bottom: 32px;
  max-width: 100%;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
`;

const RouteLabel = styled.div`
  font-size: 14px;
  color: #222;
  margin-bottom: 8px;
  width: 100%;
  flex-grow: 1;
`;

const BlockTitle = styled.div`
  font-size: 15px;
  color: #222;
  margin-bottom: 4px;
  text-align: left;
  width: 100%;
  font-weight: 600;
  text-transform: uppercase;
`;

const RouteKmContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 6px;
  justify-content: space-between;
`;

const RowTitle = styled.div`
  font-size: 13px;
  color: #222;
  margin-bottom: 4px;
  text-align: left;
  width: 100%;
  font-weight: 500;
`;

const KmValue = styled.div`
  font-size: 15px;
  color: #222;
  margin-bottom: 8px;
  text-align: center;
  flex-shrink: 1;
  white-space: nowrap;
`;

const DetailsContainer = styled.div`
  width: 100%;
`;

const Row = styled.div`
  font-size: 15px;
  margin: 8px 0;
  width: 100%;
`;

interface CO2StepCardProps {
  route: ProgramWithCO2Information["route"];
  co2: ProgramWithCO2Information["co2"];
}

const CO2StepCard: React.FC<CO2StepCardProps> = ({ route, co2 }) => {
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();
  const handleToggle = () => {
    setExpanded((v) => !v);
  };

  const avoidedKmValue =
    (route?.withoutCoprogrammation?.kmValue || 0) -
    (route?.withCoprogrammation?.kmValue || 0);

  return (
    <CO2Card expanded={expanded}>
      <Chip
        label={
          formatCO2(co2?.total?.avoidedCo2Kg || 0) +
          " " +
          t("projects:avoided-co2-simulator.section-title-label")
        }
        icon={
          <Image
            src={leafIcon}
            alt="leaf"
            style={{
              width: 20,
              height: 20,
            }}
          />
        }
        sx={{
          background: "#028868",
          paddingLeft: "8px",
          color: "#fff",
          margin: "auto",
          "&:hover": {
            background: darken("#028868", 0.1),
          },
        }}
        clickable
        onClick={handleToggle}
        deleteIcon={
          <InfoOutlinedIcon
            titleAccess={t(
              "projects:avoided-co2-simulator.co2-step-card.show-details"
            )}
            style={{ color: "#fff" }}
          />
        }
        onDelete={handleToggle}
      />

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <DetailsContainer>
          <BlockTitle>
            {t("projects:avoided-co2-simulator.co2-step-card.routes")}
          </BlockTitle>
          <Row>
            <RowTitle>
              {t(
                "projects:avoided-co2-simulator.co2-step-card.without-coprogrammation"
              )}
            </RowTitle>
            <RouteKmContainer>
              <RouteLabel>
                {route?.withoutCoprogrammation?.routeLabel}
              </RouteLabel>
              <KmValue>
                {route?.withoutCoprogrammation?.kmValue}{" "}
                {t("projects:avoided-co2-simulator.co2-step-card.km")}
              </KmValue>
            </RouteKmContainer>
          </Row>
          <Row>
            <RowTitle>
              {t(
                "projects:avoided-co2-simulator.co2-step-card.with-coprogrammation"
              )}
            </RowTitle>
            <RouteKmContainer>
              <RouteLabel>{route?.withCoprogrammation?.routeLabel}</RouteLabel>
              <KmValue>
                {route?.withCoprogrammation?.kmValue}{" "}
                {t("projects:avoided-co2-simulator.co2-step-card.km")}
              </KmValue>
            </RouteKmContainer>
          </Row>
          <Row>
            <RouteKmContainer>
              <RouteLabel style={{ fontWeight: 600, fontStyle: "italic" }}>
                {t(
                  "projects:avoided-co2-simulator.co2-step-card.total-km-avoided"
                )}
              </RouteLabel>
              <KmValue style={{ fontWeight: 600, fontStyle: "italic" }}>
                {avoidedKmValue}{" "}
                {t("projects:avoided-co2-simulator.co2-step-card.km")}
              </KmValue>
            </RouteKmContainer>
          </Row>
          <BlockTitle>
            {t("projects:avoided-co2-simulator.co2-step-card.emissions")}
          </BlockTitle>
          <Row>
            <RouteKmContainer>
              <RouteLabel>
                {co2?.people?.emissionFactor?.icon} {avoidedKmValue}{" "}
                {t("projects:avoided-co2-simulator.co2-step-card.km")} x{" "}
                {co2?.people?.count}{" "}
                {co2?.people?.count === 1
                  ? t("projects:avoided-co2-simulator.co2-step-card.passenger")
                  : t(
                      "projects:avoided-co2-simulator.co2-step-card.passengers"
                    )}{" "}
                x{" "}
                <TextWithTooltip
                  tooltip={
                    <EmissionFactorCard factor={co2?.people?.emissionFactor!} />
                  }
                >
                  <>
                    {co2?.people?.emissionFactor?.emissionFactor}{" "}
                    {co2?.people?.emissionFactor?.unit}
                  </>
                </TextWithTooltip>
              </RouteLabel>
              <KmValue>{formatCO2(co2?.people?.avoidedCo2Kg || 0)}</KmValue>
            </RouteKmContainer>
          </Row>
          <Row>
            <RouteKmContainer>
              <RouteLabel>
                {co2?.freight?.emissionFactor?.icon} {avoidedKmValue}{" "}
                {t("projects:avoided-co2-simulator.co2-step-card.km")} x{" "}
                {(co2?.freight?.weight || 0) / 1000}{" "}
                {t("projects:avoided-co2-simulator.co2-step-card.ton")} x{" "}
                <TextWithTooltip
                  tooltip={
                    <EmissionFactorCard
                      factor={co2?.freight?.emissionFactor!}
                    />
                  }
                >
                  <>
                    {co2?.freight?.emissionFactor?.emissionFactor}{" "}
                    {co2?.freight?.emissionFactor?.unit}
                  </>
                </TextWithTooltip>
              </RouteLabel>
              <KmValue>{formatCO2(co2?.freight?.avoidedCo2Kg || 0)}</KmValue>
            </RouteKmContainer>
          </Row>
          <Row>
            <RouteKmContainer>
              <RouteLabel style={{ fontWeight: 600, fontStyle: "italic" }}>
                {t(
                  "projects:avoided-co2-simulator.co2-step-card.total-co2-avoided"
                )}
              </RouteLabel>
              <KmValue style={{ fontWeight: 600, fontStyle: "italic" }}>
                {formatCO2(co2?.total?.avoidedCo2Kg || 0)}
              </KmValue>
            </RouteKmContainer>
          </Row>
        </DetailsContainer>
      </Collapse>
    </CO2Card>
  );
};

export default CO2StepCard;
