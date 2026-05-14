import { User } from "@cooprog/core";
import styled from "@emotion/styled";
import { useState } from "react";
import ShareIcon from "@mui/icons-material/Share";
import { FormHelperText, Button } from "@mui/material";
import { useTranslation } from "next-i18next";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIos";
import CloseIcon from "@mui/icons-material/Close";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DisableIfSpectator from "../authentication/DisableIfSpectator";
import UserOrExternalAutocomplete from "../structures/UserOrExternalAutocomplete";
import { useRouter } from "next/router";
import { DialogActions, DialogContent } from "@/components/UI/Dialog";
import Markdown from "../UI/Markdown";
import RichTextEditor from "../UI/RichTextEditor";
import BlueInfoCard from "../UI/BlueInfoCard";

const Container = styled.div`
  display: flex;
  justify-content: center;
`;

const Form = styled.div`
  width: 100%;
`;

const MarkdownContainer = styled.div`
  font-size: 1rem;
  line-height: 1.5;

  > p {
    margin: 1rem 0;
  }
`;

const RequiredFieldsNote = styled(FormHelperText)`
  text-align: right;
  margin-top: 4px;
  color: var(--color-gray);
`;

interface ShareInformationProps {
  user: User | undefined;
  onPrevious: () => void;
  onValidate: (values: (User | string)[], customMessage?: string) => void;
  loading: boolean;
}

export interface UserWithDistance extends User {
  distance?: number;
}

const ShareInformation = ({
  user,
  onValidate,
  onPrevious,
  loading,
}: ShareInformationProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedUsers, setSelectedUsers] = useState<(User | string)[]>([]);
  const [customMessage, setCustomMessage] = useState("");
  const handleUsersChanged = (value: (User | string)[]) => {
    setSelectedUsers(value);
  };

  const handleSubmit = async () => {
    onValidate(selectedUsers, customMessage);
  };

  return (
    <Container>
      <Form>
        <DialogContent sx={{ minHeight: "500px" }}>
          <BlueInfoCard icon={<ShareIcon sx={{ fontSize: 64, color: "white" }} />}>
            <MarkdownContainer>
              <Markdown>
                {t("common:dialogs.new-project.share.description")}
              </Markdown>
            </MarkdownContainer>
          </BlueInfoCard>
          <UserOrExternalAutocomplete onChange={handleUsersChanged} />
          <div style={{ marginTop: "24px" }}>
            <RichTextEditor
              label={t("common:dialogs.new-project.share.message-label")}
              value={customMessage}
              onChange={setCustomMessage}
              placeholder={t(
                "common:dialogs.new-project.share.message-placeholder"
              )}
            />
          </div>
        </DialogContent>

        <DialogActions>
          <div>
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <Button
                onClick={() => router.push("/projects")}
                startIcon={<CloseIcon />}
              >
                {t("common:cancel")}
              </Button>
              <div style={{ display: "flex", gap: "16px" }}>
                <Button startIcon={<ArrowBackIcon />} onClick={onPrevious}>
                  {t("common:previous")}
                </Button>
                <DisableIfSpectator>
                  {(disabled) => (
                    <Button
                      onClick={handleSubmit}
                      variant="contained"
                      color="primary"
                      disabled={disabled || loading}
                      startIcon={<AddCircleOutlineIcon />}
                    >
                      {t("common:dialogs.new-project.submit")}
                    </Button>
                  )}
                </DisableIfSpectator>
              </div>
            </div>
            <RequiredFieldsNote>
              {t("common:required-fields")}
            </RequiredFieldsNote>
          </div>
        </DialogActions>
      </Form>
    </Container>
  );
};

export default ShareInformation;
