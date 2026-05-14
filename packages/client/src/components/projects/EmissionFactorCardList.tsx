import React from "react";
import styled from "@emotion/styled";

interface EmissionFactor {
  icon: string;
  label: string;
  value: number;
  unit: string;
  source?: string;
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  margin: 24px 0;
`;

const Card = styled.div`
  background: #f5f7fa;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  padding: 24px 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
  min-width: 320px;
  border: 1.5px solid #e0e0e0;
`;

const FactorItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Icon = styled.span`
  font-size: 36px;
`;

const Label = styled.div`
  font-size: 15px;
  color: #333;
`;

const Value = styled.div`
  font-weight: 600;
  font-size: 20px;
`;

const Source = styled.div`
  font-size: 13px;
  color: #888;
`;

const Divider = styled.div`
  width: 2px;
  height: 48px;
  background: #e0e0e0;
  margin: 0 32px;
  border-radius: 1px;
`;

const EmissionFactorCardList: React.FC<{ factors: EmissionFactor[] }> = ({
  factors,
}) => {
  return (
    <Container>
      <Card>
        {factors.map((factor, idx) => (
          <React.Fragment key={factor.label}>
            <FactorItem>
              <Icon role="img" aria-label={factor.label}>
                {factor.icon}
              </Icon>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Label>{factor.label}</Label>
                <Value>
                  {factor.value} {factor.unit}
                </Value>
                {factor.source && <Source>{factor.source}</Source>}
              </div>
            </FactorItem>
            {idx < factors.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Card>
    </Container>
  );
};

export default EmissionFactorCardList;
