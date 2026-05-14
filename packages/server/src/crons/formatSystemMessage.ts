import { ChatMessage, SystemDataType } from "@cooprog/core";
import { isDate, isString } from "lodash";
import i18next from "../middlewares/i18next";
const { parseISO, isValid } = require("date-fns");

const isValidDate = (str: string) => {
  const date = parseISO(str);
  return isValid(date);
};

function translateObjectOrLeaf(
  namespace: string,
  keyPath: string,
  value: string | number
): string {
  const v = String(value);
  const resolved = i18next.t(`${keyPath}.${v}`, {
    ns: namespace,
    returnObjects: true,
  });
  if (
    typeof resolved === "object" &&
    resolved !== null &&
    !Array.isArray(resolved) &&
    "label" in resolved &&
    typeof (resolved as { label: unknown }).label === "string"
  ) {
    return (resolved as { label: string }).label;
  }
  if (typeof resolved === "string") {
    return resolved;
  }
  return v;
}

export const formatSystemMessage = (
  message: ChatMessage
): string | undefined => {
  if (!message.systemData || !Array.isArray(message.systemData)) {
    return undefined;
  }

  const context: Record<string, string | number> = {};

  for (const data of message.systemData) {
    let finalValue: string | number;
    switch (data.type) {
      case SystemDataType.ARRAY_TO_TRANSLATE_WITH_MAPPING_OBJECT:
        finalValue = data.newValues
          .map((value: string) => {
            const [namespace, key] = data.translationKey.split(":");
            return i18next.t(`${key}.${value}.${data.nameKey}`, {
              ns: namespace,
            });
          })
          .join(", ");
        context[data.fieldName] = finalValue;
        break;
      case SystemDataType.ARRAY_TO_TRANSLATE_WITH_OBJECT:
        finalValue = data.newValues
          .map((value: string | number) => {
            const [namespace, keyPath] = data.translationKey.split(":");
            return translateObjectOrLeaf(namespace, keyPath, value);
          })
          .join(", ");
        context[data.fieldName] = finalValue;
        break;
      case SystemDataType.DIRECT_VALUE:
        finalValue =
          data.value === undefined || data.value === null
            ? ""
            : isDate(data.value)
            ? data.value.toLocaleDateString()
            : isString(data.value) && isValidDate(data.value)
            ? new Date(data.value).toLocaleDateString()
            : data.value;

        context[data.fieldName] = finalValue;
        break;
    }
  }

  const msg = message.message;

  try {
    const [namespace, key] = msg.split(":");
    if (!namespace || !key) return undefined;
    const text = i18next.t(key, { ns: namespace, ...context });
    return text;
  } catch (e) {
    console.warn("Failed to compile system message:", msg, context, e);
    return msg;
  }
};
