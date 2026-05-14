import { Discipline } from "@cooprog/core";
import User from "../users/model";
import Project from "./model";

// Création de données pour les équipes artistiques selon les disciplines
const artisticTeams = {
  [Discipline.PERFORMING_ARTS]: {
    email: "artistic.sv@bleumatin.fr",
    firstName: "Équipe",
    lastName: "Spectacle vivant",
  },
  [Discipline.MUSIC]: {
    email: "artistic.ma@bleumatin.fr",
    firstName: "Équipe",
    lastName: "Musiques actuelles",
  },
};

const projectsData: any[] = [
  // PROJECT 1

  {
    artist: "Halory Goerger & Antoine Defoort",
    work: "Germinal",
    emergingArtist: true,
    culturalActionInterest: true,
    numberOfArtistOnStage: 8,
    numberOfMenOnStage: 3,
    numberOfWomenOnStage: 4,
    numberOfNonBinaryOnStage: 1,
    numberOfPeopleOnTour: 12,
    places: [
      {
        id: 22,
        country: "France",
        region: "Meurthe et moselle",
        city: "Nancy",
      },
    ],
    genres: ["0", "10"],
    targetAudiences: ["4"],
    discipline: Discipline.PERFORMING_ARTS,
    description:
      "One of the most delightful shows I've witnessed in the last years. I wish I could see it again. That's why I dream I could programm it in september next year. Will you join me to make this dream come true in the frame of a coherent and sustainable tour?",
    users: [artisticTeams[Discipline.PERFORMING_ARTS].email],
    tours: [
      {
        name: "Tournée allemagne été 2030",
        start: new Date("2030-06-01T00:00:00.000"),
        end: new Date("2030-07-30T00:00:00.000"),
        users: [
          "arved.schultze@produktionishaeuser.de",
          "t.klein@kasseloperatheatre.de",
          "j.meyer@hamburgoperatheatre.de",
          "direction@centremalraux.com",
        ],
        schedule: [
          {
            user: "arved.schultze@produktionishaeuser.de",
            date: "2030-06-02T00:00:00.000",
            status: "confirmed",
            note: "Première date à Berlin",
          },
          {
            user: "t.klein@kasseloperatheatre.de",
            date: "2030-06-05T00:00:00.000",
            status: "confirmed",
            note: "Kassel show",
          },
          {
            user: "j.meyer@hamburgoperatheatre.de",
            date: "2030-06-10T00:00:00.000",
            status: "confirmed",
            note: "Hamburg performance",
          },
          {
            user: "direction@centremalraux.com",
            date: "2030-06-11T00:00:00.000",
            status: "confirmed",
          },
          {
            user: "l.schmidt@koelnoperatheatre.de",
            date: "2030-06-15T00:00:00.000",
            status: "confirmed",
            note: "Cologne event",
          },
          {
            user: "arved.schultze@produktionishaeuser.de",
            date: "2030-06-20T00:00:00.000",
            status: "confirmed",
            note: "Retour à Berlin",
          },
          // Additional confirmed dates
          {
            user: "t.schulz@bremenoperatheatre.de",
            date: "2030-06-25T00:00:00.000",
            status: "confirmed",
            note: "Bremen show",
          },
          {
            user: "arved.schultze@produktionishaeuser.de",
            date: "2030-06-28T00:00:00.000",
            status: "confirmed",
            note: "Finale à Berlin",
          },
        ],
        archived: false,
      },
      {
        name: "Tournée automne 2025",
        start: new Date("2025-10-01T00:00:00.000"),
        end: new Date("2025-12-30T00:00:00.000"),
        users: ["t.brenk@kaserne-basel.ch", "direction@centremalraux.com"],
        schedule: [
          {
            user: "t.brenk@kaserne-basel.ch",
            date: "2025-10-05T00:00:00.000",
            status: "confirmed",
          },
          {
            user: "direction@centremalraux.com",
            date: "2025-10-05T00:00:00.000Z",
            status: "confirmed",
          },
        ],
        archived: true,
      },
    ],
  },

  // PROJECT 2

  {
    artist: "Maya Boquet",
    work: "L'énigme Rosemary Brown",
    places: [
      {
        id: 22,
        country: "France",
        region: "Meurthe et moselle",
        city: "Nancy",
      },
    ],
    genres: ["0"],
    targetAudiences: ["5"],
    discipline: Discipline.PERFORMING_ARTS,
    description:
      "Spectacle théâtral et musical sur une femme médium qui, à partir des années 1960, « entrait en contact » avec des compositeurs tels que Liszt, Chopin, Beethoven…",
    users: [artisticTeams[Discipline.PERFORMING_ARTS].email],
    tourName: "Tournée été 2030",
    tours: [
      {
        name: "Tournée été 2030",
        start: new Date("2030-06-01T00:00:00.000"),
        end: new Date("2030-09-30T00:00:00.000"),
        users: ["hlugan@yahoo.fr", "t.brenk@kaserne-basel.ch"],
        schedule: [
          {
            user: "hlugan@yahoo.fr",
            date: "2030-07-07T00:00:00.000",
            status: "pending",
          },
          {
            user: "t.brenk@kaserne-basel.ch",
            date: "2030-07-11T00:00:00.000",
            status: "pending",
          },
        ],
      },
    ],
  },

  // PROJECT 3

  {
    artist:
      "Samuel Sighicelli + Benjamin de la Fuente + Percussions de Strasbourg",
    work: "Ruptur",
    places: [
      {
        id: 22,
        country: "France",
        region: "Meurthe et moselle",
        city: "Nancy",
      },
    ],
    genres: ["3"],
    targetAudiences: ["0"],
    discipline: Discipline.MUSIC,
    description:
      '"Ruptur" is a project mixing contemporary music, rock influences and strong drums involving the band Caravaggio and the renowned ensemble Les Percussions de Strasbourg, under the direction of two brilliant composers (also members of Caravaggio).',
    users: [artisticTeams[Discipline.MUSIC].email],
    tours: [
      {
        name: "Tournée printemps 2025",
        start: new Date("2025-06-01T00:00:00.000"),
        end: new Date("2025-09-30T00:00:00.000"),
        users: [],
        schedule: [
          {
            user: "t.brenk@kaserne-basel.ch",
            date: "2024-07-07T00:00:00.000",
            status: "pending",
          },
        ],
        archived: false,
      },
    ],
  },

  // PROJECT 4

  {
    artist: "Milo Rau / NTGent",
    work: "Antigone in the Amazon",
    genres: ["2"],
    targetAudiences: ["1"],
    discipline: Discipline.PERFORMING_ARTS,
    description:
      "Milo Rau creates a political Antigone for the 21st century, together with indigenous people, activists and actors from Brazil and Europe.",
    users: [artisticTeams[Discipline.PERFORMING_ARTS].email],
    tours: [
      {
        name: "Tournée hiver 2030",
        start: new Date("2030-06-01T00:00:00.000"),
        end: new Date("2030-09-30T00:00:00.000"),
        users: ["t.brenk@kaserne-basel.ch", "direction@centremalraux.com"],
        schedule: [
          {
            user: "direction@centremalraux.com",
            date: "2030-09-23T00:00:00.000",
            status: "confirmed",
          },
          {
            user: "t.brenk@kaserne-basel.ch",
            date: "2030-09-27T00:00:00.000",
            status: "pending",
          },
        ],
      },
    ],
  },

  {
    artist: "Missing Artist",
    work: "Missing Fields Project",
    genres: ["0", "10"],
    targetAudiences: ["4"],
    discipline: Discipline.PERFORMING_ARTS,
    description:
      "One of the most delightful shows I've witnessed in the last years. I wish I could see it again. That's why I dream I could programm it in september next year. Will you join me to make this dream come true in the frame of a coherent and sustainable tour?",
    places: [],
    users: [],
    tours: [
      {
        name: "Tournée nulle part été 2025",
        start: new Date("2025-06-01T00:00:00.000"),
        end: new Date("2025-07-30T00:00:00.000"),
        users: [],
        schedule: [
          {
            user: "hlugan@yahoo.fr",
            date: "2025-06-07T00:00:00.000",
            status: "pending",
          },
        ],
        archived: false,
      },
    ],
  },
];

const seed = async () => {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  await Promise.all(
    projectsData.map(async (projectData) => {
      let project = await Project.findOne({
        artist: projectData.artist,
        work: projectData.work,
      });

      if (!project) {
        project = new Project({
          artist: projectData.artist,
          work: projectData.work,
          places: projectData.places,
        });
      }

      const users = await Promise.all(
        projectData.users.map(async (email: string) => {
          const user = await User.findOne({ email });
          if (!user) {
            console.warn(
              `Warning: User with email ${email} not found. Skipping...`
            );
            return null;
          }
          return user._id;
        })
      ).then((users) => users.filter((user) => user !== null));

      const tours = await Promise.all(
        projectData.tours.map(async (tourData: any) => {
          let tour = project.tours.find((tour) => tour.name === tourData.name);

          if (!tour) {
            tour = {
              name: tourData.name,
              start: tourData.start,
              end: tourData.end,
              users: [],
              schedule: [],
            };
          }

          const users = await Promise.all(
            tourData.users.map(async (email: string) => {
              const user = await User.findOne({ email });
              if (!user) {
                console.warn(
                  `Warning: User with email ${email} not found. Skipping...`
                );
                return null;
              }
              return user._id;
            })
          ).then((users) => users.filter((user) => user !== null));

          const schedule = await Promise.all(
            tourData.schedule.map(async (programData: any) => {
              let existingProgram = tour.schedule?.find(
                (program) =>
                  program.user?.email === programData.user &&
                  program.date === new Date(programData.date) &&
                  program.status === programData.status
              );

              if (!existingProgram) {
                existingProgram = {
                  ...programData,
                };
              }

              existingProgram.date = new Date(programData.date);
              existingProgram.status = programData.status;

              if (programData.user) {
                const user = await User.findOne({
                  email: programData.user,
                });
                if (!user) {
                  console.warn(
                    `Warning: User with email ${programData.user} not found. Skipping...`
                  );
                  return null;
                }
                const mainLocation = user.locations.find(
                  (loc: any) => loc.isMain
                );
                existingProgram.user = user;
                existingProgram.location = mainLocation?.location;
              }

              return existingProgram;
            })
          ).then((schedule) => schedule.filter((program) => program !== null));

          return {
            ...tour,
            name: tourData.name,
            start: tourData.start,
            end: tourData.end,
            users,
            schedule,
            archived: tourData.archived,
          };
        })
      );

      project.$set({
        users,
        genres: projectData.genres,
        targetAudiences: projectData.targetAudiences,
        description: projectData.description,
        tours,
        discipline: projectData.discipline || Discipline.PERFORMING_ARTS,
        emergingArtist: projectData.emergingArtist,
        culturalActionInterest: projectData.culturalActionInterest,
        numberOfArtistOnStage: projectData.numberOfArtistOnStage,
        numberOfMenOnStage: projectData.numberOfMenOnStage,
        numberOfWomenOnStage: projectData.numberOfWomenOnStage,
        numberOfNonBinaryOnStage: projectData.numberOfNonBinaryOnStage,
        numberOfPeopleOnTour: projectData.numberOfPeopleOnTour,
        complementaryGenre: projectData.complementaryGenre,
      });
      await project.save();
    })
  );

  console.log("Example project seeded");
};

export default seed;
