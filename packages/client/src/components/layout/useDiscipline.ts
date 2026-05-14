import { Discipline } from "@cooprog/core";
import { useLocalStorage } from "usehooks-ts";
import useUser from "../authentication/useUser";
import { useState } from "react";

export const colors = {
  [Discipline.PERFORMING_ARTS]: {
    accent: "#FF6B6B",
    background: "#F5F3F3",
  },
  [Discipline.MUSIC]: {
    accent: "#4ECDC4",
    background: "#F2F4F4",
  },
  //   [Discipline.LITERATURE]: "#45B7D1",
  //   [Discipline.VISUAL_ARTS]: "#96CEB4",
};

const useDiscipline = () => {
  const { user } = useUser();
  const [selectedDiscipline, setSelectedDiscipline] = useLocalStorage<
    Discipline | undefined
  >(
    "selected-discipline",
    user?.programmingDisciplines && user.programmingDisciplines.length > 0
      ? user.programmingDisciplines[0]
      : Discipline.PERFORMING_ARTS
  );

  // If the page discipline is set to null, it means that the page is not related to a discipline
  // If the page discipline is set to undefined, it means that the page discipline depends on what the user selected
  // If the page discipline is set to a discipline, it means that the page is related to this discipline
  const [pageDiscipline, setPageDiscipline] = useLocalStorage<
    Discipline | undefined | null
  >("page-discipline", null);

  return {
    selectedDiscipline,
    setSelectedDiscipline,
    discipline: pageDiscipline || selectedDiscipline,
    pageDiscipline,
    setPageDiscipline,
  };
};

export default useDiscipline;
