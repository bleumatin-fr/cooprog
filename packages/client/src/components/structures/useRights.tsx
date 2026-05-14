import { useMemo } from "react";
import { Project } from "@cooprog/core";
import { Tour, Role, User } from "@cooprog/core";
import { TouchAppRounded } from "@mui/icons-material";

export enum Actions {
  USERS_INVITE = "USERS_INVITE",
  DASHBOARD_VIEW_PROJECTS = "DASHBOARD_VIEW_PROJECTS",
  DASHBOARD_VIEW_USERS = "DASHBOARD_VIEW_USERS",
  PAGES_ACCESS_STRUCTURES = "PAGES_ACCESS_STRUCTURES",
  PAGES_ACCESS_PROJECTS = "PAGES_ACCESS_PROJECTS",
  PAGES_ACCESS_STRUCTURE = "PAGES_ACCESS_STRUCTURE",
  PAGES_ACCESS_ARTISTIC_TEAMS = "PAGES_ACCESS_ARTISTIC_TEAMS",
  PAGES_ACCESS_MY_PROJECTS = "PAGES_ACCESS_MY_PROJECTS",
  PROJECT_CREATE = "PROJECT_CREATE",
  PROJECT_EDIT = "PROJECT_EDIT",
  PROJECT_FAVORITE = "PROJECT_FAVORITE",
  PROJECT_SHARE = "PROJECT_SHARE",
  PROJECT_CLAIM = "PROJECT_CLAIM",
  TOUR_CREATE = "TOUR_CREATE",
  TOUR_VIEW_MY_PROGRAM = "TOUR_VIEW_MY_PROGRAM",
  TOUR_SEE_PLANNING = "TOUR_SEE_PLANNING",
  TOUR_SCHEDULE = "TOUR_SCHEDULE",
  TOUR_ADD_WISH = "TOUR_ADD_WISH",
  TOUR_BLOCK = "TOUR_BLOCK",
  TOUR_EDIT_DAYS = "TOUR_EDIT_DAYS",
  TOUR_EDIT_INFORMATION = "TOUR_EDIT_INFORMATION",
  TOUR_SHOW_INTEREST = "TOUR_SHOW_INTEREST",
  CHAT_CREATE_POST = "CHAT_CREATE_POST",
  TOUR_SCHEDULE_FOR_OTHERS = "TOUR_SCHEDULE_FOR_OTHERS",
  TOUR_ADD_UNAVAILABLE = "TOUR_ADD_UNAVAILABLE",
  PROJECT_EDIT_PARTICIPANTS = "PROJECT_EDIT_PARTICIPANTS",
  TOUR_EDIT_PARTICIPANTS = "TOUR_EDIT_PARTICIPANTS",
  TOUR_VIEW_CHAT = "TOUR_VIEW_CHAT",
  USER_SEE_CONTACT_INFORMATION = "USER_SEE_CONTACT_INFORMATION",
}

interface RightsProps {
  user?: User | null;
  project?: Project;
  tour?: Tour;
  tourCreation?: boolean;
}

const getUserMatcher = (currentUser: User) => (projectUser: User) =>
  projectUser._id === currentUser._id;

const useRights = ({
  tour,
  user,
  project,
  tourCreation = false,
}: RightsProps) => {
  return useMemo(() => {
    if (!user) {
      return { can: () => false };
    }

    const projectRights = tour
      ? tour?.projectUsers?.find((projectUser) => projectUser._id === user._id)
      : project?.users
          .filter((u) => !!u)
          .find((tourUser) => tourUser._id === user._id);

    const tourRights = tour
      ? tour?.users.filter((u) => !!u).find((u) => u._id === user?._id)
      : project?.tours
          ?.reduce((acc, tour) => {
            return [...acc, ...tour.users.filter((u) => !!u)];
          }, [] as User[])
          .find((u) => u?._id === user?._id);

    const isProjectArtisticTeam = projectRights?.role === Role.ARTISTIC_TEAM;
    const isTourPartner = tourRights?.role === Role.DIFFUSION_STRUCTURE;

    const userRole = user?.role;

    const hasArtisticTeam =
      project?.users.some((u) => u.role === Role.ARTISTIC_TEAM) ||
      tour?.projectUsers?.some((u) => u.role === Role.ARTISTIC_TEAM);

    const hasActiveTour = project?.tours?.some((t) => !t.archived);

    const can = (action: Actions) => {
      switch (action) {
        case Actions.PAGES_ACCESS_MY_PROJECTS:
          return userRole === Role.ARTISTIC_TEAM;
        case Actions.USERS_INVITE:
        case Actions.PROJECT_FAVORITE:
        case Actions.PROJECT_SHARE:
          return (
            user.role === Role.ADMIN ||
            (!tour?.archived && userRole === Role.DIFFUSION_STRUCTURE)
          );
        case Actions.DASHBOARD_VIEW_PROJECTS:
        case Actions.DASHBOARD_VIEW_USERS:
          return (
            userRole === Role.DIFFUSION_STRUCTURE ||
            userRole === Role.ADMIN ||
            userRole === Role.SPECTATOR
          );
        case Actions.PAGES_ACCESS_STRUCTURES:
          return true;
        case Actions.PAGES_ACCESS_PROJECTS:
        case Actions.PAGES_ACCESS_STRUCTURE:
        case Actions.PAGES_ACCESS_ARTISTIC_TEAMS:
          return (
            userRole === Role.DIFFUSION_STRUCTURE ||
            userRole === Role.ADMIN ||
            userRole === Role.SPECTATOR
          );
        case Actions.PROJECT_CREATE:
          return (
            user.role === Role.ADMIN ||
            userRole === Role.DIFFUSION_STRUCTURE ||
            userRole === Role.ARTISTIC_TEAM
          );
        case Actions.PROJECT_EDIT:
        case Actions.PROJECT_EDIT_PARTICIPANTS:
          return (
            user.role === Role.ADMIN || isTourPartner || isProjectArtisticTeam
          );
        case Actions.PROJECT_CLAIM:
          return user.role === Role.ARTISTIC_TEAM && !hasArtisticTeam;
        case Actions.TOUR_SHOW_INTEREST:
          return (
            user.role === Role.ADMIN ||
            (!tour?.archived &&
              userRole === Role.DIFFUSION_STRUCTURE &&
              !tourRights)
          );
        case Actions.TOUR_CREATE:
          return (
            user.role === Role.ADMIN ||
            userRole === Role.DIFFUSION_STRUCTURE ||
            (userRole === Role.ARTISTIC_TEAM && !!hasActiveTour)
          );
        case Actions.TOUR_EDIT_DAYS:
          return (
            !tour?.archived &&
            (user.role === Role.ADMIN ||
              (tourCreation &&
                (userRole === Role.DIFFUSION_STRUCTURE ||
                  userRole === Role.ARTISTIC_TEAM)) ||
              isTourPartner ||
              isProjectArtisticTeam)
          );
        case Actions.TOUR_BLOCK:
          return (
            !tour?.archived &&
            (user.role === Role.ADMIN ||
              (tourCreation &&
                (userRole === Role.DIFFUSION_STRUCTURE ||
                  userRole === Role.ARTISTIC_TEAM)) ||
              isProjectArtisticTeam ||
              isTourPartner)
          );

        case Actions.TOUR_ADD_WISH:
          return (
            !tour?.archived &&
            (user.role === Role.ADMIN || isProjectArtisticTeam)
          );
        case Actions.TOUR_EDIT_INFORMATION:
          return (
            user.role === Role.ADMIN || isProjectArtisticTeam || isTourPartner
          );
        case Actions.TOUR_EDIT_PARTICIPANTS:
          return (
            !tour?.archived &&
            (user.role === Role.ADMIN || isProjectArtisticTeam || isTourPartner)
          );
        case Actions.TOUR_SCHEDULE:
          return (
            !tour?.archived &&
            (user.role === Role.ADMIN ||
              (tourCreation && userRole === Role.DIFFUSION_STRUCTURE) ||
              isTourPartner)
          );
        case Actions.TOUR_ADD_UNAVAILABLE:
          return (
            !tour?.archived &&
            (user.role === Role.ADMIN ||
              (tourCreation &&
                (userRole === Role.DIFFUSION_STRUCTURE ||
                  userRole === Role.ARTISTIC_TEAM)) ||
              isProjectArtisticTeam ||
              isTourPartner)
          );
        case Actions.TOUR_SCHEDULE_FOR_OTHERS:
          return (
            !tour?.archived &&
            (user.role === Role.ADMIN ||
              (tourCreation &&
                [Role.DIFFUSION_STRUCTURE, Role.ARTISTIC_TEAM].includes(
                  userRole,
                )) ||
              isProjectArtisticTeam ||
              isTourPartner)
          );
        case Actions.TOUR_VIEW_MY_PROGRAM:
          return !tour?.archived && isTourPartner;
        case Actions.TOUR_SEE_PLANNING:
          return !tour?.archived;
        case Actions.TOUR_VIEW_CHAT:
          if (tour?.archived) {
            return false;
          }
          if (userRole === Role.DIFFUSION_STRUCTURE) {
            return isTourPartner;
          }
          if (userRole === Role.ARTISTIC_TEAM) {
            return isProjectArtisticTeam;
          }
          return false;
        case Actions.CHAT_CREATE_POST:
          return (
            !tour?.archived &&
            (userRole === Role.DIFFUSION_STRUCTURE ||
              userRole === Role.ARTISTIC_TEAM)
          );
        case Actions.USER_SEE_CONTACT_INFORMATION:
          return (
            userRole !== Role.ARTISTIC_TEAM && user.role !== Role.ARTISTIC_TEAM
          );
        default:
          return false;
      }
    };

    return { can };
  }, [tour, user, project, tourCreation]);
};

export default useRights;
