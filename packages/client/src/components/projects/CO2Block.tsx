import { Tour, Project } from "@cooprog/core";
import styled from "@emotion/styled";
import { useTranslation } from "next-i18next";
import HomeIcon from "@mui/icons-material/Home";
import UserAvatar from "@/components/structures/UserAvatar";
import MissingInformationList from "./MissingInformationList";
import Image from "next/image";
import leafIcon from "../UI/icons/leaf.svg";
import useTour from "./useTour";
import { useSnackbar } from "notistack";
import CO2StepCard from "./CO2StepCard";
import { useTourAvoidedCO2 } from "./useAvoidedCO2";
import ImpactCO2 from "./ImpactCO2";
import { formatCO2 } from "./co2Utils";
import TourOptimizationBlock from "./TourOptimizationBlock";

const Section = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 16px;
  width: 100%;

  h4 {
    color: #123036;
    font-variant: normal;
  }
`;

const SectionTitle = styled.div`
  background: #4caf50;
  color: #fff;
  border-radius: 20px;
  padding: 10px 32px;
  margin: 0 0 16px 0;
  align-self: center;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  display: inline-flex;
  flex-direction: row;
  align-items: baseline;
  gap: 12px;
  // width: 100%;
  justify-content: center;
`;

const SectionTitleIcon = styled.span`
  display: flex;
  align-items: center;
  margin-right: 6px;
`;

const SectionTitleNumber = styled.span`
  font-size: 2.2rem;
  font-weight: bold;
  line-height: 1.1;
`;

const SectionTitleLabel = styled.span`
  font-size: 1.1rem;
  font-weight: 400;
  margin-top: 0;
`;

const StatusContainer = styled.div`
  --mui-palette-primary-main: var(--color-light-green);
  --mui-palette-primary-contrastText: var(--color-white);
  svg {
    fill: white;
  }
`;
const StepperContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin-left: 32px;
  margin-top: 24px;
  margin-bottom: 24px;
`;
const StepRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  //   margin-bottom: 16px;
  //   margin-top: 64px;
  position: relative;
  flex-wrap: wrap;
`;

const StepLine = styled.div`
  position: absolute;
  left: -22px;
  top: 48px;
  width: 2px;
  height: calc(100% - 24px);
  background: #ccc;
  z-index: 1;
`;
const StepInfo = styled.div`
  width: 100%;
  min-width: 180px;
  // margin-right: 32px;
  font-size: 15px;
  color: #222;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  padding-left: 16px;
  justify-content: center;

  > div {
    max-width: 100%;
    // width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  > div:first-child {
    font-style: italic;
    font-size: 13px;
    color: #888;
  }

  > div:nth-child(2) {
    font-weight: 600;
    margin-bottom: 4px;
  }
`;

const CO2CardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 16px;
  min-height: 80px;

  @media (min-width: 800px) {
    flex-direction: row;
    gap: 16px;
  }
`;

const ImpactCO2Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: stretch;
  margin-top: 16px;
  font-family: "Libre Franklin Medium", sans-serif !important;

  .impact-co2-etiquette {
    > div {
      height: 100% !important;
      > div {
        height: 100% !important;
        > div:first-child {
          display: none !important;
        }

        > div:last-child {
          height: 100% !important;
          > div:last-child {
            height: 100% !important;
            > ul {
              height: 100% !important;
            }
          }
        }
      }
    }
  }
`;

const AvoidedCO2TabLabel = styled.div`
  gap: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  font-weight: 500;
  font-size: 1.6rem;

  border-radius: 6px 0 0 6px !important;
  gap: 0.75em !important;
  background-color: var(--primary-10) !important;
  color: var(--primary-70) !important;

  width: fit-content !important;
  display: flex !important;
  align-items: center !important;
  padding: 0 0.875rem 0 0.75rem !important;
  height: auto !important;
  color: var(--primary-50) !important;
  background-color: var(--primary-10) !important;
  box-shadow: none !important;
  min-height: 3.5rem !important;
  border: 2px solid var(--primary-30) !important;

  padding: 0.75em 1.25em 0.75em 0.25em !important;
  margin-right: -6px;

  img {
    width: 20px !important;
    height: 20px !important;
    margin-right: 12px !important;
    margin-left: 12px !important;
    position: relative !important;
    top: 2px !important;
    filter: brightness(0) saturate(100%) invert(27%) sepia(85%) saturate(500%)
      hue-rotate(140deg) brightness(1) contrast(1);
  }

  div {
    white-space: wrap;
    color: var(--primary-70) !important;
    line-height: 0.8 !important;
  }
  span {
    font-size: 0.8rem !important;
  }
`;

const CO2Block = ({
  project,
  tour,
  showTitle = true,
}: {
  project: Project;
  tour: Tour;
  showTitle?: boolean;
}) => {
  const { t } = useTranslation();
  const { edit } = useTour(project._id, tour._id!);
  const { enqueueSnackbar } = useSnackbar();

  const { totalAvoidedCO2Tons, steps, optimizationSavings } =
    useTourAvoidedCO2(tour);

  if (!steps.length) return null;

  const handleEditTour = async (update: Partial<Tour>) => {
    try {
      await edit(update);
      enqueueSnackbar(t("projects:tours.edit.success-as-owner"), {
        variant: "success",
      });
    } catch (error) {
      console.error("Error editing tour:", error);
      enqueueSnackbar(t("projects:tours.edit.error"), {
        variant: "error",
      });
    }
  };

  const formattedTotalAvoidedCO2 = formatCO2(totalAvoidedCO2Tons * 1000);
  const [value, unit] = formattedTotalAvoidedCO2.split(" ");

  return (
    <Section>
      <MissingInformationList
        project={project}
        tour={tour}
        style={{ fontStyle: "italic", paddingLeft: 16 }}
        onTourEdit={handleEditTour}
      />

      <ImpactCO2Container>
        <AvoidedCO2TabLabel>
          <Image src={leafIcon} alt="leaf" />
          <div>
            {value}{" "}
            <span>
              {unit} {t("projects:avoided-co2-simulator.section-title-label")}
            </span>
          </div>
        </AvoidedCO2TabLabel>
        <ImpactCO2 value={totalAvoidedCO2Tons * 1000000} />
      </ImpactCO2Container>
      <StepperContainer>
        {steps.map((step, idx) => {
          return (
            <StepRow key={step._id || idx}>
              <div
                style={{ position: "absolute", left: -40, top: 0, zIndex: 2 }}
              >
                {step.user ? (
                  <UserAvatar
                    user={step.user || {}}
                    size="medium"
                    showLink
                    showTooltip
                  />
                ) : (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      background: "#eee",
                      border: "2px solid #ccc",
                    }}
                  >
                    <HomeIcon style={{ width: 30, height: 30 }} />
                  </div>
                )}
              </div>
              {idx < steps.length - 1 && <StepLine />}
              <StepInfo>
                <div>
                  {step.date ? new Date(step.date).toLocaleDateString() : ""}
                </div>
                <div>{step.user ? step.user.company : ""}</div>
                <div>
                  {step.location?.data?.city && step.location?.data?.country
                    ? `${step.location.data.city}, ${step.location.data.country}`
                    : step.location?.address || ""}
                </div>
              </StepInfo>
              {idx < steps.length - 1 && (
                <CO2CardsContainer>
                  {step.co2 && step.co2?.total?.avoidedCo2Kg > 0 && (
                    <CO2StepCard route={step.route} co2={step.co2} />
                  )}
                </CO2CardsContainer>
              )}
            </StepRow>
          );
        })}
      </StepperContainer>
      {optimizationSavings > 0 && !tour.archived && (
        <TourOptimizationBlock
          tour={tour}
          style={{ fontStyle: "italic", paddingLeft: 16 }}
        />
      )}
    </Section>
  );
};

export default CO2Block;
