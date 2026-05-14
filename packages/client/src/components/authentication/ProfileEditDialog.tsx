import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  Stack,
  Alert,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import Dialog, {
  DialogContent,
  DialogActions,
  DialogTitle,
} from "@/components/UI/Dialog";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import useProfile from "./useProfile";
import { Profile } from "@cooprog/core";
import DeleteIcon from "@mui/icons-material/Delete";
import Markdown from "@/components/UI/Markdown";
import { useFormik } from "formik";
import * as Yup from "yup";

interface ProfileEditDialogProps {
  open: boolean;
  onClose: () => void;
  profile: Profile;
}

const ProfileEditDialog = ({
  open,
  onClose,
  profile,
}: ProfileEditDialogProps) => {
  const { t } = useTranslation();
  const { updateProfile, deleteProfile, error, loading } = useProfile();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const validationSchema = Yup.object({
    firstName: Yup.string().required(t("common:validation.required")),
    lastName: Yup.string().required(t("common:validation.required")),
    role: Yup.string(),
    contactInformation: Yup.object({
      types: Yup.array()
        .of(Yup.string().oneOf(["email", "phone"]))
        .min(1, t("common:validation.required")),
      email: Yup.string().when("types", {
        is: (types: string[]) => types?.includes("email"),
        then: (schema) =>
          schema
            .email(t("common:validation.email"))
            .required(t("common:validation.required")),
      }),
      phone: Yup.string().when("types", {
        is: (types: string[]) => types?.includes("phone"),
        then: (schema) => schema.required(t("common:validation.required")),
      }),
      instructions: Yup.string(),
    }),
  });

  const formik = useFormik({
    initialValues: {
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      role: profile.role || "",
      contactInformation: {
        types: profile.contactInformation?.types || ["email"],
        email: profile.contactInformation?.email || "",
        phone: profile.contactInformation?.phone || "",
        instructions: profile.contactInformation?.instructions || "",
      },
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await updateProfile({
          ...values,
          profileId: profile._id?.toString() ?? "",
        });
        onClose();
      } catch (error) {
        console.error("Failed to update profile:", error);
      }
    },
  });

  const handleDelete = async () => {
    try {
      await deleteProfile(profile._id?.toString() ?? "");
      onClose();
    } catch (error) {
      console.error("Failed to delete profile:", error);
    }
  };

  const errorMessage = error instanceof Error ? error.message : String(error);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t("common:dialogs.profile-edition.title")}</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 3 }}>
            {error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            ) : null}

            <Stack spacing={3}>
              <TextField
                required
                label={t("common:dialogs.profile-edition.firstName")}
                fullWidth
                name="firstName"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.firstName && Boolean(formik.errors.firstName)
                }
                helperText={formik.touched.firstName && formik.errors.firstName}
                disabled={loading}
              />

              <TextField
                required
                label={t("common:dialogs.profile-edition.lastName")}
                fullWidth
                name="lastName"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.lastName && Boolean(formik.errors.lastName)
                }
                helperText={formik.touched.lastName && formik.errors.lastName}
                disabled={loading}
              />

              <TextField
                label={t("common:dialogs.profile-edition.role")}
                fullWidth
                name="role"
                value={formik.values.role}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.role && Boolean(formik.errors.role)}
                helperText={formik.touched.role && formik.errors.role}
                disabled={loading}
              />

              <Markdown
                style={{
                  fontSize: "18px",
                }}
              >
                {t("common:dialogs.profile-edition.contactHelper")}
              </Markdown>

              <FormControl fullWidth required>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  {t("common:dialogs.profile-edition.contactMode")}
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.contactInformation.types.includes(
                        "email"
                      )}
                      onChange={(e) => {
                        const currentTypes =
                          formik.values.contactInformation.types;
                        const newTypes = e.target.checked
                          ? [...currentTypes, "email"]
                          : currentTypes.filter((t) => t !== "email");
                        formik.setFieldValue(
                          "contactInformation.types",
                          newTypes
                        );
                      }}
                    />
                  }
                  label={t(
                    "common:dialogs.profile-edition.contactModeValueEmail"
                  )}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.contactInformation.types.includes(
                        "phone"
                      )}
                      onChange={(e) => {
                        const currentTypes =
                          formik.values.contactInformation.types;
                        const newTypes = e.target.checked
                          ? [...currentTypes, "phone"]
                          : currentTypes.filter((t) => t !== "phone");
                        formik.setFieldValue(
                          "contactInformation.types",
                          newTypes
                        );
                      }}
                    />
                  }
                  label={t(
                    "common:dialogs.profile-edition.contactModeValuePhone"
                  )}
                />
              </FormControl>

              <TextField
                label={
                  t("common:dialogs.profile-edition.contactValueEmail") +
                  (formik.values.contactInformation.types.includes("email")
                    ? "*"
                    : "")
                }
                fullWidth
                name="contactInformation.email"
                value={formik.values.contactInformation.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.contactInformation?.email &&
                  Boolean(formik.errors.contactInformation?.email)
                }
                helperText={
                  formik.touched.contactInformation?.email &&
                  formik.errors.contactInformation?.email
                }
                disabled={
                  loading ||
                  !formik.values.contactInformation.types.includes("email")
                }
              />

              <TextField
                label={
                  t("common:dialogs.profile-edition.contactValuePhone") +
                  (formik.values.contactInformation.types.includes("phone")
                    ? "*"
                    : "")
                }
                fullWidth
                name="contactInformation.phone"
                value={formik.values.contactInformation.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.contactInformation?.phone &&
                  Boolean(formik.errors.contactInformation?.phone)
                }
                helperText={
                  formik.touched.contactInformation?.phone &&
                  formik.errors.contactInformation?.phone
                }
                disabled={
                  loading ||
                  !formik.values.contactInformation.types.includes("phone")
                }
              />

              <TextField
                label={t("common:dialogs.profile-edition.contactInstructions")}
                fullWidth
                multiline
                rows={3}
                name="contactInformation.instructions"
                value={formik.values.contactInformation.instructions}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.contactInformation?.instructions &&
                  Boolean(formik.errors.contactInformation?.instructions)
                }
                helperText={
                  formik.touched.contactInformation?.instructions &&
                  formik.errors.contactInformation?.instructions
                }
                disabled={loading}
              />
            </Stack>

            <Box
              sx={{
                mt: 4,
                display: "flex",
                justifyContent: "flex-start",
                gap: 2,
              }}
            ></Box>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "row",
            gap: 2,
          }}
        >
          <Button
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={loading}
            startIcon={<DeleteIcon />}
            sx={{ flexShrink: 0 }}
          >
            {t("common:dialogs.profile-edition.delete")}
          </Button>
          <div style={{ flexGrow: 1 }}></div>
          <Button onClick={onClose} disabled={loading} sx={{ flexShrink: 0 }}>
            {t("common:cancel")}
          </Button>
          <Button
            onClick={() => formik.handleSubmit()}
            variant="contained"
            disabled={loading}
            sx={{ flexShrink: 0 }}
          >
            {t("common:dialogs.profile-edition.submit")}
          </Button>
        </DialogActions>
      </Dialog>

      {deleteDialogOpen && (
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          showCloseButton={true}
          maxWidth="xs"
          fullWidth
        >
          <form onSubmit={handleDelete}>
            <DialogTitle>
              {t("common:dialogs.profile-edition.deleteConfirmationTitle")}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ p: 3 }}>
                <Typography>
                  {t(
                    "common:dialogs.profile-edition.deleteConfirmationMessage"
                  )}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>
                {t("common:cancel")}
              </Button>
              <Button
                color="error"
                variant="contained"
                onClick={handleDelete}
                disabled={loading}
                startIcon={<DeleteIcon />}
                loading={loading}
              >
                {t("common:dialogs.profile-edition.delete")}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}
    </>
  );
};

export default ProfileEditDialog;
