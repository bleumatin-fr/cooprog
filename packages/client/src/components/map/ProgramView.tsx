import { Feature, GeoJsonProperties, Point } from "geojson";
import { LatLngTuple } from "leaflet";
import { Marker, Popup } from "react-leaflet";
import Leaflet from "leaflet";
import { Program, ProgramStatuses } from "@cooprog/core";
import useUser from "../authentication/useUser";
import { UserTooltipContent } from "../structures/UserTooltip";

const createMarker = (text: string, status: ProgramStatuses, own: boolean) => {
  let backgroundColor = "red";
  let textColor = "white";
  let borderColor = "unset";

  if (status === ProgramStatuses.SHOW_PENDING) {
    backgroundColor = "var(--pending-background-color)";
    textColor = "var(--pending-color)";
  } else if (status === ProgramStatuses.SHOW_CONFIRMED) {
    backgroundColor = "var(--confirmed-background-color)";
    textColor = "var(--confirmed-color)";
  }

  if (own) {
    borderColor = "var(--my-background-color)";
  }

  return Leaflet.divIcon({
    html: `
    <div style="transition: all 0.5s;z-index:1000;">
        <svg
          width="45"
          height="45"
          viewBox="0 0 700 700"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="350" cy="350" r="200" fill="${backgroundColor}" stroke="${borderColor}" stroke-width="40" />
          <text font-size="12em" x="50%" y="50%" fill="${textColor}" text-anchor="middle" dominant-baseline="central">
            ${text || ""}
          </text>
        </svg>
      </div>`,
    className: "svg-icon",
    iconSize: [45, 45],
    iconAnchor: [22, 22],
    popupAnchor: [1, 20],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
  });
};

interface ProgramViewProps {
  program: Program;
  onClick?: (cluster: Feature<Point, GeoJsonProperties>) => void;
  selected?: boolean;
  disabled?: boolean;
}

const ProgramView = ({
  program,
  onClick,
  selected = false,
  disabled,
}: ProgramViewProps) => {
  const { user } = useUser();

  const dateAsText = `${new Date(program.date).getDate()}/${(
    "00" +
    (new Date(program.date).getMonth() + 1)
  ).slice(-2)}`;

  return (
    <Marker
      position={
        program.location?.geolocation?.coordinates
          .slice()
          .reverse() as LatLngTuple
      }
      icon={createMarker(
        dateAsText,
        program.status,
        program.user?._id === user?._id
      )}
    >
      {program.user && (
        <Popup>
          <UserTooltipContent user={program.user} />
        </Popup>
      )}
    </Marker>
  );
};

export default ProgramView;
