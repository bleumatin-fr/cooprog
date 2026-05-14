import { Program, Project } from "./Project";

export enum NotificationType {
  FOLLOW_REQUEST = "follow_request",
  FOLLOW_REQUEST_ACCEPTED = "follow_request_accepted",
  FOLLOW_REQUEST_ACCEPTED_AND_BACK = "follow_request_accepted_and_back",
  PEOPLE_JOINED = "people_joined",
  PROJECT_EDITION = "project_edition",
  PROJECT_EDITION_ACCEPTED = "project_edition_accepted",
  PROJECT_EDITION_REJECTED = "project_edition_rejected",
  PROJECT_SHARED = "project_shared",
  PROJECT_USER_ADDED = "project_user_added",
  DATE_SCHEDULED_FOR_YOU = "date_scheduled_for_you",
  NEW_ACTIVITY = "new_activity",
}

export interface Notification {
  _id?: string;
  user?: User;
  type: NotificationType;
  meta: any;
  seen: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GeocodeAddress {
  county?: string;
  city_district?: string;
  municipality?: string;
  city?: string;
  town?: string;
  village?: string;
  construction?: string;
  continent?: string;
  country?: string;
  country_code?: string;
  house_number?: string;
  neighbourhood?: string;
  postcode?: string;
  public_building?: string;
  state?: string;
  suburb?: string;
}

export interface Location {
  _id?: string;
  geolocation: GeoJSON.Point;
  address: string;
  data: GeocodeAddress;
}

export interface ContactInformation {
  _id?: string;
  types?: ("email" | "phone")[];
  email?: string;
  phone?: string;
  instructions?: string;
}

export enum Role {
  ADMIN = "admin",
  DIFFUSION_STRUCTURE = "diffusion_structure",
  SPECTATOR = "spectator",
  ARTISTIC_TEAM = "artistic_team",
}

export enum Discipline {
  PERFORMING_ARTS = "performingArts",
  MUSIC = "music",
}

export enum StructureType {
  VENUE = "venue",
  FESTIVAL = "festival",
  ITINERANT = "itinerant",
}

export interface Profile {
  _id?: string;
  firstName: string;
  lastName: string;
  role?: string;
  avatarUrl?: string;
  color?: string;
  contactInformation?: ContactInformation;
}

export interface LabeledLocation {
  _id?: string;
  label: string;
  isMain: boolean;
  location: Location;
}

export interface User {
  _id: string;
  company: string;
  companyDescription?: string;
  avatarUrl?: string;
  avatarChangedAt?: Date;
  link?: string;
  email: string;
  role: Role;
  color?: string;
  schedule?: Program[];
  viewedProjects?: Project[];
  favoritedProjects?: Project[];
  locations: LabeledLocation[];
  notifications?: Notification[];
  following?: User[];
  createdAt?: Date;
  updatedAt?: Date;
  status?: "awaiting-moderation" | "pending-moderation" | "ok" | "banned";
  distance?: number;
  accessInformation?: {
    isFollowing?: boolean;
    isFollower?: boolean;
    isSelf?: boolean;
  };
  index?: number;
  followerCount?: number;
  projectCount?: number;
  invitedPeopleCount?: number;
  shouldInvite?: boolean;
  changeLog?: {
    createdAt: Date;
    createdBy: User;
    changes: {
      field: string;
      oldValue: any;
      newValue: any;
    }[];
  }[];
  language?: string;
  profiles?: Profile[];
  programmingDisciplines?: Discipline[];
  structureTypes?: StructureType[];
  programmingPeriods?: string;
  programmingGenres?: string[];
  resetPasswordToken?: string;
}
