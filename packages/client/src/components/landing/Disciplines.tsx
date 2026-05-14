import styled from "@emotion/styled";
import { useTranslation } from "next-i18next";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import BrushIcon from "@mui/icons-material/Brush";
import Image from "next/image";
import MusicIcon from "../UI/icons/music.svg";
import TheaterIcon from "../UI/icons/theater.svg";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import { Chip } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const DisciplinesRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  @media (max-width: 900px) {
    flex-wrap: wrap;
    justify-content: center;
  }
  align-items: stretch;

  @media (max-width: 700px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  @media (max-width: 400px) {
    grid-template-columns: repeat(1, 1fr);
  }

  margin-top: 100px;
  margin-bottom: 100px;
`;

const DisciplineButton = styled.div`
  position: relative;
  width: 200px;
  padding: 24px 14px 24px 14px;
  color: #666;
  transition: all 0.3s ease-in-out;
  overflow: hidden;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-family: "Libre Franklin Medium", sans-serif;
  font-size: 16px;
  text-align: center;
  font-variant: all-petite-caps;
  letter-spacing: 2px;
  color: var(--color-orange);
  white-space: nowrap;

  &:first-of-type {
    border-right: 15px solid var(--color-orange);
  }

  &:nth-of-type(2),
  &:nth-of-type(3) {
    border-right: 15px solid #f2ac8d;
  }

  @media (max-width: 400px) {
    &:first-of-type {
      border-right: 0;
      border-bottom: 15px solid var(--color-orange);
    }

    &:nth-of-type(2),
    &:nth-of-type(3) {
      border-right: 0;
      border-bottom: 15px solid #f2ac8d;
    }
  }

  > svg,
  img {
    margin-bottom: 10px;
  }

  > div {
    margin-top: 10px;
  }

  &:not(:has(> div)) {
    > span {
      margin-bottom: 34px;
    }
  }
`;

const Disciplines = () => {
  const { t } = useTranslation();

  return (
    <DisciplinesRow>
      <DisciplineButton>
        <Image
          src={TheaterIcon}
          alt=""
          style={{
            width: 60,
            height: 60,
          }}
        />
        <span>{t("landing:disciplines.performingArts")}</span>
      </DisciplineButton>
      <DisciplineButton>
        <Image
          src={MusicIcon}
          alt=""
          style={{ fill: "#4ECDC4", width: 60, height: 60 }}
        />
        <span>{t("landing:disciplines.music")}</span>
        <Chip
          icon={<WhatshotIcon sx={{ fill: "var(--color-orange)" }} />}
          size="small"
          label={t("landing:disciplines.badges.new")}
          variant="outlined"
          sx={{
            borderColor: "var(--color-orange)",
            color: "var(--color-orange)",
            "& .MuiChip-label": {
              color: "var(--color-orange)",
            },
          }}
        />
      </DisciplineButton>
      <DisciplineButton
        style={{
          fontSize: 14,
        }}
      >
        <MenuBookIcon
          sx={{
            color: "#45B7D1",
            fontSize: 40,
            opacity: 0.6,
          }}
        />
        <span style={{ opacity: 0.6 }}>{t("landing:disciplines.book")}</span>
        <Chip
          icon={<AutoAwesomeIcon sx={{ fontSize: 14 }} />}
          size="small"
          label={t("landing:disciplines.badges.soon")}
          variant="outlined"
          sx={{
            height: "20px",
            opacity: 0.6,
            "& .MuiChip-label": {
              fontSize: "0.7rem",
              px: 1,
            },
          }}
        />
      </DisciplineButton>
      <DisciplineButton
        style={{
          opacity: 0.6,
          fontSize: 14,
        }}
      >
        <BrushIcon sx={{ color: "#96CEB4", fontSize: 40 }} />
        <span>{t("landing:disciplines.visual")}</span>
        <Chip
          icon={<AutoAwesomeIcon sx={{ fontSize: 14 }} />}
          size="small"
          label={t("landing:disciplines.badges.soon")}
          variant="outlined"
          sx={{
            height: "20px",
            "& .MuiChip-label": {
              fontSize: "0.7rem",
              px: 1,
            },
          }}
        />
      </DisciplineButton>
    </DisciplinesRow>
  );
};

export default Disciplines;
