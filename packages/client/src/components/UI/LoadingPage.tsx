import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { useTranslation } from "next-i18next";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
`;

const logoPulse = keyframes`
  0%, 100% {
    opacity: 0.8;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
  }
`;

const oAnimation = keyframes`
  0%, 100% {
    transform: scale(1) rotate(0deg);
    opacity: 0.7;
  }
  25% {
    transform: scale(1.1) rotate(5deg);
    opacity: 1;
  }
  50% {
    transform: scale(1.05) rotate(-3deg);
    opacity: 0.9;
  }
  75% {
    transform: scale(1.15) rotate(8deg);
    opacity: 1;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
  animation: ${fadeIn} 0.8s ease-out;
`;

const LogoContainer = styled.div`
  position: relative;
  margin-bottom: 2rem;
  animation: ${logoPulse} 3s ease-in-out infinite;
`;

const AnimatedLogo = styled.div`
  width: 200px;
  height: 75px;
  position: relative;

  svg {
    width: 100%;
    height: 100%;
    fill: var(--color-orange);
    transition: fill 0.3s ease;
  }

  &:hover svg {
    fill: var(--color-light-green);
  }

  #O_1 {
    animation: ${oAnimation} 2s ease-in-out infinite;
    transform-origin: center;
  }

  #O_2 {
    animation: ${oAnimation} 2s ease-in-out infinite 0.5s;
    transform-origin: center;
  }

  #O_3 {
    animation: ${oAnimation} 2s ease-in-out infinite 1s;
    transform-origin: center;
  }
`;

const LoadingText = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--color-text-gray);
  margin-bottom: 1rem;
  text-align: center;
  font-family: "Libre Franklin Medium", sans-serif;
  letter-spacing: 0.5px;
`;

const SpinnerContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const SpinnerDot = styled.div<{ delay: number }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-orange);
  animation: ${pulse} 1.4s ease-in-out infinite;
  animation-delay: ${(props) => props.delay}s;
`;

const LoadingPage = () => {
  const { t } = useTranslation();

  return (
    <LoadingContainer>
      <LogoContainer>
        <AnimatedLogo>
          <svg
            width="2450"
            height="918.88"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 2450 918.88"
          >
            <g className="layer">
              <path
                d="m216.59,261.2c35.28,0 62.04,13.72 81.99,35.08l0,-55c-23.33,-16.45 -51.6,-26.13 -81.99,-26.13c-65.76,0 -121.6,45.33 -138.63,106.74c-3.46,12.47 -5.45,25.55 -5.45,39.11c0,80.31 64.95,145.85 144.08,145.85c30.38,0 58.66,-9.68 81.99,-26.13l0,-55.05c-21.24,29.32 -46.68,35.12 -81.99,35.12c-53.75,0 -95.67,-42.51 -95.67,-99.79c0,-14.07 2.56,-27.24 7.17,-39.11c14.17,-36.48 47.96,-60.69 88.5,-60.69z"
                id="C"
              />
              <path
                d="m515.13,507.42c-80.43,0 -145.87,-65.44 -145.87,-145.87s65.44,-145.87 145.87,-145.87s145.87,65.44
        145.87,145.87s-65.44,145.87 -145.87,145.87zm0,-244.25c-54.24,0 -98.37,44.13
        -98.37,98.37s44.13,98.37 98.37,98.37s98.37,-44.13 98.37,-98.37s-44.13,-98.37 -98.37,-98.37z"
                id="O_1"
              />
              <path
                d="m874.01,507.42c-80.43,0 -145.87,-65.44 -145.87,-145.87s65.44,-145.87 145.87,-145.87s145.87,65.44
        145.87,145.87s-65.44,145.87 -145.87,145.87zm0,-244.25c-54.24,0 -98.37,44.13
        -98.37,98.37s44.13,98.37 98.37,98.37s98.37,-44.13 98.37,-98.37s-44.13,-98.37 -98.37,-98.37z"
                id="O_2"
              />
              <path
                d="m1260.7,216.39c-35.72,0 -68.54,13.36 -93.81,35.39l0,-28.31l-50.27,0l0,428.79l50.27,0l0,-179.56c25.27,22.04 58.1,35.39 93.81,35.39c79.13,0 144.08,-65.54 144.08,-145.85s-64.95,-145.85 -144.08,-145.85zm0,245.64c-0.4,0 -0.78,-0.05 -1.18,-0.06c-0.4,0 -0.78,0.06 -1.18,0.06c-53.73,0 -95.65,-42.51 -95.65,-99.79s41.92,-99.8 95.65,-99.8c0.4,0 0.78,0.05 1.18,0.06c0.4,0 0.78,-0.06 1.18,-0.06c53.73,0 95.65,42.52 95.65,99.8s-41.92,99.79 -95.65,99.79z"
                id="P"
              />
              <rect
                height="285.07"
                id="R_1"
                width="50.2"
                x="1501.79"
                y="223.02"
              />
              <path
                d="m1625.93,216.39c-22.47,0 -40.69,18.21 -40.69,40.68s18.22,40.68 40.69,40.68s40.68,-18.21 40.68,-40.68s-18.21,-40.68 -40.68,-40.68z"
                id="R_2"
              />
              <path
                d="m1861.88,507.42c-80.43,0 -145.87,-65.44 -145.87,-145.87s65.44,-145.87
        145.87,-145.87s145.87,65.44 145.87,145.87s-65.44,145.87 -145.87,145.87zm0,-244.25c-54.24,0
        -98.37,44.13 -98.37,98.37s44.13,98.37 98.37,98.37s98.37,-44.13 98.37,-98.37s-44.13,-98.37
        -98.37,-98.37z"
                id="O_3"
              />
              <path
                d="m2366.84,135.02c-22.47,0 -40.69,18.21 -40.69,40.68s18.22,40.68 40.69,40.68s40.68,-18.21 40.68,-40.68s-18.21,-40.68 -40.68,-40.68z"
                id="G_1"
              />
              <path
                d="m2232.95,506.9c74.75,-6.21 133.68,-69.03 133.68,-145.36c0,-80.43 -65.44,-145.87 -145.87,-145.87s-145.87,65.44 -145.87,145.87s58.93,139.15 133.68,145.36c-74.75,6.21 -133.68,69.03 -133.68,145.36c0,80.43 65.44,145.87 145.87,145.87s145.87,-65.44 145.87,-145.87s-58.93,-139.15 -133.68,-145.36zm-110.56,-145.36c0,-54.24 44.13,-98.37 98.37,-98.37s98.37,44.13 98.37,98.37s-44.13,98.37 -98.37,98.37s-98.37,-44.13 -98.37,-98.37zm98.37,389.09c-54.24,0 -98.37,-44.13 -98.37,-98.37s44.13,-98.37 98.37,-98.37s98.37,44.13 98.37,98.37s-44.13,98.37 -98.37,98.37z"
                id="G_2"
              />
            </g>
          </svg>
        </AnimatedLogo>
      </LogoContainer>

      <LoadingText>{t("common:loading")}</LoadingText>

      <SpinnerContainer>
        <SpinnerDot delay={0} />
        <SpinnerDot delay={0.2} />
        <SpinnerDot delay={0.4} />
      </SpinnerContainer>
    </LoadingContainer>
  );
};

export default LoadingPage;
