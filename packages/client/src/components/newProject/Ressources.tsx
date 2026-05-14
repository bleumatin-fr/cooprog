import { useState } from "react";
import styled from "@emotion/styled";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import AddLinkIcon from "@mui/icons-material/AddLink";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { TempFile } from "./useNewProjectForm";
import { Link, FileType } from "@cooprog/core";
import { useSnackbar } from "notistack";
import { useTranslation } from "next-i18next";
import Dialog, {
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@/components/UI/Dialog";

const forbiddenExtensions = [".exe", ".bat", ".sh", ".js", ".msi"];

const Container = styled.div`
  width: 100%;
`;

const ResourceItem = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "6px 12px",
  borderBottom: "1px solid #e0e0e0",
  fontSize: "14px",
});

interface RessourcesProps {
  id?: string;
  name?: string;
  userId: string;
  links: Link[];
  setLinks: (links: Link[]) => void;
  newFiles: TempFile[];
  setNewFiles: (files: TempFile[]) => void;
  existingFiles?: FileType[];
  onDeleteFile?: (fileId: string) => void;
}

export default function Ressources({
  id,
  name,
  userId,
  links,
  setLinks,
  newFiles,
  setNewFiles,
  existingFiles = [],
  onDeleteFile,
}: RessourcesProps) {
  const [showLinkDialogOpen, setShowLinkDialogOpen] = useState(false);
  const [showFileDialogOpen, setShowFileDialogOpen] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkError, setLinkError] = useState("");

  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");

  const addLink = () => {
    if (!linkName || !linkUrl) {
      setLinkError(t("projects:resources.link-error"));
      return;
    }
    setLinks([...links, { name: linkName, url: linkUrl, userId }]);
    setLinkName("");
    setLinkUrl("");
    setLinkError("");
    setShowLinkDialogOpen(false);
    enqueueSnackbar(t("projects:resources.link-added"), { variant: "success" });
  };

  const addFile = () => {
    if (!fileName || !selectedFile) {
      setFileError(t("projects:resources.file-error"));
      return;
    }
    const ext = selectedFile.name
      .slice(selectedFile.name.lastIndexOf("."))
      .toLowerCase();

    if (forbiddenExtensions.includes(ext)) {
      enqueueSnackbar(t("projects:resources.forbidden-filetype"), {
        variant: "error",
      });
      return;
    }
    if (selectedFile.size > 4 * 1024 * 1024) {
      enqueueSnackbar(t("projects:resources.file-too-large"), {
        variant: "error",
      });
      return;
    }
    setNewFiles([
      ...newFiles,
      {
        name: fileName,
        originalFilename: selectedFile.name,
        userId,
        file: selectedFile,
      },
    ]);
    setFileName("");
    setSelectedFile(null);
    setFileError("");
    setShowFileDialogOpen(false);
    enqueueSnackbar(t("projects:resources.file-added"), { variant: "success" });
  };

  const handleCloseLinkDialog = () => {
    setShowLinkDialogOpen(false);
    setLinkName("");
    setLinkUrl("");
    setLinkError("");
  };

  const handleCloseFileDialog = () => {
    setShowFileDialogOpen(false);
    setFileName("");
    setSelectedFile(null);
    setFileError("");
  };

  const resources = [
    ...links.map((link) => ({
      id: link.url,
      name: link.name,
      type: "link" as const,
      url: link.url,
      onDelete: () => setLinks(links.filter((l) => l.url !== link.url)),
    })),
    ...existingFiles.map((file) => ({
      id: file._id,
      name: file.name,
      originalFilename: file.originalFilename,
      type: "file" as const,
      onDelete: () => onDeleteFile?.(file._id),
    })),
    ...newFiles.map((file) => ({
      id: file.name,
      name: file.name,
      originalFilename: file.originalFilename,
      type: "file" as const,
      onDelete: () => setNewFiles(newFiles.filter((f) => f.name !== file.name)),
    })),
  ];

  return (
    <Container id={id}>
      <Box display="flex" gap="12px" marginBottom="16px">
        <Button
          variant="outlined"
          startIcon={<AddLinkIcon />}
          onClick={() => {
            setShowLinkDialogOpen(true);
            setLinkError("");
          }}
        >
          {t("projects:resources.add-link")}
        </Button>
        <Button
          variant="outlined"
          startIcon={<UploadFileIcon />}
          onClick={() => {
            setShowFileDialogOpen(true);
            setFileError("");
          }}
        >
          {t("projects:resources.add-file")}
        </Button>
      </Box>

      <Box display="flex" flexDirection="column">
        {resources && resources.length > 0 ? (
          resources.map((res) => (
            <ResourceItem key={res.id}>
              {res.type === "link" ? <LinkIcon /> : <InsertDriveFileIcon />}
              {res.type === "link" ? (
                <Typography>
                  <a href={res.url} target="_blank" rel="noopener noreferrer">
                    {res.name}
                  </a>
                  <Typography
                    variant="body2"
                    sx={{
                      display: "inline",
                      marginLeft: "24px",
                      color: "var(--color-gray)",
                    }}
                  >
                    {res.url}
                  </Typography>
                </Typography>
              ) : (
                <Typography>
                  {res.name}
                  <Typography
                    variant="body2"
                    sx={{
                      display: "inline",
                      marginLeft: "24px",
                      color: "var(--color-gray)",
                    }}
                  >
                    {res.originalFilename}
                  </Typography>
                </Typography>
              )}
              <Box marginLeft="auto">
                <IconButton size="small" onClick={res.onDelete}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </ResourceItem>
          ))
        ) : (
          <Typography>{t("projects:resources.no-resources")}</Typography>
        )}
      </Box>

      <Dialog
        open={showLinkDialogOpen}
        onClose={handleCloseLinkDialog}
        showCloseButton={true}
      >
        <DialogTitle>{t("projects:resources.add-link")}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t("projects:resources.link-name")}
            value={linkName}
            onChange={(e) => setLinkName(e.target.value)}
            margin="dense"
            error={!!linkError && !linkName}
            InputLabelProps={{ shrink: true }}
            sx={{
              paddingBottom: "12px",
            }}
            helperText={
              !!linkError && !linkName
                ? t("projects:resources.link-name-required")
                : t("projects:resources.link-name-helper-text")
            }
          />
          <TextField
            fullWidth
            label={t("projects:resources.link-url")}
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder={t("projects:resources.link-url-placeholder")}
            margin="dense"
            error={!!linkError && !linkUrl}
            InputLabelProps={{ shrink: true }}
            helperText={
              !!linkError && !linkUrl
                ? t("projects:resources.link-url-required")
                : t("projects:resources.link-url-helper-text")
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLinkDialog}>{t("common:cancel")}</Button>
          <Button onClick={addLink} variant="contained">
            {t("projects:resources.add")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showFileDialogOpen}
        onClose={handleCloseFileDialog}
        showCloseButton={true}
      >
        <DialogTitle>{t("projects:resources.add-file")}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t("projects:resources.file-name")}
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            margin="dense"
            error={!!fileError && !fileName}
            InputLabelProps={{ shrink: true }}
            sx={{
              paddingBottom: "12px",
            }}
            helperText={
              !!fileError && !fileName
                ? t("projects:resources.file-name-required")
                : t("projects:resources.file-name-helper-text")
            }
          />
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadFileIcon />}
            sx={{ mt: 2 }}
          >
            {t("projects:resources.select-file")}
            <input
              type="file"
              hidden
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </Button>
          {selectedFile && (
            <Typography variant="body2">
              {t("projects:resources.selected-file", {
                name: selectedFile?.name,
              })}
            </Typography>
          )}
          {!!fileError && !selectedFile && (
            <Typography color="error">
              {t("projects:resources.select-file-required")}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFileDialog}>{t("common:cancel")}</Button>
          <Button onClick={addFile} variant="contained">
            {t("projects:resources.add")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
