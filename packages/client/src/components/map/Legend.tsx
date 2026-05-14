import styled from "@emotion/styled";

const BaseLegend = styled.div`
  padding: 8px;
  border-radius: 8px;
  margin: 8px;

  > div {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;

    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }
`;

export const MapLegend = styled(BaseLegend)`
  position: absolute;
  bottom: 16px;
  left: 0;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.8);
  z-index: 1000;
`;

export const LegendContainer = styled(BaseLegend)`
  margin: 0;
  padding: 0;
  color: #333;
  font-size: 12px;
  margin-top: 16px;
`;

const Box = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background-color: ${({ color }) => color};
  border: 1px solid #ccc;
`;

export const LegendColorBox = ({ color }: { color: string }) => {
  return <Box color={color} />;
};

export default MapLegend;
