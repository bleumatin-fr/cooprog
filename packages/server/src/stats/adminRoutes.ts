import express from "express";
import XLSX from "xlsx";
import Project from "../projects/model";
import User from "../users/model";
import {
  Program,
  User as UserType,
  Location,
  ProgramStatuses,
} from "@cooprog/core";
import genres from "./genres.json";
import targetAudiences from "./targetAudiences.json";

const router = express.Router();

const getUserRows = async (): Promise<string[][]> => {
  const users = await User.find();

  const userHeaders = [
    "id",
    "firstName",
    "lastName",
    "company",
    "email",
    "role",
    "disciplines",
    "country",
    "region",
    "city",
    "postcode",
    "lat",
    "lon",
    "status",
    "lastActive",
    "lastLogin",
    "createdAt",
  ];
  const userData = users.map((user) => {
    const mainLocation = user.locations.find((loc: any) => loc.isMain);
    const { country, region, city, postcode, lon, lat } =
      convertLocationToPlace(mainLocation?.location);
    return [
      user._id.toString(),
      user.firstName,
      user.lastName,
      user.company,
      user.email,
      user.role,
      user.programmingDisciplines?.join(", ") || "",
      country,
      region,
      city,
      postcode,
      lon?.toString() || "",
      lat?.toString() || "",
      user.status,
      user.lastActive?.toISOString(),
      user.lastLogin?.toISOString(),
      user.createdAt?.toISOString(),
    ];
  });

  return [userHeaders, ...userData];
};

const genresById = new Map(
  (genres as { id: string; name: string }[]).map((genre) => [
    genre.id,
    genre.name,
  ]),
);

const targetAudiencesById = new Map(
  (targetAudiences as { id: string; name: string }[]).map((audience) => [
    audience.id,
    audience.name,
  ]),
);

const unique = (user: string, index: number, self: string[]) =>
  self.indexOf(user) === index;

const getProjectRows = async (): Promise<string[][]> => {
  const projects = await Project.find();

  const projectHeaders = [
    "id",
    "discipline",
    "artist",
    "work",
    "artisticTeamUsers",
    "artisticTeamPlaces",
    "genres",
    "targetAudiences",
    "diffusionStructureUsers",
    "programCountBlocked",
    "programCountUnavailable",
    "programCountWished",
    "programCountPending",
    "programCountConfirmed",
    "favoriteCount",
    "createdAt",
    "updatedAt",
  ];

  const projectData = projects.map((project) => {
    const allSchedules =
      project?.tours?.reduce(
        (acc, tour) => acc.concat(tour.schedule || []),
        [] as Program[],
      ) || [];

    const artisticTeamUsers = (project?.users || [])
      .filter((user) => user)
      .map((user) => user._id.toString())
      .filter(unique);

    const diffusionStructureUsers = (project?.tours || [])
      .reduce((acc, tour) => acc.concat(tour.users || []), [] as UserType[])
      .filter((user) => user)
      .map((user) => user._id.toString())
      .filter(unique);

    const genreNames = (project.genres || [])
      .map((genreId: string) => genresById.get(genreId) || genreId)
      .join(", ");

    const targetAudienceNames = (project.targetAudiences || [])
      .map(
        (audienceId: string) =>
          targetAudiencesById.get(audienceId) || audienceId,
      )
      .join(", ");

    const artisticTeamPlaces = (project.places || [])
      .map((place) => `${place.country}, ${place.region}, ${place.city}`)
      .join("\n");

    return [
      project._id.toString(),
      project.discipline,
      project.artist,
      project.work,
      artisticTeamUsers.join(", "),
      artisticTeamPlaces,
      genreNames,
      targetAudienceNames,
      diffusionStructureUsers.join(", "),
      allSchedules
        .filter((schedule) => schedule.status === ProgramStatuses.BLOCKED)
        .length.toString(),
      allSchedules
        .filter((schedule) => schedule.status === ProgramStatuses.UNAVAILABLE)
        .length.toString(),
      allSchedules
        .filter((schedule) => schedule.status === ProgramStatuses.SHOW_WISHED)
        .length.toString(),
      allSchedules
        .filter((schedule) => schedule.status === ProgramStatuses.SHOW_PENDING)
        .length.toString(),
      allSchedules
        .filter(
          (schedule) => schedule.status === ProgramStatuses.SHOW_CONFIRMED,
        )
        .length.toString(),
      project.favoritedBy?.length.toString(),
      project.createdAt?.toISOString(),
      project.updatedAt?.toISOString(),
    ];
  });

  return [projectHeaders, ...projectData];
};

const convertLocationToPlace = (location?: Location) => {
  const [lon, lat] = location?.geolocation?.coordinates || [];
  const address = location?.data || {};
  return {
    id: parseInt(location?._id || "0"),
    country: address.country || "",
    region: address.state || address.county || "",
    city:
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      "",
    lat,
    lon,
    postcode: address.postcode || "",
    place_id: parseInt(location?._id || "0"),
    display_name: location?.address,
    address: location?.data,
  };
};

const getProgrammationRows = async (): Promise<string[][]> => {
  const programmations = await Project.aggregate([
    {
      $unwind: "$tours",
    },
    {
      $unwind: "$tours.schedule",
    },
    {
      $project: {
        _id: "$tours.schedule._id",
        date: "$tours.schedule.date",
        status: "$tours.schedule.status",
        userId: "$tours.schedule.user",
        location: "$tours.schedule.location",
        createdAt: "$tours.schedule.createdAt",
        projectId: "$tours._id",
      },
    },
  ]);

  const programmationHeaders = [
    "project",
    "user",
    "date",
    "status",
    "country",
    "region",
    "city",
    "createdAt",
  ];

  const programmationData = programmations
    .filter((programmation) => programmation.projectId != null)
    .map((programmation) => {
      const place = convertLocationToPlace(programmation?.location || {});
      return [
        programmation.projectId.toString(),
        programmation.userId?.toString() || "",
        programmation.date?.toISOString() || "",
        programmation.status || "",
        place.country || "",
        place.region || "",
        place.city || "",
        programmation.createdAt?.toISOString() || "",
      ];
    });

  return [programmationHeaders, ...programmationData];
};

const getFavoritedRows = async (): Promise<string[][]> => {
  const projects = await Project.find({
    favoritedBy: { $exists: true, $not: { $size: 0 } },
  });

  const favoritedHeaders = ["project", "user"];

  const favoritedData = projects
    .map((project) => {
      return (project.favoritedBy || [])
        .filter((user) => user != null)
        .map((user) => {
          return [project._id.toString(), user.toString()];
        });
    })
    .flat();

  return [favoritedHeaders, ...favoritedData];
};

const getFollowRequestRows = async (): Promise<string[][]> => {
  const users = await User.find({
    notifications: {
      $elemMatch: {
        type: "follow_request",
      },
    },
  });

  const followRequestHeaders = ["user", "requester"];

  const followRequestData = users.reduce((acc, user) => {
    return acc.concat(
      (user.notifications || [])
        .filter((notification) => {
          return (
            notification?.type === "follow_request" &&
            notification?.meta?.from != null
          );
        })
        .map((notification) => {
          return [user._id.toString(), notification.meta.from.toString()];
        }),
    );
  }, []);

  return [followRequestHeaders, ...followRequestData];
};

const getFollowingRows = async (): Promise<string[][]> => {
  const users = await User.find({
    following: { $exists: true, $not: { $size: 0 } },
  });

  const followingHeaders = ["follower", "followed"];

  const followingData = users
    .map((user) => {
      return (user.following || [])
        .filter((followed) => followed != null)
        .map((followed) => {
          return [user._id.toString(), followed.toString()];
        });
    })
    .flat();

  return [followingHeaders, ...followingData];
};

router.get("/", async (request, response) => {
  try {
    const workbook = XLSX.utils.book_new();

    const userRows = await getUserRows();
    const userWorksheet = XLSX.utils.aoa_to_sheet(userRows);
    XLSX.utils.book_append_sheet(workbook, userWorksheet, "users");

    const projectRows = await getProjectRows();
    const projectWorksheet = XLSX.utils.aoa_to_sheet(projectRows);
    XLSX.utils.book_append_sheet(workbook, projectWorksheet, "projects");

    const programmationRows = await getProgrammationRows();
    const programmationWorksheet = XLSX.utils.aoa_to_sheet(programmationRows);
    XLSX.utils.book_append_sheet(
      workbook,
      programmationWorksheet,
      "programmations",
    );

    const favoritedRows = await getFavoritedRows();
    const favoritedWorksheet = XLSX.utils.aoa_to_sheet(favoritedRows);
    XLSX.utils.book_append_sheet(
      workbook,
      favoritedWorksheet,
      "favorited_projects",
    );

    const followRequestRows = await getFollowRequestRows();
    const followRequestWorksheet = XLSX.utils.aoa_to_sheet(followRequestRows);
    XLSX.utils.book_append_sheet(
      workbook,
      followRequestWorksheet,
      "follow_requests",
    );

    const followingRows = await getFollowingRows();
    const followingWorksheet = XLSX.utils.aoa_to_sheet(followingRows);
    XLSX.utils.book_append_sheet(workbook, followingWorksheet, "followings");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });
    response.statusCode = 200;
    response.setHeader(
      "Content-Disposition",
      `attachment; filename="export_${new Date().toISOString()}.xlsx"`,
    );
    response.setHeader("Content-Type", "application/vnd.ms-excel");
    response.end(buffer);
  } catch (error) {
    console.error(error);
    response.status(500).send("Internal server error");
  }
});

export default router;
