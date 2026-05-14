import HomeIcon from "@mui/icons-material/Home";
import { Breadcrumbs as MuiBreadcrumbs, Typography } from "@mui/material";
import { useTranslation } from "next-i18next";
import Link from "next/link";

// Utility function to decode HTML entities
const decodeHtmlEntities = (text: string): string => {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
};

interface BreadcrumbsProps {
  crumbs: {
    name: string;
    path?: string;
  }[];
}

const Breadcrumbs = ({ crumbs }: BreadcrumbsProps) => {
  const { t } = useTranslation();
  return (
    <MuiBreadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
      <Link color="inherit" href="/home">
        <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
        {t("common:home")}
      </Link>
      {crumbs.map((crumb, index) => {
        const decodedName = decodeHtmlEntities(crumb.name);
        if (!crumb.path)
          return (
            <Typography
              key={index}
              color="text.primary"
              sx={{ display: "flex", alignItems: "center" }}
            >
              {decodedName}
            </Typography>
          );
        return (
          <Link key={index} color="inherit" href={crumb.path}>
            {decodedName}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
};
export default Breadcrumbs;
