import { Feature, GeoJsonProperties, Point } from "geojson";
import { Discipline, Location, Profile, User } from "./User";

export interface Link {
  _id?: string;
  userId: string;
  name: string;
  url: string;
}

export interface FileType {
  _id: string;
  userId: string;
  name: string;
  originalFilename: string;
  extension: string;
  path: string;
  mimetype: string;
  size: number;
}

export interface Project {
  _id: string;
  artist: string;
  totalAvoidedKm?: number;
  work?: string;
  places?: Place[];
  genres?: string[];
  links?: Link[];
  files?: FileType[];
  targetAudiences: string[];
  description?: string;
  financialSupport?: string;
  gauge?: string[];
  minimumStageSize?: string[];
  averagePerformanceFee?: string[];
  numberOfPeopleOnTour?: number;
  numberOfArtistOnStage?: number;
  numberOfMenOnStage?: number;
  numberOfWomenOnStage?: number;
  numberOfNonBinaryOnStage?: number;
  venueConfigurationType?: string[];
  venueConfigurationSpace?: string[];
  venueConfigurationAudience?: string[];
  performanceLanguages?: string[];
  accessibilityVisual?: boolean;
  accessibilityAudio?: boolean;
  users: User[];
  distance?: number;
  minDate?: Date;
  maxDate?: Date;
  favoritedBy?: User[];
  createdAt?: Date;
  updatedAt?: Date;
  viewed?: boolean;
  tours?: Tour[];
  discipline?: Discipline;
  complementaryGenre?: string;
  emergingArtist?: boolean;
  culturalActionInterest?: boolean;
}

export interface Tour {
  _id?: string;
  name: string;
  start?: Date;
  end?: Date;
  color?: string;
  perimeter?: Feature<Point, GeoJsonProperties>;
  schedule?: Program[];
  users: User[];
  projectUsers?: User[];
  createdAt?: Date;
  updatedAt?: Date;
  artisticTeamPlace?: Place;
  peopleTransportMode?: string;
  numberOfPeopleOnTour?: number;
  decorationsTransportMode?: string;
  decorationsWeight?: number;
  lastSeenByUser?: Record<string, Date>; // userId -> lastSeen timestamp
  archived?: boolean;
}

export enum ProgramStatuses {
  SHOW_WISHED = "wished",
  SHOW_PENDING = "pending",
  SHOW_CONFIRMED = "confirmed",
  UNAVAILABLE = "unavailable",
  BLOCKED = "booked",
}

export interface Program {
  _id?: string;
  date: Date;
  user?: User;
  location?: Location;
  status: ProgramStatuses;
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Genre {
  id: string;
  name: string;
  color: string;
  backgroundColor: string;
  icon: string;
  discipline: Discipline;
}

export interface TargetAudience {
  id: string;
  name: string;
  color: string;
  backgroundColor: string;
}

export interface Place {
  id: string;
  country: string;
  region: string;
  city: string;
  geolocation?: {
    coordinates: [number, number];
  };
}

export enum ChatMessageType {
  USER = "user",
  SYSTEM = "system",
}

export enum SystemDataType {
  ARRAY_TO_TRANSLATE_WITH_MAPPING_OBJECT = "array_to_translate_with_mapping_object",
  ARRAY_TO_TRANSLATE_WITH_OBJECT = "array_to_translate_with_object",
  DIRECT_VALUE = "direct_value",
}

interface BaseSystemDataItem {
  fieldName: string;
}

interface ArrayToTranslateWithMappingObject extends BaseSystemDataItem {
  type: SystemDataType.ARRAY_TO_TRANSLATE_WITH_MAPPING_OBJECT;
  translationKey: string;
  nameKey: string;
  newValues: string[];
}

interface ArrayToTranslateWithObject extends BaseSystemDataItem {
  type: SystemDataType.ARRAY_TO_TRANSLATE_WITH_OBJECT;
  translationKey: string;
  newValues: string[];
}

interface DirectValue extends BaseSystemDataItem {
  type: SystemDataType.DIRECT_VALUE;
  value: string | number;
}

export type SystemDataItem =
  | ArrayToTranslateWithMappingObject
  | ArrayToTranslateWithObject
  | DirectValue;

export interface ChatMessage {
  _id?: string;
  type: ChatMessageType;
  tour: Tour;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
  sender?: User;
  reactions?: Reaction[];
  systemData?: SystemDataItem[];
  profile?: Profile;
}

export interface Reaction {
  _id?: string;
  sender: User;
  reaction: string;
  createdAt?: Date;
  updatedAt?: Date;
}
