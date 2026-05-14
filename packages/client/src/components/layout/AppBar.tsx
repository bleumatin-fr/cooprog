import {
  AppBar as BaseAppBar,
  Container as BaseContainer,
  Tab as BaseTab,
  Box,
  Divider,
  Fab,
  IconButton,
  Menu,
  MenuItem,
  Tabs,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/router";
import { MouseEvent, useMemo, useState } from "react";

import styled from "@emotion/styled";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import PasswordChangeDialog from "../authentication/PasswordChangeDialog";
import { useAuthentication } from "../authentication/useAuthentication";
import useUser from "../authentication/useUser";
import UserAvatar from "../structures/UserAvatar";
import useRights, { Actions } from "../structures/useRights";
import Button from "../UI/Button";
import InviteButton from "./InviteButton";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationButton from "./NotificationButton";
import { useLocalStorage } from "usehooks-ts";
import Logo from "./Logo";
import { Role } from "@cooprog/core";

const MuiAppBar = styled(BaseAppBar)`
  --mui-palette-primary-main: var(--app-bar-background-color);
`;

const Container = styled(BaseContainer)`
  --mui-palette-primary-main: var(--button-primary-background-color);
  padding: 0 16px !important;
  max-width: 1280px !important;
`;

const Tab = styled(BaseTab)`
  transition: all 0.2s ease-in-out;
  &:hover {
    color: var(--button-primary-background-color);
  }
`;

const DisciplineIndicator = styled.div<{ color: string }>`
  position: absolute;
  bottom: -8px;
  left: 0;
  right: 0;
  height: 8px;
  background: ${(props) => props.color};
  transition: all 0.3s ease-in-out;
  transform-origin: left;
  transform: ${(props) =>
    props.color === "undefined" ? "scaleX(0)" : "scaleX(1)"};
`;

const AppBar = ({ indicatorColor }: { indicatorColor?: string }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { logout } = useAuthentication();
  const { user, setSelectedProfileId } = useUser();
  const [pageSelectedTab, setPageSelectedTab] = useLocalStorage<number | null>(
    "page-selected-tab",
    null
  );

  const { can } = useRights({ user });

  const [passwordDialogOpen, setPasswordDialogOpen] = useState<boolean>(false);

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));
  const tablet = useMediaQuery(theme.breakpoints.down("md"));
  const laptop = useMediaQuery(theme.breakpoints.down("lg"));
  const newProjectLabel =
    user?.role === Role.ARTISTIC_TEAM
      ? t("common:new-project-artistic-team")
      : t("common:new-project");

  const handleOpenNavMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handlePasswordChangeClick = () => {
    setPasswordDialogOpen(true);
  };

  const handleProfileClicked = () => {
    setSelectedProfileId(undefined);
    setAnchorElUser(null);
  };

  const handleSignout = async () => {
    router.push("/");
    await logout();
  };

  const pages = [
    { name: <HomeIcon />, href: "/home", canAccess: true },
    {
      name: t("common:my_projects"),
      href: "/projects",
      canAccess: can(Actions.PAGES_ACCESS_MY_PROJECTS),
    },
    {
      name: t("common:projects"),
      href: "/projects",
      canAccess: can(Actions.PAGES_ACCESS_PROJECTS),
    },
    {
      name: t("common:structures"),
      href: "/users/role/structures",
      canAccess: can(Actions.PAGES_ACCESS_STRUCTURES),
    },
    {
      name: t("common:artistic_team"),
      href: "/users/role/artistic",
      canAccess: can(Actions.PAGES_ACCESS_ARTISTIC_TEAMS),
    },
  ];

  const visiblePages = useMemo(
    () => pages.filter((page) => page.canAccess),
    [pages]
  );

  const selectedTab = useMemo(() => {
    const pageIndex = pages.findIndex((page) =>
      router.asPath.startsWith(page.href)
    );
    if (pageIndex === -1) {
      return pageSelectedTab || 0;
    }
    // Convert from original array index to visible tab index
    const visibleIndex = visiblePages.findIndex(
      (page) => page.href === pages[pageIndex].href
    );
    return visibleIndex !== -1 ? visibleIndex : 0;
  }, [router.asPath, pageSelectedTab, visiblePages, pages]);

  const handleTabChanged = (event: React.SyntheticEvent, newValue: number) => {
    event.preventDefault();
    event.stopPropagation();
    router.push(visiblePages[newValue].href);
  };

  const handleTabClicked = (event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    router.push(visiblePages[selectedTab].href);
  };

  return (
    <MuiAppBar
      position="sticky"
      enableColorOnDark
      className={`app-bar`}
      sx={{
        backgroundColor: "primary.main",
      }}
    >
      {indicatorColor && <DisciplineIndicator color={indicatorColor} />}
      {user && (
        <>
          {passwordDialogOpen && (
            <PasswordChangeDialog
              open={passwordDialogOpen}
              handleClose={() => setPasswordDialogOpen(false)}
            ></PasswordChangeDialog>
          )}
        </>
      )}
      <Container>
        <Toolbar disableGutters>
          {(mobile || tablet) && (
            <Box sx={{ display: "flex" }}>
              <IconButton
                size="large"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="default"
              >
                <MenuIcon />
              </IconButton>
              {pages && pages.filter((page) => page.canAccess).length > 1 && (
                <Menu
                  anchorEl={anchorElNav}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                  open={Boolean(anchorElNav)}
                  onClose={handleCloseNavMenu}
                  sx={{
                    display: { xs: "block", md: "none" },
                  }}
                >
                  {visiblePages.map((page, index) => (
                    <MenuItem
                      key={`menu-item-${index}`}
                      component={Link}
                      href={page.href}
                    >
                      <Typography
                        textAlign="center"
                        sx={
                          {
                            // fontSize: "0.2rem !important",
                          }
                        }
                      >
                        {page.name}
                      </Typography>
                    </MenuItem>
                  ))}
                </Menu>
              )}
            </Box>
          )}
          <Logo />

          {!mobile && !tablet && (
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                gap: 1,
                height: "64px",
              }}
            >
              {visiblePages && visiblePages.length > 1 && (
                <Tabs
                  value={selectedTab}
                  onChange={handleTabChanged}
                  onClick={handleTabClicked}
                  sx={{
                    "& .MuiTabs-scroller": {
                      display: "flex",
                    },
                  }}
                  scrollButtons={false}
                >
                  {visiblePages.map((page, index) => (
                    <Tab
                      label={page.name}
                      key={`tab-${index}`}
                      LinkComponent={Link}
                      sx={{
                        minWidth: "auto",
                        padding:
                          mobile || tablet || laptop ? "4px 8px" : undefined,
                      }}
                    />
                  ))}
                </Tabs>
              )}
            </Box>
          )}
          <div style={{ flexGrow: 1 }}></div>

          <Box sx={{ flexGrow: 0, display: "flex", gap: "16px" }}>
            {!mobile && <InviteButton />}
            <NotificationButton />
            {!mobile && !tablet && !laptop && can(Actions.PROJECT_CREATE) && (
              <Button
                id="new-project-button"
                variant="contained"
                onClick={() => router.push("/projects/new")}
                startIcon={<AddLocationAltIcon />}
                color="primary"
                sx={{ whiteSpace: "nowrap" }}
              >
                {newProjectLabel}
              </Button>
            )}
            {(mobile || tablet || laptop) && can(Actions.PROJECT_CREATE) && (
              <Fab
                size="small"
                color="primary"
                aria-label={newProjectLabel}
                onClick={() => router.push("/projects/new")}
              >
                <AddLocationAltIcon />
              </Fab>
            )}
            {!mobile && <LanguageSwitcher />}
            <Tooltip title={t("common:settings")}>
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                {user && (
                  <UserAvatar
                    user={user}
                    showProfile
                    showTooltip={false}
                    showLink={false}
                  />
                )}
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {!mobile && [
                <MenuItem onClick={handleProfileClicked} key="profile">
                  <Typography textAlign="center">
                    {t("common:profile")}
                  </Typography>
                </MenuItem>,
                <MenuItem
                  key="public-profile"
                  component={Link}
                  href={`/users/${user?._id}`}
                >
                  <Typography textAlign="center">
                    {t("common:public-profile")}
                  </Typography>
                </MenuItem>,
                <MenuItem
                  onClick={handlePasswordChangeClick}
                  key="change-password"
                >
                  <Typography textAlign="center">
                    {t("common:change-password")}
                  </Typography>
                </MenuItem>,
                <Divider sx={{ margin: "8px 0" }} key="divider" />,
              ]}
              <MenuItem onClick={handleSignout}>
                <Typography textAlign="center">
                  {t("common:sign-out")}
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </MuiAppBar>
  );
};

export default AppBar;
