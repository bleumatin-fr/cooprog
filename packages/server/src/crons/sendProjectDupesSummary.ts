import { mail, send } from "../mails";
import Project from "../projects/model";

const sendProjectDupesSummary = async () => {
  let projects = await Project.find({});
  const allDupes: any[][] = [];

  while (projects.length > 0) {
    const project = projects.pop();

    const projectAlreadyAppearsInDupes = allDupes.some((dupes) =>
      dupes.some((d) => d._id.toString() === project._id.toString())
    );
    if (projectAlreadyAppearsInDupes) {
      continue;
    }

    const searchQuery = `${project.artist} ${project.work}`
      .split(" ")
      .filter((w) => w.length > 2)
      .join(" ");

    const numberOfWord = searchQuery.split(" ").length;

    const similarProjects: any[] = await Project.find(
      {
        $text: {
          $search: searchQuery,
        },
      },
      { score: { $meta: "textScore" } }
    ).lean();

    const dupes = similarProjects.filter((p) => p.score >= numberOfWord / 2);

    if (dupes.length > 1) {
      allDupes.push(dupes);
    }
  }

  if (allDupes.length === 0) {
    return;
  }

  await send({
    to: process.env.MAIL_TO,
    from: process.env.MAIL_FROM,
    ...(await mail("weekly-dupes-admin", "en", {
      dupes: allDupes,
    })),
  });
};

export default sendProjectDupesSummary;
