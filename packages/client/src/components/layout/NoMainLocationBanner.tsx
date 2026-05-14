import styled from "@emotion/styled";
import { Box, Button, Typography } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useTranslation } from "next-i18next";
import useUser from "../authentication/useUser";

const BannerOuter = styled(Box)`
  width: 100%;
  background: #fff8e1;
  border-bottom: 2px solid #ffa000;
  margin-top: 8px;
`;

const BannerInner = styled(Box)`
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 12px 16px;
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-sizing: border-box;
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
    min-height: auto;
  }
`;

const NoMainLocationBanner = () => {
  const { t } = useTranslation();
  const { user, openProfileForLocationEdit } = useUser();

  const hasNoMainLocation =
    user && !user.locations?.find((loc) => loc.isMain);

  if (!hasNoMainLocation) {
    return null;
  }

  return (
    <BannerOuter>
      <BannerInner>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flex: 1,
            minWidth: 0,
            justifyContent: { xs: "center", sm: "flex-start" },
          }}
        >
          <WarningAmberIcon
            sx={{ color: "#e65100", fontSize: 28, flexShrink: 0 }}
          />
          <Typography
            variant="body1"
            sx={{
              color: "text.primary",
              fontWeight: 600,
              margin: 0,
              lineHeight: 1.5,
              display: "flex",
              alignItems: "center",
            }}
          >
            {t("common:no-main-location-banner.message")}
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="medium"
          onClick={openProfileForLocationEdit}
          sx={{
            flexShrink: 0,
            fontWeight: 600,
            textTransform: "none",
            backgroundColor: "#e65100",
            color: "#fff",
            "&:hover": { backgroundColor: "#bf360c" },
          }}
        >
          {t("common:no-main-location-banner.action")}
        </Button>
      </BannerInner>
    </BannerOuter>
  );
};

export default NoMainLocationBanner;
