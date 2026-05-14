import { Genre, Discipline } from "@cooprog/core";
import { useTranslation } from "react-i18next";

const useGenres = (discipline?: Discipline) => {
  const { t } = useTranslation();
  const genres = t("projects:genres", { returnObjects: true }) as Genre[];

  if (!!discipline) {
    return genres.filter((genre) => genre.discipline === discipline);
  }

  return genres;
};

export default useGenres;
