import {
  Box,
  Typography,
  TextField,
  FormControl,
  Stack,
  useTheme,
  Alert,
  FormControlLabel,
  Checkbox,
  Button,
} from "@mui/material";
import Dialog, {
  DialogContent,
  DialogActions,
  DialogTitle,
} from "@/components/UI/Dialog";
import { useTranslation } from "next-i18next";
import useProfile from "./useProfile";
import Markdown from "@/components/UI/Markdown";
import { useFormik } from "formik";
import * as Yup from "yup";

interface ProfileCreateDialogProps {
  open: boolean;
  onClose: () => void;
}

const ProfileCreateDialog = ({ open, onClose }: ProfileCreateDialogProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { createProfile, error, loading } = useProfile();

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
            .email(t("common:validation.invalidEmail"))
            .required(t("common:validation.required")),
      }),
      phone: Yup.string().when("types", {
        is: (types: string[]) => types?.includes("phone"),
        then: (schema) =>
          schema
            .matches(/^\+?[0-9]\d{1,14}$/, t("common:validation.invalidPhone"))
            .required(t("common:validation.required")),
      }),
      instructions: Yup.string(),
    }),
  });

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      role: "",
      contactInformation: {
        types: ["email"] as ("email" | "phone")[],
        email: "",
        phone: "",
        instructions: "",
      },
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await createProfile(values);
        onClose();
      } catch (error) {
        console.error("Failed to create profile:", error);
      }
    },
  });

  const errorMessage = error instanceof Error ? error.message : String(error);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t("common:dialogs.profile-selection.createNew")}
      </DialogTitle>
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
              label={t("common:dialogs.profile-creation.firstName")}
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
              label={t("common:dialogs.profile-creation.lastName")}
              fullWidth
              name="lastName"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
              disabled={loading}
            />

            <TextField
              label={t("common:dialogs.profile-creation.role")}
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
                {t("common:dialogs.profile-creation.contactMode")}
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formik.values.contactInformation.types.includes(
                      "email"
                    )}
                    onChange={(e) => {
                      const currentTypes = formik.values.contactInformation.types;
                      const newTypes = e.target.checked
                        ? [...currentTypes, "email"]
                        : currentTypes.filter((t) => t !== "email");
                      formik.setFieldValue("contactInformation.types", newTypes);
                    }}
                  />
                }
                label={t(
                  "common:dialogs.profile-creation.contactModeValueEmail"
                )}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formik.values.contactInformation.types.includes(
                      "phone"
                    )}
                    onChange={(e) => {
                      const currentTypes = formik.values.contactInformation.types;
                      const newTypes = e.target.checked
                        ? [...currentTypes, "phone"]
                        : currentTypes.filter((t) => t !== "phone");
                      formik.setFieldValue("contactInformation.types", newTypes);
                    }}
                  />
                }
                label={t(
                  "common:dialogs.profile-creation.contactModeValuePhone"
                )}
              />
            </FormControl>

            <TextField
              label={
                t("common:dialogs.profile-creation.contactValueEmail") +
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
                t("common:dialogs.profile-creation.contactValuePhone") +
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
              label={t("common:dialogs.profile-creation.contactInstructions")}
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
        <Button onClick={onClose} disabled={loading}>
          {t("common:cancel")}
        </Button>
        <Button
          onClick={() => formik.handleSubmit()}
          variant="contained"
          disabled={loading}
        >
          {t("common:dialogs.profile-creation.submit")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileCreateDialog;
