import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const EmptyStateContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
  border: 2px dashed var(--color-gray-light);
  border-radius: 16px;
  margin: 24px 0;
  background: linear-gradient(
    to bottom right,
    rgba(255, 255, 255, 0.8),
    rgba(255, 255, 255, 0.4)
  );
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--color-primary);
    transform: translateY(-2px);
  }
`;

const IllustrationContainer = styled("div")`
  width: 200px;
  height: 200px;
  margin-bottom: 32px;
  transition: all 0.3s ease;

  svg {
    width: 100%;
    height: 100%;
    opacity: 0.8;
    transition: all 0.3s ease;
  }

  div:hover & {
    transform: scale(1.05);
    svg {
      opacity: 1;
    }
  }
`;

const EmptyStateTitle = styled(Typography)`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-dark-blue);
  margin-bottom: 12px;
  letter-spacing: -0.5px;
`;

const EmptyStateDescription = styled(Typography)`
  font-size: 1rem;
  color: var(--color-gray);
  max-width: 400px;
  line-height: 1.6;
  opacity: 0.8;
`;

interface EmptyStateProps {
  title: string;
  description: string;
}

const EmptyState = ({ title, description }: EmptyStateProps) => {
  return (
    <EmptyStateContainer>
      <IllustrationContainer>
        <svg
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background circles */}
          <circle cx="200" cy="200" r="150" fill="#123036" fillOpacity="0.05" />
          <circle cx="200" cy="200" r="120" fill="#123036" fillOpacity="0.08" />

          {/* Calendar base */}
          <rect
            x="120"
            y="100"
            width="160"
            height="180"
            rx="8"
            fill="white"
            stroke="#123036"
            strokeWidth="2"
          />

          {/* Calendar header */}
          <rect
            x="120"
            y="100"
            width="160"
            height="40"
            rx="8"
            fill="#123036"
            fillOpacity="0.1"
          />
          <path
            d="M140 130H260"
            stroke="#123036"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Calendar grid lines */}
          <path
            d="M160 140V260"
            stroke="#123036"
            strokeWidth="1"
            strokeOpacity="0.3"
          />
          <path
            d="M200 140V260"
            stroke="#123036"
            strokeWidth="1"
            strokeOpacity="0.3"
          />
          <path
            d="M240 140V260"
            stroke="#123036"
            strokeWidth="1"
            strokeOpacity="0.3"
          />
          <path
            d="M120 160H280"
            stroke="#123036"
            strokeWidth="1"
            strokeOpacity="0.3"
          />
          <path
            d="M120 200H280"
            stroke="#123036"
            strokeWidth="1"
            strokeOpacity="0.3"
          />
          <path
            d="M120 240H280"
            stroke="#123036"
            strokeWidth="1"
            strokeOpacity="0.3"
          />

          {/* Decorative elements */}
          <circle cx="160" cy="180" r="12" fill="#123036" fillOpacity="0.2" />
          <circle cx="200" cy="220" r="12" fill="#123036" fillOpacity="0.2" />
          <circle cx="240" cy="180" r="12" fill="#123036" fillOpacity="0.2" />

          {/* Tour path */}
          <path
            d="M160 180C160 180 180 200 200 220C220 240 240 220 240 180"
            stroke="#123036"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="4 4"
          />

          {/* Location markers */}
          <circle cx="160" cy="180" r="4" fill="#123036" />
          <circle cx="200" cy="220" r="4" fill="#123036" />
          <circle cx="240" cy="180" r="4" fill="#123036" />

          {/* Decorative dots */}
          <circle cx="140" cy="80" r="4" fill="#123036" fillOpacity="0.3" />
          <circle cx="260" cy="80" r="4" fill="#123036" fillOpacity="0.3" />
          <circle cx="140" cy="320" r="4" fill="#123036" fillOpacity="0.3" />
          <circle cx="260" cy="320" r="4" fill="#123036" fillOpacity="0.3" />

          {/* Connecting lines */}
          <path
            d="M140 80L260 80"
            stroke="#123036"
            strokeWidth="1"
            strokeOpacity="0.2"
          />
          <path
            d="M140 320L260 320"
            stroke="#123036"
            strokeWidth="1"
            strokeOpacity="0.2"
          />
          <path
            d="M140 80L140 320"
            stroke="#123036"
            strokeWidth="1"
            strokeOpacity="0.2"
          />
          <path
            d="M260 80L260 320"
            stroke="#123036"
            strokeWidth="1"
            strokeOpacity="0.2"
          />
        </svg>
      </IllustrationContainer>
      <EmptyStateTitle>{title}</EmptyStateTitle>
      <EmptyStateDescription>{description}</EmptyStateDescription>
    </EmptyStateContainer>
  );
};

export default EmptyState;
