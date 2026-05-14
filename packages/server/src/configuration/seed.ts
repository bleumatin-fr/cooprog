import Configuration from "./model";

// const listeGenres = [
//   {
//     name: "Théâtre",
//     backgroundColor: "#EDFEFA",
//     color: "#028868",
//     icon: "theater",
//   },
//   {
//     name: "Danse",
//     backgroundColor: "#FFF6F1",
//     color: "#FFA16B",
//     icon: "spectacle",
//   },
//   {
//     name: "Performance",
//     backgroundColor: "#FFF6F1",
//     color: "#FFA16B",
//     icon: "spectacle",
//   },
//   {
//     name: "Cirque",
//     backgroundColor: "#FFF6F1",
//     color: "#FFA16B",
//     icon: "spectacle",
//   },
//   {
//     name: "Théâtre d'Objet/Marionette",
//     backgroundColor: "#EDFEFA",
//     color: "#028868",
//     icon: "theater",
//   },
//   {
//     name: "Art dans l'espace public",
//     backgroundColor: "#FFF1E9",
//     color: "#FF7446",
//     icon: "art",
//   },
//   {
//     name: "Musiques actuelles",
//     backgroundColor: "#F5F7F3",
//     color: "#829661",
//     icon: "music",
//   },
//   {
//     name: "Musique classique/ancienne/baroque",
//     backgroundColor: "#F5F7F3",
//     color: "#829661",
//     icon: "music",
//   },
//   {
//     name: "Ciné-concert",
//     backgroundColor: "#F2F5F8",
//     color: "#4168AF",
//     icon: "cinema",
//   },
//   {
//     name: "Cinéma audiovisuel",
//     backgroundColor: "#F2F5F8",
//     color: "#4168AF",
//     icon: "cinema",
//   },
//   {
//     name: "Arts visuels",
//     backgroundColor: "#FFF1E9",
//     color: "#FF7446",
//     icon: "art",
//   },
//   {
//     name: "Lecture",
//     backgroundColor: "#FFF5E8",
//     color: "#FDB75D",
//     icon: "book",
//   },
//   {
//     name: "Rencontre d'auteur.trice",
//     backgroundColor: "#FFF5E8",
//     color: "#FDB75D",
//     icon: "book",
//   },
//   {
//     name: "Magie nouvelle",
//     backgroundColor: "#FFF6F1",
//     color: "#FFA16B",
//     icon: "spectacle",
//   },
//   {
//     name: "Conférence performée",
//     backgroundColor: "#FFF6F1",
//     color: "#FFA16B",
//     icon: "spectacle",
//   },
//   {
//     name: "Résidence",
//     backgroundColor: "#F5F7F3",
//     color: "#829661",
//     icon: "music",
//   },
//   {
//     name: "Projet in situ",
//     backgroundColor: "#FFF6F1",
//     color: "#FFA16B",
//     icon: "spectacle",
//   },
// ];

// const listeTargetAudiences = [
//   { name: "Petite enfance", backgroundColor: "#FFA16B90", color: "#123036" },
//   { name: "Enfance", backgroundColor: "#FFA16B90", color: "#123036" },
//   { name: "Adolescence", backgroundColor: "#FFA16B90", color: "#123036" },
//   { name: "Âge adulte", backgroundColor: "#FFA16B90", color: "#123036" },
//   { name: "Tout public", backgroundColor: "#FFA16B90", color: "#123036" },
// ];

const patchConfiguration = async (name: string, value: any) => {
  const configuration = await Configuration.findOne({
    name,
  });

  if (configuration && process.env.NODE_ENV !== "development") {
    // do not override configuration if it exists and we in production
    return;
  }

  if (!configuration) {
    await new Configuration({
      name,
      value,
    }).save();
  }
};

const TWO_YEARS = 730;
const ONE_WEEK = 7;
const SIX_MONTHS = 180;

const seed = async () => {
  await patchConfiguration(
    "inactive-account-warning-delay-days",
    TWO_YEARS - 2 * ONE_WEEK
  );
  await patchConfiguration("inactive-account-delete-delay-days", TWO_YEARS);
  await patchConfiguration("inactive-project-delete-delay-days", SIX_MONTHS);

  console.log("Default configuration seeded");
};

export default seed;
