import {
  User as BaseUser,
  ContactInformation,
  Discipline,
  Location,
  Notification,
  Role,
  StructureType,
  NotificationType,
  LabeledLocation,
} from "@cooprog/core";
import mongoose, { model, Schema, Types } from "mongoose";

if (!process.env.REFRESH_TOKEN_EXPIRY) {
  throw new Error("Environment variable REFRESH_TOKEN_EXPIRY not set");
}

export interface TokenType {
  user: Types.ObjectId;
  value: string;
  createdAt: Date;
}

export interface Profile {
  _id?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  color?: string;
  contactInformation?: ContactInformation;
}

export const profileSchema = new Schema<Profile>({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  role: {
    type: String,
  },
  color: {
    type: String,
  },
  contactInformation: {
    types: [
      {
        type: String,
        enum: ["email", "phone"],
      },
    ],
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    instructions: {
      type: String,
    },
  },
});

export const tokenSchema = new Schema<TokenType>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  value: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: Number(eval(process.env.REFRESH_TOKEN_EXPIRY)),
  },
});

export const Token = model<TokenType>("Token", tokenSchema);

export const locationSchema = new Schema<Location>({
  geolocation: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  address: {
    type: String,
    required: false,
  },
  data: {
    county: {
      type: String,
    },
    city: {
      type: String,
    },
    town: {
      type: String,
    },
    village: {
      type: String,
    },
    municipality: {
      type: String,
    },
    city_district: {
      type: String,
    },
    construction: {
      type: String,
    },
    continent: {
      type: String,
    },
    country: {
      type: String,
    },
    country_code: {
      type: String,
    },
    house_number: {
      type: String,
    },
    neighbourhood: {
      type: String,
    },
    postcode: {
      type: String,
    },
    public_building: {
      type: String,
    },
    state: {
      type: String,
    },
    suburb: {
      type: String,
    },
  },
});
locationSchema.index({ geolocation: "2dsphere" }, { background: false });

const notificationSchema = new Schema<Notification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    meta: { type: Schema.Types.Mixed },
    seen: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

export type User = BaseUser & {
  salt: string;
  hash: string;
  resetPasswordToken?: string;
  lastLogin?: Date;
  inactivityWarningSent?: boolean;
  lastActive?: Date;
  notifications?: Notification[];
  expireAt?: Date;
  optin: boolean;
  programmingDisciplines: Discipline[];
  structureTypes: StructureType[];
  programmingPeriods: string;
  programmingGenres: string[];
  moderationEmailSent?: boolean;
  avatarChangedAt?: Date;
  companyDescription?: string;
  firstName?: string;
  lastName?: string;
};

export const userSchema = new Schema<User>(
  {
    company: {
      type: String,
      required: true,
    },
    companyDescription: {
      type: String,
      required: false,
    },
    avatarUrl: {
      type: String,
    },
    avatarChangedAt: {
      type: Date,
    },
    profiles: [profileSchema],
    link: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    salt: {
      type: String,
    },
    hash: {
      type: String,
      required: false,
    },
    resetPasswordToken: {
      type: String,
    },
    lastLogin: {
      type: Date,
    },
    inactivityWarningSent: {
      type: Boolean,
      default: false,
    },
    lastActive: {
      type: Date,
    },
    role: {
      type: String,
      default: Role.DIFFUSION_STRUCTURE,
      enum: Object.values(Role),
    },
    color: {
      type: String,
    },
    locations: [
      {
        label: {
          type: String,
          required: true,
        },
        isMain: {
          type: Boolean,
          required: true,
          default: false,
        },
        location: locationSchema,
      },
    ],
    notifications: [notificationSchema],
    invitedPeopleCount: {
      type: Number,
      default: 0,
    },
    language: {
      type: String,
      default: "en",
    },
    optin: {
      type: Boolean,
      default: true,
    },
    programmingDisciplines: [
      {
        type: String,
        enum: Object.values(Discipline),
      },
    ],
    structureTypes: [
      {
        type: String,
        enum: Object.values(StructureType),
      },
    ],
    programmingPeriods: {
      type: String,
    },
    programmingGenres: [String],
    status: {
      type: String,
      enum: ["awaiting-moderation", "pending-moderation", "ok", "banned"],
      default: "awaiting-moderation",
    },
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    viewedProjects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    changeLog: [
      {
        createdAt: {
          type: Date,
          default: Date.now,
        },
        createdBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        changes: [
          {
            field: String,
            oldValue: Schema.Types.Mixed,
            newValue: Schema.Types.Mixed,
          },
        ],
      },
    ],
    expireAt: {
      type: Date,
    },
    moderationEmailSent: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

const stringToColour = (str?: string) => {
  if (!str) {
    return "var(--color-light-green)";
  }
  let hash = 0;
  str.split("").forEach((char) => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  });
  let colour = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    colour += value.toString(16).padStart(2, "0");
  }
  return colour;
};

userSchema.virtual("firstName").get(function () {
  return this.profiles?.length ? this.profiles[0].firstName : null;
});

userSchema.virtual("lastName").get(function () {
  return this.profiles?.length ? this.profiles[0].lastName : null;
});

profileSchema.pre("save", function (next) {
  const colorPaths = ["firstName", "lastName"];
  if (
    !this.color &&
    this.directModifiedPaths().some((path) => colorPaths.includes(path))
  ) {
    this.color = stringToColour(this.firstName + this.lastName);
  }
  next();
});

userSchema.pre("save", function (next) {
  const colorPaths = ["company"];
  if (
    !this.color ||
    this.directModifiedPaths().some((path) => colorPaths.includes(path))
  ) {
    this.color = stringToColour(this.company);
  }

  if (
    this.directModifiedPaths().includes("locations") &&
    Array.isArray(this.locations) &&
    this.locations.length > 0 &&
    !this.locations.some((loc) => loc.isMain)
  ) {
    this.locations[0].isMain = true;
  }

  next();
});

userSchema.pre(
  "remove",
  { document: true, query: false },
  async function (next) {
    // remove programmation with this projectId
    await mongoose.model("Project").updateMany(
      { "schedule.user": this._id },
      {
        $pull: {
          schedule: { user: this._id },
        },
      }
    );

    next();
  }
);

userSchema.index(
  {
    "profiles.firstName": "text",
    "profiles.lastName": "text",
    email: "text",
    "profiles.contactInformation.value": "text",
    company: "text",
    companyDescription: "text",
  },
  {
    weights: {
      "profiles.firstName": 5,
      "profiles.lastName": 5,
      email: 3,
      "profiles.contactInformation.value": 1,
      company: 2,
      companyDescription: 1,
    },
  }
);

userSchema.index(
  { "locations.location.geolocation": "2dsphere" },
  { background: false }
);
userSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

// remove hash in serialization to make sure it's not sent by API
userSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret, options) {
    delete ret.hash;
    delete ret.salt;
    if (ret.avatarUrl) {
      ret.avatarUrl = `/api/users/${ret._id}/avatar`;
    }
    return ret;
  },
});

export default model<User>("User", userSchema);
