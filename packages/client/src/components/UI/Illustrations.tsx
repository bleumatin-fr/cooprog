import styled from "@emotion/styled";

interface IllustrationProps {
  color?: string;
  hoverColor?: string;
  width?: string;
  height?: string;
}

const BottomLeftContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 130px;
  height: 110px;
  transform: scaleX(-1);
  transition: fill 0.2s ease-in-out;

  fill: ${(props: IllustrationProps) => props.color};

  a:hover &,
  a.selected & {
    fill: ${(props: IllustrationProps) => props.hoverColor};
  }
`;

export const BottomLeftIllustration = ({
  color = "#F8F8F8",
  hoverColor = "#F8F8F8",
  width = "130",
  height = "110",
}: IllustrationProps) => {
  return (
    <BottomLeftContainer
      color={color}
      hoverColor={hoverColor}
      style={{ width, height }}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 130 110"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M129.465 3.38232C120.66 1.21376 111.375 0.0685404 101.784 0.099808C45.5704 0.283074 0.131652 40.8138 0.294053 90.6278C0.314598 96.9294 1.06392 103.078 2.47112 109.01L43.4244 108.877C41.1115 103.132 39.843 96.9469 39.822 90.4989C39.7226 60.0302 67.5153 35.2395 101.899 35.1274C111.838 35.095 121.24 37.1283 129.587 40.7718L129.465 3.38232Z"
        />
      </svg>
    </BottomLeftContainer>
  );
};

const BottomRightContainer = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 130px;
  height: 110px;
  transition: fill 0.2s ease-in-out;

  fill: ${(props: IllustrationProps) => props.color};

  a:hover &,
  a.selected & {
    fill: ${(props: IllustrationProps) => props.hoverColor};
  }
`;

export const BottomRightIllustration = ({
  color = "#F8F8F8",
  hoverColor = "#F8F8F8",
  width = "130",
  height = "110",
}: IllustrationProps) => {
  return (
    <BottomRightContainer
      color={color}
      hoverColor={hoverColor}
      style={{ width, height }}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 130 110"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M129.465 3.38232C120.66 1.21376 111.375 0.0685404 101.784 0.099808C45.5704 0.283074 0.131652 40.8138 0.294053 90.6278C0.314598 96.9294 1.06392 103.078 2.47112 109.01L43.4244 108.877C41.1115 103.132 39.843 96.9469 39.822 90.4989C39.7226 60.0302 67.5153 35.2395 101.899 35.1274C111.838 35.095 121.24 37.1283 129.587 40.7718L129.465 3.38232Z"
        />
      </svg>
    </BottomRightContainer>
  );
};

const TopLeftContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 200px;
  height: 137px;
  transition: fill 0.2s ease-in-out;

  fill: ${(props: IllustrationProps) => props.color};

  a:hover &,
  a.selected & {
    fill: ${(props: IllustrationProps) => props.hoverColor};
  }
`;

export const TopLeftIllustration = ({
  color = "#F8F8F8",
  hoverColor = "#F8F8F8",
  width = "200",
  height = "138",
}: IllustrationProps) => {
  return (
    <TopLeftContainer
      color={color}
      hoverColor={hoverColor}
      style={{ width, height }}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 138"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 80.5094V133.884C4.86027 134.862 9.81972 135.665 14.8696 136.283C102.822 147.062 184.89 97.9401 198.172 26.566C199.84 17.6016 200.344 8.71258 199.776 0H137.07C137.74 6.19923 137.522 12.5613 136.327 18.9866C128.202 62.6427 78.0058 92.6883 24.2095 86.0954C15.6804 85.0501 7.57284 83.1467 0 80.5094Z"
        />
      </svg>
    </TopLeftContainer>
  );
};

const TopRightContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 137px;
  transform: scaleX(-1);
  transition: fill 0.2s ease-in-out;

  fill: ${(props: IllustrationProps) => props.color};

  a:hover &,
  a.selected & {
    fill: ${(props: IllustrationProps) => props.hoverColor};
  }
`;

export const TopRightIllustration = ({
  color = "#F8F8F8",
  hoverColor = "#F8F8F8",
  width = "200",
  height = "138",
}: IllustrationProps) => {
  return (
    <TopRightContainer
      color={color}
      hoverColor={hoverColor}
      style={{ width, height }}
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 138"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 80.5094V133.884C4.86027 134.862 9.81972 135.665 14.8696 136.283C102.822 147.062 184.89 97.9401 198.172 26.566C199.84 17.6016 200.344 8.71258 199.776 0H137.07C137.74 6.19923 137.522 12.5613 136.327 18.9866C128.202 62.6427 78.0058 92.6883 24.2095 86.0954C15.6804 85.0501 7.57284 83.1467 0 80.5094Z"
        />
      </svg>
    </TopRightContainer>
  );
};
