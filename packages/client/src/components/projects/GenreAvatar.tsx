import { Genre } from "@cooprog/core";
import styled from "@emotion/styled";
import { Tooltip } from "@mui/material";
import GenreIcon from "./GenreIcon";

const GenreContainer = styled.div`
  display: flex;

  > div:first-of-type {
    z-index: 1;
  }

  > div:hover {
    z-index: 2;
  }

  > div:not(:first-of-type) {
    margin-left: -32px;
  }
`;

interface GenreAvatarProps {
  value: string[] | undefined;
  genres: Genre[];
  complementaryGenre?: string;
}

const GenreAvatar = ({
  value,
  genres,
  complementaryGenre,
}: GenreAvatarProps) => {
  const valuesAsGenres = value?.map((v) => genres.find((g) => g.id === v));

  const tooltipText = [
    complementaryGenre
      ? {
          name: complementaryGenre,
        }
      : null,
    ...(valuesAsGenres || []),
  ]
    ?.filter((genre) => genre !== null)
    ?.map((genre) => genre?.name)
    .join(", ");

  const genresGroupedByCategories = valuesAsGenres?.reduce((acc, genre) => {
    const category = genre?.icon;
    if (!category) return acc;
    if (!acc[category]) {
      acc[category] = [...(acc[category] || []), genre];
    }
    return acc;
  }, {} as Record<string, Genre[]>);

  return (
    <Tooltip title={tooltipText} placement="top">
      <GenreContainer>
        {genresGroupedByCategories &&
          Object.keys(genresGroupedByCategories).map((category) => {
            const genre = genresGroupedByCategories[category][0];
            return (
              <GenreIcon
                name={genre.icon || ""}
                alt={genre.name || ""}
                key={genre.name || genre.icon || Math.random().toString()}
                backgroundColor={genre.backgroundColor || "#000000"}
                color={genre.color || "#ffffff"}
              />
            );
          })}
      </GenreContainer>
    </Tooltip>
  );
};

export default GenreAvatar;
