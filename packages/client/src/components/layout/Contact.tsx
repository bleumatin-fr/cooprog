import { useState } from "react";

import { useFormik } from "formik";
import { useSnackbar } from "notistack";
import * as yup from "yup";

import { Button, TextField } from "@mui/material";
import Dialog, {
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@/components/UI/Dialog";

import QuestionMarkRoundedIcon from "@mui/icons-material/QuestionMarkRounded";
import Fab from "@mui/material/Fab";
import { useTranslation } from "next-i18next";
import { useAuthentication } from "@/components/authentication/useAuthentication";
import Markdown from "@/components/UI/Markdown";
import Block from "@/components/layout/Block";

const validationSchema = yup.object({
  object: yup.string().required("Champ obligatoire"),
  message: yup.string().required("Champ obligatoire"),
});

export const ContactDialog = ({
  open,
  handleClose,
}: {
  open: boolean;
  handleClose: () => void;
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { auth, loading, sendMessage, error: authError } = useAuthentication();
  const { t } = useTranslation();

  const formik = useFormik({
    initialValues: {
      email: "",
      object: "",
      message: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      await sendMessage(
        values.object,
        values.message,
        window.location.href,
        values.email
      );
      enqueueSnackbar(t("common:dialogs.contact.success"), {
        variant: "success",
      });
      handleClose();
    },
  });

  return (
    <Dialog open={open} onClose={handleClose} showCloseButton={true}>
      <DialogTitle>{t("common:dialogs.contact.title")}</DialogTitle>
      <DialogContent>
        <div
          style={{
            fontWeight: "400",
            fontSize: "16px",
            margin: "16px 0 32px",
          }}
        >
          {!!authError && <Block color="accent">{`${authError}`}</Block>}
          <Markdown>{t("common:dialogs.contact.text")}</Markdown>
        </div>

        {!auth && (
          <TextField
            id="email"
            name="email"
            label={t("authentication:email")}
            autoFocus
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            fullWidth
            sx={{ marginBottom: "16px" }}
          />
        )}

        <TextField
          id="object"
          name="object"
          label={t("common:dialogs.contact.subject")}
          autoFocus
          value={formik.values.object}
          onChange={formik.handleChange}
          error={formik.touched.object && Boolean(formik.errors.object)}
          helperText={formik.touched.object && formik.errors.object}
          fullWidth
          sx={{ marginBottom: "16px" }}
        />

        <TextField
          id="message"
          name="message"
          label={t("common:dialogs.contact.message")}
          multiline
          rows={4}
          value={formik.values.message}
          onChange={formik.handleChange}
          error={formik.touched.message && Boolean(formik.errors.message)}
          helperText={formik.touched.message && formik.errors.message}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t("common:cancel")}</Button>
        <Button
          onClick={() => formik.handleSubmit()}
          disabled={loading}
          variant="contained"
        >
          {t("common:dialogs.contact.submit")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Contact = () => {
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <>
      <ContactDialog open={open} handleClose={handleClose} />
      <Fab
        sx={{
          position: "fixed",
          right: "16px",
          bottom: "16px",
        }}
        color="secondary"
        onClick={() => setOpen(true)}
      >
        <QuestionMarkRoundedIcon />
      </Fab>
    </>
  );
};

export default Contact;
