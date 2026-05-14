import styled from "@emotion/styled";
import { CircularProgress } from "@mui/material";
import { useTranslation } from "next-i18next";

const Container = styled.div`
  color: var(--color-orange);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  > h3 {
    color: var(--color-beige);
    font-variant: all-petite-caps;
    font-size: 52px;
    font-family: "Libre Frankin Medium", sans-serif;
    -webkit-text-stroke: 2px var(--color-orange);
    text-stroke: 2px var(--color-orange);
    letter-spacing: 2px;
  }

  > div {
    margin: 20px 0;
    font-weight: bold;
    font-size: 22px;
    letter-spacing: 1px;
    max-width: 400px;
  }
`;

const ProgressContainer = styled.div`
  --mui-palette-primary-main: var(--color-light-green);
  position: relative;
  padding: 20px;
`;

const ValueContainer = styled.div`
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-light-green);
  font-size: 32px;
`;

interface CurvedTextProps {
  color: string;
  children: React.ReactElement | string;
}

const CurvedText = ({ color, children }: CurvedTextProps) => {
  return (
    <svg
      viewBox="10 10 60 60"
      style={{
        position: "absolute",
        top: 16,
        right: 0,
        bottom: 0,
        left: "calc(50% - 72.5px)",
        fontSize: 6,
        transform: "rotate(45deg)",
      }}
      width={185}
      height={200}
    >
      <path id="tophalf" d="M11,40 a24,24 0 0,1 58,0" display="none" />

      <text
        x="5"
        y="0"
        fill={color}
        textAnchor="middle"
        fontVariant="all-petite-caps"
      >
        <textPath xlinkHref="#tophalf" startOffset="45%">
          {children}
        </textPath>
      </text>
    </svg>
  );
};
const DoGood = ({ value }: { value?: number }) => {
  const { t } = useTranslation();
  let label = `${Math.round(value || 0)}`;
  if (value && value > 100000) {
    label = Math.round(value / 1000) + "k";
  }
  return (
    <Container>
      <h3>{t("landing:do-good.title")}</h3>
      <div>{t("landing:do-good.subtitle")}</div>
      {!!value && value > 5000 && (
        <ProgressContainer>
          <CurvedText color="var(--color-light-green)">
            {t("landing:do-good.km-avoided")}
          </CurvedText>
          <CircularProgress
            variant="determinate"
            value={80}
            color="primary"
            size={200}
            style={{
              margin: 20,
            }}
          />
          <ValueContainer>{label}</ValueContainer>
        </ProgressContainer>
      )}
    </Container>
  );
};

export default DoGood;
