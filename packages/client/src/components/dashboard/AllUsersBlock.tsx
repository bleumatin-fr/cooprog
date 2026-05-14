import styled from "@emotion/styled";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Button } from "@mui/material";
import { Trans, useTranslation } from "next-i18next";
import Link from "next/link";
import { Stats } from "../landing/getStats";
import UsersIcon from "./UsersIcon";

const Title = styled.h2`
  font-size: 24px;
  margin-top: 2px;
  margin-bottom: 16px;
  font-variant: small-caps;
  text-align: center;
  font-family: "Libre Franklin Medium", sans-serif;
`;

const Container = styled.div`
  flex-grow: 1;
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.1);
  background-color: white;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 32px;
  justify-content: space-between;
`;

const ContentRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 32px;
`;

const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
`;

const Stat = styled.div`
  font-size: 32px;

  > *:nth-of-type(1) {
    color: var(--color-light-orange);
  }

  > *:nth-of-type(2) {
    margin-left: 8px;
  }
`;
const Substat = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: baseline;
  font-size: 22px;
  color: var(--color-text-gray);
`;

const Value = styled.div`
  font-size: 2em;
`;

const Label = styled.div`
  font-size: 0.5em;
`;

const IconContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100px;

  > svg,
  img {
    width: 100%;
  }
`;

interface AllUsersBlockProps {
  usersCount: number;
  lastMonthUserCount: number;
  translations: {
    title: string;
    subtitle: string;
    button: string;
  };
  href: string;
  icon: React.ReactNode;
}

const AllUsersBlock = ({
  usersCount,
  lastMonthUserCount,
  translations: { title, subtitle, button },
  href,
  icon,
}: AllUsersBlockProps) => {
  const { t } = useTranslation();
  return (
    <div>
      <Container>
        <ContentRow>
          <IconContainer>{icon}</IconContainer>
          <StatsContainer>
            <Stat>
              <Trans
                i18nKey={title}
                components={[<Value key={1} />, <Label key={2} />]}
                values={{ count: usersCount }}
              />
            </Stat>
            {lastMonthUserCount > 1 && (
              <Substat>
                <TrendingUpIcon />
                <Trans
                  i18nKey={subtitle}
                  components={[<Value key={1} />, <Label key={2} />]}
                  values={{ count: lastMonthUserCount }}
                />
              </Substat>
            )}
          </StatsContainer>
        </ContentRow>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          href={href}
          fullWidth
          sx={{
            fontSize: "11px",
            textAlign: "center",
          }}
        >
          {t(button)}
        </Button>
      </Container>
    </div>
  );
};

export default AllUsersBlock;
