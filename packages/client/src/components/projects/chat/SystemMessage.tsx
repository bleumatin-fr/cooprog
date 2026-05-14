import React, { useState } from "react";
import styled from "@emotion/styled";
import { ChatMessage, SystemDataType } from "@cooprog/core";
import InfoIcon from "@mui/icons-material/Info";
import { useTranslation } from "next-i18next";
import { isDate, isString } from "lodash";
import { parseISO, isValid } from "date-fns";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { decodeHtmlEntities } from "./decodeHtmlEntities";

/** Tour transport modes (and similar) are objects with `label` in common.json, not leaf strings. */
function translateObjectOrLeaf(
  translate: (key: string, options?: { returnObjects?: boolean }) => unknown,
  translationKey: string,
  value: string | number
): string {
  const v = String(value);
  const fullKey = `${translationKey}.${v}`;
  const resolved = translate(fullKey, { returnObjects: true });
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

const SystemMessageContainer = styled.div`
  > div:nth-of-type(2) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: var(--color-very-light-gray);
    color: var(--color-gray);
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    font-style: italic;
    max-width: 80%;
    align-self: center;
    margin: auto;
  }
  span {
    display: block;
    text-align: center;
    width: 100%;
  }
  ul {
    padding: 0;
    margin: 0.5rem 0;
    width: 100%;
  }
  li {
    text-align: left;
    width: 80%;
    margin: 0.25rem auto;
  }
`;

const TimeStamp = styled.div`
  font-size: 0.6rem;
  color: #666;
  margin-top: 0.25rem;
  text-align: center;
`;

const ShowMoreButton = styled.button`
  background: none;
  border: none;
  color: var(--color-orange);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.25rem 0;
  font-size: 0.75rem;
  font-style: italic;
  margin-top: 0.5rem;
  width: 100%;
  &:hover {
    text-decoration: underline;
  }
`;

interface SystemMessageProps {
  message: ChatMessage;
  messages?: ChatMessage[];
}

const SystemMessage: React.FC<SystemMessageProps> = ({ message, messages }) => {
  const { t } = useTranslation(["projects"]);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!Array.isArray(message.systemData)) return null;

  const formatMessage = (msg: ChatMessage) => {
    const formattedChanges = msg.systemData?.reduce((acc: any, data: any) => {
      let finalValue: string;
      switch (data.type) {
        case SystemDataType.ARRAY_TO_TRANSLATE_WITH_MAPPING_OBJECT:
          finalValue = data.newValues
            .map((value: string) => {
              const translated = t(
                `${data.translationKey}.${value}.${data.nameKey}`
              );
              // Remove text between parentheses and asterisks
              return translated
                .replace(/\([^)]*\)/g, "")
                .trim()
                .toLowerCase();
            })
            .join(", ");
          break;
        case SystemDataType.ARRAY_TO_TRANSLATE_WITH_OBJECT:
          finalValue = data.newValues
            .map((value: string | number) => {
              const translated = translateObjectOrLeaf(
                t,
                data.translationKey,
                value
              );
              // Remove text between parentheses and asterisks
              return translated
                .replace(/\([^)]*\)/g, "")
                .trim()
                .toLowerCase();
            })
            .join(", ");
          break;
        case SystemDataType.DIRECT_VALUE:
          if (isDate(data.value)) {
            finalValue = data.value.toLocaleDateString();
          } else if (isString(data.value) && isValidDate(data.value)) {
            finalValue = new Date(data.value).toLocaleDateString();
          } else {
            finalValue = data.value;
          }
          break;
        default:
          return acc;
      }
      return { ...acc, [data.fieldName]: finalValue };
    }, {} as Record<string, string | number>);

    return t(msg.message, formattedChanges) as string;
  };

  const getSummaryMessage = () => {
    if (!messages || messages.length === 0) return formatMessage(message);

    const firstUser = messages[0].systemData?.find(
      (data) =>
        data.type === SystemDataType.DIRECT_VALUE &&
        data.fieldName === "company"
    ) as { type: SystemDataType.DIRECT_VALUE; value: string } | undefined;

    const count = messages.length;

    return t("projects:tours.chat.system-message.planning-changes", {
      user: firstUser?.value || t("projects:tours.chat.system-message.someone"),
      count,
    });
  };

  return (
    <SystemMessageContainer>
      <TimeStamp>{new Date(message.createdAt!).toLocaleString()}</TimeStamp>
      <div>
        {messages && messages.length > 1 ? (
          <>
            <span>{decodeHtmlEntities(getSummaryMessage())}</span>
            {isExpanded && (
              <ul>
                {messages.map((msg, idx) => (
                  <li key={idx}>{decodeHtmlEntities(formatMessage(msg))}</li>
                ))}
              </ul>
            )}
            <ShowMoreButton onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? (
                <>
                  {t("projects:tours.chat.system-message.show-less")}{" "}
                  <ExpandLessIcon fontSize="small" />
                </>
              ) : (
                <>
                  {t("projects:tours.chat.system-message.show-more")}{" "}
                  <ExpandMoreIcon fontSize="small" />
                </>
              )}
            </ShowMoreButton>
          </>
        ) : (
          <span>{decodeHtmlEntities(formatMessage(message))}</span>
        )}
      </div>
    </SystemMessageContainer>
  );
};

const isValidDate = (str: string) => {
  const date = parseISO(str);
  return isValid(date);
};

export default SystemMessage;
