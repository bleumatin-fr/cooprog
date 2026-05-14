import { Discipline } from "@cooprog/core";
import { mail, send } from "../mails";
import User from "../users/model";

/**
 * Envoie deux emails quotidiens distincts avec la liste des utilisateurs en attente de modération :
 * - Un email pour les utilisateurs en Spectacle Vivant
 * - Un email pour les utilisateurs en Musiques Actuelles
 *
 * Les utilisateurs appartenant aux deux disciplines sont inclus dans les deux emails.
 */
const sendModerationEmails = async () => {
  try {
    console.log("Recherche des utilisateurs en attente de modération...");

    // Rechercher tous les utilisateurs en attente de modération qui n'ont pas encore été notifiés
    const usersToModerate = await User.find({
      status: "awaiting-moderation",
      moderationEmailSent: { $ne: true },
    });

    if (usersToModerate.length === 0) {
      console.log("Aucun nouvel utilisateur en attente de modération.");
      return;
    }

    console.log(
      `Trouvé ${usersToModerate.length} utilisateurs en attente de modération.`
    );

    // Préparer les groupes d'utilisateurs par discipline
    const spectacleVivantUsers = [];
    const musiquesActuellesUsers = [];

    for (const user of usersToModerate) {
      const userData = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        company: user.company,
        link: `${process.env.ADMIN_URL}/#/users/${user._id}`,
      };

      // Vérifier si l'utilisateur est en Spectacle Vivant
      if (
        user.programmingDisciplines &&
        user.programmingDisciplines.includes(Discipline.PERFORMING_ARTS)
      ) {
        spectacleVivantUsers.push(userData);
      }

      // Vérifier si l'utilisateur est en Musiques Actuelles
      if (
        user.programmingDisciplines &&
        user.programmingDisciplines.includes(Discipline.MUSIC)
      ) {
        musiquesActuellesUsers.push(userData);
      }

      // Marquer l'utilisateur comme notifié, qu'il ait une discipline ou non
      user.moderationEmailSent = true;
      await user.save();
    }

    // Envoyer l'email pour les utilisateurs en Spectacle Vivant s'il y en a
    if (spectacleVivantUsers.length > 0) {
      console.log(
        `Envoi d'un email pour ${spectacleVivantUsers.length} utilisateurs en Spectacle Vivant`
      );
      await send({
        to: process.env.MAIL_TO || "",
        from: process.env.MAIL_FROM || "",
        ...(await mail("account-to-moderate", "fr", {
          subject: `CooProg - Nouveaux utilisateurs à modérer - Spectacle Vivant (${spectacleVivantUsers.length})`,
          spectacleVivantUsers,
          musiquesActuellesUsers: [],
          bothDisciplinesUsers: [],
          noDisciplineUsers: [],
          disciplineFilter: "spectacle-vivant",
        })),
      });
      console.log("Email pour Spectacle Vivant envoyé avec succès.");
    }

    // Envoyer l'email pour les utilisateurs en Musiques Actuelles s'il y en a
    if (musiquesActuellesUsers.length > 0) {
      console.log(
        `Envoi d'un email pour ${musiquesActuellesUsers.length} utilisateurs en Musiques Actuelles`
      );
      await send({
        to: process.env.MAIL_TO || "",
        from: process.env.MAIL_FROM || "",
        ...(await mail("account-to-moderate", "fr", {
          subject: `CooProg - Nouveaux utilisateurs à modérer - Musiques Actuelles (${musiquesActuellesUsers.length})`,
          spectacleVivantUsers: [],
          musiquesActuellesUsers,
          bothDisciplinesUsers: [],
          noDisciplineUsers: [],
          disciplineFilter: "musiques-actuelles",
        })),
      });
      console.log("Email pour Musiques Actuelles envoyé avec succès.");
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi des emails de modération :", error);
  }
};

export default sendModerationEmails;
