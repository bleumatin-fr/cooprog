import { Genre, TargetAudience } from "@cooprog/core";
import styled from "@emotion/styled";
import { Tooltip } from "@mui/material";
import { useTranslation } from "next-i18next";

const GenresChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  &.small {
    gap: 4px;
  }
`;

const GenresChip = styled.div`
  background: #f5f7fa;
  border-radius: 12px;
  padding: 6px 12px;
  font-size: 14px;
  color: #123036;

  &.small {
    font-size: 12px;
    padding: 4px 8px;
    line-height: 1.2;
  }
`;

const MoreContainer = styled.div`
  font-size: 12px;
  color: #b5bfd4;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

interface GenreChipsProps {
  genreValue: string[];
  targetAudienceValue: string[];
  genres: Genre[];
  targetAudiences: TargetAudience[];
  limit?: number;
  genreType?: string;
  complementaryGenre?: string;
  size?: "small" | "medium";
}

const GenreChips = ({
  genreValue,
  targetAudienceValue,
  genres,
  targetAudiences,
  limit,
  complementaryGenre,
  size = "small",
}: GenreChipsProps) => {
  const { t } = useTranslation();

  let genreLabels = genreValue
    ?.map((genreId) => genres.find((genre) => genre.id === genreId))
    .filter(Boolean);

  let targetAudienceLabels = targetAudienceValue
    ?.map((targetAudienceId) =>
      targetAudiences.find(
        (targetAudience) => targetAudience.id === targetAudienceId
      )
    )
    .filter(Boolean);

  let remainingGenreLabels = "";
  let remainingGenresCount = 0;
  let displayedGenreLabels = genreLabels;

  let remainingTargetAudienceLabels = "";
  let remainingTargetAudiencesCount = 0;
  let displayedTargetAudienceLabels = targetAudienceLabels;

  // Combined remaining items for single tooltip
  let combinedRemainingLabels = "";
  let combinedRemainingCount = 0;

  if (limit) {
    displayedGenreLabels = genreLabels.slice(0, limit);
    remainingGenresCount = genreLabels.length - limit;
    remainingGenreLabels = genreLabels.slice(limit).join(", ");

    displayedTargetAudienceLabels = targetAudienceLabels.slice(0, limit);
    remainingTargetAudiencesCount = targetAudienceLabels.length - limit;
    remainingTargetAudienceLabels = targetAudienceLabels
      .slice(limit)
      .map((targetAudience) => targetAudience?.name)
      .join(", ");

    // Combine remaining items
    const remainingGenres = genreLabels.slice(limit);
    const remainingTargetAudiences = targetAudienceLabels.slice(limit);

    const remainingItems = [
      ...remainingGenres.map((genre) => genre?.name),
      ...remainingTargetAudiences.map((targetAudience) => targetAudience?.name),
    ].filter(Boolean);

    combinedRemainingLabels = remainingItems.join(", ");
    combinedRemainingCount =
      remainingGenresCount + remainingTargetAudiencesCount;
  }

  return (
    <GenresChipsContainer className={size}>
      {displayedGenreLabels.map((genre, index) => {
        if (!genre) return null;
        return (
          <GenresChip
            key={genre?.name}
            className={size}
            style={{
              backgroundColor: genre?.backgroundColor,
              color: genre?.color,
            }}
          >
            {genre?.name}
          </GenresChip>
        );
      })}
      {displayedTargetAudienceLabels.map((targetAudience) => {
        if (!targetAudience) return null;
        return (
          <GenresChip
            key={targetAudience?.name}
            className={size}
            style={{
              backgroundColor: targetAudience?.backgroundColor,
              color: targetAudience?.color,
            }}
          >
            {targetAudience?.name}
          </GenresChip>
        );
      })}
      {complementaryGenre && (
        <GenresChip
          key={complementaryGenre}
          className={size}
          style={{
            backgroundColor: "#FFF6F1",
            color: "#FFA16B",
          }}
        >
          {complementaryGenre}
        </GenresChip>
      )}
      {limit && combinedRemainingCount > 0 && combinedRemainingLabels && (
        <Tooltip title={combinedRemainingLabels}>
          <MoreContainer>+ {combinedRemainingCount}</MoreContainer>
        </Tooltip>
      )}
    </GenresChipsContainer>
  );
};

export default GenreChips;
