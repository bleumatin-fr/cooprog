import { ProgramStatuses, Tour } from "@cooprog/core";
import { LatLngTuple } from "leaflet";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { Polyline } from "react-leaflet";
import ProgramView from "./ProgramView";

interface Line {
  start?: LatLngTuple;
  end?: LatLngTuple;
}

interface TourStepsViewProps {
  tour: Tour;
}

const TourStepsView = ({ tour }: TourStepsViewProps) => {
  const router = useRouter();
  const { i18n } = useTranslation();

  const lines = useMemo(() => {
    return (
      tour.schedule
        ?.filter(
          (program) =>
            program.location?.geolocation?.coordinates.length === 2 &&
            [
              ProgramStatuses.SHOW_PENDING,
              ProgramStatuses.SHOW_CONFIRMED,
            ].includes(program.status)
        )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .reduce((allLines, currentProgram, index, allPrograms) => {
          const lastLine = allLines[allLines.length - 1];
          const isLastProgram = index === allPrograms.length - 1;

          if (lastLine) {
            lastLine.end = currentProgram.location?.geolocation.coordinates
              .slice()
              .reverse() as LatLngTuple;
          }
          if (isLastProgram) {
            return allLines;
          }
          const line: Line = {
            start: currentProgram.location?.geolocation.coordinates
              .slice()
              .reverse() as LatLngTuple,
          };
          return [...allLines, line];
        }, [] as Line[])
        .filter((line) => line.start && line.end && line.start !== line.end) ||
      []
    );
  }, [tour.schedule]);

  const displayedPrograms = useMemo(() => {
    return (
      tour.schedule?.filter(
        (program) =>
          program.location?.geolocation?.coordinates.length === 2 &&
          [
            ProgramStatuses.SHOW_PENDING,
            ProgramStatuses.SHOW_CONFIRMED,
          ].includes(program.status)
      ) || []
    );
  }, [tour.schedule]);

  return (
    <>
      {lines.map((line, index) => (
        <Polyline
          key={`line-${index}`}
          dashArray={[5, 5]}
          pathOptions={{ color: "#ffa16b" }}
          positions={[line.start as LatLngTuple, line.end as LatLngTuple]}
        />
      ))}
      {displayedPrograms.map((program) => (
        <ProgramView key={`program-${program._id}`} program={program} />
      ))}
    </>
  );
};

export default TourStepsView;
