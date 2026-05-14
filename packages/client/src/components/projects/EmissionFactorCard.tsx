import React from "react";
import styled from "@emotion/styled";
import { EmissionFactor } from "./useAvoidedCO2";
import Link from "next/link";

const FactorItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  color: #fff;
  padding: 8px;
`;

const Icon = styled.div`
  font-size: 36px;
`;

const Label = styled.div`
  font-size: 15px;
`;

const Value = styled.div`
  font-weight: 600;
  font-size: 20px;
`;

const Source = styled.div`
  font-size: 13px;
`;

const EmissionFactorCard = ({ factor }: { factor: EmissionFactor }) => {
  return (
    <FactorItem>
      <Icon role="img" aria-label={factor.label}>
        {factor.icon}
      </Icon>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Label>{factor.label}</Label>
        <Value>
          {factor.emissionFactor} {factor.unit}
        </Value>
        {factor.source && (
          <Source>
            Source :{" "}
            <Link href={factor.source.link} target="_blank">
              {factor.source.label}
            </Link>
          </Source>
        )}
      </div>
    </FactorItem>
  );
};

export default EmissionFactorCard;
