import { useTranslation } from "next-i18next";
import { Trans } from "next-i18next";
import PlaceIcon from "@mui/icons-material/Place";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import styled from "@emotion/styled";
import { Tour } from "@cooprog/core";
import humanizeDateRange from "./humanizeDateRange";
import ElectricRickshawOutlinedIcon from "@mui/icons-material/ElectricRickshawOutlined";
import { joinWithSeparator } from "./TechnicalDetails";

const Container = styled.div`
  padding: 16px;
  border-radius: 8px;
  background-color: var(--color-bg-gray);
  margin-bottom: 16px;
  min-width: 100%;
  > div:not(:first-of-type) {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
`;

const TechnicalDetail = styled.div`
  font-size: 13px;
  line-height: 20px;
  display: flex;
  align-items: center;
  gap: 18px;
  svg {
    color: var(--color-gray);
  }

  p {
    line-height: 20px;
  }
`;

const TourTechnicalDetails = ({ tour }: { tour: Tour }) => {
  const { t, i18n } = useTranslation();

  const place = tour.artisticTeamPlace;

  const hasPlace = Boolean(place);

  const hasPeopleTransport =
    tour.peopleTransportMode && tour.peopleTransportMode.length > 0;
  const hasDecorationsTransport =
    tour.decorationsTransportMode && tour.decorationsTransportMode.length > 0;

  const hasWeight = tour.decorationsWeight;

  const peopleTransportModeOptions = t(
    "common:dialogs.new-project.tour-information.people-transport-mode",
    { returnObjects: true }
  ) as {
    [key: string]: {
      label: string;
      emissionFactor: number;
      source: { label: string; link: string };
    };
  };

  const peopleTransportModeKey = tour.peopleTransportMode || "";

  const decorationsTransportModeOptions = t(
    "common:dialogs.new-project.tour-information.decorations-transport-mode",
    { returnObjects: true }
  ) as {
    [key: string]: {
      label: string;
      emissionFactor: number;
      source: { label: string; link: string };
    };
  };
  const decorationsTransportModeKey = tour.decorationsTransportMode || "";

  return (
    <Container>
      <div>
        {tour.start && (
          <TechnicalDetail>
            <CalendarTodayIcon fontSize="small" />
            <p>{humanizeDateRange(tour.start, tour.end || null, i18n)}</p>
          </TechnicalDetail>
        )}
        {hasPlace && (
          <TechnicalDetail>
            <PlaceIcon fontSize="small" />
            <p>
              <strong>{place?.country}</strong>: {place?.city}
            </p>
          </TechnicalDetail>
        )}
        {(hasDecorationsTransport || hasPeopleTransport) && (
          <TechnicalDetail>
            <ElectricRickshawOutlinedIcon fontSize="small" />
            <p>
              {joinWithSeparator([
                hasPeopleTransport && (
                  <Trans
                    i18nKey="projects:tours.technical-details.peopleTransport"
                    components={{ bold: <strong /> }}
                    values={{
                      peopleTransportMode:
                        peopleTransportModeOptions[peopleTransportModeKey]
                          ?.label,
                      emissionFactor:
                        peopleTransportModeOptions[peopleTransportModeKey]
                          ?.emissionFactor,
                      source:
                        peopleTransportModeOptions[peopleTransportModeKey]
                          ?.source,
                    }}
                  />
                ),
                hasDecorationsTransport && (
                  <Trans
                    i18nKey="projects:tours.technical-details.decorationsTransport"
                    components={{ bold: <strong /> }}
                    values={{
                      decorationsTransportMode:
                        decorationsTransportModeOptions[
                          decorationsTransportModeKey
                        ]?.label,
                      decorationsEmissionFactor:
                        decorationsTransportModeOptions[
                          decorationsTransportModeKey
                        ]?.emissionFactor,
                      decorationsSource:
                        decorationsTransportModeOptions[
                          decorationsTransportModeKey
                        ]?.source,
                    }}
                  />
                ),
                hasWeight && (
                  <Trans i18nKey="" components={{ bold: <strong /> }}>
                    {t("projects:tours.technical-details.decorationsWeight", {
                      decorationsWeight: tour.decorationsWeight,
                    })}
                  </Trans>
                ),
              ])}
            </p>
          </TechnicalDetail>
        )}
      </div>
    </Container>
  );
};

export default TourTechnicalDetails;
