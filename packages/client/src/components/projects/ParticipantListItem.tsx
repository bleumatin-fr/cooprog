import { User } from "@cooprog/core";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Box,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemProps,
  ListItemText,
  Tooltip,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useTranslation } from "next-i18next";
import UserAvatar from "../structures/UserAvatar";
import { getCity } from "./ProjectCard";
import { PeopleOutline } from "@mui/icons-material";
import styled from "@emotion/styled";
import { Actions } from "../structures/useRights";
import useRights from "../structures/useRights";
import useUser from "../authentication/useUser";

const InformationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  justify-content: space-between;
`;

const ProfileRole = styled.span`
  font-size: 0.9em;
  color: var(--color-gray);
  font-style: italic;
`;

interface ContactInfoProps {
  value: string;
  onCopy: (event: React.MouseEvent) => void;
}

const ContactInfo = ({ value, onCopy }: ContactInfoProps) => {
  const { t } = useTranslation();
  return (
    <Tooltip title={t("users:actions.copy")}>
      <Box
        display="flex"
        gap={1}
        marginLeft="28px"
        alignItems="center"
        onClick={onCopy}
      >
        <span
          style={{
            textDecoration: "underline",
            paddingTop: 2,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {value}
          <IconButton
            onClick={onCopy}
            size="small"
            style={{ height: 12, width: 12, marginLeft: 6 }}
          >
            <ContentCopyIcon sx={{ fontSize: "12px" }} />
          </IconButton>
        </span>
      </Box>
    </Tooltip>
  );
};

interface ParticipantListItemProps extends ListItemProps {
  user: Partial<User>;
  showContactInformation?: boolean;
}

const ParticipantListItem = ({
  user,
  showContactInformation = false,
  ...rest
}: ParticipantListItemProps) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { user: currentUser } = useUser();
  const { can } = useRights({ user: currentUser });

  const handleCopyToClipboard =
    (value: string) => (event: React.MouseEvent) => {
      event.stopPropagation();

      if (value) {
        navigator.clipboard.writeText(value);
        enqueueSnackbar(t("users:actions.copy-success"), {
          variant: "success",
        });
      }
    };

  if (!currentUser) {
    return null;
  }

  return (
    <ListItem
      key={user._id}
      sx={{
        alignItems: "flex-start",
      }}
      {...rest}
    >
      <ListItemAvatar>
        <UserAvatar
          user={user}
          sx={{
            marginTop: "8px",
          }}
          showTooltip
          showLink={can(Actions.PAGES_ACCESS_STRUCTURE)}
        />
      </ListItemAvatar>
      <ListItemText
        primary={user.company}
        secondary={
          <InformationContainer>
            {user.locations && (
              <Box display="flex" gap={1} alignItems="center">
                <LocationOnOutlinedIcon fontSize="small" />
                <div>
                  {user.locations
                    .sort((a, b) => (a.isMain ? -1 : 1))
                    .map((location) => (
                      <div key={location._id}>
                        {`${getCity(location.location) || ""}`}
                      </div>
                    ))}
                </div>
              </Box>
            )}
            {user.profiles?.map((profile) => (
              <Box key={profile._id}>
                <Box display="flex" gap={1} alignItems="center">
                  <PeopleOutline fontSize="small" />
                  <span style={{ paddingTop: 2 }}>
                    {`${profile.firstName} ${profile.lastName}`}
                    {profile.role && (
                      <ProfileRole> ({profile.role})</ProfileRole>
                    )}
                  </span>
                </Box>
                {showContactInformation &&
                  profile.contactInformation &&
                  can(Actions.USER_SEE_CONTACT_INFORMATION) && (
                    <>
                      {!!profile.contactInformation.email && (
                        <ContactInfo
                          value={profile.contactInformation.email}
                          onCopy={handleCopyToClipboard(
                            profile.contactInformation.email
                          )}
                        />
                      )}
                      {!!profile.contactInformation.phone && (
                        <ContactInfo
                          value={profile.contactInformation.phone}
                          onCopy={handleCopyToClipboard(
                            profile.contactInformation.phone
                          )}
                        />
                      )}
                      {!!profile.contactInformation.instructions && (
                        <Box
                          display="flex"
                          marginLeft="28px"
                          alignItems="center"
                        >
                          {profile.contactInformation.instructions}
                        </Box>
                      )}
                    </>
                  )}
              </Box>
            ))}
          </InformationContainer>
        }
      />
      {user.role && (
        <ListItemText
          sx={{
            flexShrink: 0,
            flexGrow: 0,
            marginTop: "8px",
            whiteSpace: "nowrap",
          }}
          secondary={t(`projects:participants.role.${user.role}`)}
        ></ListItemText>
      )}
    </ListItem>
  );
};

export default ParticipantListItem;
