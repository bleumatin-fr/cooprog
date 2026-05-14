import styled from "@emotion/styled";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React from "react";
import LogoWithoutOs from "./LogoWithoutOs";

const Circle = styled.div`
  border-radius: 50%;
  height: 90px;
  width: 90px;
  border: 15px solid ${(props) => props.color};
  border-width: 15px;
  transition: border-width 0.4s ease-in-out;
`;

interface CurvedTextProps {
  color: string;
  startingPosition: "top" | "bottom";
  children: React.ReactElement | string;
}

const CurvedText = ({ color, startingPosition, children }: CurvedTextProps) => {
  return (
    <svg
      viewBox="10 10 60 60"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: 130,
        height: 130,
        fontSize: 8,
        transformOrigin: "center",
      }}
    >
      <path id="title_tophalf" d="M16,40 a24,24 0 0,1 48,0" display="none" />
      <path id="title_lowerhalf" d="M10,40 a24,24 0 0,0 58,0" display="none" />

      {startingPosition === "top" && (
        <text
          x="5"
          y="0"
          fill={color}
          textAnchor="middle"
          fontVariant="all-petite-caps"
          fontFamily="Libre Franklin Medium"
        >
          <textPath xlinkHref="#title_tophalf" startOffset="40%">
            {/* <textPath xlinkHref="#title_tophalf" startOffset="60%"> */}
            {children}
          </textPath>
        </text>
      )}
      {startingPosition === "bottom" && (
        <text
          x="5"
          y="0"
          fill={color}
          textAnchor="middle"
          fontVariant="all-petite-caps"
          fontFamily="Libre Franklin Medium"
          letterSpacing={1}
        >
          <textPath xlinkHref="#title_lowerhalf" startOffset="45%">
            {children}
          </textPath>
        </text>
      )}
    </svg>
  );
};

const ButtonContainer = styled.div`
  position: relative;
  padding: 20px;
  display: inline-block;
  cursor: pointer;
  user-select: none;

  > svg {
    transition: transform 0.4s ease-in-out;
  }

  &:hover {
    > svg {
      transform: rotate(90deg);
    }
    > div {
      border-width: 45px;
    }
  }

  &:active {
    > svg {
      transform: rotate(180deg);
    }
    > div {
      border-width: 45px;
    }
  }
`;

interface ButtonProps {
  color: string;
  text: string;
  startingPosition: "top" | "bottom";
  onClick: () => void;
}

const Button = ({ color, text, startingPosition, onClick }: ButtonProps) => {
  return (
    <ButtonContainer className={startingPosition} onClick={onClick}>
      <CurvedText color={color} startingPosition={startingPosition}>
        {text}
      </CurvedText>
      <Circle color={color} />
    </ButtonContainer>
  );
};

const Container = styled.div`
  overflow: visible;
  max-width: 100vw;
  display: flex;
  justify-content: center;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  max-width: 100vw;
  overflow: visible;
  transition: transform 0.4s ease-in-out;

  @media (max-width: 800px) {
    transform: scale(0.5);
    height: 200px;
    margin-top: 100px;
  }
  @media (min-width: 800px) and (max-width: 1024px) {
    transform: scale(0.8);
  }
  @media (min-width: 1024px) and (max-width: 1280px) {
    transform: scale(1);
  }
  @media (min-width: 1280px) and (max-width: 1600px) {
    transform: scale(1.2);
  }
  @media (min-width: 1600px) {
    transform: scale(1.4);
  }

  transform-origin: top center;
  gap: 20px;
  padding: 0 20px;
  align-items: flex-start;
`;

const NameContainer = styled.div`
  display: flex;
  color: var(--color-text-gray);
  align-items: flex-end;
  position: relative;
  overflow: visible;

  > div {
    font-size: 120px;
    position: absolute;

    &:nth-of-type(1) {
      top: 80px;
      left: 90px;
    }
    &:nth-of-type(2) {
      top: 80px;
      left: 202px;
    }
    &:nth-of-type(3) {
      top: 80px;
      left: 501px;
    }
  }
`;

const SloganContainer = styled.div`
  text-transform: uppercase;
  font-weight: 600;
  font-size: 22px;
  width: 260px;
  color: var(--color-text-gray);
  font-family: "Libre Franklin Medium", sans-serif;
  letter-spacing: 2px;
  user-select: none;
  margin-top: 72px;
  .mobile & {
    display: none;
  }
`;

const Title = () => {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <Container>
      <TitleContainer>
        <NameContainer>
          <LogoWithoutOs
            style={{
              width: 750,
              height: 350,
            }}
          />
          <Button
            color="var(--color-light-green)"
            text={t("authentication:actions.login")}
            startingPosition="top"
            onClick={() => {
              router.push(`/authentication/login`);
            }}
          />
          <Button
            color="var(--color-orange)"
            text={t("authentication:actions.register")}
            startingPosition="bottom"
            onClick={() => router.push(`/authentication/register`)}
          />
          <Button
            color="var(--color-dark-green)"
            text={t("landing:stakes-and-values.title")}
            startingPosition="top"
            onClick={() => {
              document.getElementById("stakes-and-values")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          />
        </NameContainer>
        <SloganContainer>{t("landing:slogan")}</SloganContainer>
      </TitleContainer>
    </Container>
  );
};

export default Title;
