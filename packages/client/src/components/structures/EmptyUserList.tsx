import styled from "@emotion/styled";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import mobility from "../UI/icons/mobility.svg";
import Markdown from "../UI/Markdown";
import useUser from "../authentication/useUser";
import { Role } from "@cooprog/core";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 32px;
  padding: 64px 0;

  > img {
    max-width: 200px;
    max-height: 200px;
    flex-grow: 0;
    flex-shrink: 1;
    opacity: 0.5;
  }

  > div {
    max-width: 400px;
    text-align: center !important;
    font-size: 1rem !important;
    line-height: 1.2 !important;
  }
`;

const EmptyUserList = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const userRole = user?.role;
  return (
    <Container>
      <Image src={mobility} alt="" />
      <Markdown>
        {t(
          userRole === Role.ARTISTIC_TEAM
            ? "users:empty-artistic_team"
            : "users:empty",
        )}
      </Markdown>
    </Container>
  );
};

export default EmptyUserList;
