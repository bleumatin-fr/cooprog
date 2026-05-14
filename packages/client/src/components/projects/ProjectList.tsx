import { Program, Project, Location } from "@cooprog/core";
import styled from "@emotion/styled";
import StarIcon from "@mui/icons-material/Star";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import { IconButton } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import {
  DataGrid,
  GridCallbackDetails,
  GridColDef,
  GridPaginationModel,
} from "@mui/x-data-grid";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { Dot as BaseDot, getCity } from "./ProjectCard";
import useUser from "../authentication/useUser";
import GenreChips from "./GenreChips";
import useGenres from "./useGenres";
import useTargetAudiences from "./useTargetAudiences";

const Dot = styled(BaseDot)`
  position: relative;
  top: 0;
  left: calc(50% - 6px);
`;

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-white);
  flex-grow: 1;
`;

const DotPlaceholder = styled.div`
  min-width: 22px;
  height: 24px;
`;

interface ProjectListProps {
  projects: Project[];
  getNextPage: () => void;
  getPreviousPage: () => void;
  totalProjects: number;
  onFavoriteClicked?: (id: string) => () => Promise<void>;
}

// Component wrapper for genre cell that uses hooks
const GenreCell = ({ project }: { project: Project }) => {
  const genres = useGenres(project.discipline);
  const targetAudiences = useTargetAudiences();

  return (
    <GenreChips
      genres={genres}
      genreValue={project.genres || []}
      targetAudienceValue={project.targetAudiences || []}
      targetAudiences={targetAudiences}
      complementaryGenre={project.complementaryGenre}
      limit={3}
      size="small"
    />
  );
};

// Component wrapper for target audience cell that uses hooks
const TargetAudienceCell = ({ project }: { project: Project }) => {
  const genres = useGenres(project.discipline);
  const targetAudiences = useTargetAudiences();

  return (
    <GenreChips
      genres={genres}
      genreValue={[]}
      targetAudienceValue={project.targetAudiences || []}
      targetAudiences={targetAudiences}
      limit={3}
      size="small"
    />
  );
};

// Helper functions for location formatting (same as ProjectCard)
const getCityOnly = (location: Location) => {
  let city =
    location.data?.city ||
    location.data?.village ||
    location.data?.town ||
    location.data?.municipality ||
    undefined;
  return city;
};

const getCountry = (location: Location) => {
  return location.data?.country;
};

interface ProgramWithLocation extends Omit<Program, "location"> {
  location: Location;
}

// Component wrapper for location cell that uses the same logic as ProjectCard
const LocationCell = ({ project }: { project: Project }) => {
  const allSchedules = useMemo(() => {
    return project.tours
      ?.reduce((acc, tour) => {
        if (!tour.schedule) {
          return acc;
        }
        return [...acc, ...tour.schedule];
      }, [] as Program[])
      .filter(
        (schedule) => schedule.location?.geolocation.coordinates,
      ) as ProgramWithLocation[];
  }, [project]);

  const locations = useMemo(() => {
    if (!allSchedules || allSchedules.length === 0) return "";

    // Get locations with their countries and dates, preserving order
    const locationsWithDates = allSchedules
      .map((program) => ({
        city: getCityOnly(program.location),
        country: getCountry(program.location),
        date: program.date,
      }))
      .filter((loc) => !!loc.city && !!loc.country)
      .sort((a, b) => {
        // Sort by date if available
        if (a.date && b.date) {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        return 0;
      });

    if (locationsWithDates.length === 0) return "";

    // Remove duplicates while preserving order
    const uniqueLocations = locationsWithDates.filter(
      (loc, index, array) =>
        array.findIndex(
          (l) => l.city === loc.city && l.country === loc.country,
        ) === index,
    );

    if (uniqueLocations.length === 0) return "";

    // Group by country while preserving order
    const locationsByCountry = uniqueLocations.reduce(
      (acc, loc) => {
        const country = loc.country || "";
        if (!acc[country]) {
          acc[country] = [];
        }
        acc[country].push(loc.city || "");
        return acc;
      },
      {} as Record<string, string[]>,
    );

    // Format locations with country only on the last one per country
    const formattedLocations = Object.entries(locationsByCountry).map(
      ([country, cities]) => {
        if (cities.length === 1) {
          return `${cities[0]}, ${country}`;
        } else {
          const citiesWithoutCountry = cities.slice(0, -1);
          const lastCity = cities[cities.length - 1];
          return [...citiesWithoutCountry, `${lastCity}, ${country}`].join(
            " • ",
          );
        }
      },
    );

    return formattedLocations.join(" • ");
  }, [allSchedules]);

  return <span>{locations || ""}</span>;
};

const ProjectList = ({
  projects,
  getNextPage,
  getPreviousPage,
  totalProjects,
  onFavoriteClicked,
}: ProjectListProps) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useUser();

  const [paginationModel, setPaginationModel] = useState({
    pageSize: 12,
    page: 0,
  } as GridPaginationModel);

  const handlePaginationModelChange = (
    model: GridPaginationModel,
    details: GridCallbackDetails<any>,
  ) => {
    setPaginationModel(model);
    if (model.page === paginationModel.page) return;
    if (model.page < paginationModel.page) {
      return getPreviousPage();
    }
    if (model.page > paginationModel.page) {
      return getNextPage();
    }
  };

  const rows = projects.map((project) => ({
    id: project._id,
    ...project,
  }));

  const columns: GridColDef<(typeof rows)[number]>[] = [
    {
      field: "viewed",
      headerName: "",
      width: 100,
      renderCell: (params) => {
        const isFavorited = !!params.row.favoritedBy?.find(
          (u: any) => u._id.toString() === user?._id.toString(),
        );
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "nowrap",
              height: "100%",
            }}
          >
            {!params.value ? <Dot /> : <DotPlaceholder />}
            {onFavoriteClicked && (
              <Tooltip title={t("projects:actions.favorite")} placement="right">
                <IconButton
                  style={{ padding: 0, marginLeft: 8 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onFavoriteClicked(params.row._id)();
                  }}
                >
                  {isFavorited ? (
                    <StarIcon></StarIcon>
                  ) : (
                    <StarBorderOutlinedIcon></StarBorderOutlinedIcon>
                  )}
                </IconButton>
              </Tooltip>
            )}
          </div>
        );
      },
      sortable: false,
    },
    {
      field: "artist",
      headerName: t("projects:table.artist"),
      width: 250,
      sortable: false,
    },
    {
      field: "work",
      headerName: t("projects:table.work"),
      width: 250,
      sortable: false,
    },
    {
      field: "genres",
      headerName: t("projects:table.genre"),
      width: 300,
      sortable: false,
      renderCell: (params) => {
        return <GenreCell project={params.row} />;
      },
    },
    {
      field: "targetAudiences",
      headerName: t("projects:table.target-audience"),
      width: 150,
      sortable: false,
      renderCell: (params) => {
        return <TargetAudienceCell project={params.row} />;
      },
    },
    {
      field: "schedule",
      headerName: t("projects:table.locations"),
      width: 300,
      sortable: false,
      renderCell: (params) => {
        return <LocationCell project={params.row} />;
      },
    },
    {
      field: "distance",
      headerName: t("projects:table.distance"),
      type: "string",
      valueGetter: (value, row) => {
        return row.distance ? Math.round(row.distance) + " km" : "0 km";
      },
      width: 110,
      sortable: false,
    },
    {
      field: "minDate",
      headerName: t("projects:table.start"),
      type: "date",
      valueGetter: (value, row) => {
        return row.minDate ? new Date(row.minDate) : null;
      },
      width: 110,
      sortable: false,
    },
    {
      field: "maxDate",
      headerName: t("projects:table.end"),
      type: "date",
      valueGetter: (value, row) => {
        return row.maxDate ? new Date(row.maxDate) : null;
      },
      width: 110,
      sortable: false,
    },
  ];

  return (
    <Container>
      <DataGrid
        className="project-card"
        rowCount={totalProjects}
        rows={rows}
        columns={columns}
        pagination={undefined}
        disableRowSelectionOnClick
        onRowClick={(params) => {
          router.push(`/projects/${params.id}`);
        }}
        autoHeight
        disableColumnFilter
        disableColumnMenu
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        pageSizeOptions={[12]}
        style={{ maxWidth: "100%" }}
      />
    </Container>
  );
};

export default ProjectList;
