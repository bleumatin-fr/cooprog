import {
  Link,
  ChatMessageType,
  SystemDataType,
  User,
  Notification,
  NotificationType,
} from "@cooprog/core";
import { ChatMessage } from "@cooprog/core";
import { Types } from "mongoose";
import ChatMessageModel from "../chatMessages/model";
import { Program } from "@cooprog/core";
import Project from "../projects/model";
import sendNotification from "../users/sendNotification";

const sendProjectNotification = async (projectId: string, tourId?: string) => {
  const project = await Project.findOne({
    _id: projectId,
  });
  if (!project) {
    throw new Error("Project not found");
  }
  const projectUsers = project.users.map((user) => user._id) ?? [];

  const tour = project.tours.find((tour) => tour._id.toString() === tourId);
  const tourUsers = tour?.users.map((user) => user._id) ?? [];

  [...projectUsers, ...tourUsers].forEach(async (userId) => {
    await sendNotification(userId, NotificationType.NEW_ACTIVITY, {
      count: 1,
      projectId: project._id,
      tourId: tourId,
    });
  });
};

export const getPatchProjectSystemMessages = (
  tourIds: string[],
  key: string,
  value: any
) => {
  let messageTemplate: Partial<ChatMessage> | null = null;

  if (
    [
      "artist",
      "work",
      "financialSupport",
      "places",
      "numberOfPeopleOnTour",
      "numberOfArtistOnStage",
    ].includes(key)
  ) {
    messageTemplate = {
      type: ChatMessageType.SYSTEM,
      message: "projects:tours.chat.system-message.update-project-property",
      systemData: [
        {
          fieldName: "propertyName",
          type: SystemDataType.ARRAY_TO_TRANSLATE_WITH_OBJECT,
          translationKey: `common:dialogs.new-project.${key}`,
          newValues: ["label"],
        },
        {
          fieldName: "newValue",
          type: SystemDataType.DIRECT_VALUE,
          value:
            key === "places"
              ? value && value.city && value.country
                ? `${value.city} ${value.country}`
                : value
              : value,
        },
        {
          fieldName: "count",
          type: SystemDataType.DIRECT_VALUE,
          value: Array.isArray(value) ? value.length : 1,
        },
      ],
    };
  } else if (["genre", "targetAudiences"].includes(key)) {
    messageTemplate = {
      type: ChatMessageType.SYSTEM,
      message: "projects:tours.chat.system-message.update-project-property",
      systemData: [
        {
          fieldName: "propertyName",
          type: SystemDataType.ARRAY_TO_TRANSLATE_WITH_OBJECT,
          translationKey: "common:dialogs.new-project.project-information",
          newValues: [key],
        },
        {
          fieldName: "newValue",
          type: SystemDataType.ARRAY_TO_TRANSLATE_WITH_MAPPING_OBJECT,
          translationKey: `projects:${key}s`,
          nameKey: "name",
          newValues: value,
        },
        {
          fieldName: "count",
          type: SystemDataType.DIRECT_VALUE,
          value: Array.isArray(value) ? value.length : 1,
        },
      ],
    };
  } else if (
    [
      "gauge",
      "targetAudience",
      "minimumStageSize",
      "averagePerformanceFee",
      "venueConfigurationType",
      "venueConfigurationSpace",
      "venueConfigurationAudience",
      "performanceLanguages",
    ].includes(key)
  ) {
    messageTemplate = {
      type: ChatMessageType.SYSTEM,
      message: "projects:tours.chat.system-message.update-project-property",
      systemData: [
        {
          fieldName: "propertyName",
          type: SystemDataType.ARRAY_TO_TRANSLATE_WITH_OBJECT,
          translationKey: `common:dialogs.new-project.${key}`,
          newValues: ["label"],
        },
        {
          fieldName: "newValue",
          type: SystemDataType.ARRAY_TO_TRANSLATE_WITH_OBJECT,
          translationKey:
            key === "performanceLanguages"
              ? `projects:${key}`
              : `projects:${key}s`,
          newValues: value,
        },
        {
          fieldName: "count",
          type: SystemDataType.DIRECT_VALUE,
          value: Array.isArray(value) ? value.length : 1,
        },
      ],
    };
  } else if (["links"].includes(key)) {
    const linkNames = value.map((link: Link) => link.name).join(", ");
    messageTemplate = {
      type: ChatMessageType.SYSTEM,
      message: "projects:tours.chat.system-message.new-link",
      systemData: [
        {
          fieldName: "linkName",
          type: SystemDataType.DIRECT_VALUE,
          value: linkNames,
        },
        {
          fieldName: "count",
          type: SystemDataType.DIRECT_VALUE,
          value: Array.isArray(value) ? value.length : 1,
        },
      ],
    };
  }

  return messageTemplate
    ? tourIds.map((tourId) => ({
        ...messageTemplate,
        tour: new Types.ObjectId(tourId),
      }))
    : [];
};

const tourKeyToTranslationKey: Record<string, string> = {
  name: "name",
  start: "start",
  end: "end",
  artisticTeamPlace: "artistic-team-localization",
  peopleTransportMode: "people-transport",
  decorationsTransportMode: "decorations-transport",
  decorationsWeight: "decorationsWeight",
};

export const getPatchTourSystemMessages = (
  tourId: string,
  key: string,
  value: any
) => {
  let messageTemplate: Partial<ChatMessage> | null = null;

  if (
    ["name", "start", "end", "artisticTeamPlace", "decorationsWeight"].includes(
      key
    )
  ) {
    messageTemplate = {
      type: ChatMessageType.SYSTEM,
      message: "projects:tours.chat.system-message.update-tour-property",
      systemData: [
        {
          fieldName: "propertyName",
          type: SystemDataType.ARRAY_TO_TRANSLATE_WITH_OBJECT,
          translationKey: `common:dialogs.new-project.tour-information`,
          newValues: [(tourKeyToTranslationKey[key] as string) ?? key],
        },
        {
          fieldName: "newValue",
          type: SystemDataType.DIRECT_VALUE,
          value:
            key === "artisticTeamPlace"
              ? value && value.city && value.country
                ? `${value.city} ${value.country}`
                : value
              : value,
        },
      ],
    };
  } else if (
    ["peopleTransportMode", "decorationsTransportMode"].includes(key)
  ) {
    messageTemplate = {
      type: ChatMessageType.SYSTEM,
      message: "projects:tours.chat.system-message.update-tour-property",
      systemData: [
        {
          fieldName: "propertyName",
          type: SystemDataType.ARRAY_TO_TRANSLATE_WITH_OBJECT,
          translationKey: `common:dialogs.new-project.tour-information`,
          newValues: [(tourKeyToTranslationKey[key] as string) ?? key],
        },
        {
          fieldName: "newValue",
          type: SystemDataType.ARRAY_TO_TRANSLATE_WITH_OBJECT,
          translationKey: `common:dialogs.new-project.tour-information.${
            (tourKeyToTranslationKey[key] as string) ?? key
          }-mode`,
          newValues: [value],
        },
      ],
    };
  }

  return {
    ...messageTemplate,
    tour: new Types.ObjectId(tourId),
  };
};

const getUserSystemData = (user: User) => {
  return [
    {
      fieldName: "company",
      type: SystemDataType.DIRECT_VALUE,
      value: `${user.company}`,
    },
  ];
};

export const saveNewInterestMessage = async (tourId: string, user: User) => {
  const chatMessage = new ChatMessageModel({
    type: ChatMessageType.SYSTEM,
    tour: new Types.ObjectId(tourId),
    message: "projects:tours.chat.system-message.new-interest",
    systemData: getUserSystemData(user),
  });
  await chatMessage.save();
  const project = await Project.findOne({
    "tour._id": tourId,
  });
  if (!project) {
    throw new Error("Project not found");
  }

  await sendProjectNotification(project._id, tourId);
};

export const saveRemoveInterestMessage = async (tourId: string, user: User) => {
  const chatMessage = new ChatMessageModel({
    type: ChatMessageType.SYSTEM,
    tour: new Types.ObjectId(tourId),
    message: "projects:tours.chat.system-message.remove-interest",
    systemData: getUserSystemData(user),
  });
  await chatMessage.save();
  const project = await Project.findOne({
    "tour._id": tourId,
  });
  if (!project) {
    throw new Error("Project not found");
  }
  await sendProjectNotification(project._id, tourId);
};

export const saveNewProgramMessage = async (
  tourId: string,
  user: User,
  program: Program
) => {
  const isForSomeoneElse = program.user?._id.toString() !== user._id.toString();
  const chatMessage = new ChatMessageModel({
    type: ChatMessageType.SYSTEM,
    tour: new Types.ObjectId(tourId),
    message: isForSomeoneElse
      ? "projects:tours.chat.system-message.new-program-for-someone-else"
      : "projects:tours.chat.system-message.new-program",
    systemData: [
      ...getUserSystemData(user),
      {
        fieldName: "programStatus",
        type: SystemDataType.DIRECT_VALUE,
        value: program.status,
      },
      {
        fieldName: "date",
        type: SystemDataType.DIRECT_VALUE,
        value: program.date,
      },
      {
        fieldName: "onBehalfOf",
        type: SystemDataType.DIRECT_VALUE,
        value: isForSomeoneElse ? program.user?.company : null,
      },
    ],
  });
  await chatMessage.save();
  const project = await Project.findOne({
    "tour._id": tourId,
  });
  if (!project) {
    throw new Error("Project not found");
  }
  await sendProjectNotification(project._id, tourId);
};

export const saveUpdatedProgramMessage = async (
  tourId: string,
  user: User,
  program: Program
) => {
  if (!program.note) {
    return;
  }
  const chatMessage = new ChatMessageModel({
    type: ChatMessageType.SYSTEM,
    tour: new Types.ObjectId(tourId),
    message: "projects:tours.chat.system-message.updated-program",
    systemData: [
      ...getUserSystemData(user),
      {
        fieldName: "note",
        type: SystemDataType.DIRECT_VALUE,
        value: program.note,
      },
      {
        fieldName: "programStatus",
        type: SystemDataType.DIRECT_VALUE,
        value: program.status,
      },
      {
        fieldName: "date",
        type: SystemDataType.DIRECT_VALUE,
        value: program.date,
      },
    ],
  });
  await chatMessage.save();
  const project = await Project.findOne({
    "tour._id": tourId,
  });
  if (!project) {
    throw new Error("Project not found");
  }
  await sendProjectNotification(project._id, tourId);
};

export const saveUnscheduleMessage = async (
  tourId: string,
  user: User,
  program: Program
) => {
  const isForSomeoneElse = program.user?._id.toString() !== user._id.toString();
  const chatMessage = new ChatMessageModel({
    type: ChatMessageType.SYSTEM,
    tour: new Types.ObjectId(tourId),
    message: isForSomeoneElse
      ? "projects:tours.chat.system-message.unschedule-for-someone-else"
      : "projects:tours.chat.system-message.unschedule",
    systemData: [
      ...getUserSystemData(user),
      {
        fieldName: "programStatus",
        type: SystemDataType.DIRECT_VALUE,
        value: program.status,
      },
      {
        fieldName: "date",
        type: SystemDataType.DIRECT_VALUE,
        value: program.date,
      },
      {
        fieldName: "onBehalfOf",
        type: SystemDataType.DIRECT_VALUE,
        value: isForSomeoneElse ? program.user?.company : null,
      },
    ],
  });
  await chatMessage.save();
  const project = await Project.findOne({
    "tour._id": tourId,
  });
  if (!project) {
    throw new Error("Project not found");
  }
  await sendProjectNotification(project._id, tourId);
};

export const saveNewFileMessage = async (
  tourId: string,
  fileNames: string,
  count: number
) => {
  const chatMessage = new ChatMessageModel({
    type: ChatMessageType.SYSTEM,
    tour: new Types.ObjectId(tourId),
    message: "projects:tours.chat.system-message.new-file",
    systemData: [
      {
        fieldName: "fileName",
        type: SystemDataType.DIRECT_VALUE,
        value: fileNames,
      },
      {
        fieldName: "count",
        type: SystemDataType.DIRECT_VALUE,
        value: count,
      },
    ],
  });
  await chatMessage.save();
  const project = await Project.findOne({
    "tour._id": tourId,
  });
  if (!project) {
    throw new Error("Project not found");
  }
  await sendProjectNotification(project._id, tourId);
};

export const saveNewTourMessage = async (
  tourId: string,
  tourName: string,
  user: User
) => {
  const mainLocation = user.locations.find((loc: any) => loc.isMain);
  const chatMessage = new ChatMessageModel({
    type: ChatMessageType.SYSTEM,
    tour: new Types.ObjectId(tourId),
    message: "projects:tours.chat.system-message.new-tour",
    systemData: [
      {
        fieldName: "tourName",
        type: SystemDataType.DIRECT_VALUE,
        value: tourName,
      },
      {
        fieldName: "location",
        type: SystemDataType.DIRECT_VALUE,
        value: `${mainLocation?.location.data.municipality}, ${mainLocation?.location.data.country}`,
      },
    ],
  });
  await chatMessage.save();
};
