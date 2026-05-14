import { ChatMessage, Discipline, Program, Project, Tour } from "@cooprog/core";
import mongoose, { model, Schema } from "mongoose";

import { ProgramStatuses } from "@cooprog/core";
import { Feature, GeoJsonProperties, Point } from "geojson";
import { locationSchema } from "../users/model";
import smallestEnclosingCircle from "./smallestEnclosingCircle";
import { longitudeToKilometers } from "./utils";

const circleSchema = new Schema({
  type: { type: String, enum: ["Feature"], required: true },
  geometry: {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: { type: [Number], required: true },
  },
  properties: {
    radius: { type: Number, required: true },
  },
});

const programSchema = new Schema<Program>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: false },
    date: { type: Date, required: true },
    location: { type: locationSchema, required: false },
    status: { type: String, required: true },
    note: { type: String, required: false, default: "" },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

programSchema.index(
  { "location.geolocation": "2dsphere" },
  { background: false }
);

const tourSchema = new Schema<Tour>(
  {
    name: { type: String, required: true },
    start: { type: Date, required: false },
    end: { type: Date, required: false },
    color: { type: String, required: false },
    artisticTeamPlace: { type: Schema.Types.Mixed, required: false },
    peopleTransportMode: { type: String, required: false },
    decorationsTransportMode: { type: String, required: false },
    decorationsWeight: { type: Number, required: false },
    perimeter: { type: circleSchema, required: false },
    schedule: [programSchema],
    lastSeenByUser: {
      type: Schema.Types.Mixed,
      default: {},
    },
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    archived: { type: Boolean, required: false, default: false },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

tourSchema.virtual("numberOfPeopleOnTour").get(function () {
  const project = (this as any).parent() as Project;
  return project?.numberOfPeopleOnTour;
});

const stringToColour = (str: string) => {
  let hash = 0;
  str.split("").forEach((char) => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  });

  const h = Math.abs(hash % 360); // Hue value between 0 and 360
  const s = 25 + Math.abs(hash % 71); // Saturation between 25% and 95%
  const l = 85 + Math.abs(hash % 11); // Lightness between 85% and 95%

  return `hsl(${h}, ${s}%, ${l}%)`;
};

const colorPaths = ["name", "start", "end"];

const getPerimeter = (
  allPoints: { x: number; y: number }[]
): Feature<Point, GeoJsonProperties> => {
  const { x, y, r } = smallestEnclosingCircle(allPoints);
  const minRadiusInKm = 100;
  const radiusInKm = longitudeToKilometers(r, y);
  const radius = Math.max(radiusInKm * 0.8, minRadiusInKm);
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [y, x],
    },
    properties: {
      radius,
    },
  };
};

const getProgramTimestamp = (program: Program): number =>
  new Date(program.date).getTime();

tourSchema.pre("validate", async function (next) {
  try {
    const modifiedPaths = this.directModifiedPaths();
    const systemMessages: ChatMessage[] = [];

    // Keep schedule ordered for a stable timeline everywhere.
    if (Array.isArray(this.schedule) && this.schedule.length > 1) {
      this.schedule.sort(
        (a, b) => getProgramTimestamp(a as Program) - getProgramTimestamp(b as Program)
      );
    }

    // Check for null users in schedule
    this.schedule.forEach((program, index) => {
      if (
        !program.user &&
        [ProgramStatuses.SHOW_PENDING, ProgramStatuses.SHOW_CONFIRMED].includes(
          program.status
        )
      ) {
        console.error(
          "Found pending/confirmed program with null user in tour pre-validate hook",
          {
            tourId: this._id,
            programIndex: index,
            programId: program._id,
            date: program.date,
            status: program.status,
          }
        );
      }
    });

    if (
      !this.color ||
      this.directModifiedPaths().some((path) => colorPaths.includes(path))
    ) {
      this.color = stringToColour(`${this.name} ${this.start} ${this.end}`);
    }

    if (!this.perimeter || this.directModifiedPaths().includes("schedule")) {
      const allPoints = (this.schedule || [])
        .filter((program) =>
          [
            ProgramStatuses.SHOW_PENDING,
            ProgramStatuses.SHOW_CONFIRMED,
          ].includes(program.status)
        )
        .filter((program) => program.location?.geolocation?.coordinates)
        .map((program) => ({
          x: program.location.geolocation.coordinates[1],
          y: program.location.geolocation.coordinates[0],
        }));

      if (allPoints.length > 0) {
        this.perimeter = getPerimeter(allPoints);
      }
    }
  } catch (e) {
    console.log("ERROR IN TOUR PRE SAVE HOOK", e);
  }
  next();
});

const projectSchema = new Schema<Project>(
  {
    artist: { type: String, required: true },
    work: { type: String, required: false },
    places: { type: Schema.Types.Mixed },
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    tours: [tourSchema],
    links: [
      {
        _id: { type: Schema.Types.ObjectId, auto: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: false },
        url: { type: String, required: false },
      },
    ],
    files: [
      {
        _id: { type: Schema.Types.ObjectId, auto: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        extension: { type: String, required: false },
        name: { type: String, required: false },
        originalFilename: { type: String, required: false },
        path: { type: String, required: false },
        mimetype: { type: String, required: false },
        size: { type: Number, required: false },
      },
    ],
    genres: { type: [String], required: false },
    targetAudiences: { type: [String], required: true, default: [] },
    description: { type: String, required: false },
    financialSupport: { type: String, required: false },
    gauge: { type: [String], required: false },
    minimumStageSize: { type: [String], required: false },
    averagePerformanceFee: { type: [String], required: false },
    venueConfigurationType: { type: [String], required: false },
    venueConfigurationSpace: { type: [String], required: false },
    venueConfigurationAudience: { type: [String], required: false },
    performanceLanguages: { type: [String], required: false },
    accessibilityVisual: { type: Boolean, required: false, default: false },
    accessibilityAudio: { type: Boolean, required: false, default: false },
    numberOfPeopleOnTour: { type: Number, required: false },
    numberOfArtistOnStage: { type: Number, required: false },
    numberOfMenOnStage: { type: Number, required: false },
    numberOfWomenOnStage: { type: Number, required: false },
    numberOfNonBinaryOnStage: { type: Number, required: false },
    favoritedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    discipline: {
      type: String,
      enum: Object.values(Discipline),
    },
    complementaryGenre: { type: String, required: false },
    emergingArtist: { type: Boolean, required: false },
    culturalActionInterest: { type: Boolean, required: false },
    totalAvoidedKm: { type: Number, required: false, default: 0 },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

// Add pre-validate hook to check for null users
projectSchema.pre("validate", async function (next) {
  try {
  } catch (e) {
    console.error("Error in project pre-validate hook", e);
  }
  next();
});

projectSchema.index({ artist: "text", work: "text" }, { background: false });

projectSchema.virtual("title").get(function () {
  return this.work ? `${this.artist} · ${this.work}` : this.artist;
});

projectSchema.pre(
  "remove",
  { document: true, query: false },
  async function (next) {
    // remove notifications with this projectId
    await mongoose
      .model("User")
      .updateMany(
        { "notifications.meta.projectId": this._id },
        { $pull: { notifications: { "meta.projectId": this._id } } }
      );

    next();
  }
);

export default model<Project>("Project", projectSchema);
