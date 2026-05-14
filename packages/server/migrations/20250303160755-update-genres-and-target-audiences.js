const genres = {
  0: "Théâtre",
  1: "Danse",
  2: "Performance",
  3: "Cirque",
  4: "Théâtre d'Objet/Marionette",
  5: "Art dans l'espace public",
  6: "Musiques de création",
  7: "Ciné-concert",
  8: "Arts numériques",
  9: "Arts visuels",
  10: "Lecture",
  11: "Conte / Art de la parole",
  12: "Magie nouvelle",
  13: "Conférence performée",
  14: "Musique classique / Musique de répertoire",
  15: "Projet in situ",
};

const targetAudiences = {
  0: "Petite enfance",
  1: "Enfance",
  2: "Adolescence",
  3: "Âge adulte",
  4: "Tout public",
};

const getKey = (object, targetValue) => {
  const foundEntry = Object.entries(object).find(([key, value]) => {
    return value === targetValue;
  });
  return foundEntry ? foundEntry[0] : undefined;
};

module.exports = {
  async up(db, client) {
    const projects = await db.collection("projects").find({}).toArray();

    for (const project of projects) {
      const updatedGenres = (project.genre || [])
        .map((genre) => getKey(genres, genre))
        .filter((genre) => genre !== undefined);

      const updatedTargetAudiences = (project.targetAudience || [])
        .map((audience) => getKey(targetAudiences, audience))
        .filter((audience) => audience !== undefined);

      await db.collection("projects").updateOne(
        { _id: project._id },
        {
          $set: {
            genre: updatedGenres,
            targetAudience: updatedTargetAudiences,
            _genre: project.genre,
            _targetAudience: project.targetAudience,
          },
        }
      );
    }
  },

  async down(db, client) {
    const projects = await db.collection("projects").find({}).toArray();

    for (const project of projects) {
      await db.collection("projects").updateOne(
        { _id: project._id },
        {
          $set: {
            genre: project._genre,
            targetAudience: project._targetAudience,
          },
          $unset: {
            _genre: "",
            _targetAudience: "",
          },
        }
      );
    }
  },
};
