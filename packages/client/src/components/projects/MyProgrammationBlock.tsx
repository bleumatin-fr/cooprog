import styled from "@emotion/styled";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import {
  Button,
  Step,
  StepConnector,
  stepConnectorClasses,
  StepIconProps,
  StepLabel,
  Stepper,
  styled as muiStyled,
} from "@mui/material";
import { useTranslation } from "next-i18next";

import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import Markdown from "../UI/Markdown";
import ClearIcon from "@mui/icons-material/Clear";

const Container = styled.div`
  border: 2px solid var(--my-background-color);
  padding: 1rem;
  border-radius: 0.5rem;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 1rem;

  > span {
    flex-grow: 1;
  }
`;

const ExplanationContainer = styled.div`
  margin-top: 1rem;
`;

const gradient =
  "var(--my-background-color) 0%, var(--my-background-color) 100%";

const ColorlibConnector = muiStyled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient( 95deg,${gradient})`,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient( 95deg,${gradient})`,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: "#eaeaf0",
    borderRadius: 1,
    ...theme.applyStyles("dark", {
      backgroundColor: theme.palette.grey[800],
    }),
  },
}));

const ColorlibStepIconRoot = muiStyled("div")<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme }) => ({
  backgroundColor: "#ccc",
  zIndex: 1,
  color: "#fff",
  width: 50,
  height: 50,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  ...theme.applyStyles("dark", {
    backgroundColor: theme.palette.grey[700],
  }),
  variants: [
    {
      props: ({ ownerState }) => ownerState.active,
      style: {
        backgroundImage: `linear-gradient( 136deg, ${gradient})`,
        boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
      },
    },
    {
      props: ({ ownerState }) => ownerState.completed,
      style: {
        backgroundImage: `linear-gradient( 136deg, ${gradient})`,
      },
    },
  ],
}));

const IconMerger = styled.div`
  position: relative;

  & svg:nth-of-type(1) {
    font-size: 22px;
  }

  & svg:nth-of-type(2) {
    position: absolute;
    top: 7px;
    font-size: 12px;
    right: 0;
    bottom: 0;
    left: 4px;
    width: 0.9rem;
  }
`;

function ColorlibStepIcon(props: StepIconProps) {
  const { active, completed, className } = props;

  const icons: { [index: string]: React.ReactElement<unknown> } = {
    1: <TipsAndUpdatesIcon />,
    2: (
      <IconMerger>
        <CalendarTodayIcon />
        <QuestionMarkIcon />
      </IconMerger>
    ),
    3: (
      <IconMerger>
        <CalendarTodayIcon />
        <TaskAltIcon />
      </IconMerger>
    ),
  };

  return (
    <ColorlibStepIconRoot
      ownerState={{ completed, active }}
      className={className}
    >
      {icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
}

export const enum ProgrammationSteps {
  INTERESTED = 0,
  OPTION = 1,
  CONFIRMED = 2,
}

const stepKeys = ["interested", "option", "confirmed"];

interface MyProgrammationBlockProps {
  step: ProgrammationSteps;
  removeInterest: () => void;
}

const MyProgrammationBlock = ({
  step,
  removeInterest,
}: MyProgrammationBlockProps) => {
  const { t } = useTranslation();

  return (
    <Container>
      <Title>
        <CalendarMonthOutlinedIcon />
        <span>{t("projects:tours.my-programmation.title")}</span>
        <Button
          variant="text"
          color="secondary"
          size="small"
          startIcon={<ClearIcon />}
          onClick={removeInterest}
        >
          {t("projects:tours.removeInterest")}
        </Button>
      </Title>
      <Stepper
        activeStep={step}
        alternativeLabel
        connector={<ColorlibConnector />}
      >
        <Step>
          <StepLabel StepIconComponent={ColorlibStepIcon}>
            {t("projects:tours.steps.interested.title")}
          </StepLabel>
        </Step>
        <Step>
          <StepLabel StepIconComponent={ColorlibStepIcon}>
            {t("projects:tours.steps.option.title")}
          </StepLabel>
        </Step>
        <Step>
          <StepLabel StepIconComponent={ColorlibStepIcon}>
            {t("projects:tours.steps.confirmed.title")}
          </StepLabel>
        </Step>
      </Stepper>
      <ExplanationContainer>
        <Markdown>
          {t(`projects:tours.steps.${stepKeys[step]}.description`)}
        </Markdown>
      </ExplanationContainer>
    </Container>
  );
};

export default MyProgrammationBlock;
