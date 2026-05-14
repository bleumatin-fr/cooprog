import { Discipline, Project } from "@cooprog/core";
import styled from "@emotion/styled";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";
import Groups3RoundedIcon from "@mui/icons-material/Groups3Rounded";
import HearingDisabledOutlinedIcon from "@mui/icons-material/HearingDisabledOutlined";
import PlaceIcon from "@mui/icons-material/Place";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import TheaterComedyRoundedIcon from "@mui/icons-material/TheaterComedyRounded";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import type { TFunction } from "i18next";
import { Trans, useTranslation } from "next-i18next";
import React from "react";
import Markdown from "../UI/Markdown";
import FilesAndLinks from "./FilesAndLinks";

const Container = styled.div`
  padding: 16px;
  border-radius: 8px;
  background-color: var(--color-bg-gray);
  margin-bottom: 16px;
  > div:not(:first-of-type) {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
`;

const TechnicalDetail = styled.div`
  font-size: 13px;
  display: flex;
  align-items: flex-start;
  gap: 18px;
  svg {
    color: var(--color-gray);
  }

  p {
    line-height: 20px;
  }
`;

const AccessibilityValue = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  line-height: 1.2;

  svg {
    display: block;
    font-size: 16px;
  }
`;

export const joinWithSeparator = (
  items: (React.ReactNode | false)[],
  separator = " · ",
) =>
  items.filter(Boolean).reduce<React.ReactNode[]>((acc, item, index) => {
    if (index > 0) acc.push(separator);
    acc.push(item);
    return acc;
  }, []);

const TechnicalDetails = ({ project }: { project: Project }) => {
  const { t } = useTranslation();

  const hasLink = project.links && project.links.length > 0;
  const hasFile = project.files && project.files.length > 0;

  const hasGauge = project.gauge && project.gauge.length > 0;
  const hasMinimumStageSize =
    project.minimumStageSize && project.minimumStageSize.length > 0;
  const hasVenueConfigurationType =
    project.venueConfigurationType && project.venueConfigurationType.length > 0;
  const hasVenueConfigurationSpace =
    project.venueConfigurationSpace &&
    project.venueConfigurationSpace.length > 0;
  const hasVenueConfigurationAudience =
    project.venueConfigurationAudience &&
    project.venueConfigurationAudience.length > 0;
  const hasVenueConfiguration =
    hasVenueConfigurationType ||
    hasVenueConfigurationSpace ||
    hasVenueConfigurationAudience;
  const hasPerformanceLanguages =
    project.performanceLanguages && project.performanceLanguages.length > 0;
  const hasAccessibilityVisual = Boolean(project.accessibilityVisual);
  const hasAccessibilityAudio = Boolean(project.accessibilityAudio);
  const hasAccessibility = hasAccessibilityVisual || hasAccessibilityAudio;

  const hasRepresentationConditions =
    hasGauge || hasMinimumStageSize || hasVenueConfiguration || hasPerformanceLanguages;

  const hasFee =
    project.averagePerformanceFee && project.averagePerformanceFee.length > 0;
  const hasNbArtistOnStage =
    project.numberOfArtistOnStage && project.numberOfArtistOnStage > 0;
  const hasNbPeopleOnTour =
    project.numberOfPeopleOnTour && project.numberOfPeopleOnTour > 0;
  const hasFinancialSupport = !!project.financialSupport?.length;

  // Vérifier la présence des informations de répartition par genre
  const hasGenderDistribution =
    (project.numberOfMenOnStage && project.numberOfMenOnStage > 0) ||
    (project.numberOfWomenOnStage && project.numberOfWomenOnStage > 0) ||
    (project.numberOfNonBinaryOnStage && project.numberOfNonBinaryOnStage > 0);

  const hasBudgetInformation =
    hasFee || hasNbArtistOnStage || hasNbPeopleOnTour || hasFinancialSupport;

  // TO UDPATE WITH ARTISTIC INFO
  const hasArtisticInfo = hasGenderDistribution;

  const placesByCountry = React.useMemo(() => {
    return project.places?.reduce<Record<string, string[]>>((acc, place) => {
      if (!acc[place.country]) acc[place.country] = [];
      acc[place.country].push(place.city);
      return acc;
    }, {});
  }, [project.places]);

  const venueConfiguration = React.useMemo(() => {
    return joinWithSeparator([
      hasVenueConfigurationType &&
        getListOfProperties(
          project.venueConfigurationType!,
          "projects:venueConfigurationTypes",
          t,
        ),
      hasVenueConfigurationSpace &&
        getListOfProperties(
          project.venueConfigurationSpace!,
          "projects:venueConfigurationSpaces",
          t,
        ),
      hasVenueConfigurationAudience &&
        getListOfProperties(
          project.venueConfigurationAudience!,
          "projects:venueConfigurationAudiences",
          t,
        ),
    ]);
  }, [
    project.venueConfigurationType,
    project.venueConfigurationSpace,
    project.venueConfigurationAudience,
  ]);

  const accessibilityDetails = React.useMemo(
    () =>
      joinWithSeparator([
        hasAccessibilityVisual && (
          <AccessibilityValue key="accessibility-visual">
            <VisibilityOffOutlinedIcon fontSize="inherit" />
            {t("projects:technical-details.accessibilityVisualValue")}
          </AccessibilityValue>
        ),
        hasAccessibilityAudio && (
          <AccessibilityValue key="accessibility-audio">
            <HearingDisabledOutlinedIcon fontSize="inherit" />
            {t("projects:technical-details.accessibilityAudioValue")}
          </AccessibilityValue>
        ),
      ]),
    [hasAccessibilityAudio, hasAccessibilityVisual, t],
  );

  if (
    !hasRepresentationConditions &&
    !hasAccessibility &&
    !hasBudgetInformation &&
    !hasArtisticInfo &&
    !hasLink &&
    !hasFile &&
    !Object.keys(placesByCountry || {}).length
  ) {
    return null;
  }

  return (
    <Container>
      <div>
        {(hasLink || hasFile) && (
          <TechnicalDetail>
            <AttachFileIcon fontSize="small" />
            <FilesAndLinks
              projectId={project._id}
              files={project.files}
              links={project.links}
            />
          </TechnicalDetail>
        )}

        {hasRepresentationConditions && (
          <TechnicalDetail>
            <TheaterComedyRoundedIcon fontSize="small" />

            <p>
              {joinWithSeparator([
                hasGauge && (
                  <TranslatedList
                    labelKey="projects:technical-details.gauge"
                    labelListKey="gauges"
                    listKey={
                      project.discipline === Discipline.MUSIC
                        ? "projects:gaugesMusic"
                        : "projects:gauges"
                    }
                    values={project.gauge}
                  />
                ),
                hasMinimumStageSize && (
                  <TranslatedList
                    labelKey="projects:technical-details.minimumStageSize"
                    labelListKey="minimumStageSizes"
                    listKey="projects:minimumStageSizes"
                    values={project.minimumStageSize}
                  />
                ),
                hasVenueConfiguration && venueConfiguration.length > 0 && (
                  <>
                    <Trans
                      i18nKey="projects:technical-details.venueConfiguration"
                      components={{
                        bold: <strong key="venue-config-strong" />,
                      }}
                    />
                    {` `}
                    {venueConfiguration}
                  </>
                ),
                hasPerformanceLanguages && (
                  <TranslatedList
                    labelKey="projects:technical-details.performanceLanguages"
                    labelListKey="performanceLanguages"
                    listKey="projects:performanceLanguages"
                    values={project.performanceLanguages}
                  />
                ),
              ])}
            </p>
          </TechnicalDetail>
        )}

        {hasAccessibility && (
          <TechnicalDetail>
            <AccessibilityNewIcon fontSize="small" />
            <p>
              <strong>{t("projects:technical-details.accessibilityLabel")}</strong>{" "}
              {accessibilityDetails}
            </p>
          </TechnicalDetail>
        )}

        {hasBudgetInformation && (
          <TechnicalDetail>
            <SavingsRoundedIcon fontSize="small" />
            <p>
              {joinWithSeparator([
                hasFee && (
                  <TranslatedList
                    labelKey="projects:technical-details.averagePerformanceFee"
                    labelListKey="averagePerformanceFees"
                    listKey={
                      project.discipline === Discipline.MUSIC
                        ? "projects:averagePerformanceFeesMusic"
                        : "projects:averagePerformanceFees"
                    }
                    values={project.averagePerformanceFee}
                  />
                ),
                hasNbArtistOnStage && (
                  <Trans
                    i18nKey=""
                    components={{ bold: <strong key="nb-artist-strong" /> }}
                  >
                    {t("projects:technical-details.numberOfArtistOnStage", {
                      count: project.numberOfArtistOnStage,
                    })}
                  </Trans>
                ),
                hasNbPeopleOnTour && (
                  <Trans
                    i18nKey=""
                    components={{ bold: <strong key="nb-people-strong" /> }}
                  >
                    {t("projects:technical-details.numberOfPeopleOnTour", {
                      count: project.numberOfPeopleOnTour,
                    })}
                  </Trans>
                ),
                hasFinancialSupport && (
                  <Markdown style={{ fontSize: "13px", gap: "0px" }}>
                    {t("projects:technical-details.financialSupport", {
                      financialSupport: project.financialSupport,
                    })}
                  </Markdown>
                ),
              ])}
            </p>
          </TechnicalDetail>
        )}

        {hasArtisticInfo && (
          <TechnicalDetail>
            <Groups3RoundedIcon fontSize="small" />
            <p>
              {joinWithSeparator([
                hasGenderDistribution && (
                  <Trans
                    i18nKey=""
                    components={{
                      bold: <strong key="gender-distribution-strong" />,
                    }}
                  >
                    <strong>
                      {t("projects:technical-details.genderDistribution")}
                    </strong>
                    {project.numberOfMenOnStage &&
                    project.numberOfMenOnStage > 0
                      ? ` ${project.numberOfMenOnStage} ${
                          project.numberOfMenOnStage === 1
                            ? t(
                                "common:dialogs.new-project.genderDistribution.man",
                              )
                            : t(
                                "common:dialogs.new-project.genderDistribution.men",
                              )
                        }`
                      : ""}
                    {project.numberOfWomenOnStage &&
                    project.numberOfWomenOnStage > 0
                      ? `${
                          project.numberOfMenOnStage &&
                          project.numberOfMenOnStage > 0
                            ? ", "
                            : ""
                        } ${project.numberOfWomenOnStage} ${
                          project.numberOfWomenOnStage === 1
                            ? t(
                                "common:dialogs.new-project.genderDistribution.woman",
                              )
                            : t(
                                "common:dialogs.new-project.genderDistribution.women",
                              )
                        }`
                      : ""}
                    {project.numberOfNonBinaryOnStage &&
                    project.numberOfNonBinaryOnStage > 0
                      ? `${
                          (project.numberOfMenOnStage &&
                            project.numberOfMenOnStage > 0) ||
                          (project.numberOfWomenOnStage &&
                            project.numberOfWomenOnStage > 0)
                            ? ", "
                            : ""
                        } ${project.numberOfNonBinaryOnStage} ${
                          project.numberOfNonBinaryOnStage === 1
                            ? t(
                                "common:dialogs.new-project.genderDistribution.nonBinaryPerson",
                              )
                            : t(
                                "common:dialogs.new-project.genderDistribution.nonBinaryPeople",
                              )
                        }`
                      : ""}
                  </Trans>
                ),
              ])}
            </p>
          </TechnicalDetail>
        )}

        {placesByCountry && (
          <TechnicalDetail>
            <PlaceIcon fontSize="small" />
            <p>
              {Object.entries(placesByCountry).map(
                ([country, cities], index, array) => (
                  <span key={country}>
                    <strong>{country}</strong>: {cities.join(", ")}
                    {index < array.length - 1 && " · "}
                  </span>
                ),
              )}
            </p>
          </TechnicalDetail>
        )}
      </div>
    </Container>
  );
};

const getListOfProperties = (
  list: string[],
  labelKey: string,
  t: TFunction,
) => {
  // For venue configuration types, spaces and audiences, filter out the last option (Plusieurs possibilités)
  const isVenueConfig = labelKey === "projects:venueConfigurationSpaces";

  const filteredList = isVenueConfig
    ? list.filter((index) => {
        const lastIndex =
          Object.keys(
            t(`${labelKey}`, { returnObjects: true }) as Record<string, string>,
          ).length - 1;
        return parseInt(index) !== lastIndex;
      })
    : list;

  return filteredList.map((index) => t(`${labelKey}.${index}`)).join(", ");
};

interface TranslatedListProps {
  labelKey: string;
  labelListKey: string;
  listKey: string;
  values?: string[];
}

const TranslatedList = ({
  labelKey,
  labelListKey,
  listKey,
  values = [],
}: TranslatedListProps) => {
  const { t } = useTranslation();
  return (
    <Trans
      i18nKey={labelKey}
      components={{ bold: <strong key={`${labelKey}-strong`} /> }}
      values={{
        count: values.length,
        [labelListKey]: values
          .map((value) => t(`${listKey}.${value}`))
          .join(", "),
      }}
    />
  );
};

export default TechnicalDetails;
